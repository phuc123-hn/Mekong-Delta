import mongoose, { Schema, Document } from 'mongoose';
import bcryptjs from 'bcryptjs';
import { PHONE_REGEX } from '../utils/validators';

export type UserRole = 'FARMER' | 'GOVERNMENT';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  phone: string;
  email?: string | null;
  emailVerified: boolean;
  password_hash: string;
  fullName: string;
  role: UserRole;
  region?: string | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      // Đúng 10 chữ số, bắt đầu bằng 0
      match: [PHONE_REGEX, 'Số điện thoại phải gồm đúng 10 chữ số'],
      trim: true,
    },
    // sparse: tài khoản cũ (tạo trước khi có email) vẫn hợp lệ
    email: { type: String, lowercase: true, trim: true, unique: true, sparse: true, default: undefined },
    emailVerified: { type: Boolean, default: false },
    password_hash: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    role: { type: String, enum: ['FARMER', 'GOVERNMENT'], default: 'FARMER' },
    region: { type: String, trim: true, default: null },
  },
  { timestamps: true }
);

// Băm mật khẩu trước khi lưu. Bỏ qua nếu mật khẩu đã được băm sẵn (đăng ký qua OTP).
UserSchema.pre('save', async function () {
  if (!this.isModified('password_hash')) return;
  if ((this.$locals as any)?.skipHash) return;
  const salt = await bcryptjs.genSalt(10);
  this.password_hash = await bcryptjs.hash(this.password_hash, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcryptjs.compare(candidatePassword, this.password_hash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
