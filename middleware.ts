import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function readRole(raw?: string): string | undefined {
  if (!raw) return undefined;
  try {
    // Cookie được mã hóa URL; vẫn đọc được cookie cũ chưa mã hóa
    const text = raw.startsWith('%7B') || raw.startsWith('%7b') ? decodeURIComponent(raw) : raw;
    return JSON.parse(text)?.role;
  } catch {
    return undefined; // cookie hỏng không được làm sập cả trang
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === '/auth' || pathname.startsWith('/auth/');
  const isPublic = pathname === '/' || pathname.startsWith('/tin-tuc') || pathname.startsWith('/images') || isAuthPage;

  if (isPublic) {
    // Đã đăng nhập thì không cần ở lại trang đăng nhập
    if (token && isAuthPage && !request.nextUrl.searchParams.has('expired')) {
      const role = readRole(request.cookies.get('user')?.value);
      return NextResponse.redirect(new URL(role === 'GOVERNMENT' ? '/gov' : '/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!token) return NextResponse.redirect(new URL('/auth', request.url));

  const role = readRole(request.cookies.get('user')?.value);
  if (pathname.startsWith('/gov') && role !== 'GOVERNMENT') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Bỏ qua file tĩnh, ảnh và các file trong public (có đuôi mở rộng)
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)'],
};
