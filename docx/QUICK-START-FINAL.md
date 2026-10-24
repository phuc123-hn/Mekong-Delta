================================================================================
🚀 QUICK START - Chạy Backend + Frontend Đúng Cách
================================================================================

✅ ĐÃ FIX:
[x] Port 5000 → 3001 (backend .env + frontend .env.local)
[x] Script dev:backend (package.json)
[x] Contact page port (localhost:3001)
[x] Public auth.js port (localhost:3001)

================================================================================
📋 BƯỚC 1: Chuẩn Bị (Chỉ chạy lần đầu)
================================================================================

Kiểm tra đã cài node_modules chưa:
```
npm install          # Root frontend
cd backend && npm install && cd ..  # Backend deps
```

================================================================================
🎯 BƯỚC 2: Chạy Backend + Frontend (ĐÚNG CÁCH)
================================================================================

❗ CHẠY 2 TERMINAL RIÊNG BIỆT (KHÔNG GỘP):

─────────────────────────────────────────────────────────
TERMINAL 1: BACKEND (Port 3001)
─────────────────────────────────────────────────────────

cd backend
npm run dev

✅ Kết quả mong đợi:
  • "Compiling TypeScript..." log
  • "✅ Server running on port 3001"
  • "✅ MongoDB connected" (hoặc database log)
  • Không có error

─────────────────────────────────────────────────────────
TERMINAL 2: FRONTEND (Port 5073)
─────────────────────────────────────────────────────────

npm run dev

✅ Kết quả mong đợi:
  • "ready - started server on 0.0.0.0:5073"
  • Build log: "✓ Compiled successfully"
  • "🌐 API_URL configured as: http://localhost:3001" ✅ (PHẢI LÀ 3001!)

================================================================================
🌐 BƯỚC 3: MỞ BROWSER & TEST
================================================================================

URL: http://localhost:5073

✅ Test ngay:
1. Login (Farmer hoặc Government account)
   • Username/Email
   • Password

2. Test Báo Cáo (FIX 404):
   • Farmer dashboard → "Báo Cáo" sidebar
   • URL: http://localhost:5073/dashboard/bao-cao
   • Thấy 3 card tỉnh (Cần Thơ, An Giang, Cà Mau)
   • Mỗi card hiện: Độ Mặn, Nhiệt độ, Lưu lượng, Ô nhiễm

3. Test Tin Nhắn:
   • Farmer: Dashboard → Inbox → "✉️ Gửi tin cho Chính phủ"
   • Nhập text → Gửi
   • Gov: Gov → Hộp Thư → Thấy tin từ Farmer
   • Gov: Reply → Farmer thấy tin back

4. Test Archive:
   • Inbox → Mở tin → "Lưu Trữ" → Tin biến mất

5. Test Gov Input:
   • Gov → Nhập Liệu
   • Update dữ liệu (Cần Thơ: Mặn 60)
   • Farmer báo cáo → Cập nhật tự động

================================================================================
🔧 NẾU CÓ LỖI
================================================================================

❌ "Cannot GET /dashboard/bao-cao" (404):
   → Backend chạy chưa?
   → npm run build rồi chưa?
   → Refresh browser (Ctrl+R hoặc Cmd+R)

❌ "API Error" hoặc "Connection refused":
   → Backend process chạy ở port 3001 không?
   → Kiểm tra Terminal 1 log: "Server running on port 3001"?
   → Frontend .env.local: NEXT_PUBLIC_BACKEND_URL=http://localhost:3001?

❌ "MongoDB connection error":
   → MongoDB chạy chưa? (Check: mongod process)
   → Hoặc dùng MongoDB Atlas (cloud)
   → Sửa backend/.env: MONGO_URI=...

❌ "Port 5073 already in use":
   → taskkill /F /IM node.exe (Windows)
   → lsof -i :5073 && kill -9 <PID> (Mac/Linux)

❌ TypeScript compile error:
   → cd backend && npm run build
   → Check dist/ folder có file không

================================================================================
⚡ SHORTCUT (Nếu muốn dùng 1 lệnh)
================================================================================

Sau khi setup xong lần đầu, cài concurrently:
```
npm install --save-dev concurrently
```

Rồi chạy:
```
npm run dev:full
```

(Sẽ chạy backend + frontend cùng lúc trong 1 terminal)

⚠️ Nhưng vẫn recommend 2 terminal riêng để dễ debug log!

================================================================================
✅ READY TO GO!
================================================================================

Giờ đã setup xong, mở 2 terminal và chạy:

Terminal 1:
cd backend && npm run dev

Terminal 2:
npm run dev

Browser: http://localhost:5073

Test theo checklist rồi báo kết quả cho tao! 🔥

Bro ơi, chạy xong gửi ảnh screenshot:
- Báo Cáo 3 tỉnh page
- Inbox tin nhắn  
- Gov input dữ liệu

Tao với team sẽ kiểm tra + ăn mừng hoàn thành cơ! 🎉💪
================================================================================
