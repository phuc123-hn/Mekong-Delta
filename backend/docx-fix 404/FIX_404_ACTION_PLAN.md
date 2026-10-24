# 🚀 FIX 404 LỖI - PLAN HÀNH ĐỘNG

## 📋 Tìm Tóm Tắt Những Gì Đã Làm

### ✅ Backend (server.ts):
- ✅ Thêm **global request logger** (lưu file + console)
- ✅ Thêm **404 handler** (show available routes khi 404)
- ✅ Thêm **error handler** global (4 params bắt buộc)
- ✅ **Route listing** (auto print routes lúc start)
- ✅ Tăng giới hạn upload từ default → 50mb
- ✅ CORS logging (show khi CORS blocked)

### ✅ Files Tạo Mới:
- ✅ `vercel.json` - Deploy config cho Vercel
- ✅ `backend/DEBUGGING_404.md` - Full debug guide
- ✅ `backend/QUICK_DEBUG_404.txt` - Quick reference
- ✅ `backend/test-routes.mjs` - Auto test routes

---

## 🎯 Bước Thực Hiện (Làm Ngay)

### BƯỚC 1: Lock Node Version (3 phút)
**Vấn đề:** "downgrade Node" → mất dependencies

```bash
# Cài nvm (từ https://github.com/nvm-sh/nvm)
# Windows: nvm-windows hoặc fnm

# or đơn giản: check Node version
node --version
# Phải >= 18.x (best: 20.x)

# Nếu < 18: Cài lại từ nodejs.org
```

**Create `.nvmrc`** (ghi nhớ version):
```
20.10.0
```

---

### BƯỚC 2: Copy Backend Files + Reinstall (5 phút)
```bash
cd backend

# ⚠ IMPORTANT: Xóa node_modules (fix downgrade Node)
rm -rf node_modules package-lock.json

# Cài lại dependencies
npm install

# Build TypeScript
npm run build

# ✅ Kiểm tra: có folder dist/ không
ls dist/
```

**Nếu build fail:**
```bash
# Check tsconfig.json, lib version mismatch
npm ls typescript
# Phải là ^5.3.2 trở lên
```

---

### BƯỚC 3: Set Environment Variables (2 phút)

**Backend**: `backend/.env`
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/mekong
JWT_SECRET=your-32-char-secret-key-very-secure-ok-bro
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
PORT=5000
```

**Frontend**: `.env.local`
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

---

### BƯỚC 4: Test Backend Routes (2 phút)

**Terminal 1:**
```bash
cd backend
npm run dev
```

**Kỳ vọng thấy:**
```
✅ Server middleware initialized
📋 Registered routes:
  PATCH,GET,PUT,DELETE,POST → /api/auth/register
  PATCH,GET,PUT,DELETE,POST → /api/auth/login
  (other routes...)
✅ Running on http://localhost:5000
📝 Logs: /path/to/logs
```

**Terminal 2 (test routes):**
```bash
cd backend
node test-routes.mjs
```

**Kỳ vọng:**
```
✅ Health Check
   Status: 200 ✓

✅ Register (Public)
   Status: 201 or 409 ✓

✅ Login (Public)
   Status: 200 or 401 ✓

🎉 ALL ROUTES working! Deploy safe! ✅
```

---

### BƯỚC 5: Test Frontend (3 phút)

**Terminal 3:**
```bash
npm run dev  # (từ workspace root)
```

Mở http://localhost:3000 → Thực hiện Login/Register

**Check Network Tab (F12):**
- Request method: POST ✅
- Request URL: `http://localhost:5000/api/auth/login` ✅
- Status: 200 hoặc 4xx (không 404) ✅

---

### BƯỚC 6: Read Logs (Nếu Vẫn Error)

```bash
# Real-time watch logs
tail -f backend/logs/error-*.log  # macOS/Linux

# Windows PowerShell
Get-Content backend/logs/error-*.log -Wait

# Or just read file
cat backend/logs/server-2024-01-15.log
```

