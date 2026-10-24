import mongoose, { Schema, Document } from 'mongoose';
import { OTP } from '../config/security';
import { OtpState } from '../utils/otp-policy';

/** Phiên đăng ký đang chờ xác thực OTP. Tài khoản chỉ được tạo sau khi nhập đúng mã. */
export interface IPendingRegistration extends Document, OtpState {
  email: string;
  phone: string;
  fullName: string;
  role: 'FARMER' | 'GOVERNMENT';
  passwordHash: string;
  salt: string;
  stateVersion: number;
  expireAt: Date;
}

const PendingSchema = new Schema<IPendingRegistration>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  fullName: { type: String, required: true, trim: true },
  role: { type: String, enum: ['FARMER', 'GOVERNMENT'], default: 'FARMER' },
  passwordHash: { type: String, required: true },
  salt: { type: String, required: true },
  codeHash: { type: String, default: null },
  expiresAt: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  lastSentAt: { type: Number, default: 0 },
  sendCount: { type: Number, default: 0 },
  sendLockedUntil: { type: Number, default: 0 },
  verifyLockedUntil: { type: Number, default: 0 },
  /** Tăng sau mỗi lần ghi trạng thái OTP -> chống bấm/nhập đồng thời vượt giới hạn */
  stateVersion: { type: Number, default: 0 },
  expireAt: { type: Date, default: () => new Date(Date.now() + OTP.SESSION_TTL_MS) },
});

// MongoDB tự xóa phiên hết hạn
PendingSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export const PendingRegistration = mongoose.model<IPendingRegistration>('PendingRegistration', PendingSchema);

export const OTP_FIELDS = ['codeHash', 'expiresAt', 'attempts', 'lastSentAt', 'sendCount', 'sendLockedUntil', 'verifyLockedUntil'] as const;

export const pickOtpState = (d: IPendingRegistration): OtpState => ({
  codeHash: d.codeHash ?? null,
  expiresAt: d.expiresAt || 0,
  attempts: d.attempts || 0,
  lastSentAt: d.lastSentAt || 0,
  sendCount: d.sendCount || 0,
  sendLockedUntil: d.sendLockedUntil || 0,
  verifyLockedUntil: d.verifyLockedUntil || 0,
});

/**
 * Ghi state mới theo kiểu compare-and-swap: chỉ ghi nếu chưa ai khác sửa (stateVersion không đổi).
 * Trả về false nếu có request khác chen vào trước.
 */
export async function saveOtpState(doc: IPendingRegistration, next: OtpState): Promise<boolean> {
  const res = await PendingRegistration.updateOne(
    { _id: doc._id, stateVersion: doc.stateVersion },
    { $set: { ...next }, $inc: { stateVersion: 1 } }
  );
  if (res.modifiedCount === 1) {
    doc.stateVersion += 1;
    return true;
  }
  return false;
}
