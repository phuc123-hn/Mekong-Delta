/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Chỉ ảnh hưởng chế độ dev: chuyển biểu tượng "N" sang góc phải để không đè nút Đăng xuất
  devIndicators: { position: 'bottom-right' },
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
