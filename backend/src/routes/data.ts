import express from 'express';
import { RegionReading } from '../models/RegionReading';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { AuthRequest, requireRole } from '../middleware/auth';
import { fail } from '../utils/http';
import { MEKONG_REGIONS, getRegion } from '../config/regions';
import { describeReading, overallLevel } from '../config/risk';
import { emitToAll, emitToRole } from '../realtime';

const router = express.Router();

const toDto = (r: any) => ({
  id: String(r._id),
  provinceCode: r.provinceCode,
  provinceName: r.provinceName,
  salinity: r.salinity,
  temperature: r.temperature,
  waterLevel: r.waterLevel,
  waterQuality: r.waterQuality,
  note: r.note || '',
  isSample: !!r.isSample,
  updatedByName: r.updatedByName || null,
  updatedAt: r.createdAt,
});

/** Số liệu mới nhất của từng tỉnh - bản đồ nông dân và trang tổng quan đều lấy từ đây. */
async function latestByProvince() {
  const rows = await RegionReading.aggregate([
    { $sort: { createdAt: -1 } },
    { $group: { _id: '$provinceCode', doc: { $first: '$$ROOT' } } },
  ]);
  return rows.map((r) => toDto(r.doc));
}

router.get('/regions', async (_req, res) => {
  try {
    res.json({ regions: MEKONG_REGIONS, readings: await latestByProvince() });
  } catch (err) {
    console.error('Get regions error:', err);
    fail(res, 500, 'SERVER_ERROR', 'Không tải được số liệu các tỉnh.');
  }
});

router.get('/regions/:code/history', async (req, res) => {
  try {
    const region = getRegion(req.params.code);
    if (!region) return fail(res, 404, 'NOT_FOUND', 'Không tìm thấy tỉnh này.');
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const rows = await RegionReading.find({ provinceCode: region.code }).sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ region, history: rows.map(toDto) });
  } catch (err) {
    console.error('History error:', err);
    fail(res, 500, 'SERVER_ERROR', 'Không tải được lịch sử số liệu.');
  }
});

// ------------------------------------------------------------ CHỈ CHÍNH PHỦ
router.get('/recent', requireRole('GOVERNMENT'), async (_req, res) => {
  try {
    const rows = await RegionReading.find().sort({ createdAt: -1 }).limit(30).lean();
    res.json({ history: rows.map(toDto) });
  } catch (err) {
    fail(res, 500, 'SERVER_ERROR', 'Không tải được lịch sử nhập liệu.');
  }
});

router.get('/summary', requireRole('GOVERNMENT'), async (req: AuthRequest, res) => {
  try {
    const [farmers, governments, unreadChats, readings] = await Promise.all([
      User.countDocuments({ role: 'FARMER' }),
      User.countDocuments({ role: 'GOVERNMENT' }),
      Message.countDocuments({ type: 'private', isRead: false, receiverId: null }),
      latestByProvince(),
    ]);
    const levels = readings.map((r) => overallLevel(r));
    res.json({
      farmers,
      governments,
      unreadChats,
      provincesWithData: readings.length,
      totalProvinces: MEKONG_REGIONS.length,
      provincesAtRisk: levels.filter((l) => l === 'high' || l === 'extreme').length,
    });
  } catch (err) {
    fail(res, 500, 'SERVER_ERROR', 'Không tải được số liệu tổng quan.');
  }
});

router.post('/regions', requireRole('GOVERNMENT'), async (req: AuthRequest, res) => {
  try {
    const region = getRegion(String(req.body.provinceCode ?? ''));
    if (!region) return fail(res, 400, 'INVALID_REGION', 'Vui lòng chọn một tỉnh/thành thuộc Đồng bằng sông Cửu Long.', { field: 'provinceCode' });

    const spec = [
      { key: 'salinity', label: 'Độ mặn', min: 0, max: 40, unit: '‰' },
      { key: 'temperature', label: 'Nhiệt độ', min: 15, max: 50, unit: '°C' },
      { key: 'waterLevel', label: 'Mức ngập', min: 0, max: 500, unit: 'cm' },
      { key: 'waterQuality', label: 'Chỉ số chất lượng nước (WQI)', min: 0, max: 100, unit: '' },
    ] as const;

    const values: Record<string, number> = {};
    for (const s of spec) {
      const raw = req.body[s.key];
      const n = typeof raw === 'string' ? Number(raw.replace(',', '.')) : Number(raw);
      if (raw === '' || raw === null || raw === undefined || !Number.isFinite(n)) {
        return fail(res, 400, 'INVALID_VALUE', `${s.label} chưa được nhập hoặc không phải là số.`, { field: s.key });
      }
      if (n < s.min || n > s.max) {
        return fail(res, 400, 'OUT_OF_RANGE', `${s.label} phải nằm trong khoảng ${s.min} đến ${s.max}${s.unit ? ' ' + s.unit : ''}.`, { field: s.key });
      }
      values[s.key] = Math.round(n * 10) / 10;
    }

    const note = String(req.body.note ?? '').trim().slice(0, 500);
    const reading = await RegionReading.create({
      provinceCode: region.code,
      provinceName: region.name,
      ...(values as any),
      note,
      isSample: false,
      updatedBy: req.user!.userId,
      updatedByName: req.user!.fullName,
    });

    const dto = toDto(reading.toObject());
    const { overall, text } = describeReading(region.name, { ...(values as any), note });

    // Bản đồ của nông dân (và các trang tổng quan) cập nhật ngay
    emitToAll('region_update', { reading: dto, level: overall });

    let notified = false;
    if (req.body.notify) {
      const msg = await Message.create({
        senderId: req.user!.userId,
        senderName: req.user!.fullName || 'Cơ quan quản lý',
        type: 'public',
        kind: overall === 'high' || overall === 'extreme' ? 'ALERT' : 'DATA',
        level: overall,
        provinceCode: region.code,
        title: `Cập nhật số liệu ${region.name}`,
        content: text,
        isRead: false,
      });
      emitToRole('FARMER', 'announcement', { id: String(msg._id), provinceCode: region.code });
      emitToRole('GOVERNMENT', 'announcement', { id: String(msg._id), provinceCode: region.code });
      notified = true;
    }

    res.status(201).json({ status: 201, message: `Đã lưu số liệu ${region.name}.`, reading: dto, level: overall, notified });
  } catch (err) {
    console.error('Save region reading error:', err);
    fail(res, 500, 'SERVER_ERROR', 'Không lưu được số liệu. Vui lòng thử lại.');
  }
});

export default router;
