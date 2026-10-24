# 🚀 DELTA STRESS LENS - SETUP & DEPLOYMENT GUIDE

## ✅ IMPLEMENTATION COMPLETE

Tất cả 7 giai đoạn đã hoàn thành:
- ✅ Giai đoạn 1: Backend + Database
- ✅ Giai đoạn 2: Login/Register Page (HTML/CSS/JS)
- ✅ Giai đoạn 3: RBAC Middleware
- ✅ Giai đoạn 4: Farmer Features (Map, Knowledge, Contact)
- ✅ Giai đoạn 5: Government Features (Data Input, Inbox)
- ✅ Giai đoạn 6: Theme Toggle, Language Switch
- ✅ Giai đoạn 7: WebSocket Real-time Sync

---

## 🔧 LOCAL DEVELOPMENT SETUP

### 1. **Backend Setup**

```bash
cd backend
npm install
```

Tạo file `.env`:
```
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/delta_stress_lens
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

**Setup Database:**
```bash
# PostgreSQL must be running
npm run db:setup
```

**Start Backend:**
```bash
npm run dev
```

Backend sẽ chạy trên: `http://localhost:3001`

### 2. **Frontend Setup**

```bash
npm install
```

Tạo file `.env.local`:
```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Start Frontend:**
```bash
npm run dev
```

Frontend sẽ chạy trên: `http://localhost:3000`

---

## 🌐 ACCESSING THE SYSTEM

### 1. **Login Page**
- URL: `http://localhost:3000/auth/index.html`
- Format phone: `0` + 9-10 digits (e.g., `0123456789`)
- Password: Minimum 8 characters

### 2. **Register New Account**
- Click "Create one" link on login page
- Phone number must be unique
- Role defaults to FARMER

### 3. **Test Accounts (After DB Setup)**

**Farmer:**
- Phone: `0123456789`
- Password: `password123`

**Government:**
- Phone: `0987654321`
- Password: `password456`

(Create these manually via SQL or use registration form)

---

## 📁 PROJECT STRUCTURE

```
Mekong Delta/
├── backend/
│   ├── src/
│   │   ├── routes/          (API endpoints)
│   │   │   ├── auth.ts      (login/register)
│   │   │   ├── data.ts      (risk data)
│   │   │   ├── messages.ts  (communication)
│   │   │   └── forecasts.ts (alerts)
│   │   ├── middleware/
│   │   │   └── auth.ts      (JWT + RBAC)
│   │   ├── db/
│   │   │   ├── index.ts     (connection)
│   │   │   └── setup.ts     (schema)
│   │   ├── utils/
│   │   │   └── jwt.ts       (token utils)
│   │   └── server.ts        (Express app + WebSocket)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           (with Navbar)
│   │   │   ├── page.tsx             (landing)
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx         (home)
│   │   │   │   ├── map/page.tsx     (farmer map + forecast)
│   │   │   │   ├── knowledge/page.tsx
│   │   │   │   └── contact/page.tsx
│   │   │   └── gov/
│   │   │       ├── input/page.tsx   (data input)
│   │   │       └── inbox/page.tsx   (messages)
│   │   ├── components/
│   │   │   ├── Navbar.tsx           (top nav with controls)
│   │   │   ├── ProtectedRoute.tsx   (auth guard)
│   │   │   ├── ThemeToggle.tsx      (dark/light mode)
│   │   │   └── LanguageSwitch.tsx   (vi/en)
│   │   ├── store/
│   │   │   ├── auth-store.ts        (Zustand auth)
│   │   │   ├── ui-store.ts          (theme, language, sidebar)
│   │   │   └── layer-store.ts       (existing)
│   │   └── lib/
│   │       └── socket.ts            (real-time)
│   ├── public/
│   │   └── auth/
│   │       ├── index.html
│   │       ├── style.css
│   │       ├── auth.js
│   │       └── rocket.svg
│   ├── middleware.ts                (RBAC routing)
│   ├── package.json
│   └── .env.local.example
│
└── docs/
    └── SETUP_GUIDE.md (this file)
```

---

## 🔐 AUTHENTICATION FLOW

```
1. User visits /auth/index.html
   ↓
2. Submits phone + password
   ↓
3. Backend validates at POST /api/auth/login or /register
   ↓
4. If valid → returns JWT token
   ↓
5. Frontend stores token in localStorage
   ↓
6. Displays intro screen with rocket animation
   ↓
7. On click → plays sound, rockets launch, redirects to /dashboard
   ↓
8. Middleware checks token, allows access based on role
```

---

## 👥 RBAC ROLES & PERMISSIONS

### **FARMER (Nông dân)**
- ✅ View map & forecasts
- ✅ Access knowledge base
- ✅ Send messages to government
- ✅ View responses
- ❌ Cannot access `/gov/*` routes

### **GOVERNMENT (Chính quyền)**
- ✅ Input/update risk data
- ✅ Broadcast forecasts/alerts
- ✅ View farmer inbox
- ✅ Reply to messages
- ❌ Cannot access `/dashboard/*` routes (except dashboard home)

---

## 📊 API ENDPOINTS

### **Auth**
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### **Risk Data** (Protected + GOVERNMENT)
- `GET /api/data` - Fetch all risk data
- `POST /api/data/update` - Update risk data

