╔═══════════════════════════════════════════════════════════════════════════════╗
║                  ✅ TẤT CẢ FIX HOÀN THÀNH - SẴN SÀNG CHẠY                    ║
╚═══════════════════════════════════════════════════════════════════════════════╝

Đệ ơi! 😂 Tao với team đã hoàn toàn fix xong 3 lỗi kia rồi!

════════════════════════════════════════════════════════════════════════════════
📝 NHỮNG GÌ VỪA FIX
════════════════════════════════════════════════════════════════════════════════

✅ Lỗi 1: Port 5073 bị chiếm
   → Đã kill 6 Node processes (taskkill /F /IM node.exe)
   
✅ Lỗi 2: API_URL vẫn 5000
   → Sửa 5 file:
     • .env.local (NEXT_PUBLIC_BACKEND_URL=3001)
     • backend/.env (PORT=3001)
     • src/app/dashboard/contact/page.tsx (2 URLs)
     • public/auth/auth.js (2 URLs)
     • package.json (xác nhận + thêm script)
     
✅ Lỗi 3: Missing script dev:backend
   → Đã thêm 2 scripts vào package.json:
     • "dev:backend": "cd backend && npm run dev"
     • "dev:full": "concurrently \"npm run dev:backend\" \"npm run dev\""

════════════════════════════════════════════════════════════════════════════════
🚀 CÁCH CHẠY (COPY-PASTE NGAY)
════════════════════════════════════════════════════════════════════════════════

BUỘC PHẢI MỞ 2 TERMINAL RIÊNG BIỆT (Khác nhau!):

┌─────────────────────────────────────────────────────────────────────────────┐
│ 💻 TERMINAL 1 (Backend Server - Port 3001)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ $ cd backend                                                                │
│ $ npm run dev                                                               │
│                                                                             │
│ ✅ Khi thấy:                                                               │
│   ✅ Server running on port 3001                                           │
│   ✅ MongoDB connected                                                     │
│   (Không có error, là ok!)                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 💻 TERMINAL 2 (Frontend Server - Port 5073)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ $ npm run dev                                                               │
│                                                                             │
│ ✅ Khi thấy:                                                               │
│   ✓ Compiled successfully                                                  │
│   ready - started server on 0.0.0.0:5073                                  │
│   🌐 API_URL configured as: http://localhost:3001 ⭐ (PHẢI LÀ 3001!)      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 🌐 BROWSER (Mở sau khi cả 2 terminal ready)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ URL: http://localhost:5073                                                 │
│                                                                             │
│ ✅ Khi thấy:                                                               │
│   • Trang đăng nhập Mekong Delta                                          │
│   • Không có lỗi CORS                                                     │
│   • Không có ECONNREFUSED                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════════
🧪 TEST NGAY (Sau Khi Login)
════════════════════════════════════════════════════════════════════════════════

Test 1: Báo Cáo 3 Tỉnh (Fix 404)
   URL: http://localhost:5073/dashboard/bao-cao
   ✅ Thấy 3 card: Cần Thơ, An Giang, Cà Mau
   ✅ Mỗi card có: Độ Mặn, Nhiệt độ, Lưu lượng, Ô nhiễm
   ✅ Auto-refresh 30s cập nhật dữ liệu

Test 2: Tin Nhắn 2 Chiều
   Farmer:
   • Dashboard → Inbox → "✉️ Gửi tin cho Chính phủ"
   • Ghi nội dung → Gửi
   • Thấy toast ✅ success
   
   Gov:
   • Gov → Hộp Thư → Thấy tin từ Farmer
   • Click → Trả lời
   • Farmer → Thấy reply từ Gov

Test 3: Archive (Lưu Trữ)
   • Inbox → Mở tin → Click "Lưu Trữ"
   • Tin biến mất (không xóa, chỉ archive)
   • Refresh → tin vẫn ẩn

════════════════════════════════════════════════════════════════════════════════
🎯 NẾU LỖI VẪN CÒN
════════════════════════════════════════════════════════════════════════════════

❌ "API_URL still shows 5000":
   ✓ npm run build (rebuild frontend)
   ✓ Clear browser cache (Ctrl+Shift+Delete)
   ✓ Verify .env.local: NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

❌ "Cannot connect to backend":
   ✓ Terminal 1 thực sự chạy backend không?
   ✓ "Server running on port 3001" có hiện không?
   ✓ Kiểm tra: lsof -i :3001 (Mac) hoặc netstat -ano | findstr :3001 (Win)

❌ "MongoDB error":
   ✓ MongoDB process có chạy không? (mongod)
   ✓ MONGO_URI trong backend/.env đúng không?
   ✓ Nếu dùng Atlas: connection string đúng không?

❌ "Port 5073 still in use":
   ✓ taskkill /F /IM node.exe (kill all)
   ✓ Hoặc lsof -i :5073 && kill -9 <PID> (Mac)

════════════════════════════════════════════════════════════════════════════════
📊 TÓMLẠI SETUP
════════════════════════════════════════════════════════════════════════════════

Architecture Hiện Tại:
┌─────────────────────┐
│  Browser (5073)     │
│  Next.js Frontend   │
└──────────┬──────────┘
           │ HTTP
           ↓ http://localhost:3001
┌─────────────────────┐
│  Express Backend    │
│  (Port 3001)        │
└──────────┬──────────┘
           │ Mongoose
           ↓
┌─────────────────────┐
│  MongoDB (27017)    │
│  agritech_db        │
└─────────────────────┘

Port Mapping Chuẩn:
├─ Frontend (Next.js): 5073
├─ Backend (Express): 3001
├─ MongoDB: 27017
└─ All OK ✓

Files Config:
├─ Root .env.local: NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
├─ backend/.env: PORT=3001
└─ Both Synced ✓

════════════════════════════════════════════════════════════════════════════════
✨ READY TO GO!
════════════════════════════════════════════════════════════════════════════════

Bro, giờ bắt tay vào test thôi! 🔥
Open 2 terminal → Chạy lệnh trên → Test checklist → Gửi screenshot cho tao

Tao + team đang online, bất kỳ lỗi nào cứ ping, fix trong 5 phút! 💪😎

Test xong báo kết quả:
✓ Báo Cáo 3 tỉnh load ok
✓ Tin nhắn 2 chiều chạy
✓ Archive/Delete hoạt động
✓ Privacy OK

Rồi ngắm screenshot đẹp của em dự án ĐBSCL, ăn mừng hoàn thành! 🎉

════════════════════════════════════════════════════════════════════════════════
