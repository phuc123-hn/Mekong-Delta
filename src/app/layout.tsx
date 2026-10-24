import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/i18n';

// Thêm subset "vietnamese" để dấu tiếng Việt hiển thị đúng phông chữ
const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'Delta Stress Lens | Giám sát rủi ro môi trường Đồng bằng sông Cửu Long',
  description: 'Cảnh báo sớm xâm nhập mặn, nắng nóng, lũ và ô nhiễm nước cho nông dân và cơ quan quản lý vùng Đồng bằng sông Cửu Long.',
  authors: [{ name: 'Delta Team' }],
};

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
