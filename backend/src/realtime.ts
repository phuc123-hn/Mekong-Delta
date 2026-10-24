import { Server } from 'socket.io';

/**
 * Giữ tham chiếu tới Socket.io ở một module riêng để các route không phải import server.ts
 * (tránh import vòng tròn). Mỗi người dùng được đưa vào phòng riêng `user:<id>` và phòng theo vai trò
 * `role:<ROLE>` nên tin nhắn riêng chỉ đến đúng người nhận.
 */
let io: Server | null = null;

export const setIO = (server: Server) => {
  io = server;
};

export const emitToUser = (userId: string, event: string, payload: unknown) => {
  io?.to(`user:${userId}`).emit(event, payload);
};

export const emitToRole = (role: 'FARMER' | 'GOVERNMENT', event: string, payload: unknown) => {
  io?.to(`role:${role}`).emit(event, payload);
};

export const emitToAll = (event: string, payload: unknown) => {
  io?.emit(event, payload);
};
