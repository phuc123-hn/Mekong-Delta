import { Message } from '../models/Message';
import { User } from '../models/User';

/**
 * Tin nhắn riêng tạo trước khi có trường `farmerId` -> gán lại chủ cuộc trò chuyện (luôn là nông dân),
 * để các cuộc trò chuyện cũ vẫn hiển thị trong giao diện mới.
 */
export async function migrateLegacyMessages() {
  const legacy = await Message.find({ type: 'private', $or: [{ farmerId: null }, { farmerId: { $exists: false } }] }).limit(5000);
  if (!legacy.length) return;

  const ids = Array.from(new Set(legacy.map((m) => String(m.senderId))));
  const users = await User.find({ _id: { $in: ids } }).select('role').lean();
  const roleById = new Map(users.map((u: any) => [String(u._id), u.role]));

  let fixed = 0;
  for (const m of legacy) {
    const senderRole = roleById.get(String(m.senderId));
    const owner = senderRole === 'GOVERNMENT' ? m.receiverId : m.senderId;
    if (!owner) continue;
    m.farmerId = owner;
    m.kind = 'CHAT';
    await m.save();
    fixed += 1;
  }
  console.log(`🔧 Đã chuyển ${fixed}/${legacy.length} tin nhắn cũ sang cấu trúc mới`);
}
