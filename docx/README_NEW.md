# 🌊 DELTA STRESS LENS

**Environmental Risk Intelligence Platform for Mekong Delta**

![Status](https://img.shields.io/badge/Status-MVP-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Build](https://img.shields.io/badge/Build-Passing-success)

---

## ⚡ Quick Start (3 Steps)

```bash
# 1️⃣ Run everything
.\start-all.bat

# 2️⃣ Open browser
Frontend: http://localhost:5073
Backend:  http://localhost:3001

# 3️⃣ Login
Phone:    0909123456
Password: 12345678
```

**First time? Read [HƯỚNG_DẪN_NHANH.md](docs/HƯỚNG_DẪN_NHANH.md)**

---

## 📚 Documentation

**For detailed guides, see [docs/00_INDEX.md](docs/00_INDEX.md)**

### Quick Navigation
- 👋 **New to the project?** → [GIỚI_THIỆU.md](docs/GIỚI_THIỆU.md)
- 🚀 **Want to run it now?** → [HƯỚNG_DẪN_NHANH.md](docs/HƯỚNG_DẪN_NHANH.md)
- 🏗️ **Need architecture details?** → [KIẾN_TRÚC_HỆ_THỐNG.md](docs/KIẾN_TRÚC_HỆ_THỐNG.md)
- 📁 **Where are the files?** → [CẤUTRÚC_DỰ_ÁN.md](docs/CẤUTRÚC_DỰ_ÁN.md)
- 🚢 **Deploy to server?** → [SETUP_DEPLOYMENT.md](docs/SETUP_DEPLOYMENT.md)
- ✅ **Testing checklist?** → [MVP_CHECKLIST.md](docs/MVP_CHECKLIST.md)
- 🔮 **What's next?** → [GIAI_DOAN_3_ROADMAP.md](docs/GIAI_DOAN_3_ROADMAP.md)

---

## 🎯 What is DELTA STRESS LENS?

An **intelligent environmental monitoring platform** for the Mekong Delta that:

- 📊 **Visualizes compound risks** (Salinity + Heat + Flood + Pollution)
- 🗺️ **Interactive mapping** with real-time data
- 👥 **Multi-role access** (Farmers vs Government officials)
- 🌐 **Multilingual** (Vietnamese + English)
- 🔐 **Secure authentication** with role-based access control

**Goal:** Help farmers & government officials **make data-driven decisions** to mitigate environmental risks.

---

## 🌟 Key Features

✅ **Interactive Maps** - Leaflet/Mapbox with real-time risk visualization  
✅ **Analytics Dashboard** - Risk breakdown by dimension  
✅ **Multilingual UI** - Vietnamese + English (extensible)  
✅ **Role-Based Access** - Different UI for Farmer vs Government  
✅ **JWT Authentication** - Secure login with password hashing  
✅ **Message System** - Communication between farmers & government  
✅ **Mobile Responsive** - Works on desktop, tablet, mobile  
✅ **Dark Theme** - Enterprise-grade UI optimized for long viewing  

---

## 💻 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js 14, React 18, TypeScript | Latest |
| **Styling** | Tailwind CSS, Framer Motion | 3.3+ |
| **Maps** | Leaflet / Mapbox GL JS | Latest |
| **State** | Zustand | 4.4+ |
| **Backend** | Express.js, Node.js | 20+ |
| **Auth** | JWT, bcryptjs | Latest |
| **Database** | In-Memory (Phase 3: MongoDB) | - |

---

## 🚀 Project Status

| Phase | Feature | Status | Version |
|-------|---------|--------|---------|
| **Phase 1-2** | Frontend + Backend | ✅ Complete | 1.0.0 |
| **Phase 3** | Auth + RBAC + i18n | ✅ Complete | 1.0.0 |
| **Phase 4** | Forecasting (7-day) | 🔄 Planned | - |
| **Phase 5** | Satellite integration | 🔄 Planned | - |
| **Phase 6** | Database (MongoDB) | 🔄 Planned | - |

---

## 📂 Project Structure

```
Mekong Delta/
├── docs/                    # 📚 Complete documentation
│   ├── 00_INDEX.md         # ← START HERE
│   ├── GIỚI_THIỆU.md       # Project overview
│   ├── HƯỚNG_DẪN_NHANH.md   # Quick start (3 steps)
│   └── ... (13 more guides)
│
├── src/                     # 💻 Frontend source code
│   ├── app/                # Next.js pages
│   ├── components/         # React components
│   ├── lib/               # Utilities
│   └── store/             # Zustand state
│
├── backend/                 # ⚙️ Express.js API
│   ├── src/
│   │   ├── server.ts      # Main server
│   │   ├── routes/        # API endpoints
│   │   └── middleware/    # Auth, RBAC
│   └── package.json
│
├── public/                  # 📁 Static files
│   └── auth/              # Login page (HTML/CSS/JS)
│
├── package.json            # Frontend dependencies
└── start-all.bat           # Run everything (Windows)
```

---

## 🔐 Login Credentials

### Test Account (Farmer)
- **Phone:** `0909123456`
- **Password:** `12345678`

### Test Account (Government)
- **Phone:** `0987654321`
- **Password:** `abcd1234`

---

## 🛠️ Development Commands

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Run everything (Windows)
.\start-all.bat

# Or run separately:
npm run dev          # Frontend (5073)
cd backend && npm run dev  # Backend (3001)

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📊 System Architecture

```
┌─────────────────────────────────────┐
│     Browser (User Interface)        │
│  (Next.js 14 + React + Tailwind)    │
└────────────┬────────────────────────┘
             │ HTTP/WebSocket (Port 5073)
             ▼
┌─────────────────────────────────────┐
│    Frontend State Management        │
│  (Zustand + React Query)            │
└────────────┬────────────────────────┘
             │ Fetch API Calls (Port 3001)
             ▼
┌─────────────────────────────────────┐
│     Express.js Backend API          │
│  (Node.js 20+)                      │
│  - Authentication (JWT)             │
│  - RBAC Middleware                  │
│  - Route handlers                   │
└────────────┬────────────────────────┘
             │ Data Storage
             ▼
┌─────────────────────────────────────┐
│    In-Memory Data Store             │
│  (Phase 3: MongoDB)                 │
└─────────────────────────────────────┘
```

---

## 🧪 Testing

Run the checklist: [MVP_CHECKLIST.md](docs/MVP_CHECKLIST.md)

**Key Test Cases:**
- ✅ Login/Logout flow
- ✅ Role-based UI differences
- ✅ Map interaction & zoom
- ✅ Risk calculation accuracy
- ✅ Message system
- ✅ Multi-language switching
- ✅ Mobile responsiveness

---

## 📦 Deployment

**See:** [SETUP_DEPLOYMENT.md](docs/SETUP_DEPLOYMENT.md)

For production deployment on:
- Azure App Service
- AWS EC2
- Self-hosted Linux server
- Docker container

---

## 🔮 Roadmap

**Phase 4:** 7-day weather forecasting + AI insights  
**Phase 5:** Satellite imagery integration  
**Phase 6:** Real MongoDB database with historical data  
**Phase 7:** Mobile app (React Native)  

See: [GIAI_DOAN_3_ROADMAP.md](docs/GIAI_DOAN_3_ROADMAP.md)

---

## 🤝 Contributing

1. Read documentation in `docs/`
2. Follow the folder structure in `src/`
3. Use TypeScript for type safety
4. Test locally before committing
5. Submit PR with clear description

---

## 📞 Support

- 📧 Email: [contact]
- 💬 GitHub Issues: [repo]/issues
- 📚 Docs: [docs/00_INDEX.md](docs/00_INDEX.md)

---

## 📄 License

MIT License - See LICENSE file

---

## ✨ Credits

Built with ❤️ by Delta Team  
**Last Updated:** February 4, 2026

---

**👉 [Start with Documentation](docs/00_INDEX.md)**
