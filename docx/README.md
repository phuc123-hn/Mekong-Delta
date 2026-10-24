# DELTA STRESS LENS 🌾

**Compound Risk Analytics Platform for Mekong Delta Farmers**

---

## 📋 Quick Start

### 1️⃣ **One-Command Start**
```bash
cd "c:\Users\VivoBook\Documents\mekong\web\Backup2\Mekong Delta"
.\start-all.bat
```
✅ Backend: http://localhost:3001  
✅ Frontend: http://localhost:5073

### 2️⃣ **Login**
- **Phone:** `0909123456`
- **Password:** `12345678`

### 3️⃣ **Explore**
- 🗺️ Stress Map: View 3 Mekong provinces (Cần Thơ, An Giang, Cà Mau)
- 📬 Inbox: Manage farmer messages
- 📚 Knowledge: Educational resources
- 👥 Contact: Get support

---

## 🎯 What is DELTA STRESS?

An intelligent platform that helps farmers in the Mekong Delta understand and mitigate environmental risks:

- **Salinity:** Track water salinity levels
- **Heat:** Monitor temperature stress
- **Flood:** Assess flood risk
- **Pollution:** Detect chemical contamination

**Visual Analytics:** Interactive Leaflet maps with real-time risk indices

---

## 🏗️ Architecture

```
Frontend (Next.js 14) ←→ Backend (Express.js)
  ↓ 5073                  ↓ 3001
  
 React 18              In-Memory Store
 Tailwind CSS          (No Database)
 Leaflet Maps          JWT Auth
 Zustand State         CORS Enabled
```

**Full documentation:** See [KIẾN_TRÚC_HIỆN_TẠI.md](./docs/KIẾN_TRÚC_HIỆN_TẠI.md)

---

## 📁 Project Structure

```
Mekong Delta/
├── start-all.bat              # 🚀 One-click start script
│
├── frontend/                  # Next.js app (port 5073)
│   ├── src/
│   │   ├── app/              # Pages
│   │   ├── components/       # UI components
│   │   ├── store/            # Zustand stores
│   │   ├── lib/              # Utilities
│   │   └── data/             # Static data (GeoJSON)
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                   # Express.js API (port 3001)
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── middleware/       # JWT auth
│   │   ├── utils/            # JWT helpers
│   │   └── server.ts         # Entry point
│   ├── package.json
│   └── tsconfig.json
│
└── docs/                      # Documentation
    ├── CÁCH RUN.txt          # How to run
    ├── HƯỚNG_DẪN_NHANH.md   # Quick guide
    ├── KIẾN_TRÚC_HIỆN_TẠI.md # Architecture
    └── MVP_CHECKLIST.md      # Feature status
```

---

## 🔐 Authentication

**JWT-based with in-memory user store**

```
POST /api/auth/login
POST /api/auth/register

Demo Account:
- Phone: 0909123456
- Password: 12345678
- Role: FARMER
```

Token stored in:
- ✅ localStorage
- ✅ HTTP cookie (secure)

---

## 🗺️ Main Features

### Stress Map Page
- Interactive Leaflet map with 3 Mekong provinces
- 4 stress layers: Salinity, Heat, Flood, Pollution
- Layer visibility toggle + opacity control
- Click province → detailed panel with:
  - Compound risk index
  - Bar chart visualization
  - Risk level classification
  - Individual stress indices

### Inbox System
- Farmer message submission
- Government notification center
- Reply functionality
- Status tracking (SENT → READ → RESPONDED)

### Dashboard
- Quick navigation cards
- User profile display
- Links to all features

### Responsive Design
- Desktop: Sidebar + Full map + Right panel
- Mobile: Bottom sheet + Full map

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend Framework** | Next.js 14 |
| **UI Library** | React 18 |
| **Styling** | Tailwind CSS 3 |
| **State Management** | Zustand |
| **Animation** | Framer Motion |
| **Maps** | Leaflet 1.9.4 |
| **Charts** | Recharts |
| **Backend** | Express.js |
| **Authentication** | JWT + bcryptjs |
| **Language** | TypeScript 5 |

---

## ⚙️ System Requirements

