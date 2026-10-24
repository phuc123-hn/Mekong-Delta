# 🚀 QUICK REFERENCE: MongoDB Atlas Setup (5 phút)

## ⚡ TÓM TẮT LẠI

### 1️⃣ Tạo MongoDB Atlas Account
```
Vào: https://www.mongodb.com/cloud/atlas
Đăng ký bằng Google → Tạo Organization
```

### 2️⃣ Tạo Cluster
```
Build a Database → FREE → Region: Singapore
Cluster name: agritech-cluster
```

### 3️⃣ Tạo User & Network
```
Username: admin
Password: password123
Network: Allow from Anywhere (0.0.0.0/0)
```

### 4️⃣ Lấy Connection String
```
Connect → Drivers → Copy chuỗi dạng:
mongodb+srv://admin:password123@agritech-cluster.xxxxx.mongodb.net/?...
```

### 5️⃣ Update `.env`
```bash
# Mở: backend/.env
# Thay dòng MONGO_URI bằng:
MONGO_URI=mongodb+srv://admin:password123@agritech-cluster.xxxxx.mongodb.net/agritech_db?retryWrites=true&w=majority
```

### 6️⃣ Test
```bash
# Terminal 1
cd backend && npm run dev
# Chờ: ✅ MongoDB Connected

# Terminal 2
cd backend && npm run db:seed
# Chờ: ✅ Database seeded successfully!

# Terminal 3
cd backend && npm run test:api
# Chờ: ✅ LOGIN SUCCESS! (3/3 accounts)
```

---

## 📝 CRITICAL POINTS

| Bước | Cần nhớ |
|------|--------|
| Username | `admin` |
| Password | `password123` (hoặc ghi nhớ) |
| Cluster | `agritech-cluster` |
| Database | `agritech_db` |
| Region | Singapore hoặc HongKong |
| Network | Allow from Anywhere |

---

## ✅ SUCCESS INDICATORS

```
Terminal 1 Output:
✅ MongoDB Connected: agritech-cluster...
✅ Running on http://localhost:5000

Terminal 2 Output:
✅ Database seeded successfully!
✅ Created 3 users
✅ Created 3 sample messages

Terminal 3 Output:
╔══════════════════════════════════════════╗
║   🧪 TESTING MEKONG DELTA API            ║
║   ✅ LOGIN SUCCESS! (ADMIN)              ║
║   ✅ LOGIN SUCCESS! (FARMER_1)           ║
║   ✅ LOGIN SUCCESS! (FARMER_2)           ║
║   ✅ All tests passed                    ║
╚══════════════════════════════════════════╝
```

---

## 🔧 CHEAT SHEET

### Connection String Template
```
mongodb+srv://[USERNAME]:[PASSWORD]@[CLUSTER].mongodb.net/[DATABASE]?retryWrites=true&w=majority
```

### Example (không dùng cái này!)
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/agritech_db?retryWrites=true&w=majority
```

### Cách Identify từng phần:
```
mongodb+srv://               ← Protocol
admin                        ← [USERNAME]
:password123                 ← :[PASSWORD]
@agritech-cluster           ← @[CLUSTER]
.abc123xyz.mongodb.net      ← MongoDB domain (tự động)
/agritech_db                ← /[DATABASE]
?retryWrites=true&w=majority ← Options (giữ nguyên)
```

---

## 🎯 WHEN TO REPORT BACK

**Báo cáo khi:**
✅ MongoDB Atlas account created
✅ Cluster created and running
✅ Connection string in hand
✅ `.env` file updated
✅ All 3 terminal commands working
✅ `npm run test:api` shows 3/3 LOGIN SUCCESS

**Format báo cáo:**
```
✅ Phase 3.0 Complete
- MongoDB Atlas: Setup ✅
- Database: Connected ✅
- Seed Data: Created (3 users, 3 messages) ✅
- API Tests: All passed (3/3) ✅
- Ready for: Phase 3.2 (Data API Routes)
```

---

## 🆘 QUICK FIXES

| Error | Fix |
|-------|-----|
| "Cannot connect" | Check connection string + password |
| "Network error" | Allow IP from Anywhere |
| "User not found" | Verify username = admin |
| "Auth failed" | Verify password is correct |
| "Database seeding failed" | Check MongoDB is running + connection string correct |

---

**Chúc bạn thành công!** 🚀
Báo cáo lại khi hoàn thành - chúng ta sẽ implement Data API Routes tiếp!
