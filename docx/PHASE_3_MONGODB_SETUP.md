# 🚀 PHASE 3.0: MONGODB BACKEND SETUP - COMPLETED ✅

## 📊 Tình trạng hiện tại

Chúng ta vừa hoàn thành **Bước 3.0 & 3.1** của Phase 3:

### ✅ Hoàn thành:
1. **MongoDB Connection** - Tạo `backend/src/config/db.ts` kết nối MongoDB
2. **Database Models**:
   - ✅ `User.ts` - Schema người dùng (phone, password, role: FARMER|GOVERNMENT)
   - ✅ `Message.ts` - Schema tin nhắn (senderId, receiverId, content, isRead)
   - ✅ `Metric.ts` - Schema chỉ số nông nghiệp (type, value, region, recordedAt)
3. **Auth Routes Migration** - Migrate từ in-memory → MongoDB
   - ✅ POST `/api/auth/register` - Tạo user mới với bcryptjs hashing
   - ✅ POST `/api/auth/login` - Xác thực + trả JWT
4. **Message API Routes** - Viết lại routes/messages.ts dùng MongoDB Models
5. **Seed Script** - Tạo `npm run db:seed` để tạo dữ liệu mẫu
6. **TypeScript Build** - ✅ Compile thành công (0 errors)

---

## 🔧 CẤU TRÚC BACKEND HIỆN TẠI

```
backend/
├── src/
│   ├── config/
│   │   └── db.ts                    ← NEW: MongoDB connection
│   ├── models/
│   │   ├── User.ts                  ← NEW: User schema + password hashing
│   │   ├── Message.ts               ← NEW: Message schema
│   │   └── Metric.ts                ← NEW: Metric schema
│   ├── db/
│   │   └── seed.ts                  ← NEW: Seed script với test data
│   ├── routes/
│   │   ├── auth.ts                  ← MIGRATED: In-memory → MongoDB
│   │   └── messages.ts              ← UPDATED: Dùng MongoDB Message model
│   ├── middleware/
│   │   └── auth.ts                  ✅ (JWT validation - unchanged)
│   ├── utils/
│   │   └── jwt.ts                   ← UPDATED: userId từ string (ObjectId)
│   └── server.ts                    ← UPDATED: Thêm connectDB()
├── .env                             ← UPDATED: Thêm MONGO_URI
└── package.json                     ← UPDATED: Thêm npm run db:seed
```

---

## 📝 HƯỚNG DẪN SỬ DỤNG

### 1️⃣ Chuẩn bị MongoDB

#### Option A: Local MongoDB (Dev/Testing)
```bash
# Cài MongoDB Community Edition
# Windows: https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Linux: sudo apt-get install -y mongodb

# Khởi động MongoDB
mongod
# hoặc trên macOS:
brew services start mongodb-community
```

#### Option B: MongoDB Atlas (Cloud) - Recommend cho Production
1. Đăng ký tại: https://www.mongodb.com/cloud/atlas
2. Tạo database cluster (miễn phí)
3. Lấy connection string: `mongodb+srv://username:password@cluster0.xxx.mongodb.net/agritech_db`
4. Update `.env`:
```bash
MONGO_URI=mongodb+srv://username:password@cluster0.xxx.mongodb.net/agritech_db?retryWrites=true&w=majority
```

### 2️⃣ Seed Database với Dữ liệu Mẫu

```bash
cd backend
npm run db:seed
```

**Output:**
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
```

### 3️⃣ Khởi động Backend

```bash
cd backend
npm run dev
# hoặc
npm run build && npm run start
```

**Output:**
```
✅ MongoDB Connected: localhost

╔════════════════════════════════════════╗
║   DELTA STRESS LENS - BACKEND API      ║
║   ✅ Running on http://localhost:5000  ║
╚════════════════════════════════════════╝
```

---

## 🧪 TEST API ROUTES

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0909123456",
    "password": "12345678"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "role": "FARMER",
    "phone": "0909123456",
    "fullName": "Nguyễn Văn B (Nông dân)"
  }
}
```

