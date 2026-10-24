# ✅ MONGODB ATLAS SETUP CHECKLIST

## 📋 Theo dõi tiến độ

### BƯỚC 1: Đăng ký MongoDB Atlas
- [ ] Mở https://www.mongodb.com/cloud/atlas
- [ ] Đăng ký/Đăng nhập (Google recommended)
- [ ] Tạo Organization (tên tùy ý)

**Status:** ⏳ PENDING

---

### BƯỚC 2: Tạo Cluster
- [ ] Chọn "Build a Database"
- [ ] Chọn "FREE" (Shared)
- [ ] Chọn Region: Singapore hoặc Hong Kong
- [ ] Đặt tên Cluster: `agritech-cluster`
- [ ] Chọn "Create Deployment"
- [ ] ⏳ Chờ 1-2 phút cluster tạo xong

**Status:** ⏳ PENDING

---

### BƯỚC 3: Tạo Database User
- [ ] Username: `admin` (hoặc ghi nhớ tên khác)
- [ ] Password: `password123` (hoặc ghi nhớ password khác)
- [ ] Chọn "Create User"

**Credentials đã tạo:**
```
Username: _______________
Password: _______________
```

**Status:** ⏳ PENDING

---

### BƯỚC 4: Setup Network Access
- [ ] Chọn "My Local Environment" hoặc "Allow Access from Anywhere"
- [ ] Chọn "Add Entry" / "Confirm"

**Status:** ⏳ PENDING

---

### BƯỚC 5: Lấy Connection String
- [ ] Chọn "Drivers" (hoặc tab "Connect")
- [ ] Language: Node.js
- [ ] Copy toàn bộ connection string

**Connection String:**
```
mongodb+srv://_______________
```

**Status:** ⏳ PENDING

---

### BƯỚC 6: Update `.env` Backend
- [ ] Mở file: `backend/.env`
- [ ] Tìm dòng `MONGO_URI=...`
- [ ] Thay bằng connection string từ bước 5
- [ ] Lưu file (Ctrl + S)

**Nội dung sau khi update:**
```
MONGO_URI=mongodb+srv://admin:password123@agritech-cluster.xxxxx.mongodb.net/agritech_db?retryWrites=true&w=majority
```

**Status:** ⏳ PENDING

---

### BƯỚC 7: Test Connection

#### Terminal 1: Khởi động Backend
```bash
cd backend
npm run dev
```

- [ ] Chờ đến khi thấy: `✅ MongoDB Connected`
- [ ] Copy nội dung log screen

**Log Screen:**
```
_____________
```

**Status:** ⏳ PENDING

#### Terminal 2: Seed Database
```bash
cd backend
npm run db:seed
```

- [ ] Chờ đến khi thấy: `✅ Database seeded successfully!`
- [ ] Kiểm tra có 3 users được tạo

**Users created:**
- [ ] ADMIN: 0912345678
- [ ] FARMER 1: 0909123456
- [ ] FARMER 2: 0987654321

**Status:** ⏳ PENDING

#### Terminal 3: Test API
```bash
cd backend
npm run test:api
```

- [ ] Login test cho ADMIN: ✅ SUCCESS
- [ ] Login test cho FARMER 1: ✅ SUCCESS
- [ ] Login test cho FARMER 2: ✅ SUCCESS
- [ ] Protected route test: ✅ SUCCESS
- [ ] Message send test: ✅ SUCCESS

**Test Results:**
```
Total tests: 3 accounts
Passed: ___/3
Failed: ___/3
```

**Status:** ⏳ PENDING

---

## 🎯 FINAL STATUS

**Khi hoàn thành tất cả:**

```
┌─────────────────────────────────────────┐
│  ✅ MONGODB ATLAS SETUP COMPLETE        │
│                                         │
│  Database: agritech_db                  │
│  Cluster: agritech-cluster              │
│  Region: Singapore                      │
│  Status: 🟢 CONNECTED                   │
│                                         │
│  Test Results:                          │
│  ✅ Authentication: PASS                │
│  ✅ Protected Routes: PASS              │
│  ✅ Messaging API: PASS                 │
│                                         │
│  🎉 READY FOR FRONTEND INTEGRATION!     │
└─────────────────────────────────────────┘
```

---

## 📸 Screenshots để đối chiếu

### Screenshot 1: MongoDB Atlas Dashboard
- Cluster đang chạy (status = "AVAILABLE")
- Network Access tab hiển thị IP whitelist

### Screenshot 2: Connection String
- Driver: Node.js
- Chuỗi kết nối từ MongoDB Atlas

### Screenshot 3: Terminal 1 Output
```
✅ MongoDB Connected: agritech-cluster.xxxxx.mongodb.net
Running on http://localhost:5000
```

### Screenshot 4: Terminal 2 Output
```
✅ Database seeded successfully!
Created 3 users
```

### Screenshot 5: Terminal 3 Output
```
✅ LOGIN SUCCESS! (ADMIN)
✅ LOGIN SUCCESS! (FARMER_1)
✅ LOGIN SUCCESS! (FARMER_2)
✅ Test Summary: All tests passed
```

---

## 🆘 NẾUẾ GẶP LỖI

**Ghi lại:**
- [ ] Lỗi nào xảy ra
- [ ] Terminal nào (1, 2, hay 3)
- [ ] Copy-paste error message

**Error Log:**
```
_____________________
_____________________
_____________________
```

---

## 📞 BÁO CÁO KHI HOÀN THÀNH

Gửi cho mình:
```
✅ MongoDB Atlas Setup Status
- Cluster: agritech-cluster
- Connected: YES ✅
- Seeded: YES ✅
- Tests Passed: 3/3 ✅
- Ready for Frontend: YES ✅

Ready for next phase: PHASE 3.2 (Data API)
```

---

**Chúc bạn may mắn!** 🚀
Khi hoàn thành, báo cáo lại - chúng ta sẽ chuyển sang kết nối Frontend! 🎉
