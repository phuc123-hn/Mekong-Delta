# 📁 CẤUTRÚC DỰ ÁN - PROJECT STRUCTURE

**Last Updated:** January 28, 2026  
**Project:** Delta Stress Lens MVP 1.0.0

---

## 🗂️ CẤP ĐỀU (ROOT LEVEL)

```
Mekong Delta/
├── docs/                    # 📚 Tài liệu (Documentation)
├── src/                     # 💻 Mã nguồn (Source Code)
├── public/                  # 📁 Tập tin tĩnh (Static Files)
├── node_modules/            # 📦 Thư viện phụ thuộc (Dependencies)
├── .next/                   # 🏗️ Build output (Next.js build folder)
├── .github/                 # 🔧 GitHub CI/CD
│
├── package.json             # 📋 Project metadata & dependencies ⭐
├── package-lock.json        # 🔐 Dependency lock file
├── tsconfig.json            # 📖 TypeScript config ⭐
├── tailwind.config.ts       # 🎨 Tailwind CSS theme ⭐
├── postcss.config.js        # 🔄 PostCSS config ⭐
├── next.config.js           # ⚡ Next.js settings ⭐
├── .env.local               # 🔑 Environment variables (local) ⭐
├── next-env.d.ts            # 📖 Auto-generated TS definitions
├── install-deps.bat         # 🚀 Auto-install script (Windows)
└── .gitignore               # 🚫 Git ignore rules

⭐ = Cấu hình quan trọng (Required by Next.js)
```

**📌 Lưu ý:** Config files phải ở root level để Next.js tìm được!

---

## 📚 DOCS/ - TÀI LIỆU HƯỚNG DẪN (Documentation Guides)

**Mục đích:** Chứa tất cả file hướng dẫn cho người dùng mới

```
docs/
├── GIỚI_THIỆU.md                          # 👋 Giới thiệu dự án
├── HƯỚNG_DẪN_NHANH.md                     # ⚡ Quick start (3 bước)
├── HƯỚNG_DẪN_CÀI_ĐẶT.md                   # 📖 Setup guide cơ bản
├── HƯỚNG_DẪN_CÀI_ĐẶT_ĐẦY_ĐỦ.md            # 📚 Setup guide chi tiết
├── KIẾN_TRÚC_HỆ_THỐNG.md                   # 🏛️ Architecture & components
├── YÊU_CẦU_PHIÊN_BẢN.md                    # 🔧 Version requirements
└── DANH_SÁCH_KIỂM_TRA_MVP.md               # ✅ MVP checklist
```

### 📖 Khi nào dùng từng file?

| File | Cho ai? | Khi nào? |
|------|---------|---------|
| **GIỚI_THIỆU.md** | Tất cả mọi người | Lần đầu tiên thấy dự án |
| **HƯỚNG_DẪN_NHANH.md** | Người đã có Node.js | Muốn chạy ngay (3 bước) |
| **HƯỚNG_DẪN_CÀI_ĐẶT.md** | Người chưa cài Node.js | Muốn cài từ đầu |
| **HƯỚNG_DẪN_CÀI_ĐẶT_ĐẦY_ĐỦ.md** | Developer | Cần chi tiết tất cả |
| **KIẾN_TRÚC_HỆ_THỐNG.md** | Developer & architect | Hiểu cách code tổ chức |
| **YÊU_CẦU_PHIÊN_BẢN.md** | System admin | Check version compatibility |
| **DANH_SÁCH_KIỂM_TRA_MVP.md** | QA & tester | Xác nhận tính năng hoạt động |

---

## ⚙️ CONFIG FILES - CẤU HÌNH (At Root Level)

**Mục đích:** Cấu hình Next.js, TypeScript, Tailwind, PostCSS

```
Root/
├── package.json             # 📦 Project dependencies & scripts
├── package-lock.json        # 🔐 Locked dependency versions
├── tsconfig.json            # 📖 TypeScript configuration
├── tailwind.config.ts       # 🎨 Tailwind CSS theme config
├── postcss.config.js        # 🔄 PostCSS transformations
├── next.config.js           # ⚡ Next.js settings
├── .env.local               # 🔑 Local environment variables
├── .env.local.example       # 📝 Example env variables
└── .eslintrc.json           # 📏 ESLint rules
```

**📌 Tại sao ở root?** Next.js tìm những file này ở root level, không trong subfolder!

### ⚙️ Chi tiết từng file

**`package.json`** (📦 Dependencies) - 🔴 **PHẢI ở root**
- Liệt kê tất cả npm packages cần cài
- Scripts: `dev`, `build`, `start`, `lint`
- Version constraints: Node v20+, npm v10+
- ⚠️ Next.js tìm file này ở root level!

**`tsconfig.json`** (📖 TypeScript) - 🔴 **PHẢI ở root**
- Target: ES2020
- Strict mode: ON (full type checking)
- Path aliases: `@/*` → `./src/*`
- ⚠️ TypeScript compiler tìm file này ở root!

