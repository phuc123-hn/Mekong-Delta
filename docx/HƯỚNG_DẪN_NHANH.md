# Hướng dẫn chạy nhanh DELTA STRESS LENS (v2026)

## ⚡ Start nhanh nhất (1 lệnh):

```bash
# Từ folder dự án
cd "c:\Users\VivoBook\Documents\mekong\web\Backup2\Mekong Delta"

# Chạy script (tự động mở 2 terminal)
.\start-all.bat
```

✅ Backend chạy: http://localhost:3001  
✅ Frontend chạy: http://localhost:5073  
✅ Mở browser: http://localhost:5073

---

## 🔐 Đăng nhập

**Demo Account:**
- Số điện thoại: `0909123456`
- Mật khẩu: `12345678`

Hoặc đăng ký tài khoản mới (bất kỳ số nào, định dạng: 0xx xxxxxxx)

---

## 🗺️ Tính năng chính

| Trang | URL | Mô tả |
|-------|-----|--------|
| Dashboard | `/dashboard` | Tổng quan + Navigation |
| Stress Map | `/dashboard/stress-map` | Bản đồ Leaflet 3 tỉnh Mekong |
| Inbox | `/dashboard/inbox` | Tin nhắn từ nông dân |
| Knowledge | `/dashboard/knowledge` | Thư viện kiến thức |
| Contact | `/dashboard/contact` | Liên hệ |

---

## 📋 Cấu hình hệ thống

**Frontend:**
- Next.js 14 (React 18)
- Tailwind CSS
- Framer Motion (animation)
- Zustand (state management)
- Leaflet (maps)

**Backend:**
- Express.js
- TypeScript
- MongoDB 8.2.4 (Local - tự động chạy)
- JWT authentication

**Database:**
- MongoDB Local: `mongodb://127.0.0.1:27017/agritech_db`
- Tự chạy sau khi cài MongoDB Service

**Cổng mặc định:**
- Backend: `5000`
- Frontend: `5073`

---

## 🐛 Troubleshooting

| Vấn đề | Giải pháp |
|--------|----------|
| "Failed to fetch" | Backend chưa chạy, hoặc MongoDB chưa chạy → Bật MongoDB Service |
| MongoDB Connection Error | Chạy: `services.msc` → tìm MongoDB → click Start |
| Port đã dùng | `taskkill /F /IM node.exe` → chạy lại |
| Module error | `npm install` ở cả backend + frontend |
| Build error | Xóa `.next` folder → rebuild |

---

## ✅ Checklist sau chạy

- [ ] Trang chủ (auth) hiển thị
- [ ] Đăng nhập thành công
- [ ] Dashboard hiển thị navigation cards
- [ ] Stress Map hiển thị Leaflet + 3 tỉnh
- [ ] Click tỉnh → detail-panel bên phải
- [ ] Inbox hiển thị messages (nếu có)
- [ ] Theme toggle (☀️/🌙) hoạt động
- [ ] Language toggle (VN/EN) hoạt động

---

## Versions:

- Node: v18+ (đã test: v24.13.0)
- npm: v9+ (đã test: v11.6.2)
- Next.js: 14.0.0
- React: 18.x
- TypeScript: 5.x
**Chi tiết xem:** `COMPLETE_SETUP_GUIDE.md`