- **Node.js:** v18+ (tested: v24.13.0)
- **npm:** v9+ (tested: v11.6.2)
- **RAM:** 500MB+
- **Disk:** 500MB+
- **OS:** Windows / macOS / Linux

---

## 🚀 Installation & Setup

### First Time Setup
```bash
# Navigate to project
cd "c:\Users\VivoBook\Documents\mekong\web\Backup2\Mekong Delta"

# Install dependencies (both frontend & backend)
npm install
cd backend && npm install && cd ..

# Run
.\start-all.bat
```

### Manual Setup (2 Terminals)
```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Runs on http://localhost:3001

# Terminal 2 - Frontend
npm run dev
# Runs on http://localhost:5073
```

---

## 🧪 Testing

### Test Checklist
- [ ] Login with demo account works
- [ ] Stress map loads with 3 provinces
- [ ] Click province → detail panel appears
- [ ] Theme toggle changes colors
- [ ] Language toggle switches VN/EN
- [ ] Inbox page loads without errors
- [ ] All navigation links work
- [ ] Mobile responsive ✓

See [MVP_CHECKLIST.md](./docs/MVP_CHECKLIST.md) for full test suite

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Failed to fetch" on login | Backend not running. Check Terminal 1 |
| Port 3001/5073 in use | `taskkill /F /IM node.exe` → restart |
| Module not found | Run `npm install` in affected folder |
| Map shows blank | Check browser console for errors |
| Token expired | Login again or refresh page |

See [CÁCH RUN.txt](./docs/CÁCH%20RUN.txt) for more troubleshooting

---

## 📊 Database Status

⚠️ **Current:** In-memory stores (no persistence on restart)
- Users: Stored in JavaScript object
- Messages: Stored in JavaScript array

✅ **For Production:** Replace with PostgreSQL  
(Schema ready in migration files)

---

## 🔗 API Documentation

### Auth Routes
```
POST /api/auth/login
POST /api/auth/register
```

### Message Routes
```
GET /api/messages/inbox
GET /api/messages/gov-inbox
POST /api/messages/send
POST /api/messages/reply
```

### Data Routes
```
GET /api/data/provinces
GET /api/data/province/:id
```

### Health Check
```
GET /health
```

See [KIẾN_TRÚC_HIỆN_TẠI.md](./docs/KIẾN_TRÚC_HIỆN_TẠI.md) for full API details

---

## 📝 Documentation Files

| File | Purpose |
|------|---------|
| CÁCH RUN.txt | Step-by-step setup guide |
| HƯỚNG_DẪN_NHANH.md | Quick start reference |
| KIẾN_TRÚC_HIỆN_TẠI.md | System architecture deep-dive |
| MVP_CHECKLIST.md | Feature status & test checklist |
| DANH_SÁCH_KIỂM_TRA_MVP.md | Original MVP requirements |

---

## 🎓 Learning the Codebase

### Frontend Flow
1. `src/app/page.tsx` - Auth check & redirect
2. `src/app/auth/page.tsx` - Login/register
3. `src/app/dashboard/stress-map/page.tsx` - Main feature
4. `src/components/map-view.tsx` - Leaflet integration
5. `src/store/layer-store.ts` - State management

### Backend Flow
1. `backend/src/server.ts` - Express setup
2. `backend/src/routes/auth.ts` - User authentication
3. `backend/src/routes/messages.ts` - Message handling
4. `backend/src/middleware/auth.ts` - JWT verification

---

## 🤝 Contributing

When making changes:
1. Update corresponding doc file
2. Test both frontend & backend
3. Check responsive design (mobile/desktop)
4. Verify console has no errors
5. Update MVP_CHECKLIST.md if needed

---

## 📞 Support

- **Demo Account:** 0909123456 / 12345678
- **Frontend:** http://localhost:5073
- **Backend:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

---

## 📜 License

Internal project for Mekong Delta Farmers  
Developed: 2025-2026

---

## 🎉 Status

✅ **MVP Version:** Ready for testing  
✅ **All Core Features:** Implemented  
✅ **Documentation:** Complete  
✅ **Deployment Ready:** Pending database setup

**Next Phase:** PostgreSQL integration + Production deployment

---

**Last Updated:** February 2, 2026  
**Version:** 2.0 (Post-Merge)
