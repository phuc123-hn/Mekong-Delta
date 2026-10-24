import { Request, Response, NextFunction } from 'express';
import { verifyToken, AuthPayload } from '../utils/jwt';
import { fail } from '../utils/http';

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') return next();

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return fail(res, 401, 'UNAUTHORIZED', 'Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.');
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return fail(res, 401, 'TOKEN_INVALID', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }
};

export const requireRole = (requiredRole: 'FARMER' | 'GOVERNMENT') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== requiredRole) {
      const who = requiredRole === 'GOVERNMENT' ? 'cơ quan quản lý' : 'nông dân';
      return fail(res, 403, 'FORBIDDEN', `Chức năng này chỉ dành cho tài khoản ${who}.`);
    }
    next();
  };
};
