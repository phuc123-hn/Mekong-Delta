# 🌍 Delta Stress Lens - Cấu Trúc Hệ Thống Toàn Phần

## 📋 Mục Lục
1. [Tổng quan hệ thống](#tổng-quan-hệ-thống)
2. [Kiến trúc toàn cảnh](#kiến-trúc-toàn-cảnh)
3. [Frontend Structure](#frontend-structure)
4. [Backend Structure](#backend-structure)
5. [Cấu hình Port & Environment](#cấu-hình-port--environment)
6. [Database](#database)
7. [API Endpoints](#api-endpoints)
8. [Authentication & Authorization](#authentication--authorization)
9. [Công nghệ sử dụng](#công-nghệ-sử-dụng)
10. [Hướng dẫn chạy hệ thống](#hướng-dẫn-chạy-hệ-thống)

---

## 🎯 Tổng quan hệ thống

**Delta Stress Lens** là một ứng dụng tương tác theo dõi và phân tích rủi ro môi trường tại Đồng bằng Sông Cửu Long.

**Mục đích:** Giúp nông dân và chính phủ quản lý, giám sát, và dự báo các rủi ro căng thẳng môi trường:
- 🌊 Mực nước mặn
- 🌡️ Chỉ số nhiệt
- 💧 Độ sâu lũ
- 🏭 Chỉ số ô nhiễm

**Người dùng:**
- 👨‍🌾 **FARMER:** Người nông dân (xem dữ liệu, gửi thông báo)
- 🏛️ **GOVERNMENT:** Chính phủ (nhập dữ liệu, gửi cảnh báo, trả lời thông báo)
- 🔑 **ADMIN:** Quản trị viên (toàn bộ quyền)

---

## 🏗️ Kiến trúc toàn cảnh

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT SIDE (Frontend)                  │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Next.js 14 / React 18                             │   │
│  │  🌐 Running on: http://localhost:5073              │   │
│  │                                                    │   │
│  │  Pages:                                            │   │
│  │  ├─ /auth         → Login/Register                 │   │
│  │  ├─ /dashboard    → Citizen Dashboard              │   │
│  │  ├─ /gov/input    → Government Data Input          │   │
│  │  ├─ /gov/inbox    → Government Messages Inbox      │   │
│  │  └─ /gov/announcements → Broadcast Announcements   │   │
│  │                                                    │   │
│  │  Libraries:                                        │   │
│  │  ├─ Tailwind CSS (Styling)                         │   │
│  │  ├─ Framer Motion (Animations)                     │   │
│  │  ├─ Leaflet / Mapbox GL (Maps)                     │   │
│  │  ├─ Recharts (Data Visualization)                  │   │
│  │  ├─ i18next (English/Vietnamese)                   │   │
│  │  ├─ Zustand (State Management)                     │   │
│  │  └─ Socket.io Client (Real-time)                   │   │
│  └────────────────────────────────────────────────────┘   │
│                          HTTP/WS                            │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                   SERVER SIDE (Backend)                     │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Express.js + TypeScript                           │   │
│  │  🔗 Running on: http://localhost:3001              │   │
│  │                                                    │   │
│  │  Core Components:                                  │   │
│  │  ├─ API Routes                                     │   │
│  │  │  ├─ /api/auth (Login/Register)                  │   │
│  │  │  ├─ /api/data (Stress data)                     │   │
│  │  │  ├─ /api/messages (Inbox/Send)                  │   │
│  │  │  ├─ /api/forecasts (Alerts/Broadcast)           │   │
│  │  │  └─ /health (Health check)                      │   │
│  │  │                                                 │   │
│  │  ├─ Middleware                                     │   │
│  │  │  ├─ CORS (Cross-Origin)                         │   │
│  │  │  ├─ Authentication                              │   │
│  │  │  ├─ Error Handling                              │   │
│  │  │  └─ Request Logging                             │   │
│  │  │                                                 │   │
│  │  ├─ WebSocket (Socket.io)                          │   │
│  │  │  ├─ data_update                                 │   │
│  │  │  ├─ forecast_alert                              │   │
│  │  │  └─ new_message                                 │   │
│  │  │                                                 │   │
│  │  └─ Database Connections                           │   │
│  │     ├─ MongoDB (Mongoose)                          │   │
│  │     └─ PostgreSQL (pg)                             │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                           │
│                                                             │
│  ├─ MongoDB Atlas (Primary Data Store)                    │
│  │  ├─ Users Collection                                   │
│  │  ├─ StressData Collection                              │
│  │  ├─ Forecasts Collection                               │
│  │  └─ Messages Collection                                │
│  │                                                        │
│  └─ PostgreSQL (Optional, Alternative)                    │
│     ├─ Users Table                                        │
│     ├─ Risk Data Tables                                   │
│     └─ Messages Tables                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Frontend Structure

### Đường dẫn: `/src`

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Home page
│   ├── globals.css                  # Global styles
│   ├── auth/                        # Authentication routes
│   │   └── page.tsx                # Login/Register page
│   ├── dashboard/                   # Farmer dashboard
│   │   ├── page.tsx                # Main dashboard
│   │   ├── contact/
│   │   │   └── page.tsx            # Contact/Messages page
│   │   └── ...
│   ├── gov/                         # Government routes (protected)
│   │   ├── input/
│   │   │   └── page.tsx            # Data input form
│   │   ├── inbox/
│   │   │   └── page.tsx            # Messages inbox
│   │   ├── announcements/
│   │   │   └── page.tsx            # Broadcast system
│   │   └── users/
│   │       └── page.tsx            # User management (commented)
│   └── leaflet.css                  # Leaflet map styles
│
├── components/                      # Reusable React components
│   ├── actionable-legend.tsx       # Map legend (interactive)
│   ├── animations.tsx              # Framer Motion animations
│   ├── auth-form.tsx               # Login/Register form
│   ├── citizen-science-map.tsx     # Citizen science map (commented)
│   ├── citizen-science.tsx         # Citizen science section
│   ├── dashboard-overview.tsx      # Dashboard summary
│   ├── detail-panel.tsx            # Detail side panel
│   ├── insight-card.tsx            # Insight card component
│   ├── insights-section.tsx        # Insights grid section
│   ├── language-toggle.tsx         # Language switcher
│   ├── LanguageSwitch.tsx          # Alternative language switcher
│   ├── legend.tsx                  # Map legend
│   ├── map-view.tsx                # Interactive map view
│   ├── Navbar.tsx                  # Navigation bar
│   ├── ProtectedRoute.tsx          # RBAC component
│   ├── risk-metrics.tsx            # Risk metrics display
│   ├── stress-level-indicator.tsx  # Stress level gauge
│   └── ...                          # Other components
│
├── config/                         # Configuration
│   ├── colors.ts                   # Color palette
│   ├── map-config.ts               # Map settings
│   ├── menu-config.ts              # Menu structure
│   └── ...
│
├── data/                           # Static data
│   ├── mock-data.ts                # Mock/test data
│   ├── predictions.ts              # Forecast data
│   └── ...
│
├── lib/                            # Utilities
│   ├── api.ts                      # Axios instance (API client)
│   ├── auth-store.ts               # Zustand auth store
│   └── ...
│
├── locales/                        # i18n translations
│   ├── en/                         # English translations
│   │   ├── common.json
│   │   ├── dashboard.json
│   │   └── ...
│   └── vi/                         # Vietnamese translations
│       ├── common.json
│       ├── dashboard.json
│       └── ...
│
├── store/                          # State management (Zustand)
│   ├── auth-store.ts               # Authentication state
│   ├── map-store.ts                # Map state
│   └── ...
│
└── i18n.ts                         # i18n configuration
```

### Frontend Key Files:
- **API Client:** `src/lib/api.ts` - Axios instance với `NEXT_PUBLIC_BACKEND_URL`
- **Auth Store:** `src/store/auth-store.ts` - State quản lý token, user, role
- **Protected Routes:** `src/components/ProtectedRoute.tsx` - RBAC guard
- **Middleware:** `middleware.ts` - Next.js middleware (cookie auth check)

---

## 🗄️ Backend Structure

### Đường dẫn: `/backend/src`

```
backend/src/
├── server.ts                       # Main Express server
│                                  # Port: 3001
│                                  # CORS, Middleware setup
│                                  # WebSocket (Socket.io)
│
├── config/
│   └── db.ts                      # MongoDB connection
│                                  # Uses: MONGO_URI env var
│
├── middleware/
│   ├── auth.ts                    # JWT authentication
│   │                              # Extracts token from headers
│   │                              # Verifies JWT_SECRET
│   └── ...
│
├── routes/
│   ├── auth.ts                    # POST /api/auth/login
│   │                              # POST /api/auth/register
│   │
│   ├── data.ts                    # GET /api/data (stress data)
│   │                              # POST /api/data/update
│   │
│   ├── messages.ts                # GET /api/messages/inbox
│   │                              # GET /api/messages/gov-inbox
│   │                              # POST /api/messages/send
│   │                              # POST /api/messages/reply
│   │                              # DELETE /api/messages/:id
│   │
│   └── forecasts.ts               # GET /api/forecasts
│                                  # POST /api/forecasts/broadcast
│                                  # GET /api/forecasts/:phenomenon
│
├── models/                        # Mongoose schemas
│   ├── User.ts                   # User model
│   ├── StressData.ts             # Risk/stress data
│   ├── Message.ts                # Messages
│   ├── Forecast.ts               # Forecasts/alerts
│   └── ...
│
├── utils/                        # Helper functions
│   ├── validators.ts             # Input validation (Joi)
│   ├── jwt.ts                    # JWT token utils
│   └── ...
│
├── db/
│   ├── setup.ts                  # Database initialization
│   ├── seed.ts                   # Seed test data
│   └── ...
│
├── logs/                         # Server logs
│   ├── server-YYYY-MM-DD.log    # All requests/responses
│   └── error-YYYY-MM-DD.log     # Error logs
│
├── test-api.ts                  # API testing script
│                                # Run: npm run test:api
│
└── tsconfig.json               # TypeScript config
```

### Backend Key Features:
- **Express.js** - RESTful API server
- **TypeScript** - Type safety
- **Mongoose** - MongoDB ORM
- **JWT** - Token-based authentication
- **Socket.io** - Real-time WebSocket
- **Joi** - Data validation
- **CORS** - Cross-origin requests
- **bcryptjs** - Password hashing
- **Logging** - File-based request/error logs

---

## 🔐 Cấu hình Port & Environment

### Ports (Must Not Conflict):
| Service | Port | Status | Command |
|---------|------|--------|---------|
| Backend API | **3001** | ✅ LISTENING | `npm run dev` |
| Frontend (Next.js) | **5073** | ✅ LISTENING | `npm run dev` |

### Environment Variables:

#### **Backend (.env required in `/backend`):**
```env
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/agritech_db
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=http://localhost:5073
```

#### **Frontend (.env.local in root):**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

### CORS Configuration (backend/src/server.ts):
```typescript
allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5073",  // ✅ Frontend
  "http://localhost:5174",  // Vite default
  process.env.FRONTEND_URL
]
```

---

## 🗄️ Database

### MongoDB (Primary):
- **Collections:**
  - `users` - User accounts (phone, password, role)
  - `stressdata` - Risk metrics (salinity, temp, flood, pollution)
  - `messages` - User messages/notifications
  - `forecasts` - Weather alerts & risk forecasts
  - `announcements` - Government broadcasts

- **Connection:** 
  - Local: `mongodb://localhost:27017/agritech_db`
  - Cloud: MongoDB Atlas (via MONGO_URI)

### PostgreSQL (Optional):
- Can be used as alternative to MongoDB
- Same schema as MongoDB collections
- Connection via `pg` package

---

## 🔗 API Endpoints

### Authentication (`/api/auth`)
```
POST   /api/auth/login
       Body: { phone, password }
       Response: { token, user }

POST   /api/auth/register
       Body: { phone, password }
       Response: { token, user }
```

### Stress Data (`/api/data`) - Protected
```
GET    /api/data
       Response: [] array of stress records

POST   /api/data/update
       Body: { province_id, salinity_level, heat_index, ... }
       Response: { status, data }
```

### Messages (`/api/messages`) - Protected
```
GET    /api/messages/inbox
       Response: [] farmer messages

GET    /api/messages/gov-inbox
       Response: [] government inbox messages

POST   /api/messages/send
       Body: { name, phone, content, toRole }
       Response: { message_id }

POST   /api/messages/reply
       Body: { message_id, response_content }
       Response: { status }

DELETE /api/messages/:id
       Response: { deleted: true }
```

### Forecasts (`/api/forecasts`) - Protected
```
GET    /api/forecasts
       Response: [] all forecasts

GET    /api/forecasts/:phenomenon
       Response: {} specific forecast

POST   /api/forecasts/broadcast
       Body: { time_horizon, phenomenon, risk_level, details }
       Response: { forecast_id }
```

### Utility
```
GET    /
       Response: System status & available endpoints

GET    /health
       Response: { status: 'OK' }
```

---

## 🔑 Authentication & Authorization

### Flow:
1. **Registration/Login** → User sends phone + password → Backend validates → JWT token created
2. **Token Storage** → Frontend stores in localStorage
3. **Requests** → Token added to `Authorization: Bearer <token>` header
4. **Middleware** → All protected routes check JWT validity
5. **RBAC** → Routes check user.role (FARMER, GOVERNMENT, ADMIN)

### User Roles:
```
FARMER
├─ Can view: dashboard, maps, data
├─ Can do: send messages, view responses
└─ Routes: /dashboard/*, /auth

GOVERNMENT
├─ Can view: all farmer data, inbox
├─ Can do: input data, broadcast forecasts, reply to messages
└─ Routes: /gov/*, /auth

ADMIN
├─ Can do: everything
└─ (System administrator access)
```

### Token Content:
```typescript
{
  id: string,
  phone: string,
  role: 'FARMER' | 'GOVERNMENT' | 'ADMIN',
  iat: number,  // issued at
  exp: number   // expiration
}
```

---

## 💻 Công nghệ sử dụng

### Frontend Stack:
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.0.0 | React framework |
| **React** | 18 | UI library |
| **TypeScript** | ^5 | Type safety |
| **Tailwind CSS** | 3.3.5 | Styling |
| **Framer Motion** | 10.16.4 | Animations |
| **Leaflet** | 1.9.4 | Maps (OSM) |
| **Mapbox GL** | 2.15.0 | Advanced maps |
| **Recharts** | 2.10.0 | Data charts |
| **i18next** | 25.8.0 | i18n (EN/VI) |
| **Zustand** | 4.5.7 | State management |
| **Axios** | 1.13.4 | HTTP client |
| **Socket.io Client** | 4.7.0 | Real-time |

### Backend Stack:
| Technology | Version | Purpose |
|------------|---------|---------|
| **Express.js** | 4.18.2 | Web framework |
| **TypeScript** | 5.3.2 | Type safety |
| **Mongoose** | 9.1.5 | MongoDB ODM |
| **PostgreSQL (pg)** | 8.11.0 | SQL database |
| **JWT** | 8.5.1 | Authentication |
| **bcryptjs** | 2.4.3 | Password hashing |
| **Socket.io** | 4.7.0 | Real-time WebSocket |
| **Joi** | 17.11.0 | Data validation |
| **CORS** | 2.8.5 | Cross-origin |
| **dotenv** | 16.3.1 | Env variables |
| **ts-node** | 10.9.1 | Run TypeScript |

---

## 🚀 Hướng dẫn chạy hệ thống

### Prerequisites:
```bash
✅ Node.js >= 16.x
✅ npm >= 7.x
✅ MongoDB (local hoặc Atlas)
✅ Git (optional)
```

### 1. Install Dependencies:
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 2. Setup Environment Files:

**`backend/.env`:**
```env
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/agritech_db
JWT_SECRET=your_secret_key_min_32_chars
FRONTEND_URL=http://localhost:5073
```

**`.env.local`:**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

### 3. Start Backend:
```bash
cd backend
npm run dev
# Backend runs on http://localhost:3001
```

### 4. Start Frontend (New Terminal):
```bash
npm run dev
# Frontend runs on http://localhost:5073
```

### 5. Access System:
- 🔐 **Login:** http://localhost:5073/auth
- 👨‍🌾 **Farmer Dashboard:** http://localhost:5073/dashboard
- 🏛️ **Government Panel:** http://localhost:5073/gov
- 📡 **Backend API:** http://localhost:3001

### 6. Test API (Optional):
```bash
cd backend
npm run test:api
# Tests login, messages, and forecast endpoints
```

---

## 📊 Data Models

### User Schema:
```typescript
{
  _id: ObjectId,
  phone: string (unique),
  password: string (hashed),
  role: 'FARMER' | 'GOVERNMENT' | 'ADMIN',
  fullName?: string,
  province?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### StressData Schema:
```typescript
{
  _id: ObjectId,
  province_id: string,
  salinity_level: number (0-100),
  heat_index: number (0-100),
  flood_depth: number (meters),
  pollution_index: number (0-100),
  timestamp: Date,
  updatedBy: string (user_id),
  createdAt: Date
}
```

### Message Schema:
```typescript
{
  _id: ObjectId,
  from_user_id: number,
  phone: string,
  name: string,
  subject?: string,
  content: string,
  toRole: 'FARMER' | 'GOVERNMENT',
  status: 'UNREAD' | 'READ' | 'REPLIED',
  response_content?: string,
  created_at: Date,
  updated_at: Date
}
```

### Forecast Schema:
```typescript
{
  _id: ObjectId,
  phenomenon: 'RAIN' | 'FLOOD' | 'SALINITY' | 'HEAT',
  time_horizon: 'SHORT' | 'MEDIUM' | 'LONG',
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  details: object,
  broad_to: string[] (provinces),
  createdAt: Date,
  createdBy: string (user_id)
}
```

---

## 🛠️ Troubleshooting

### Port Already in Use:
```bash
# Find process on port 3001
netstat -ano | findstr ":3001"

# Kill process (Windows)
taskkill /F /PID <PID>
```

### MongoDB Connection Error:
```
Error: MongoDB Connection Error
→ Check MONGO_URI in backend/.env
→ Ensure MongoDB is running (local or cloud)
→ Test: mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

### CORS Error:
```
Access denied from origin
→ Check CORS allowedOrigins in backend/src/server.ts
→ Ensure frontend URL matches (http://localhost:5073)
→ Clear browser cache
```

### JWT Error:
```
Invalid token
→ Check JWT_SECRET in backend/.env
→ Secrets must match between login & request verification
→ Re-login to get new token
```

---

## 📝 Scripts

### Frontend:
```bash
npm run dev      # Start dev server (port 5073)
npm run build    # Build for production
npm run start    # Run production build
npm run lint     # Check ESLint
```

### Backend:
```bash
npm run dev           # Build + run server
npm run build         # Compile TypeScript → dist/
npm run db:setup     # Initialize database
npm run db:seed      # Load test data
npm run test:api     # Test API endpoints
```

---

## 📂 Key File Locations

| File | Purpose |
|------|---------|
| `package.json` | Frontend dependencies & scripts |
| `backend/package.json` | Backend dependencies & scripts |
| `next.config.js` | Next.js configuration |
| `tsconfig.json` | TypeScript (frontend) |
| `backend/tsconfig.json` | TypeScript (backend) |
| `middleware.ts` | Next.js auth middleware |
| `src/lib/api.ts` | Axios API client |
| `backend/src/server.ts` | Express main server |
| `src/app/layout.tsx` | Root React layout |

---

## 🎯 Summary

**Delta Stress Lens** là một full-stack ứng dụng:
- ✅ **Frontend:** Next.js 14 @ http://localhost:5073
- ✅ **Backend:** Express.js @ http://localhost:3001
- ✅ **Database:** MongoDB (Mongoose ORM)
- ✅ **Auth:** JWT token + RBAC roles
- ✅ **Real-time:** Socket.io WebSocket
- ✅ **Responsive:** Tailwind CSS + Framer Motion
- ✅ **Multi-language:** English & Vietnamese (i18next)
- ✅ **Maps:** Leaflet + Mapbox GL

**Deployment Ready:** Sử dụng Vercel (frontend) + Railway/Heroku (backend)

---

*Last Updated: February 28, 2026*
*Status: ✅ All systems operational*
