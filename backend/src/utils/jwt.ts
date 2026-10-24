import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthPayload {
  userId: string; // MongoDB ObjectId
  role: string;
  fullName?: string; // ← THÊM DÒNG NÀY
}

export const generateToken = (userId: string, role: string, fullName?: string): string => {
  return jwt.sign({ userId, role, fullName }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): AuthPayload => {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
};

export const decodeToken = (token: string): AuthPayload | null => {
  try {
    return jwt.decode(token) as AuthPayload;
  } catch {
    return null;
  }
};
