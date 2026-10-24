# 🚀 QUICK START: MongoDB Setup & Login Testing

## ⚡ 3 Bước để "cắm điện" cho hệ thống:

### **BƯỚC 1: Chọn MongoDB Instance**

#### ✅ Option A: MongoDB Local (DEV/TESTING - Nhanh nhất) ✨ ĐANG DÙNG
```
📦 Phiên bản: MongoDB 8.2.4 2008R2Plus SSL (64-bit)
🔌 Kết nối: mongodb://127.0.0.1:27017/agritech_db
⚡ Tốc độ: Cực nhanh (local)
🌐 Yêu cầu: Không cần internet
```

**Cài đặt (nếu chưa có):**
- Download: https://www.mongodb.com/try/download/community
- Chọn: Windows → MSI → Latest
- Chạy installer → Next → Tích "Install MongoDB as a Service" → Install
- MongoDB sẽ tự chạy mỗi khi khởi động máy

**Kiểm tra:**
```bash
mongod --version
# hoặc
services.msc  # tìm MongoDB → Status = Running
```

**File `.env` trong backend:**
```env
MONGO_URI=mongodb://127.0.0.1:27017/agritech_db
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

---

#### ✅ Option B: MongoDB Atlas (CLOUD - Recommend)
1. Đăng ký miễn phí: https://www.mongodb.com/cloud/atlas
2. Tạo cluster (chọn M0 free tier)
3. Thêm user (username/password)
4. Get connection string: `mongodb+srv://username:password@cluster0.xxx.mongodb.net/agritech_db?retryWrites=true&w=majority`
5. Update `.env`:

```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxx.mongodb.net/agritech_db?retryWrites=true&w=majority
JWT_SECRET=your_secret_key
```

---

### **BƯỚC 2: Tạo Test Data (Seed Database)**

Chạy lệnh:
```bash
cd backend
npm run db:seed
```

**Output sẽ hiển thị:**
```
🌱 Seeding database...
✅ Cleared existing users and messages
✅ Created 3 users:
   - Trần Văn A (Admin) (0912345678)
   - Nguyễn Văn B (Nông dân) (0909123456)
   - Phạm Thị C (Nông dân) (0987654321)
✅ Created 3 sample messages

📝 Test Credentials:
   ADMIN:
     Phone: 0912345678
     Password: admin123456
   FARMER 1:
     Phone: 0909123456
     Password: 12345678
   FARMER 2:
     Phone: 0987654321
     Password: password123

✅ Database seeded successfully!
```

💡 **Tip:** Nếu muốn reset dữ liệu, chỉ cần chạy `npm run db:seed` lại!

---

### **BƯỚC 3: Test Login API**

#### 3.1 Khởi động Backend Server
```bash
cd backend
npm run dev
```

Chờ đến khi thấy:
```
✅ MongoDB Connected: localhost

╔════════════════════════════════════════╗
║   DELTA STRESS LENS - BACKEND API      ║
║   ✅ Running on http://localhost:5000  ║
╚════════════════════════════════════════╝
```

#### 3.2 Test API bằng Script (Terminal mới)
```bash
cd backend
npm run test:api
```

**Script sẽ:**
- ✅ Thử đăng nhập với 3 tài khoản mẫu
- ✅ Kiểm tra JWT token trả về
- ✅ Test protected route (`/api/messages/inbox`)
- ✅ Test gửi tin nhắn

**Output mẫu:**
```
╔══════════════════════════════════════════╗
║        🧪 TESTING MEKONG DELTA API       ║
║     Auth Login + JWT Token Validation    ║
╚══════════════════════════════════════════╝

📡 API Base URL: http://localhost:5000

==================================================
🔐 Testing ADMIN: 0912345678
==================================================

📤 Sending POST /api/auth/login...

✅ LOGIN SUCCESS!
   User ID: 65a1b2c3d4e5f6g7h8i9j0k1
   Full Name: Trần Văn A (Admin)
   Role: GOVERNMENT
   Phone: 0912345678
   Token: eyJhbGciOiJIUzI1NiIsI...dffkdfkdfdf

✅ INBOX FETCH SUCCESS!
   Messages count: 1
   Sample: Thông báo chung: Hãy kiểm tra dữ liệu độ ẩm đất hôm nay!

==================================================
🔐 Testing FARMER_1: 0909123456
==================================================
... (tiếp tục cho FARMER_2)

✨ Test Summary:
   ✅ Login endpoints tested with all 3 accounts
   ✅ Protected route access validated
   ✅ Message sending capability verified
```

