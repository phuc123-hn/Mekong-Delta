import axios, { AxiosError } from 'axios';

const RAW_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
export const API_URL = RAW_URL.replace(/\/+$/, '');
const TIMEOUT_MS = 20000;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  // 20 giây: backend trên Railway/Render có thể mất vài giây để "thức dậy" sau thời gian không dùng
  timeout: TIMEOUT_MS,
});

const isBrowser = () => typeof window !== 'undefined';

export function clearSession() {
  if (!isBrowser()) return;
  ['token', 'user', 'auth-storage'].forEach((k) => localStorage.removeItem(k));
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

api.interceptors.request.use((config) => {
  if (isBrowser()) {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const cfg: any = error.config;

    // Lỗi mạng chập chờn: tự thử lại 1 lần với request GET hoặc request được đánh dấu retryNetwork
    const noResponse = !error.response;
    const canRetry = cfg && !cfg.__retried && (cfg.method === 'get' || cfg.retryNetwork);
    if (noResponse && canRetry && error.code !== 'ECONNABORTED') {
      cfg.__retried = true;
      await new Promise((r) => setTimeout(r, 800));
      return api(cfg);
    }

    // Phiên đăng nhập hết hạn (không áp dụng cho chính các request đăng nhập/đăng ký)
    const url = String(cfg?.url || '');
    if (error.response?.status === 401 && !url.startsWith('/api/auth/') && isBrowser()) {
      clearSession();
      if (!window.location.pathname.startsWith('/auth')) window.location.href = '/auth?expired=1';
    }
    return Promise.reject(error);
  }
);

export default api;

// ---------------------------------------------------------------------------------------------
// Chuyển mọi lỗi thành thông báo tiếng Việt nói rõ NGUYÊN NHÂN (thay cho chữ "Network Error" chung chung)
// ---------------------------------------------------------------------------------------------
export interface ApiErrorInfo {
  message: string;
  kind: 'network' | 'cors' | 'timeout' | 'server' | 'client';
  status?: number;
  code?: string;
  field?: string;
  retryAfterSec?: number;
  attemptsLeft?: number;
}

/** Phân biệt "backend không chạy" với "backend chạy nhưng trình duyệt chặn (CORS)" */
async function diagnoseNetwork(): Promise<ApiErrorInfo> {
  const origin = isBrowser() ? window.location.origin : '';
  if (isBrowser() && window.location.protocol === 'https:' && API_URL.startsWith('http:')) {
    return {
      kind: 'network',
      message: `Trang web chạy HTTPS nhưng địa chỉ máy chủ (${API_URL}) lại là HTTP nên trình duyệt chặn kết nối. Hãy đặt NEXT_PUBLIC_BACKEND_URL thành địa chỉ https.`,
    };
  }
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 6000);
    // mode no-cors: nếu máy chủ đang chạy thì promise vẫn thành công (response "opaque") dù bị chặn CORS
    await fetch(`${API_URL}/health`, { mode: 'no-cors', signal: ctl.signal, cache: 'no-store' });
    clearTimeout(t);
    return {
      kind: 'cors',
      message: `Máy chủ đang chạy nhưng trình duyệt chặn kết nối vì địa chỉ web hiện tại (${origin}) chưa được cho phép. Hãy thêm địa chỉ này vào FRONTEND_URL trong backend/.env rồi chạy lại backend.`,
    };
  } catch {
    return {
      kind: 'network',
      message: `Không kết nối được tới máy chủ tại ${API_URL}. Backend có thể chưa chạy hoặc đang khởi động lại. Hãy chạy backend (cd backend, npm run dev), kiểm tra NEXT_PUBLIC_BACKEND_URL và kết nối mạng, rồi thử lại.`,
    };
  }
}

export async function explainApiError(err: unknown): Promise<ApiErrorInfo> {
  const e = err as AxiosError<any>;

  if (e?.response) {
    const d = e.response.data || {};
    const status = e.response.status;
    const fallback =
      status === 401 ? 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.' :
      status === 403 ? 'Bạn không có quyền thực hiện thao tác này.' :
      status === 404 ? 'Không tìm thấy dữ liệu yêu cầu.' :
      status === 429 ? 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.' :
      status === 503 ? 'Máy chủ chưa kết nối được cơ sở dữ liệu. Vui lòng thử lại sau vài giây.' :
      status >= 500 ? 'Máy chủ gặp lỗi. Vui lòng thử lại sau.' :
      'Yêu cầu không hợp lệ.';
    return {
      message: d.message || (typeof d.error === 'string' ? d.error : '') || fallback,
      kind: status >= 500 ? 'server' : 'client',
      status,
      code: d.code,
      field: d.field,
      retryAfterSec: d.retryAfterSec,
      attemptsLeft: d.attemptsLeft,
    };
  }

  if (e?.code === 'ECONNABORTED' || e?.code === 'ETIMEDOUT') {
    return {
      kind: 'timeout',
      message: `Máy chủ phản hồi quá chậm (hơn ${TIMEOUT_MS / 1000} giây). Máy chủ có thể đang khởi động lại. Vui lòng đợi một lát rồi thử lại.`,
    };
  }

  if (e?.request || e?.message === 'Network Error') return diagnoseNetwork();

  return { kind: 'client', message: (e as Error)?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.' };
}
