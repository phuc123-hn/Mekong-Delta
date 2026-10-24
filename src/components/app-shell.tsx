'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';
import { useRealtime } from '@/lib/realtime';
import { Spinner } from '@/components/ui';

interface NavItem {
  label: string;
  href: string;
  badge?: 'chat';
}

const FARMER_NAV: NavItem[] = [
  { label: 'Tổng quan', href: '/dashboard' },
  { label: 'Bản đồ rủi ro', href: '/dashboard/stress-map' },
  { label: 'Tin nhắn', href: '/dashboard/inbox', badge: 'chat' },
  { label: 'Bác Tư Vấn (AI)', href: '/dashboard/ai-tuvan' },
  { label: 'Kiến thức', href: '/dashboard/knowledge' },
];

const GOV_NAV: NavItem[] = [
  { label: 'Tổng quan', href: '/gov' },
  { label: 'Nhập liệu', href: '/gov/input' },
  { label: 'Hộp thoại', href: '/gov/inbox', badge: 'chat' },
  { label: 'Tin nhắn chung', href: '/gov/announcements' },
  { label: 'Phân tích AI', href: '/dashboard/ai-analysis' },
  { label: 'Quản lý người dùng', href: '/gov/users' },
];

const TITLES: Record<string, string> = {
  '/dashboard': 'Tổng quan',
  '/dashboard/stress-map': 'Bản đồ rủi ro',
  '/dashboard/inbox': 'Tin nhắn',
  '/dashboard/ai-tuvan': 'Bác Tư Vấn (AI)',
  '/dashboard/knowledge': 'Kiến thức',
  '/dashboard/ai-analysis': 'Phân tích AI',
  '/gov': 'Tổng quan',
  '/gov/input': 'Nhập liệu theo tỉnh',
  '/gov/inbox': 'Hộp thoại với nông dân',
  '/gov/announcements': 'Tin nhắn chung',
  '/gov/users': 'Quản lý người dùng',
};

const FARMER_ONLY = ['/dashboard/stress-map', '/dashboard/inbox', '/dashboard/ai-tuvan', '/dashboard/knowledge'];

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => setMounted(true), []);

  // Chưa đăng nhập -> về trang đăng nhập. Sai vai trò -> về trang chủ của vai trò đó.
  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated || !user) return router.replace('/auth');
    if (user.role === 'GOVERNMENT' && (pathname === '/dashboard' || FARMER_ONLY.some((p) => pathname.startsWith(p)))) router.replace('/gov');
    if (user.role === 'FARMER' && (pathname.startsWith('/gov') || pathname.startsWith('/dashboard/ai-analysis'))) router.replace('/dashboard');
  }, [mounted, isAuthenticated, user, pathname, router]);

  useEffect(() => setMenuOpen(false), [pathname]);

  const loadUnread = useCallback(async () => {
    try {
      const res = await api.get('/api/messages/unread');
      setUnread(res.data.chat || 0);
    } catch {
      /* huy hiệu chưa đọc không quan trọng bằng nội dung trang */
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadUnread();
    const t = setInterval(loadUnread, 30000);
    return () => clearInterval(t);
  }, [isAuthenticated, loadUnread, pathname]);

  useRealtime({ chat_message: () => loadUnread() });

  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <Spinner size={36} />
      </div>
    );
  }

  const nav = user.role === 'GOVERNMENT' ? GOV_NAV : FARMER_NAV;
  const isActive = (href: string) => (href === '/dashboard' || href === '/gov' ? pathname === href : pathname.startsWith(href));
  const title = TITLES[pathname] || Object.entries(TITLES).find(([k]) => k !== '/dashboard' && k !== '/gov' && pathname.startsWith(k))?.[1] || 'Delta Stress Lens';

  const sidebar = (
    <nav className="flex h-full flex-col bg-slate-900">
      <div className="border-b border-slate-800 px-5 py-4">
        <p className="text-lg font-bold text-white">Delta Stress Lens</p>
        <p className="text-xs text-slate-400">Đồng bằng sông Cửu Long</p>
      </div>
      <ul className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.href) ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.label}</span>
              {item.badge === 'chat' && unread > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{unread > 99 ? '99+' : unread}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
      <div className="border-t border-slate-800 p-4">
        <p className="truncate text-sm font-semibold text-white">{user.fullName || 'Người dùng'}</p>
        <p className="mb-3 text-xs text-slate-400">{user.role === 'GOVERNMENT' ? 'Cơ quan quản lý' : 'Nông dân'}</p>
        <button onClick={logout} className="btn btn-secondary w-full">
          Đăng xuất
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950">
      {/* Thanh bên cho màn hình lớn */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 lg:block">{sidebar}</aside>

      {/* Thanh bên dạng ngăn kéo cho điện thoại */}
      {menuOpen && (
        <div className="fixed inset-0 z-[1200] lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMenuOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85%] border-r border-slate-800">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(true)} className="btn btn-secondary px-3 py-1.5 lg:hidden" aria-label="Mở menu">
              Menu
            </button>
            <h2 className="text-base font-semibold text-white">{title}</h2>
          </div>
          <p className="hidden text-sm text-slate-400 sm:block">{user.phone}</p>
        </header>

        {/* Vùng nội dung: luôn cuộn được, thanh cuộn hiện rõ */}
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
