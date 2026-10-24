'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

let socket: Socket | null = null;
let socketToken = '';

/** Một kết nối Socket.io dùng chung cho cả ứng dụng, có xác thực bằng token đăng nhập. */
export function getSocket(token: string): Socket {
  if (socket && socketToken === token) return socket;
  socket?.disconnect();
  socketToken = token;
  socket = io(API_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionDelayMax: 10000,
  });
  // Mất kết nối realtime không làm hỏng trang: các trang đã có cơ chế tự tải lại định kỳ.
  socket.on('connect_error', () => undefined);
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
  socketToken = '';
}

/** Lắng nghe sự kiện realtime. handlers có thể đổi mỗi lần render mà không bị đăng ký lại. */
export function useRealtime(handlers: Record<string, (data: any) => void>) {
  const token = useAuthStore((s) => s.token);
  const ref = useRef(handlers);
  ref.current = handlers;
  const events = Object.keys(handlers).join('|');

  useEffect(() => {
    if (!token) return;
    const s = getSocket(token);
    const bound = events.split('|').filter(Boolean).map((ev) => {
      const fn = (d: any) => ref.current[ev]?.(d);
      s.on(ev, fn);
      return [ev, fn] as const;
    });
    return () => bound.forEach(([ev, fn]) => s.off(ev, fn));
  }, [token, events]);
}