### Test Get Inbox (Protected)
```bash
curl -X GET http://localhost:5000/api/messages/inbox \
  -H "Authorization: Bearer eyJhbGc..."
```

### Test Send Message
```bash
curl -X POST http://localhost:5000/api/messages/send \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Chào admin, tôi có câu hỏi về kỹ thuật canh tác",
    "receiverId": "65a1b2c3d4e5f6g7h8i9j0k2"
  }'
```

---

## 📚 DATABASE SCHEMA

### Users Collection
```typescript
{
  _id: ObjectId,
  phone: "0909123456",           // Unique, pattern: 0xxxxxxxxx
  password_hash: "bcrypt_hash",  // Hashed với bcryptjs
  fullName: "Nguyễn Văn B",
  role: "FARMER" | "GOVERNMENT",
  region: "An Giang",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Messages Collection
```typescript
{
  _id: ObjectId,
  senderId: ObjectId,            // Ref to User
  receiverId: ObjectId | null,   // null = broadcast
  content: "Tin nhắn...",
  isRead: false,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### Metrics Collection
```typescript
{
  _id: ObjectId,
  type: "SOIL_MOISTURE" | "WATER_LEVEL" | "TEMPERATURE" | "PH" | "NITROGEN" | "STRESS_LEVEL",
  value: 65.5,
  region: "An Giang",
  recordedAt: ISODate,
  updatedBy: ObjectId,           // Ref to User
  notes: "Optional notes...",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

---

## 🔐 Security & Best Practices

✅ **Implemented:**
- Password hashing với bcryptjs (salt rounds: 10)
- JWT validation middleware trên protected routes
- Role-based access control (FARMER vs GOVERNMENT)
- Mongoose data validation

🔄 **TODO - Phase 3.2:**
- [ ] Rate limiting trên auth endpoints (brute force protection)
- [ ] HTTPS/TLS setup cho production
- [ ] Audit logging cho sensitive operations
- [ ] Encryption cho sensitive data (nếu cần)

---

## 📋 NEXT STEPS: BẬC 3.2 - DATA API & METRICS

Tiếp theo, chúng ta sẽ:

1. **GET /api/metrics** - Lấy chỉ số nông nghiệp từ DB
2. **POST /api/metrics** - Farmer upload chỉ số mới
3. **GET /api/forecasts** - Lấy dự báo mùa vụ (có thể integrate Gemini API)
4. **Socket.io Event Handlers** - Real-time data updates

---

## ✨ TÓNG TẮT

| Công việc | Trạng thái |
|-----------|-----------|
| MongoDB Connection | ✅ Hoàn thành |
| User Model & Auth | ✅ Hoàn thành |
| Message Model & Routes | ✅ Hoàn thành |
| Metric Model | ✅ Hoàn thành (schema only) |
| Seed Script | ✅ Hoàn thành |
| Backend Build | ✅ Thành công (0 errors) |
| **Phase 3.1** | **✅ COMPLETE** |

---

## 🎯 Architecture Pattern (DDD - Domain-Driven Design)

```
┌─────────────────────────────────────┐
│   Frontend (Next.js 14 + React)     │  ← Role-based UI, i18n
└────────────────┬────────────────────┘
                 │ (JWT Token)
                 ↓
┌─────────────────────────────────────┐
│   API Gateway (Express)              │  ← authMiddleware, requireRole
└────────────────┬────────────────────┘
                 │
        ┌────────┼────────┐
        ↓        ↓        ↓
     Auth    Messages  Metrics  ← (Socket.io Events)
     Routes  Routes    Routes
        │        │        │
        └────────┼────────┘
                 ↓
        ┌─────────────────────┐
        │  MongoDB Database   │  ← Collections: Users, Messages, Metrics
        └─────────────────────┘
```

---

**Bạn sẵn sàng setup MongoDB và test login API chưa?**

Hay chúng ta sẽ:
- [ ] Kiểm tra data routes (GET /api/data)
- [ ] Setup real-time Socket.io messaging
- [ ] Implement Metrics API endpoints
