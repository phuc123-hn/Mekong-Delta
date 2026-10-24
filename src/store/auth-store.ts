'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { clearSession, explainApiError } from '@/lib/api';
import { disconnectSocket } from '@/lib/realtime';

export interface User {
  id?: string;
  userId?: string;
  phone?: string;
  email?: string | null;
  fullName?: string;
  region?: string | null;
  role: 'FARMER' | 'GOVERNMENT';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  login: (phone: string, password: string) => Promise<void>;
}

/** Cookie cho middleware: chỉ chứa thông tin tối thiểu (vai trò), đã mã hóa URL để không vỡ khi có tiếng Việt */
function writeCookies(token: string, user: User) {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax`;
  document.cookie = `user=${encodeURIComponent(JSON.stringify({ id: user.id, role: user.role }))}; path=/; max-age=${maxAge}; samesite=lax`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        set({ token, user, isAuthenticated: true });
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        writeCookies(token, user);
      },

      logout: () => {
        disconnectSocket();
        set({ user: null, token: null, isAuthenticated: false });
        clearSession();
        window.location.href = '/auth';
      },

      login: async (phone, password) => {
        try {
          // retryNetwork: tự thử lại 1 lần nếu mạng chập chờn (đăng nhập an toàn để thử lại)
          const res = await api.post('/api/auth/login', { phone, password }, { retryNetwork: true } as any);
          const { token, user } = res.data;
          useAuthStore.getState().setAuth(token, user);
        } catch (err) {
          const info = await explainApiError(err);
          throw Object.assign(new Error(info.message), { info });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
    }
  )
);
