# 🔍 DEBUG LỖI 404 - HƯỚNG DẪN TỔNG HỢP

## 🚀 Bước 1: Chạy server và xem logs

```bash
cd backend
npm run dev
```

**Kỳ vọng thấy:**
```
✅ Server middleware initialized
📋 Registered routes:
  GET|POST → /api/auth/register
  GET|POST → /api/auth/login
  GET → /api/data/...
  GET → /api/messages/...
  GET → /api/forecasts/...
📝 Logs: ./logs
✅ Running on http://localhost:5000
```

Nếu **không thấy route nào** → router import sai hoặc middleware chặn.

---

## 📋 Bước 2: Kiểm tra Request từ Frontend

### 2a. Xem Network Tab (Browser DevTools)
1. Mở browser → F12 (DevTools)
2. Tab **Network**
3. Làm action (login/register)
4. Xem request:
   - **URL**: Phải là `http://localhost:5000/api/auth/login` (không phải `/login` hoặc `/auth/login`)
   - **Method**: POST (không phải GET)
   - **Status**: 404 = route sai, 500 = route đúng nhưng error trong code
   - **Headers**: Xem `Authorization` (nếu protected route)
   - **Request Body**: Phải có `phone`, `password`

### 2b. Kiểm tra Frontend API.ts
```typescript
// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
// PHẢI SET trong .env.local hoặc Vercel env vars
// Giá trị: http://localhost:5000 (local) hoặc https://api.mekong.com (production)
```

**Fix nhanh (local):**
```bash
# .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### 2c. Test bằng Postman/cURL
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0123456789","password":"password123"}'
```

**Kỳ vọng:**
- ✅ 200: `{ "token": "...", "user": {...} }`
- ❌ 404: `{ "error": "404 Not Found", "availableRoutes": [...] }`
- ❌ 400: `{ "error": "Phone number already registered" }`

---

## 🔬 Bước 3: Đọc Server Logs

### Nơi logs được lưu:
```
logs/
├── server-2024-01-15.log      (toàn bộ request)
├── error-2024-01-15.log       (chỉ error)
```

### Ví dụ log cần xem:

**Login REQUEST:**
```
[2024-01-15T10:30:45.123Z] [INFO] 👉 [POST] /api/auth/login {
  ip: "::1",
  userAgent: "Mozilla/5.0...",
  body: {phone: "0123456789", password: "123456"}
}
```

**Login RESPONSE (200):**
```
[2024-01-15T10:30:45.245Z] [INFO] ✓ [POST] /api/auth/login → 200 (122ms)
```

**404 ERROR:**
```
[2024-01-15T10:30:46.000Z] [ERROR] 🔴 404 NOT FOUND: POST /login
[2024-01-15T10:30:46.001Z] [ERROR] Available routes: GET|POST /api/auth/register, GET|POST /api/auth/login
```

**Route sai nhất**: Xem `Available routes` để check đúng path là gì.

---

## 🐛 Bước 4: Fix Lỗi Cụ Thể

### ❌ LỖI 1: "404 Not Found: POST /login"
**Nguyên nhân:** Frontend gọi `/login` thay vì `/api/auth/login`

**Fix:**
```typescript
// src/lib/api.ts - Sai
const response = await api.post('/login', {...});

// Đúng
const response = await api.post('/auth/login', {...});
```

---

### ❌ LỖI 2: "404 Not Found: POST /api/auth/login" (phải là GET)
**Nguyên nhân:** Backend route là GET `/api/auth/login` nhưng frontend POST

**Frontend fix:**
```typescript
const response = await api.get('/auth/login'); // Wrong
const response = await api.post('/auth/login', {phone, password}); // Correct
```

**Backend fix** (nếu route sai):
```typescript
// backend/src/routes/auth.ts - Sai
router.get('/login', async (req, res) => { ... });

// Đúng
router.post('/login', async (req, res) => { ... });
```

---

### ❌ LỖI 3: "body undefined" hoặc "req.body = {}"
**Nguyên nhân:** Middleware `express.json()` chưa chạy hoặc bị ghi đè

