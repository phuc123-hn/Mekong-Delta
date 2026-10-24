import express from 'express';
import mongoose from 'mongoose';
import { AuthRequest, requireRole } from '../middleware/auth';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { fail } from '../utils/http';
import { emitToRole, emitToUser } from '../realtime';
import { REGION_CODES, getRegion } from '../config/regions';

/**
 * Tin nhắn gồm 2 loại, đã được đơn giản hóa:
 *  1) TRAO ĐỔI RIÊNG: mỗi nông dân có đúng 1 cuộc trò chuyện với cơ quan quản lý.
 *  2) THÔNG BÁO CHUNG: cơ quan quản lý đăng, mọi nông dân đều đọc được (có thể giới hạn theo tỉnh).
 */
const router = express.Router();
const MAX_LEN = 2000;

const msgDto = (m: any) => ({
  id: String(m._id),
  content: m.content,
  title: m.title ?? null,
  kind: m.kind ?? (m.type === 'public' ? 'ANNOUNCEMENT' : 'CHAT'),
  level: m.level ?? null,
  provinceCode: m.provinceCode ?? null,
  provinceName: getRegion(m.provinceCode)?.name ?? null,
  senderName: m.senderName,
  isRead: !!m.isRead,
  createdAt: m.createdAt,
});

function cleanContent(raw: unknown) {
  return String(raw ?? '').trim();
}

// =====================================================================
// NÔNG DÂN - cuộc trò chuyện của chính mình
// =====================================================================
router.get('/thread', requireRole('FARMER'), async (req: AuthRequest, res) => {
  try {
    const farmerId = new mongoose.Types.ObjectId(req.user!.userId);
    const rows = await Message.find({ type: 'private', farmerId }).sort({ createdAt: 1 }).limit(300).populate('senderId', 'role').lean();
    res.json({
      messages: rows.map((m: any) => ({ ...msgDto(m), fromMe: String(m.senderId?._id ?? m.senderId) === req.user!.userId })),
    });
  } catch (err) {
    console.error('Thread error:', err);
    fail(res, 500, 'SERVER_ERROR', 'Không tải được tin nhắn.');
  }
});

router.post('/thread', requireRole('FARMER'), async (req: AuthRequest, res) => {
  try {
    const content = cleanContent(req.body.content);
    if (!content) return fail(res, 400, 'EMPTY', 'Vui lòng nhập nội dung tin nhắn.');
    if (content.length > MAX_LEN) return fail(res, 400, 'TOO_LONG', `Tin nhắn tối đa ${MAX_LEN} ký tự.`);

    const farmerId = new mongoose.Types.ObjectId(req.user!.userId);
    const msg = await Message.create({
      senderId: farmerId,
      senderName: req.user!.fullName || 'Nông dân',
      farmerId,
      receiverId: null,
      type: 'private',
      kind: 'CHAT',
      content,
      isRead: false,
    });
    const dto = { ...msgDto(msg.toObject()), fromMe: true };
    emitToRole('GOVERNMENT', 'chat_message', { farmerId: String(farmerId), farmerName: msg.senderName, message: { ...dto, fromMe: false } });
    res.status(201).json({ message: dto });
  } catch (err) {
    console.error('Send thread error:', err);
    fail(res, 500, 'SERVER_ERROR', 'Không gửi được tin nhắn. Vui lòng thử lại.');
  }
});

/** Nông dân mở cuộc trò chuyện -> đánh dấu tin của cơ quan quản lý là đã đọc */
router.post('/thread/read', requireRole('FARMER'), async (req: AuthRequest, res) => {
  try {
    const farmerId = new mongoose.Types.ObjectId(req.user!.userId);
    await Message.updateMany({ type: 'private', farmerId, senderId: { $ne: farmerId }, isRead: false }, { $set: { isRead: true, deliveryStatus: 'read' } });
    res.json({ ok: true });
  } catch (err) {
    fail(res, 500, 'SERVER_ERROR', 'Không cập nhật được trạng thái đã đọc.');
  }
});

router.get('/unread', async (req: AuthRequest, res) => {
  try {
    const me = new mongoose.Types.ObjectId(req.user!.userId);
    const chat =
      req.user!.role === 'GOVERNMENT'
        ? await Message.countDocuments({ type: 'private', receiverId: null, isRead: false })
        : await Message.countDocuments({ type: 'private', farmerId: me, senderId: { $ne: me }, isRead: false });
    res.json({ chat });
  } catch (err) {
    fail(res, 500, 'SERVER_ERROR', 'Không đếm được tin chưa đọc.');
  }
});

