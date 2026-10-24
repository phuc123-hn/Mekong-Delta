import { Response } from 'express';

/** Mọi lỗi trả về đều có dạng { status, code, message } để frontend hiển thị đúng nguyên nhân. */
export function fail(res: Response, status: number, code: string, message: string, extra: Record<string, unknown> = {}) {
  return res.status(status).json({ status, code, message, ...extra });
}