### **Messages** (Protected)
- `GET /api/messages/inbox` - Farmer inbox
- `GET /api/messages/gov-inbox` - Government inbox
- `POST /api/messages/send` - Send message
- `POST /api/messages/reply` - Reply to message

### **Forecasts** (Protected + GOVERNMENT)
- `GET /api/forecasts?horizon=SHORT` - Get forecasts
- `POST /api/forecasts/broadcast` - Broadcast alert

---

## 🎨 UI FEATURES

### **Login/Register Page**
- Neon purple + cyan gradient background
- Hover glow effects on inputs/buttons
- Ripple animation on button click
- Touch-friendly on mobile
- Form validation before submit

### **Post-Login Intro Effect**
- Rocket SVG images gather from edges to center
- On click → plays sound (fallback if blocked)
- Rockets launch upward with animation
- Screen fades to reveal dashboard
- Body scroll locked during animation

### **Dashboard Features**
- **Navbar** with user info, logout, theme toggle, language switch
- **Protected routes** redirect unauthorized access
- **Sidebar** (expandable, with video player support)
- **Dark theme** by default, light mode toggle
- **Multi-language** Vietnamese/English
- **Real-time data** via polling (WebSocket-ready)

---

## 🚀 DEPLOYMENT

### **Vercel (Frontend + Backend API Routes)**

```bash
# Frontend
npm run build
vercel deploy

# Environment variables in Vercel dashboard:
NEXT_PUBLIC_MAPBOX_TOKEN=...
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
NEXT_PUBLIC_JWT_SECRET=...
```

### **Backend Hosting Options**

**Option 1: Render (Free tier)**
- Push to GitHub
- Connect to Render
- Set environment variables
- Auto-deploy on push

**Option 2: Railway**
- Similar to Render
- Good for Node.js apps

**Option 3: AWS EC2**
- More control
- More expensive
- Better for production scale

### **Database: Vercel Postgres or Supabase**

```bash
# In Vercel:
# Dashboard → Storage → Create Postgres
# Get DATABASE_URL from Vercel

# Or use Supabase:
# https://supabase.com → Create project → Get connection string
```

---

## ⚙️ CONFIGURATION CHECKLIST

- [ ] PostgreSQL database running
- [ ] `.env` file in backend with DATABASE_URL
- [ ] `.env.local` file in frontend with MAPBOX_TOKEN
- [ ] Backend running on :3001
- [ ] Frontend running on :3000
- [ ] Rocket SVG in `/public/auth/rocket.svg`
- [ ] CORS enabled in backend (allow localhost:3000)
- [ ] Middleware.ts protecting routes
- [ ] Auth store persisting token

---

## 🧪 TESTING CHECKLIST

### **Login Flow**
- [ ] Invalid phone format shows error
- [ ] Invalid password shows error
- [ ] Valid credentials show intro screen
- [ ] Rocket animation plays
- [ ] Redirects to dashboard

### **Farmer Features**
- [ ] View map with provinces
- [ ] Select province shows detail panel
- [ ] Forecast chart displays data
- [ ] Knowledge page expands sections
- [ ] Contact form submits message
- [ ] Inbox shows government responses

### **Government Features**
- [ ] Can access /gov/input
- [ ] Farmers cannot access /gov/*
- [ ] Update risk data broadcasts to farmers
- [ ] Broadcast alert sends to all users
- [ ] Inbox shows farmer messages
- [ ] Can reply to messages

### **UI Features**
- [ ] Theme toggle switches dark/light
- [ ] Language switch changes vi/en
- [ ] Navbar displays user info
- [ ] Logout redirects to auth page
- [ ] Responsive on mobile/tablet

---

## 📚 ADDITIONAL RESOURCES

- **Mapbox Docs**: https://docs.mapbox.com/
- **Next.js 14**: https://nextjs.org/docs
- **Zustand**: https://github.com/pmndrs/zustand
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Express**: https://expressjs.com/
- **Socket.io**: https://socket.io/docs/

---

## ⚠️ IMPORTANT NOTES

1. **JWT Secret**: Change `your-jwt-secret-key` in production
2. **Database**: Always backup before deleting data
3. **CORS**: Update allowed origins in production
4. **Passwords**: Bcrypt hashed, never store plain text
5. **Environment**: Keep `.env` files out of Git
6. **Rate Limiting**: Consider adding rate limits to API
7. **SSL/TLS**: Use HTTPS in production

---

## 🆘 TROUBLESHOOTING

### **"Failed to fetch" when logging in**
- Check backend is running on 3001
- Check CORS is enabled in backend
- Check `NEXT_PUBLIC_BACKEND_URL` is correct

### **"Unauthorized" error**
- Token might be expired (7 days)
- Clear localStorage and login again
- Check JWT_SECRET matches

### **Database connection error**
- PostgreSQL service not running
- DATABASE_URL format incorrect
- User permissions not set

### **Map not loading**
- Mapbox token invalid or expired
- Check NEXT_PUBLIC_MAPBOX_TOKEN
- Verify token has correct scopes

---

## 🎓 NEXT STEPS

1. Deploy backend to Render/Railway
2. Deploy frontend to Vercel
3. Point Vercel to backend domain
4. Add SSL certificates
5. Setup CI/CD pipeline
6. Monitor logs & performance
7. Gather user feedback
8. Implement additional features based on feedback

---

**🎉 Delta Stress Lens system is now ready for development and deployment!**

For questions or issues, refer to the docs in `/docs` folder.