// =====================================================================
// CHÍNH PHỦ - danh sách và nội dung các cuộc trò chuyện
// =====================================================================
router.get('/conversations', requireRole('GOVERNMENT'), async (_req, res) => {
  try {
    const groups = await Message.aggregate([
      { $match: { type: 'private', farmerId: { $ne: null } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$farmerId',
          last: { $first: '$$ROOT' },
          unread: { $sum: { $cond: [{ $and: [{ $eq: ['$receiverId', null] }, { $eq: ['$isRead', false] }] }, 1, 0] } },
        },
      },
      { $sort: { 'last.createdAt': -1 } },
      { $limit: 200 },
    ]);
    const users = await User.find({ _id: { $in: groups.map((g) => g._id) } }).select('fullName phone region').lean();
    const byId = new Map(users.map((u: any) => [String(u._id), u]));

    res.json({
      conversations: groups
        .filter((g) => byId.has(String(g._id)))
        .map((g) => {
          const u: any = byId.get(String(g._id));
          return {
            farmerId: String(g._id),
            fullName: u.fullName,
            phone: u.phone,
            region: u.region ?? null,
            regionName: getRegion(u.region)?.name ?? null,
            lastMessage: g.last.content,
            lastFromFarmer: String(g.last.senderId) === String(g._id),
            lastAt: g.last.createdAt,
            unread: g.unread,
          };
        }),
    });
  } catch (err) {
    console.error('Conversations error:', err);
    fail(res, 500, 'SERVER_ERROR', 'Không tải được danh sách trò chuyện.');
  }
});

router.get('/conversations/:farmerId', requireRole('GOVERNMENT'), async (req, res) => {
  try {
    const { farmerId } = req.params;
    if (!mongoose.isValidObjectId(farmerId)) return fail(res, 400, 'INVALID_ID', 'Mã nông dân không hợp lệ.');
    const farmer = await User.findById(farmerId).select('fullName phone region email').lean();
    if (!farmer) return fail(res, 404, 'NOT_FOUND', 'Nông dân này không còn tồn tại.');
    const rows = await Message.find({ type: 'private', farmerId }).sort({ createdAt: 1 }).limit(300).lean();
    res.json({
      farmer: { id: farmerId, fullName: farmer.fullName, phone: farmer.phone, regionName: getRegion(farmer.region)?.name ?? null },
      messages: rows.map((m: any) => ({ ...msgDto(m), fromMe: String(m.senderId) !== farmerId })),
    });
  } catch (err) {
    fail(res, 500, 'SERVER_ERROR', 'Không tải được cuộc trò chuyện.');
  }
});

router.post('/conversations/:farmerId/read', requireRole('GOVERNMENT'), async (req, res) => {
  try {
    const { farmerId } = req.params;
    if (!mongoose.isValidObjectId(farmerId)) return fail(res, 400, 'INVALID_ID', 'Mã nông dân không hợp lệ.');
    await Message.updateMany({ type: 'private', farmerId, receiverId: null, isRead: false }, { $set: { isRead: true, deliveryStatus: 'read' } });
    res.json({ ok: true });
  } catch (err) {
    fail(res, 500, 'SERVER_ERROR', 'Không cập nhật được trạng thái đã đọc.');
  }
});

router.post('/conversations/:farmerId', requireRole('GOVERNMENT'), async (req: AuthRequest, res) => {
  try {
    const { farmerId } = req.params;
    if (!mongoose.isValidObjectId(farmerId)) return fail(res, 400, 'INVALID_ID', 'Mã nông dân không hợp lệ.');
    const content = cleanContent(req.body.content);
    if (!content) return fail(res, 400, 'EMPTY', 'Vui lòng nhập nội dung trả lời.');
    if (content.length > MAX_LEN) return fail(res, 400, 'TOO_LONG', `Tin nhắn tối đa ${MAX_LEN} ký tự.`);

    const farmer = await User.findOne({ _id: farmerId, role: 'FARMER' }).select('fullName').lean();
    if (!farmer) return fail(res, 404, 'NOT_FOUND', 'Không tìm thấy nông dân này.');

    const msg = await Message.create({
      senderId: req.user!.userId,
      senderName: req.user!.fullName || 'Cơ quan quản lý',
      farmerId,
      receiverId: farmerId,
      receiverName: farmer.fullName,
      type: 'private',
      kind: 'CHAT',
      content,
      isRead: false,
    });
    const dto = msgDto(msg.toObject());
    emitToUser(farmerId, 'chat_message', { farmerId, message: { ...dto, fromMe: false } });
    emitToRole('GOVERNMENT', 'chat_message', { farmerId, farmerName: farmer.fullName, byGov: true, message: { ...dto, fromMe: false } });
    res.status(201).json({ message: { ...dto, fromMe: true } });
  } catch (err) {
    console.error('Reply error:', err);
    fail(res, 500, 'SERVER_ERROR', 'Không gửi được tin trả lời. Vui lòng thử lại.');
  }
});

