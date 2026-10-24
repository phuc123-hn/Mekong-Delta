# 🎯 DELTA STRESS LENS - SYSTEM OVERVIEW

**Comprehensive System Architecture & Code Guide**  
**Last Updated:** February 4, 2026

---

## 📋 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Frontend Structure](#frontend-structure)
4. [Backend Structure](#backend-structure)
5. [Data Flow](#data-flow)
6. [Key Technologies](#key-technologies)
7. [File Organization](#file-organization)
8. [Code Examples](#code-examples)

---

## 🎯 System Overview

### **What Does DELTA STRESS LENS Do?**

DELTA STRESS LENS is an **environmental risk monitoring platform** that:

1. **Visualizes** compound environmental risks in the Mekong Delta
2. **Analyzes** 4 risk dimensions: Salinity, Heat, Flood, Pollution
3. **Provides** role-based dashboards for Farmers vs Government officials
4. **Supports** multilingual UI (Vietnamese + English)
5. **Ensures** secure access via JWT authentication

### **Core Use Cases**

```
┌──────────────────────────────────────────────────┐
│           END USER (Farmer/Government)           │
├──────────────────────────────────────────────────┤
│ 1. Login with Phone + Password                   │
│ 2. View interactive map of 3 provinces           │
│ 3. See compound risk index (0-1 scale)          │
│ 4. Click province for detailed breakdown         │
│ 5. Manage messages with government              │
│ 6. Toggle language (VN ↔ EN)                    │
└──────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

### **High-Level System Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                             │
│         (Chrome, Edge, Safari, Firefox)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/WebSocket
                       │ Port 5073
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          NEXT.JS FRONTEND (React 18)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Pages (app/)                                       │   │
│  │  - page.tsx (Landing)                              │   │
│  │  - auth/page.tsx (Login)                           │   │
│  │  - dashboard/page.tsx (Map view)                   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Components (components/)                          │   │
│  │  - MapView (Leaflet/Mapbox)                        │   │
│  │  - Sidebar (Layer controls)                        │   │
│  │  - DetailPanel (Analytics)                         │   │
│  │  - Navbar (Navigation)                             │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  State Management (store/)                         │   │
│  │  - auth-store.ts (User + JWT)                      │   │
│  │  - layer-store.ts (Map state)                      │   │
│  │  - ui-store.ts (UI state)                          │   │
│  │  - theme-store.ts (Dark/Light)                     │   │
│  │  - i18n-store.ts (Language)                        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Styling (Tailwind CSS)                            │   │
│  │  - globals.css (Global styles)                     │   │
│  │  - Component-level styles                          │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ Fetch API
                       │ POST /api/login
                       │ GET /api/data
                       │ Port 3001
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         EXPRESS.JS BACKEND (Node.js)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Server Setup (server.ts)                           │   │
│  │  - Port: 3001                                       │   │
│  │  - CORS enabled                                     │   │
│  │  - WebSocket support                                │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Routes (routes/)                                   │   │
│  │  - auth.ts (Login/Register/Logout)                │   │
│  │  - data.ts (Risk data CRUD)                        │   │
│  │  - messages.ts (Message system)                    │   │
│  │  - forecasts.ts (Weather forecast)                 │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Middleware (middleware/)                          │   │
│  │  - auth.ts (JWT verification)                      │   │
│  │  - rbac.ts (Role-based access)                     │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Database (db/)                                     │   │
│  │  - index.ts (In-memory store)                      │   │
│  │  - seed.ts (Sample data)                           │   │
│  │  - setup.ts (Initialize)                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Models (models/)                                   │   │
│  │  - User.ts (User schema)                           │   │
│  │  - Message.ts (Message schema)                     │   │
│  │  - Metric.ts (Risk metrics)                        │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         IN-MEMORY DATA STORE                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Users                                              │   │
│  │  - Phone, password_hash, role, name                │   │
│  │  ├─ 0909123456 → Farmer                           │   │
│  │  └─ 0987654321 → Government                        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Risk Data                                          │   │
│  │  - Province-level metrics                          │   │
│  │  ├─ Salinity (0-1)                                │   │
│  │  ├─ Heat (0-1)                                    │   │
│  │  ├─ Flood (0-1)                                   │   │
│  │  └─ Pollution (0-1)                               │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Messages                                           │   │
│  │  - From: farmer_id                                 │   │
│  │  - To: government_id                               │   │
│  │  - Content, timestamp                              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Frontend Structure

### **Next.js App Router (src/app/)**

```
src/app/
├── layout.tsx              # Root layout (HTML structure)
├── page.tsx                # Landing page (/)
├── globals.css             # Global styles + scrollbar CSS ⭐
├── auth/
│   └── page.tsx           # Login page (/auth)
└── dashboard/
    ├── layout.tsx         # Dashboard wrapper (with sidebar)
    ├── page.tsx           # Dashboard home
    ├── map/
    │   └── page.tsx       # Map view (/dashboard/map)
    └── contact/
        └── page.tsx       # Contact page
```

### **Components (src/components/)**

| Component | Purpose | Props |
|-----------|---------|-------|
| **MapView** | Leaflet map renderer | provinces, selectedProvince |
| **Sidebar** | Layer controls | layers, onToggle |
| **DetailPanel** | Analytics detail | province, metrics |
| **Navbar** | Top navigation | user, language |
| **Legend** | Color scale | min, max |
| **LanguageToggle** | i18n switcher | - |

### **State Management (src/store/)**

**Zustand stores:**
- `auth-store.ts` - User login state
- `layer-store.ts` - Map layer visibility
- `ui-store.ts` - UI state (panels, etc)
- `theme-store.ts` - Dark/Light mode
- `i18n-store.ts` - Current language

### **Utilities (src/lib/)**

```typescript
// stress-calc.ts
export function calculateCompoundIndex(
  salinity: number,
  heat: number,
  flood: number,
  pollution: number,
  amplifyFactor: number
): { index: number, level: RiskLevel }

// utils.ts
export function cn(...classes: string[]): string
export function getRiskColor(index: number): string
```

---

## ⚙️ Backend Structure

### **Express Routes (backend/src/routes/)**

#### **1. Auth Routes (auth.ts)**
```typescript
POST   /api/auth/login     // Phone + Password → JWT token
POST   /api/auth/register  // Create new user
POST   /api/auth/logout    // Clear session
GET    /api/auth/profile   // Get current user
```

#### **2. Data Routes (data.ts)**
```typescript
GET    /api/data/provinces    // All provinces with risk
GET    /api/data/province/:id // Single province detail
PUT    /api/data/province/:id // Update risk metrics
```

#### **3. Message Routes (messages.ts)**
```typescript
GET    /api/messages        // Get user messages
POST   /api/messages        // Send message
PUT    /api/messages/:id    // Mark as read
```

#### **4. Forecast Routes (forecasts.ts)**
```typescript
GET    /api/forecasts/7day  // 7-day weather forecast
GET    /api/forecasts/:id   // Single forecast detail
```

### **Middleware (backend/src/middleware/)**

**auth.ts** - JWT verification
```typescript
// Checks Authorization: Bearer <token>
// Sets req.user if valid, returns 401 if not
```

**rbac.ts** - Role-based access control
```typescript
// Checks req.user.role
// Restricts routes based on role (Farmer vs Government)
```

### **Database (backend/src/db/)**

**In-memory store** (ephemeral - lost on server restart)
```typescript
{
  users: Map<phone, User>,
  provinces: Map<id, Province>,
  messages: Message[],
  metrics: Map<provinceId, Metrics>
}
```

**Phase 3:** Will migrate to MongoDB Atlas

---

## 📊 Data Flow

### **1. User Login Flow**

```
Frontend                          Backend
───────────────────────────────────────────
User enters phone/password
    │
    ├─ Validates locally
    │
    └─→ POST /api/auth/login
            │
            └─→ Check phone in DB
                │
                ├─ Hash password check
                │
                └─→ Generate JWT (sign with secret)
                        │
                        └─→ Return { token, user }
    
Browser stores token
    │
    └─ Sets Authorization header for future requests
```

### **2. Map Data Fetch Flow**

```
Frontend                          Backend
───────────────────────────────────────────
User opens /dashboard/map
    │
    ├─ Check localStorage for auth token
    │
    └─→ GET /api/data/provinces
        (with Authorization header)
            │
            ├─ Middleware checks JWT
            │
            ├─ Queries in-memory DB
            │
            └─→ Return GeoJSON with risk data
    
Frontend
    │
    ├─ Calculate compound index
    │
    ├─ Render Leaflet map
    │
    └─ Color provinces by risk level
```

### **3. Message Send Flow**

```
Frontend                          Backend
───────────────────────────────────────────
User writes message in textarea
    │
    └─→ POST /api/messages
        {
          to_user_id: gov_user_id,
          content: "Help!",
          timestamp: now
        }
            │
            ├─ Verify sender (from JWT)
            │
            ├─ Validate recipient exists
            │
            ├─ Store in DB
            │
            └─→ Return { id, status: "sent" }
    
Frontend
    │
    └─ Show "Message sent ✓"
```

---

## 🛠️ Key Technologies

### **Frontend Stack**

| Tech | Why | Usage |
|------|-----|-------|
| **Next.js 14** | Server-side rendering + static generation | Pages, routing |
| **React 18** | UI components | Components |
| **TypeScript** | Type safety | All code |
| **Tailwind CSS** | Utility-first styling | Styling |
| **Zustand** | Lightweight state | Auth, UI state |
| **Leaflet** | Interactive maps | Map visualization |
| **Framer Motion** | Smooth animations | Panel animations |
| **i18next** | Multilingual support | Vietnamese + English |

### **Backend Stack**

| Tech | Why | Usage |
|------|-----|-------|
| **Express.js** | Fast HTTP server | API routes |
| **Node.js 20+** | JavaScript runtime | Server |
| **JWT (jsonwebtoken)** | Stateless auth | Token signing/verify |
| **bcryptjs** | Password hashing | Secure passwords |
| **CORS** | Cross-origin requests | Allow frontend access |

---

## 📁 File Organization

### **Important Files (Top Level)**

```
package.json           # Frontend deps + scripts
tsconfig.json         # TypeScript config
tailwind.config.ts    # Tailwind theme
next.config.js        # Next.js settings
.env.local            # Environment secrets
start-all.bat         # Run frontend + backend
```

### **Frontend Source**

```
src/
├── app/
│   ├── globals.css ⭐ (Scrollbar + global styles)
│   ├── layout.tsx (HTML root)
│   ├── page.tsx (Landing)
│   ├── auth/page.tsx (Login)
│   └── dashboard/
│       ├── layout.tsx (Sidebar wrapper)
│       ├── page.tsx (Dashboard)
│       └── map/page.tsx (Map view)
│
├── components/
│   ├── MapView.tsx
│   ├── Sidebar.tsx
│   ├── DetailPanel.tsx
│   ├── Navbar.tsx
│   ├── Legend.tsx
│   ├── LanguageToggle.tsx
│   └── ThemeProvider.tsx
│
├── lib/
│   ├── stress-calc.ts
│   ├── utils.ts
│   └── api.ts
│
├── store/
│   ├── auth-store.ts
│   ├── layer-store.ts
│   ├── ui-store.ts
│   ├── theme-store.ts
│   └── i18n-store.ts
│
├── data/
│   └── mock-geo.ts (GeoJSON provinces)
│
└── locales/
    ├── vi/ (Vietnamese)
    │   ├── common.json
    │   └── sidebar.json
    └── en/ (English)
        ├── common.json
        └── sidebar.json
```

### **Backend Source**

```
backend/src/
├── server.ts (Main Express app)
├── routes/
│   ├── auth.ts (Login/Register)
│   ├── data.ts (Risk data)
│   ├── messages.ts (Messages)
│   └── forecasts.ts (Weather)
├── middleware/
│   ├── auth.ts (JWT verify)
│   └── rbac.ts (Role check)
├── models/
│   ├── User.ts
│   ├── Message.ts
│   └── Metric.ts
└── db/
    ├── index.ts (In-memory store)
    ├── seed.ts (Sample data)
    └── setup.ts (Initialize)
```

---

## 💡 Code Examples

### **Example 1: Login Component**

```typescript
// src/components/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth-store'

export function LoginForm() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Call backend API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    })
    
    const { token, user } = await response.json()
    
    // Store in Zustand
    login(token, user)
    
    // Redirect to dashboard
    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="0909123456"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

### **Example 2: Risk Calculation**

```typescript
// src/lib/stress-calc.ts
export function calculateCompoundIndex(
  salinity: number,
  heat: number,
  flood: number,
  pollution: number,
  amplifyFactor: number = 1.0
): {
  index: number
  level: 'low' | 'moderate' | 'high' | 'extreme'
} {
  // Weights for each dimension
  const weights = {
    salinity: 0.3,
    heat: 0.25,
    flood: 0.25,
    pollution: 0.2
  }

  // Weighted sum
  let compound = 
    salinity * weights.salinity +
    heat * weights.heat +
    flood * weights.flood +
    pollution * weights.pollution

  // Apply amplification
  compound *= amplifyFactor

  // Clamp to 0-1
  compound = Math.min(1, Math.max(0, compound))

  // Determine risk level
  let level: 'low' | 'moderate' | 'high' | 'extreme'
  if (compound < 0.3) level = 'low'
  else if (compound < 0.6) level = 'moderate'
  else if (compound < 0.8) level = 'high'
  else level = 'extreme'

  return { index: compound, level }
}
```

### **Example 3: Backend Auth Middleware**

```typescript
// backend/src/middleware/auth.ts
import jwt from 'jsonwebtoken'

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' })
  }

  const token = authHeader.slice(7) // Remove "Bearer "
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // Attach user to request
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
```

---

## 📝 Key Takeaways

1. **Frontend:** Next.js 14 with React 18, TypeScript, Zustand state
2. **Backend:** Express.js with JWT auth, RBAC middleware
3. **Data:** In-memory store (Phase 3: MongoDB)
4. **Auth:** Phone + password → JWT token
5. **UI:** Multilingual (VN/EN), Dark theme, Responsive
6. **Maps:** Leaflet/Mapbox for visualization
7. **Styling:** Tailwind CSS + custom scrollbar

---

## 🔗 See Also

- [GIỚI_THIỆU.md](GIỚI_THIỆU.md) - Features overview
- [KIẾN_TRÚC_HỆ_THỐNG.md](KIẾN_TRÚC_HỆ_THỐNG.md) - Current code structure
- [CẤUTRÚC_DỰ_ÁN.md](CẤUTRÚC_DỰ_ÁN.md) - Folder organization
- [GIAI_DOAN_3_ROADMAP.md](GIAI_DOAN_3_ROADMAP.md) - Future features

---

**Built with ❤️ for Mekong Delta farmers**