---

## 🔧 Manual Test (nếu không dùng script)

### Test Login bằng `curl`

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0909123456",
    "password": "12345678"
  }'

# Response (copy token này):
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": "65a1b2c3d4e5f6g7h8i9j0k1",
#     "role": "FARMER",
#     "phone": "0909123456",
#     "fullName": "Nguyễn Văn B (Nông dân)"
#   }
# }
```

```bash
# 2. Test protected route
curl -X GET http://localhost:5000/api/messages/inbox \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Response:
# [
#   {
#     "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
#     "senderId": { "fullName": "Trần Văn A (Admin)", "phone": "0912345678" },
#     "receiverId": null,
#     "content": "Thông báo chung: Hãy kiểm tra dữ liệu độ ẩm đất hôm nay!",
#     "isRead": false,
#     "createdAt": "2026-02-03T..."
#   }
# ]
```

---

## ✅ Checklist: Khi nào có thể chuyển sang Frontend Integration?

- [ ] MongoDB instance đang chạy (local hoặc Atlas)
- [ ] `npm run db:seed` thành công → 3 users tạo được
- [ ] `npm run dev` backend chạy → "Running on http://localhost:5000"
- [ ] `npm run test:api` - tất cả test pass ✅
- [ ] Có thể login + nhận JWT token
- [ ] Protected routes trả về dữ liệu

**Nếu tất cả ✅**, bạn sẵn sàng để:**
1. **Integrate Frontend** - Cập nhật `auth-store.ts` dùng real JWT
2. **Setup Socket.io** - Real-time messaging
3. **Implement Data API** - GET/POST metrics

---

## 🆘 Troubleshooting

### ❌ "Cannot connect to MongoDB"
```
Error: MongoDB Connection Error: connect ECONNREFUSED
```
**Fix:**
- Kiểm tra MongoDB đang chạy: `mongod` hoặc Docker
- Kiểm tra MONGO_URI trong `.env` đúng không
- Local: `mongodb://localhost:27017/agritech_db`
- Atlas: `mongodb+srv://user:pass@cluster0...`

### ❌ "Auth failed: Phone not found"
```
401 Unauthorized: Invalid credentials
```
**Fix:**
- Kiểm tra seed data đã tạo: `npm run db:seed`
- Kiểm tra MongoDB có dữ liệu: Dùng MongoDB Compass
- Thử phone: `0909123456`, password: `12345678`

### ❌ "CORS error on frontend"
```
Access to XMLHttpRequest blocked by CORS
```
**Fix:**
- Backend `server.ts` đã có CORS setup (✅ sẵn rồi)
- Frontend fetch URL phải là `http://localhost:5000`

---

## 🎯 Kết quả cuối cùng

Khi mọi bước hoàn tất:

```
┌────────────────────┐
│   Frontend (3000)  │
│   + Real JWT       │
└────────┬───────────┘
         │ Token: eyJhbGc...
         ↓
┌────────────────────┐
│  Backend API (5000)│
│  ✅ MongoDB        │
│  ✅ Auth Working   │
│  ✅ Messages API   │
└────────┬───────────┘
         │
         ↓
┌────────────────────┐
│    MongoDB DB      │
│  ✅ Users: 3      │
│  ✅ Messages: 3   │
└────────────────────┘

🎉 System Ready for Production!
```

---

**Bạn ready? Hãy chạy:**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Seed data
cd backend && npm run db:seed

# Terminal 3: Test
cd backend && npm run test:api
```

**Báo cáo lại kết quả nhé!** 🚀