**`tailwind.config.ts`** (🎨 Styling) - 🔴 **PHẢI ở root**
- Delta theme colors
- Responsive breakpoints
- Custom plugin configurations
- ⚠️ Tailwind tìm file này ở root!

**`postcss.config.js`** (🔄 CSS Processing) - 🔴 **PHẢI ở root**
- Tailwind CSS plugin
- Autoprefixer for browser compatibility

**`next.config.js`** (⚡ Next.js) - 🔴 **PHẢI ở root**
- React strict mode: ON
- Image optimization
- Build settings
- ⚠️ Next.js tìm file này ở root level!

**`.env.local`** (🔑 Secrets) - 🔴 **PHẢI ở root**
- Mapbox token (if needed)
- Database URLs
- API keys
- **⚠️ Không commit file này!**
- **⚠️ Next.js tìm file này ở root level!**

---

## 💻 SRC/ - MÃ NGUỒN (Source Code)

**Mục đích:** Chứa tất cả code của ứng dụng

```
src/
├── app/                     # 🏠 Next.js App Router
│   ├── layout.tsx           # Root layout (HTML structure)
│   ├── page.tsx             # Home page (/)
│   └── globals.css          # Global styles & CSS imports
│
├── components/              # 🧩 React Components
│   ├── map-view.tsx         # Leaflet map engine
│   ├── sidebar.tsx          # Layer controls & settings
│   ├── detail-panel.tsx     # Province analytics panel
│   └── legend.tsx           # Color scale legend
│
├── lib/                     # 🔧 Utility Functions
│   ├── stress-calc.ts       # Compound risk calculation
│   ├── utils.ts             # Helper functions (clsx, cn, etc)
│   └── types.ts             # Type definitions (optional)
│
├── store/                   # 📦 State Management (Zustand)
│   └── layer-store.ts       # Global state: layers, selection
│
└── data/                    # 📊 Mock Data
    └── mock-geo.ts          # GeoJSON provinces (3 samples)
```

### 🧩 Components Breakdown

**`map-view.tsx`** (🗺️ Map Engine)
- Leaflet + OpenStreetMap integration
- Interactive province layers
- Click/hover detection
- Real-time data visualization

**`sidebar.tsx`** (🎛️ Control Panel)
- Layer toggle switches
- Opacity slider
- Amplify factor slider
- Screenshot export button

**`detail-panel.tsx`** (📈 Analytics)
- Recharts bar chart (4 dimensions)
- Risk score badge
- AI insights
- Mobile-responsive sheet

**`legend.tsx`** (📏 Color Scale)
- 0.0-1.0 gradient visualization
- Risk level categories
- Animated fade-in effect

### 🔧 Lib Functions

**`stress-calc.ts`** (📐 Calculations)
```typescript
// Input: layer values + amplify factor
// Output: compound_index (0-1) + risk_level
function calculateStress(layers, amplify): {
  compound_index: number
  risk_level: 'low' | 'moderate' | 'high' | 'extreme'
}
```

**`utils.ts`** (🛠️ Helpers)
- `cn()` - Tailwind class merging
- `clsx()` - Conditional CSS classes
- Color mapping functions

### 📦 Store (Zustand)

**`layer-store.ts`** (🔄 Global State)
```typescript
{
  activeLayers: Record<string, boolean>     // Which layers visible
  opacity: number                            // Map layer opacity (0-1)
  amplifyFactor: number                      // Risk amplification (1-3)
  selectedProvince: Province | null          // Currently selected
  
  // Actions:
  toggleLayer(name)
  setOpacity(value)
  setAmplify(value)
  setSelectedProvince(province)
}
```

### 📊 Data

**`mock-geo.ts`** (📍 GeoJSON)
- 3 sample provinces: Cần Thơ, An Giang, Cà Mau
- Properties: salinity, heat, flood, pollution
- Format: GeoJSON FeatureCollection
- **Replace with real data later**

---

## 📁 PUBLIC/ - TẬP TIN TĨNH (Static Assets)

**Mục đích:** Chứa hình ảnh, icon, favicon (public HTTP)

```
public/
├── favicon.ico              # Browser tab icon
├── images/                  # Project screenshots
├── map-data/                # Additional GeoJSON files
└── ...                      # Other static assets
```

**📌 Note:** Mọi file trong `public/` được serve tại `/` URL

---

## 🏗️ .NEXT/ - BUILD OUTPUT

