import express from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Message } from '../models/Message';
import { AuthRequest } from '../middleware/auth';
import { fail } from '../utils/http';
import { REGION_CODES } from '../config/regions';
import { isValidEmail, isValidPhone, normalizeEmail, normalizePhone } from '../utils/validators';

/**
 * Quản lý người dùng - chỉ dành cho tài khoản Chính phủ (requireRole được gắn ở server.ts).
 * Chỉ có: xem danh sách, sửa thông tin, xóa. Không có thêm mới (người dùng tự đăng ký).
 */
const router = express.Router();

const toDto = (u: any) => ({
  id: String(u._id),
  fullName: u.fullName,
  phone: u.phone,
  email: u.email ?? null,
  emailVerified: !!u.emailVerified,
  role: u.role,
  region: u.region ?? null,
  createdAt: u.createdAt,
});

router.get('/', async (req, res) => {
  try {
    const role = String(req.query.role ?? '');
    const q = String(req.query.q ?? '').trim();
    const filter: Record<string, any> = {};
    if (role === 'FARMER' || role === 'GOVERNMENT') filter.role = role;
    if (q) {
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [{ fullName: new RegExp(safe, 'i') }, { phone: new RegExp(safe) }, { email: new RegExp(safe, 'i') }];
    }
    const [users, counts] = await Promise.all([
      User.find(filter).select('-password_hash').sort({ createdAt: -1 }).limit(500).lean(),
      User.aggregate([{ $group: { _id: '$role', n: { $sum: 1 } } }]),
    ]);
    const count = (r: string) => counts.find((c) => c._id === r)?.n ?? 0;
    res.json({ users: users.map(toDto), totals: { FARMER: count('FARMER'), GOVERNMENT: count('GOVERNMENT') } });
  } catch (err) {
    console.error('List users error:', err);
    fail(res, 500, 'SERVER_ERROR', 'Không tải được danh sách người dùng.');
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return fail(res, 400, 'INVALID_ID', 'Mã người dùng không hợp lệ.');

    const user = await User.findById(id);
    if (!user) return fail(res, 404, 'NOT_FOUND', 'Không tìm thấy người dùng này.');

    const fullName = String(req.body.fullName ?? user.fullName).trim();
    const phone = normalizePhone(req.body.phone ?? user.phone);
    const emailRaw = req.body.email === undefined ? user.email ?? '' : req.body.email;
    const email = normalizeEmail(emailRaw);
    const role = String(req.body.role ?? user.role);
    const region = req.body.region === undefined ? user.region : String(req.body.region || '') || null;

    if (fullName.length < 2 || fullName.length > 60) return fail(res, 400, 'INVALID_NAME', 'Họ tên phải từ 2 đến 60 ký tự.', { field: 'fullName' });
    if (!isValidPhone(phone)) return fail(res, 400, 'INVALID_PHONE', 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0.', { field: 'phone' });
    if (email && !isValidEmail(email)) return fail(res, 400, 'INVALID_EMAIL', 'Địa chỉ email không hợp lệ.', { field: 'email' });
    if (role !== 'FARMER' && role !== 'GOVERNMENT') return fail(res, 400, 'INVALID_ROLE', 'Vai trò không hợp lệ.', { field: 'role' });
    if (region && !REGION_CODES.includes(region)) return fail(res, 400, 'INVALID_REGION', 'Tỉnh/thành không thuộc Đồng bằng sông Cửu Long.', { field: 'region' });

    const isSelf = req.user?.userId === String(user._id);
    if (isSelf && role !== user.role) {
      return fail(res, 400, 'SELF_ROLE_CHANGE', 'Bạn không thể tự đổi vai trò của chính mình.', { field: 'role' });
    }

    if (phone !== user.phone && (await User.exists({ phone, _id: { $ne: user._id } }))) {
      return fail(res, 409, 'PHONE_EXISTS', 'Số điện thoại này đã thuộc về tài khoản khác.', { field: 'phone' });
    }
    if (email && email !== user.email && (await User.exists({ email, _id: { $ne: user._id } }))) {
      return fail(res, 409, 'EMAIL_EXISTS', 'Email này đã thuộc về tài khoản khác.', { field: 'email' });
    }

    user.fullName = fullName;
    user.phone = phone;
    if (email) user.email = email;
    else user.set('email', undefined);
    user.role = role as 'FARMER' | 'GOVERNMENT';
    user.region = region;
    await user.save();

    res.json({ status: 200, message: 'Đã cập nhật thông tin người dùng.', user: toDto(user.toObject()) });
  } catch (err) {
    console.error('Update user error:', err);
    fail(res, 500, 'SERVER_ERROR', 'Không cập nhật được thông tin người dùng.');
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return fail(res, 400, 'INVALID_ID', 'Mã người dùng không hợp lệ.');
    if (req.user?.userId === id) return fail(res, 400, 'SELF_DELETE', 'Bạn không thể xóa chính tài khoản đang đăng nhập.');

    const user = await User.findById(id);
    if (!user) return fail(res, 404, 'NOT_FOUND', 'Không tìm thấy người dùng này.');

    if (user.role === 'GOVERNMENT' && (await User.countDocuments({ role: 'GOVERNMENT' })) <= 1) {
      return fail(res, 400, 'LAST_GOV', 'Không thể xóa tài khoản chính phủ cuối cùng của hệ thống.');
    }

    await User.deleteOne({ _id: user._id });
    // Xóa các cuộc trò chuyện riêng của người dùng này; thông báo chung đã phát hành được giữ lại
    const del = await Message.deleteMany({ type: 'private', $or: [{ farmerId: user._id }, { senderId: user._id }, { receiverId: user._id }] });

    res.json({ status: 200, message: `Đã xóa tài khoản ${user.fullName}.`, deletedMessages: del.deletedCount ?? 0 });
  } catch (err) {
    console.error('Delete user error:', err);
    fail(res, 500, 'SERVER_ERROR', 'Không xóa được người dùng.');
  }
});

export default router;
