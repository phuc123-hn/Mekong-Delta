# 🏗️ DELTA STRESS LENS - ARCHITECTURE (v2026)

## System Overview

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                  │
│              http://localhost:5073                        │
└──────────────────┬───────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
    [Auth]    [Dashboard]  [Stress Map]
     /auth   /dashboard   /dashboard/stress-map
              [Inbox]        [Detail Panel]
            /dashboard/      [Legend]
             inbox           [Sidebar]
              
        │
        └──────────────┐
                       │ HTTP API Calls
                       │ (http://localhost:3001/api/*)
                       ▼
┌──────────────────────────────────────────────────────────┐
│                   BACKEND (Express.js)                    │
│              http://localhost:3001                        │
│                                                           │
│   Routes:                                                 │
│   ├─ /api/auth (login, register) → JWT                   │
│   ├─ /api/messages (inbox, gov-inbox, send, reply)       │
│   ├─ /api/data (province data)                           │
│   └─ /api/forecasts (weather forecast)                   │
│                                                           │
│   Data Store:                                             │
│   ├─ In-memory users {} (no database)                    │
│   └─ In-memory messages [] (no database)                 │
└──────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Pages (`src/app/`)
```
/page.tsx
├─ Auth check
└─ Redirect to /auth or /dashboard/stress-map

/auth/page.tsx
├─ Login form
├─ Register form
└─ Token storage (localStorage + cookie)

/dashboard/page.tsx
├─ Navigation cards (Stress Map, Inbox, Knowledge, Contact)
└─ User info display

/dashboard/stress-map/page.tsx
├─ Layout: Navbar + Sidebar + (MapView + DetailPanel + Legend)
└─ Leaflet map initialization

/dashboard/inbox/page.tsx
├─ Messages list
└─ Reply UI

/dashboard/knowledge/page.tsx
/dashboard/contact/page.tsx
```

### Components (`src/components/`)
```
map-view.tsx
├─ Leaflet.js initialization
├─ GeoJSON layer with 3 provinces
├─ Click handler → setSelectedProvince()
└─ Hover tooltip

detail-panel.tsx
├─ Position: absolute (right-4, top-4, bottom-4) on desktop
├─ Position: bottom-0 on mobile
├─ Framer Motion slide animation
├─ Recharts bar chart (stress indices)
└─ Risk level badge

sidebar.tsx
├─ Layer toggles (Salinity, Heat, Flood, Pollution)
├─ Opacity slider
├─ Amplify factor slider
└─ Dark theme styling

legend.tsx
├─ Risk index scale (Extreme/High/Moderate/Low)
└─ Color mapping display

navbar.tsx
├─ Logo + nav links
├─ Language toggle (VN/EN)
├─ Theme toggle (☀️/🌙)
└─ User info + logout button

LanguageSwitch.tsx, ThemeToggle.tsx
├─ i18n store integration
└─ Zustand state management
```

### State Management (`src/store/`)
```
auth-store.ts
├─ user, token, isAuthenticated
├─ login(phone, password)
├─ register(phone, password, role, fullName)
└─ logout()

layer-store.ts
├─ activeLayers: {salinity, heat, flood, pollution}
├─ opacity, amplifyFactor
├─ selectedProvince
└─ setSelectedProvince()

theme-store.ts (optional)
├─ isDarkMode
└─ toggleTheme()

i18n-store.ts
├─ currentLanguage ('vi' or 'en')
├─ translations object
└─ t(key) function
```

---

## Backend Architecture

### Routes (`backend/src/routes/`)
```
auth.ts
├─ POST /register
│  ├─ Validate phone (0xx xxxxxxx), password (8+), role
│  ├─ Hash password with bcryptjs
│  └─ Store in users{}
│
└─ POST /login
   ├─ Find user by phone
   ├─ Compare password hash
   ├─ Generate JWT token
   └─ Return {token, user}

messages.ts
├─ GET /inbox (messages for FARMER)
├─ GET /gov-inbox (messages for GOVERNMENT)
├─ POST /send {content, toRole}
└─ POST /reply {message_id, response_content}

data.ts
├─ GET /provinces
└─ GET /province/:id

forecasts.ts
├─ GET /forecast/:province_id
└─ GET /forecasts
```

### Middleware (`backend/src/middleware/`)
```
auth.ts
├─ authMiddleware: Verify JWT token
├─ requireRole: Check user role
└─ AuthRequest: Extended Express Request
```

### Models & Utils
```
In-memory Stores:
├─ users: { [phone]: {id, phone, password_hash, role, full_name} }
└─ messages: [{id, from_user_id, to_role, content, status, ...}]

JWT (backend/src/utils/jwt.ts)
├─ generateToken(userId, role)
└─ verifyToken(token)
```

---

## Data Flow Examples

### Example 1: Login User
```
Frontend                          Backend
  │                                 │
  ├─ User enters phone + password   │
  │                                 │
  ├─ POST /api/auth/login ────────► │
  │                                 │
  │                          ├─ Find user by phone
  │                          ├─ Compare password (bcryptjs)
  │                          ├─ Generate JWT token
  │                          │
  │◄────── {token, user} ───│
  │
  ├─ Store token (localStorage + cookie)
  ├─ Set auth-store: {user, token, isAuthenticated: true}
  │
  └─ Redirect to /dashboard/stress-map
```

### Example 2: Click Province on Map
```
User clicks "An Giang" on map
  │
  ├─ map-view.tsx layer.on("click") fires
  │
  ├─ setSelectedProvince(provinceData)
  │
  ├─ layer-store updates selectedProvince
  │
  ├─ detail-panel.tsx detects {selectedProvince} change
  │
  ├─ DetailPanel renders with:
  │  ├─ Province name + risk level
  │  ├─ Compound index score
  │  ├─ Bar chart (recharts)
  │  └─ Framer Motion slide-in animation
  │
  └─ Map highlights province with cyan border
```

### Example 3: Send Message
```
Farmer fills form: {name, phone, content, toRole='GOVERNMENT'}
  │
  ├─ POST /api/messages/send ─────► Backend
  │
  │                          ├─ Create Message object
  │                          ├─ Add to messages[]
  │                          ├─ Emit socket event 'new_message'
  │                          │
  │◄────── {id, status: 'SENT'} ─│
  │
  ├─ Frontend updates inbox
  └─ Show success toast
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js | 14.0.0 |
| UI | React | 18.x |
| Styling | Tailwind CSS | 3.x |
| Animation | Framer Motion | - |
| Charts | Recharts | - |
| Maps | Leaflet.js | 1.9.4 |
| State | Zustand | - |
| Backend | Express.js | 4.x |
| Auth | JWT + bcryptjs | - |
| Language | TypeScript | 5.x |

---

## Authentication Flow

```
┌─────────────────────────────────────────┐
│  User visits /                          │
│  (page.tsx checks auth)                 │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
   No token    Token in localStorage
        │             │
        ▼             ▼
   /auth page   Verify with backend
        │             │
        │        ┌────┴─────┐
        │        │           │
        │     Valid      Invalid
        │        │           │
        │        ▼           ▼
        └──► /dashboard   /auth (redirect)
```

---

## Important: In-Memory Storage (No Database)

⚠️ **Current Implementation:**
- Users stored in `users{}` object (backend/src/routes/auth.ts)
- Messages stored in `messages[]` array (backend/src/routes/messages.ts)
- Data cleared on server restart

✅ **For Development:** Works perfectly for testing  
⚠️ **For Production:** Replace with PostgreSQL/MongoDB

---