**Mục đích:** Auto-generated by Next.js (don't edit!)

```
.next/
├── static/                  # Compiled JS/CSS
├── server/                  # Server-side code
└── ...                      # Cache & build artifacts
```

**⚠️ Không commit folder này!** (Đã trong `.gitignore`)

---

## 📦 NODE_MODULES/ - DEPENDENCIES

**Mục đích:** npm packages (auto-installed)

```
node_modules/
├── react/
├── next/
├── tailwindcss/
├── leaflet/
├── zustand/
├── recharts/
├── framer-motion/
├── html2canvas/
└── ... (400+ more packages)
```

**⚠️ Không commit folder này!** (Đã trong `.gitignore`)

**Cài lại:**
```bash
npm install
```

---

## 🚀 WORKFLOWS - COMMON TASKS

### 1️⃣ Start Development
```bash
npm run dev
# Opens http://localhost:3000
```

### 2️⃣ Build for Production
```bash
npm run build
npm start
```

### 3️⃣ Check for Type Errors
```bash
npm run type-check
# (Linting with TypeScript)
```

### 4️⃣ Format Code
```bash
npm run lint
```

### 5️⃣ Update Dependencies
```bash
npm update
npm audit fix
```

---

## 📊 FOLDER SIZE GUIDE

| Folder | Size | Notes |
|--------|------|-------|
| `node_modules/` | ~500 MB | Auto-generated, don't commit |
| `.next/` | ~200 MB | Build cache, don't commit |
| `src/` | ~50 KB | Actual source code |
| `docs/` | ~100 KB | Documentation |
| `config/` | ~20 KB | Configuration files |
| **Total repo** | ~5 MB | Without node_modules & .next |

---

## 🔄 GIT IGNORE RULES

**Files NOT committed:**
```
node_modules/          # Dependencies (install locally)
.next/                 # Build output (rebuild locally)
.env.local             # Secrets (never share!)
*.log                  # Log files
.DS_Store              # macOS files
dist/                  # Build artifacts
```

---

## 📋 ADDING NEW FILES

### Adding a New Component
```typescript
// src/components/MyComponent.tsx
export function MyComponent() {
  return <div>Component content</div>
}

// Use in page.tsx
import { MyComponent } from '@/components/MyComponent'
```

### Adding a New Page
```typescript
// src/app/my-page/page.tsx
export default function MyPage() {
  return <div>New page</div>
}
// Auto-available at /my-page
```

### Adding a Utility Function
```typescript
// src/lib/my-util.ts
export function myFunction() {
  // ...
}

// Use anywhere
import { myFunction } from '@/lib/my-util'
```

---

## 🎯 FOLDER NAMING CONVENTIONS

- **Folders:** lowercase with hyphen `my-folder` ✅
- **Components:** PascalCase `MyComponent.tsx` ✅
- **Utilities:** camelCase `myUtil.ts` ✅
- **Types:** PascalCase `MyType.ts` ✅

---

## ✅ STRUCTURE VERIFICATION

Run this to verify folder structure:
```bash
# Windows
tree /F /A

# macOS/Linux
tree -L 2 -I 'node_modules|.next'
```

Expected output structure:
```
Mekong Delta/
├── docs/                    # 📚 Documentation folder
│   ├── GIỚI_THIỆU.md
│   ├── HƯỚNG_DẪN_NHANH.md
│   ├── HƯỚNG_DẪN_CÀI_ĐẶT.md
│   ├── HƯỚNG_DẪN_CÀI_ĐẶT_ĐẦY_ĐỦ.md
│   ├── KIẾN_TRÚC_HỆ_THỐNG.md
│   ├── YÊU_CẦU_PHIÊN_BẢN.md
│   └── DANH_SÁCH_KIỂM_TRA_MVP.md
├── src/                     # 💻 Source code
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── store/
│   └── data/
├── public/                  # 📁 Static assets
├── node_modules/            # 📦 Dependencies
├── .next/                   # 🏗️ Build folder
│
├── package.json ⭐          # Root level (required!)
├── tsconfig.json ⭐         # Root level (required!)
├── tailwind.config.ts ⭐    # Root level (required!)
├── postcss.config.js ⭐     # Root level (required!)
├── next.config.js ⭐        # Root level (required!)
└── .env.local ⭐            # Root level (required!)
```

⭐ = Must be at root for Next.js to find them

---

## 🔗 IMPORT PATHS

**Use `@/` alias instead of relative paths:**

```typescript
// ✅ GOOD
import { MyComponent } from '@/components/MyComponent'
import { stress-calc } from '@/lib/stress-calc'

// ❌ AVOID
import { MyComponent } from '../../../components/MyComponent'
import { stress-calc } from '../../lib/stress-calc'
```

This is configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 📞 SUPPORT

**Can't find a file?**
1. Check this guide for folder location
2. Search in `src/` for components
3. Check `docs/` for documentation
4. Check `config/` for configuration

**Need to add something?**
- New component? → `src/components/`
- New utility? → `src/lib/`
- New page? → `src/app/new-page/`
- New documentation? → `docs/`

---

**Status:** ✅ Project Organized  
**Last Verified:** January 28, 2026  
**Maintainer:** Delta Team
