# 📚 HƯỚNG DẪN CHI TIẾT: Lấy MongoDB Atlas Connection String

## 🎯 Mục tiêu
Trong 5 phút, bạn sẽ có một MongoDB Database trong cloud + Connection String để paste vào `.env`

---

## 📍 BƯỚC 1: Đăng ký MongoDB Atlas (1 phút)

1. Mở: https://www.mongodb.com/cloud/atlas
2. Chọn **Sign Up** (hoặc Sign In nếu đã có account)
3. Đăng ký bằng Google (nhanh nhất):
   - Chọn "Sign up with Google"
   - Hoặc dùng Email + Password

4. Làm theo hướng dẫn tạo organization (tên tùy ý, VD: "mekong-project")

---

## 📍 BƯỚC 2: Tạo Database Cluster (1 phút)

Sau khi đăng ký, bạn sẽ thấy dashboard:

1. Chọn **"Build a Database"** (button lớn ở giữa)

2. Chọn **"FREE"** (Shared)
   - Cập nhật: Nó sẽ hỏi chọn Provider (AWS, GCP, Azure - chọn AWS ok)
   - Chọn Region: **Singapore** hoặc **Hong Kong** (gần Việt Nam)

3. Đặt tên Cluster: `agritech-cluster` (hoặc gì đó bạn nhớ)

4. Chọn **"Create Deployment"**

⏳ Chờ 1-2 phút để cluster tạo xong...

---

## 📍 BƯỚC 3: Tạo Database User (1 phút)

Nó sẽ bật popup "Create a user for your database":

1. **Username**: `admin` (hay gì đó bạn nhớ)
2. **Password**: `password123` (hay gì đó bạn nhớ)
3. Chọn **"Create User"**

🔒 **Lưu ý:** Nhớ username + password này!

---

## 📍 BƯỚC 4: Setup Network Access (1 phút)

Bước tiếp theo hỏi: "Where would you like to connect from?"

Chọn **"My Local Environment"** 

Hoặc chọn **"Allow Access from Anywhere"** (0.0.0.0/0) - Easier, không lo IP thay đổi:

1. Chọn **"Allow Access from Anywhere"**
2. Bấm **"Add Entry"** hoặc **"Confirm"**

✅ IP Whitelist setup xong!

---

## 📍 BƯỚC 5: Lấy Connection String (2 phút) - ⭐ QUAN TRỌNG

1. Bạn sẽ thấy prompt: **"Connect to your cluster"**

2. Chọn **"Drivers"** (hoặc tab "Connect" -> "Drivers")

3. Chọn:
   - **Language**: Node.js
   - **Version**: (Latest - tùy ý)

4. Bạn sẽ thấy chuỗi kết nối:
   ```
   mongodb+srv://admin:<password>@agritech-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. **Copy toàn bộ chuỗi này** (bao gồm `mongodb+srv://` ở đầu)

---

## ⚙️ BƯỚC 6: Update File `.env` Backend

Mở file: `backend/.env`

### ❌ CÓ:
```dotenv
MONGO_URI=mongodb://localhost:27017/agritech_db
```

### ✅ THÀNH:
```dotenv
MONGO_URI=mongodb+srv://admin:password123@agritech-cluster.xxxxx.mongodb.net/agritech_db?retryWrites=true&w=majority
```

**🔴 QUAN TRỌNG:**
- Thay `<password>` bằng **password bạn đặt lúc bước 3** (VD: `password123`)
- Thay `xxxxx` bằng tên cluster thật của bạn (nó nằm trong chuỗi kết nối)
- Thêm `/agritech_db` ở cuối (tên database)

### 📋 Template hoàn chỉnh:
```dotenv
DATABASE_URL=postgresql://postgres:password@localhost:5432/mekong_delta
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection String
MONGO_URI=mongodb+srv://admin:password123@agritech-cluster.xxxxx.mongodb.net/agritech_db?retryWrites=true&w=majority

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
FRONTEND_URL=http://localhost:3000
```

---

## 🚀 BƯỚC 7: Test Connection

Mở **2 Terminal** riêng biệt:

### Terminal 1: Khởi động Backend
```bash
cd backend
npm run dev
```

**Chờ đến khi thấy:**
```
✅ MongoDB Connected: agritech-cluster.xxxxx.mongodb.net
```

Nếu thấy ✅ = Database kết nối thành công! 🎉

### Terminal 2: Seed Data + Test API
```bash
cd backend

# Lệnh 1: Tạo dữ liệu mẫu
npm run db:seed

# Chờ đến khi thấy:
# ✅ Database seeded successfully!
# 📝 Test Credentials: (hiển thị 3 tài khoản)

# Lệnh 2: Test API
npm run test:api

# Chờ đến khi thấy:
# ✅ LOGIN SUCCESS! (cho tất cả 3 accounts)
# ✅ INBOX FETCH SUCCESS!
```

---

## ✅ SUCCESS CHECKLIST

Khi hoàn tất, bạn sẽ thấy:

- ✅ "MongoDB Connected" ở Terminal 1
- ✅ "Database seeded successfully!" ở Terminal 2
- ✅ "LOGIN SUCCESS!" trong test output
- ✅ "INBOX FETCH SUCCESS!" trong test output
- ✅ "Test Summary: All 3 accounts tested"

Nếu tất cả đều ✅ → **Hệ thống sống dậy rồi!** 🎉

---

## 🆘 Troubleshooting

### ❌ Error: "connect ECONNREFUSED" hoặc "Cannot connect"

**Nguyên nhân:** Connection string sai

**Fix:**
1. Kiểm tra lại username/password trong connection string
2. Kiểm tra cluster name (phần `xxxxx` trong URL)
3. Kiểm tra có `/agritech_db` ở cuối không
4. Kiểm tra Network Access: Phải cho phép IP kết nối

**Cách debug:**
- Copy-paste connection string từ MongoDB Atlas lại
- Đảm bảo `<password>` được thay thế bằng password thật

### ❌ Error: "User not found" hoặc "auth failed"

**Fix:**
- Kiểm tra username là `admin` (hoặc tên bạn đặt)
- Kiểm tra password đúng không
- Thử tạo user mới nếu quên password

### ❌ "Database seeded successfully!" nhưng dữ liệu không có

**Fix:**
- Mở MongoDB Compass (bên trái dashboard)
- Check xem database `agritech_db` có collection `users` không
- Nếu không có, kiểm tra error log ở Terminal

---

## 📞 Khi nào báo cáo lại?

**Hãy báo cho tôi khi:**

1. ✅ Lấy được connection string từ MongoDB Atlas
2. ✅ Update xong file `.env`
3. ✅ Terminal 1 hiển thị "✅ MongoDB Connected"
4. ✅ Terminal 2 chạy `npm run test:api` và thấy "✅ LOGIN SUCCESS!"

**Format báo cáo:**
```
✅ MongoDB Atlas Setup Complete
- Cluster: agritech-cluster
- Region: Singapore
- Status: Connected ✅
- Test Results: 3/3 users login success ✅
```

---

**Sẵn sàng chưa? Hãy bắt đầu bước 1 nhé!** 🚀

Nếu gặp khó khăn ở bất cứ bước nào, cứ báo lại tôi ngay!