**Kiếm dấu hiệu:**
```
👉 [POST] /api/auth/login  ← request tới
✓ [POST] /api/auth/login → 200  ← success
✓ [POST] /api/auth/login → 404  ← route missing!
```

---

## 🔍 Troubleshooting Nhanh

| Vấn đề | Nguyên Nhân | Fix |
|---------|-----------|-----|
| `npm ERR! Cannot find module 'express'` | node_modules bị xóa hoặc corrupt | `npm install` |
| `Cannot find file .../dist/server.js` | TypeScript chưa build | `npm run build` |
| `Error: listen EADDRINUSE :::5000` | Port 5000 đang bị dùng | `lsof -i :5000` (kill process) |
| `CORS blocked error` | Frontend URL không trong whitelist | Thêm vào `frontend_url` .env |
| `req.body undefined` | express.json() ở SAU routes | Đưa `app.use(express.json())` LÊN TRƯỚC |
| `404 Not Found: POST /login` | URL sai (/login vs /api/auth/login) | Check Network tab URL |
| `401 Unauthorized` | Token fail | Check localStorage.getItem('token') |
| `ENOENT: no such file or directory, open '.env'` | .env không tồn tại | Copy từ `.env.example` |

---

## 📊 Verify Checklist

Trước khi đi deploy, verify:

- [ ] Backend chạy, thấy ✅ "Running on localhost:5000"
- [ ] Logs folder có file `server-YYYY-MM-DD.log`
- [ ] `npm test routes.mjs` show ✅ ALL ROUTES working
- [ ] Network tab (F12) hiển thị POST 200 (không 404)
- [ ] `.env` và `.env.local` có đầy đủ giá trị
- [ ] Node version >= 18.x (`node --version`)
- [ ] Không có `npm ERR!` hoặc TypeScript error
- [ ] `const io` export từ server.ts (cho Socket.io)

---

## 🚢 Deploy (Sau Fix OK)

### Vercel Deploy:
```bash
git add .
git commit -m "fix: add logging + 404 handler + vercel.json"
git push
```

Vercel sẽ auto build + deploy.

### Railway/Render Deploy:
```bash
# Check vercel.json sủa route mapping

# Build command:
npm run build && cd backend && npm install && npm run build

# Run command:
PORT=5000 npm start
```

---

## 📞 Nếu Vẫn 404 Sau Tất Cả

1. **Copy error log:**
   ```bash
   cat backend/logs/error-*.log | tail -50
   ```

2. **Test cURL direct:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"phone":"0123456789","password":"test123"}' -v
   ```

3. **Check routes theo tô:**
   ```bash
   grep "Registered routes:" backend/logs/server-*.log
   ```

4. **Report issue với:**
   - Error log (logs/error-*.log)
   - Network screenshot (F12 → Network)
   - Node version (`node --version`)
   - Backend start output (console)

---

## ✨ Pro Tips

### Tip 1: Watch Mode
```bash
# Terminal 1: Watch TypeScript
npm run build -- --watch

# Terminal 2: Auto restart server khi change
npx nodemon dist/server.js
```

### Tip 2: Format Log Output
```typescript
// Trong backend routes hoặc middleware
console.log('🔍 DEBUG:', {
  method: req.method,
  path: req.path,
  body: req.body,
  user: req.user?.id,
  headers: req.headers
});
```

### Tip 3: Test Specific Route
```bash
curl -X GET http://localhost:5000/health \
  -H "Authorization: Bearer YOUR_TOKEN" -v
```

---

## 🎯 Mục Tiêu

✅ **Sau bước này:**
- Backend log chi tiết hết mọi request
- 404 error show available routes
- Frontend connect tới backend mà không 404
- Deploy safe (vercel.json sẳn sàng)

**Good luck bro! 🚀 Fix xong rồi mình scale nếu cần.**