router.delete('/conversations/:farmerId', requireRole('GOVERNMENT'), async (req, res) => {
  try {
    const { farmerId } = req.params;
    if (!mongoose.isValidObjectId(farmerId)) return fail(res, 400, 'INVALID_ID', 'Mã nông dân không hợp lệ.');
    const del = await Message.deleteMany({ type: 'private', farmerId });
    res.json({ ok: true, deleted: del.deletedCount ?? 0 });
  } catch (err) {
    fail(res, 500, 'SERVER_ERROR', 'Không xóa được cuộc trò chuyện.');
  }
});

// =====================================================================
// THÔNG BÁO CHUNG
// =====================================================================
router.get('/announcements', async (req: AuthRequest, res) => {
  try {
    const filter: Record<string, any> = { type: 'public' };
    if (req.user!.role === 'FARMER') {
      // Nông dân thấy thông báo toàn vùng + thông báo của tỉnh mình (nếu đã được gán tỉnh)
      const me = await User.findById(req.user!.userId).select('region').lean();
      if (me?.region) filter.$or = [{ provinceCode: null }, { provinceCode: '' }, { provinceCode: me.region }, { provinceCode: { $exists: false } }];
    }
    const rows = await Message.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ announcements: rows.map(msgDto) });
  } catch (err) {
    console.error('Announcements error:', err);
    fail(res, 500, 'SERVER_ERROR', 'Không tải được thông báo.');
  }
});

router.post('/announcements', requireRole('GOVERNMENT'), async (req: AuthRequest, res) => {
  try {
    const content = cleanContent(req.body.content);
    const title = cleanContent(req.body.title).slice(0, 150);
    const provinceCode = String(req.body.provinceCode ?? '') || null;
    const level = ['low', 'moderate', 'high', 'extreme'].includes(req.body.level) ? req.body.level : null;
    const kind = req.body.kind === 'ALERT' ? 'ALERT' : 'ANNOUNCEMENT';

    if (!content) return fail(res, 400, 'EMPTY', 'Vui lòng nhập nội dung thông báo.', { field: 'content' });
    if (content.length > MAX_LEN) return fail(res, 400, 'TOO_LONG', `Thông báo tối đa ${MAX_LEN} ký tự.`, { field: 'content' });
    if (provinceCode && !REGION_CODES.includes(provinceCode)) return fail(res, 400, 'INVALID_REGION', 'Tỉnh/thành không hợp lệ.', { field: 'provinceCode' });

    const msg = await Message.create({
      senderId: req.user!.userId,
      senderName: req.user!.fullName || 'Cơ quan quản lý',
      type: 'public',
      kind,
      level,
      provinceCode,
      title: title || null,
      content,
      isRead: false,
    });
    emitToRole('FARMER', 'announcement', { id: String(msg._id), provinceCode });
    emitToRole('GOVERNMENT', 'announcement', { id: String(msg._id), provinceCode });
    res.status(201).json({ message: msgDto(msg.toObject()) });
  } catch (err) {
    console.error('Post announcement error:', err);
    fail(res, 500, 'SERVER_ERROR', 'Không phát hành được thông báo. Vui lòng thử lại.');
  }
});

router.delete('/announcements/:id', requireRole('GOVERNMENT'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 400, 'INVALID_ID', 'Mã thông báo không hợp lệ.');
    const del = await Message.deleteOne({ _id: req.params.id, type: 'public' });
    if (!del.deletedCount) return fail(res, 404, 'NOT_FOUND', 'Không tìm thấy thông báo này.');
    emitToRole('FARMER', 'announcement', { id: req.params.id, deleted: true });
    res.json({ ok: true });
  } catch (err) {
    fail(res, 500, 'SERVER_ERROR', 'Không xóa được thông báo.');
  }
});

export default router;