**Server fix:**
```typescript
// backend/src/server.ts
// ✅ ĐÚNG: middleware trước routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes); // Sau này

// ❌ SAI: middleware sau routes
app.use('/api/auth', authRoutes);
app.use(express.json()); // Quá muộn!
```

---

### ❌ LỖI 4: CORS error (blocked request)
**Logs hiển thị:** `🚫 CORS blocked: ...`

**Browser error:** `Access to XMLHttpRequest ... has been blocked by CORS policy`

**Fix:**
```typescript
// backend/src/server.ts
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://mekong.vercel.app'],
  credentials: true
}));
```

---

### ❌ LỖI 5: Node version downgrade (dependency mismatch)
**Triệu chứng:**
- Module not found error
- Unexpected token
- Cannot read property error

**Fix:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run build
npm run dev
```

**Check Node version:**
```bash
node --version
# Expected: v18.x hoặc v20.x (phải giống package.json)
```

---

## 📊 Bước 5: Cheat Sheet - Route Status

Khi xem logs, dùng này để interpret:

| Status | Ý nghĩa | Nguyên nhân | Fix |
|--------|---------|-----------|-----|
| **404** | Route không tồn tại | URL/method sai, route chưa register | Xem `availableRoutes` |
| **400** | Bad request | Body format sai, validation fail | Check req.body, schema |
| **401** | Unauthorized | Token fail, auth header sai | Check Authorization header |
| **403** | Forbidden | Không quyền (sai role) | Check authMiddleware |
| **500** | Server error | Exception trong route handler | Xem error stack trong logs |
| **200** | Success! | Request thành công | ✅ Done |

---

## 🎯 Bước 6: Verify Routes (Auto List)

**Server sẽ auto print routes lúc start:**
```
📋 Registered routes:
  PATCH,GET,PUT,DELETE,POST → /api/auth/register
  PATCH,GET,PUT,DELETE,POST → /api/auth/login
  PATCH,GET,PUT,DELETE,POST → /api/data
  PATCH,GET,PUT,DELETE,POST → /api/messages
  PATCH,GET,PUT,DELETE,POST → /api/forecasts
```

Nếu route bạn cần **không có trong list này** → bạn copy sai URL.

---

## ✅ Checklist Debug Final

Chạy qua list này trước khi report bug:

- [ ] Backend chạy `npm run dev`, thấy ✅ Running
- [ ] Logs folder có file `server-YYYY-MM-DD.log`
- [ ] Network tab browser hiển thị request URL đúng (copy-paste)
- [ ] Method đúng (GET/POST/PUT/DELETE)
- [ ] Body có data (nếu POST/PUT)
- [ ] Status code là gì (404 / 400 / 500 / 200)
- [ ] Logs hiển thị request (👉) hoặc 404 message
- [ ] Xem `availableRoutes` để check route tồn tại
- [ ] Frontend `.env.local` có `NEXT_PUBLIC_BACKEND_URL`
- [ ] No CORS error (hoặc fix CORS config)
- [ ] Node version >= 18.x

---

## 🔥 Pro Tips

### Tip 1: Real-time Log Watching
```bash
# Terminal 1: Chạy server
npm run dev

# Terminal 2: Watch logs
tail -f logs/error-*.log  # macOS/Linux
Get-Content logs/error-*.log -Wait  # Windows PowerShell
```

### Tip 2: Test API Direct (Skip Frontend)
```bash
# VS Code REST Client extension, file test.rest
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "phone": "0123456789",
  "password": "password123"
}
```

### Tip 3: Add Debug Breakpoint
```typescript
// backend/src/routes/auth.ts
router.post('/login', async (req, res) => {
  console.log('🔍 DEBUG: req.body =', req.body);
  console.log('🔍 DEBUG: req.headers =', req.headers);
  // ... rest code
});
```

---

## 📞 Still 404?

1. **Copy lại logs folder** (`logs/error-*.log`)
2. **Paste core error message** vào GitHub issue
3. **Thêm:**
   - Frontend URL + request method + URL test
   - Node version (`node --version`)
   - What you tried to fix it

Good luck! 🚀
