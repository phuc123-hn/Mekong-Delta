import Link from 'next/link';
import { HOTLINE, HOTLINE_DISPLAY } from '@/data/news';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="text-lg font-bold text-white">
          Delta Stress Lens
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/#tin-tuc" className="hidden rounded-lg px-3 py-2 text-slate-300 hover:text-white sm:block">
            Tin tức và cảnh báo
          </Link>
          <Link href="/auth" className="rounded-lg px-3 py-2 font-medium text-slate-200 hover:text-white">
            Đăng nhập
          </Link>
          <Link href="/dashboard" className="btn btn-primary">
            Vào hệ thống
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-4 py-10 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          <p className="text-lg font-bold text-white">Delta Stress Lens</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Công cụ hỗ trợ quyết định cho nông dân và cơ quan quản lý vùng Đồng bằng sông Cửu Long, theo dõi bốn rủi ro: mặn, nhiệt, lũ và ô nhiễm nước.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Hotline hỗ trợ</p>
          <a href={`tel:${HOTLINE}`} className="mt-1 block text-xl font-bold text-cyan-300 hover:text-cyan-200">
            {HOTLINE_DISPLAY}
          </a>
          <p className="mt-1 text-slate-400">Hỗ trợ đăng ký, đăng nhập và hướng dẫn sử dụng hệ thống.</p>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-xs text-slate-500">© 2026 Delta Stress Lens. Thông tin trên hệ thống mang tính tham khảo, không thay thế chỉ đạo của cơ quan chức năng.</p>
    </footer>
  );
}
