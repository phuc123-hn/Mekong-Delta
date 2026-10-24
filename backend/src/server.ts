import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import fs from 'fs';

dotenv.config();

import connectDB, { isDbReady } from './config/db';
import authRoutes from './routes/auth';
import dataRoutes from './routes/data';
import messagesRoutes from './routes/messages';
import usersRoutes from './routes/users';
import { authMiddleware, requireRole } from './middleware/auth';
import { verifyToken } from './utils/jwt';
import { setIO } from './realtime';
import { migrateLegacyMessages } from './utils/migrate';
import { isMailConfigured } from './utils/mailer';
import { fail } from './utils/http';

// ---------------------------------------------------------------- Logger
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
const day = new Date().toISOString().split('T')[0];
const logFile = path.join(logsDir, `server-${day}.log`);
const errorLogFile = path.join(logsDir, `error-${day}.log`);

function log(level: string, ...args: any[]) {
  const message = `[${new Date().toISOString()}] [${level}] ${args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : a)).join(' ')}`;
  console.log(message);
  if (level === 'ERROR') fs.appendFileSync(errorLogFile, message + '\n');
  fs.appendFileSync(logFile, message + '\n');
}

/** Không bao giờ ghi mật khẩu / OTP / token vào file log */
const SENSITIVE = ['password', 'otp', 'token', 'passwordhash', 'password_hash'];
function redact(value: any): any {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, SENSITIVE.includes(k.toLowerCase()) ? '***' : redact(v)]));
  }
  return value;
}

// ---------------------------------------------------------------- Env check
const missing = ['MONGO_URI', 'JWT_SECRET'].filter((k) => !process.env[k]);
if (missing.length) log('WARN', '⚠️  Thiếu biến môi trường:', missing.join(', '));
if (!isMailConfigured()) log('WARN', '⚠️  Chưa cấu hình SMTP (SMTP_HOST / SMTP_USER / SMTP_PASS): mã OTP sẽ chỉ được in ra console backend.');

// ---------------------------------------------------------------- CORS
/**
 * Cho phép: localhost / 127.0.0.1 (mọi cổng), mạng LAN nội bộ khi chạy dev (vd 192.168.x.x:5073 - nguyên nhân
 * từng gây "Network Error" khi mở web bằng địa chỉ IP), và các URL khai báo trong FRONTEND_URL (nhiều URL cách nhau dấu phẩy).
 */
const extraOrigins = (process.env.FRONTEND_URL || '').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
const isDev = process.env.NODE_ENV !== 'production';

export function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true; // Postman, curl, server-to-server
  if (extraOrigins.includes(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') return true;
    if (isDev && /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname)) return true;
  } catch {
    return false;
  }
  return false;
}

const app = express();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: { origin: (origin, cb) => cb(null, isAllowedOrigin(origin)), credentials: true },
});
setIO(io);

app.use((req, res, next) => {
  const start = Date.now();
  // Ghi log khi request kết thúc (lúc này body đã được đọc). Request lỗi sẽ kèm body đã che mật khẩu/OTP/token để dễ tìm nguyên nhân.
  res.on('finish', () => {
    const lvl = res.statusCode >= 500 ? 'ERROR' : 'INFO';
    const failedWrite = res.statusCode >= 400 && req.method !== 'GET' && req.method !== 'OPTIONS';
    log(lvl, `${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`, ...(failedWrite ? [redact(req.body ?? {})] : []));
  });
  next();
});

app.use(
  cors({
    origin: (origin, cb) => {
      if (isAllowedOrigin(origin)) return cb(null, true);
      log('WARN', '🚫 CORS blocked:', origin, '- thêm địa chỉ này vào FRONTEND_URL trong backend/.env nếu đây là web của bạn');
      cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ---------------------------------------------------------------- Routes
app.get('/', (_req, res) => {
  res.json({ message: 'Delta Stress Lens Backend API - Online', status: 'online', database: isDbReady() ? 'connected' : 'connecting', uptime: `${Math.round(process.uptime())}s` });
});

app.get('/health', (_req, res) => {
  res.status(isDbReady() ? 200 : 503).json({ status: isDbReady() ? 'OK' : 'DB_UNAVAILABLE', db: isDbReady() ? 'connected' : 'disconnected', mail: isMailConfigured() ? 'smtp' : 'not-configured', timestamp: new Date().toISOString() });
});

// DB chưa sẵn sàng -> trả lỗi rõ ràng thay vì để request treo rồi báo Network Error
app.use('/api', (req, res, next) => {
  if (req.method === 'OPTIONS' || isDbReady()) return next();
  return fail(res, 503, 'DB_UNAVAILABLE', 'Máy chủ chưa kết nối được cơ sở dữ liệu. Vui lòng thử lại sau vài giây.');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, requireRole('GOVERNMENT'), usersRoutes);
app.use('/api/data', authMiddleware, dataRoutes);
app.use('/api/messages', authMiddleware, messagesRoutes);

// ---------------------------------------------------------------- Socket.io (có xác thực + phòng riêng)
io.use((socket, next) => {
  try {
    const token = (socket.handshake.auth as any)?.token;
    if (!token) return next(new Error('unauthorized'));
    socket.data.user = verifyToken(token);
    next();
  } catch {
    next(new Error('unauthorized'));
  }
});

io.on('connection', (socket) => {
  const user = socket.data.user as { userId: string; role: string };
  socket.join(`user:${user.userId}`);
  socket.join(`role:${user.role}`);
  socket.on('disconnect', () => undefined);
});

// ---------------------------------------------------------------- 404 + lỗi chung (luôn trả JSON có `message`)
app.use((req, res) => fail(res, 404, 'NOT_FOUND', `Không tìm thấy đường dẫn ${req.method} ${req.originalUrl}`));

app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  if (err?.type === 'entity.parse.failed') return fail(res, 400, 'BAD_JSON', 'Dữ liệu gửi lên không đúng định dạng.');
  if (err?.type === 'entity.too.large') return fail(res, 413, 'TOO_LARGE', 'Dữ liệu gửi lên quá lớn.');
  log('ERROR', `${req.method} ${req.originalUrl}`, err?.stack || err?.message || err);
  return fail(res, err?.status || 500, 'SERVER_ERROR', 'Lỗi máy chủ. Vui lòng thử lại sau.');
});

process.on('unhandledRejection', (reason) => log('ERROR', 'unhandledRejection:', reason as any));

// ---------------------------------------------------------------- Start
connectDB(() => {
  migrateLegacyMessages().catch((e) => log('WARN', 'Migrate tin nhắn cũ thất bại:', e?.message));
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => log('INFO', `Delta Stress Lens backend chạy tại http://localhost:${PORT}`));

export default app;
