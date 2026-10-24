# 📋 DANH SÁCH FOLDER & MỤC ĐÍCH

**Last Updated:** January 28, 2026  
**Language:** Vietnamese (Tiếng Việt)

---

## 📚 DOCS/ - TÀI LIỆU HƯỚNG DẪN
**Mục đích:** Chứa tất cả file hướng dẫn cho người dùng mới

| File | Dùng cho ai? | Nội dung |
|------|-----------|---------|
| **GIỚI_THIỆU.md** | Tất cả mọi người | Tổng quan dự án, features, tech stack |
| **HƯỚNG_DẪN_NHANH.md** | Người có Node.js | 3 bước chạy (cd → npm install → npm run dev) |
| **HƯỚNG_DẪN_CÀI_ĐẶT.md** | Người Windows/Mac | Hướng dẫn cài Node.js + npm + chạy project |
| **HƯỚNG_DẪN_CÀI_ĐẶT_ĐẦY_ĐỦ.md** | Developer & team | Chi tiết tất cả từ môi trường đến troubleshooting |
| **KIẾN_TRÚC_HỆ_THỐNG.md** | Developer & architect | Code structure, components, state management |
| **YÊU_CẦU_PHIÊN_BẢN.md** | System admin | Version requirements, compatibility matrix |
| **DANH_SÁCH_KIỂM_TRA_MVP.md** | QA & tester | Features checklist, test cases |
| **CẤUTRÚC_DỰ_ÁN.md** | Developers | Folder organization, file purposes |

---

## 💻 SRC/ - MÃ NGUỒN (Source Code)
**Mục đích:** Tất cả code của ứng dụng React/Next.js

### SRC/APP/ - Next.js Pages & Layout
| File | Mục đích |
|------|---------|
| `layout.tsx` | HTML structure, global wrapper |
| `page.tsx` | Home page (/) - main app |
| `globals.css` | Global styles, CSS imports |

### SRC/COMPONENTS/ - React Components
| File | Mục đích |
|------|---------|
| `map-view.tsx` | 🗺️ Leaflet map + OpenStreetMap |
| `sidebar.tsx` | 🎛️ Layer controls, sliders, export |
| `detail-panel.tsx` | 📈 Province analytics with chart |
| `legend.tsx` | 📏 Color scale visualization |

### SRC/LIB/ - Utility Functions
| File | Mục đích |
|------|---------|
| `stress-calc.ts` | 📐 Compound risk calculation |
| `utils.ts` | 🛠️ Helper functions (cn, clsx) |

### SRC/STORE/ - State Management (Zustand)
| File | Mục đích |
|------|---------|
| `layer-store.ts` | 🔄 Global state (layers, selection) |

### SRC/DATA/ - Mock Data
| File | Mục đích |
|------|---------|
| `mock-geo.ts` | 📊 GeoJSON provinces (3 samples) |

---

## 📁 PUBLIC/ - STATIC ASSETS
**Mục đích:** Hình ảnh, icon, favicon (serve at /)

| Item | Dùng cho |
|------|----------|
| `favicon.ico` | Browser tab icon |
| `images/` | Screenshots, project images |
| `map-data/` | Additional GeoJSON files |

---

## ROOT LEVEL - CẤU HÌNH CHÍNH
**Mục đích:** Config files cho Next.js, TypeScript, Tailwind

**⚠️ QUAN TRỌNG:** Những file này PHẢI ở root level!

| File | Mục đích | Công cụ |
|------|---------|--------|
| `package.json` ⭐ | Dependencies & scripts | npm |
| `package-lock.json` | Locked versions | npm |
| `tsconfig.json` ⭐ | TypeScript config | TypeScript |
| `tailwind.config.ts` ⭐ | Tailwind theme & styles | Tailwind CSS |
| `postcss.config.js` ⭐ | CSS processing | PostCSS |
| `next.config.js` ⭐ | Next.js settings | Next.js |
| `.env.local` ⭐ | Environment variables | Runtime |
| `.eslintrc.json` | Code quality rules | ESLint |
| `.gitignore` | Git exclusions | Git |

---

## 🚀 WORKFLOW - HỖ TRỢ CẤU TRÚC

### Đang làm việc?
**Chỉnh sửa trong SRC/** → Auto reload at http://localhost:3000

### Muốn thêm component mới?
```
src/components/MyNewComponent.tsx
```

### Muốn thêm trang mới?
```
src/app/my-new-page/page.tsx
→ Auto-available at /my-new-page
```

### Muốn thêm utility function?
```
src/lib/my-new-util.ts
Import: import { func } from '@/lib/my-new-util'
```

### Muốn thêm state?
```
src/store/my-new-store.ts
Dùng Zustand pattern từ layer-store.ts
```

### Muốn thêm mock data?
```
src/data/my-new-data.ts
```

---

## 📊 FOLDER SIZE & CLEANUP

| Folder | Size | Commit? | Notes |
|--------|------|---------|-------|
| `src/` | ~50 KB | ✅ YES | Source code - critical |
| `docs/` | ~100 KB | ✅ YES | Documentation - important |
| `public/` | ~100 KB | ✅ YES | Assets - important |
| `node_modules/` | ~500 MB | ❌ NO | Auto-installed (in .gitignore) |
| `.next/` | ~200 MB | ❌ NO | Build cache (in .gitignore) |

**To clean up:**
```bash
# Remove build cache
rm -r .next
rm -r node_modules

# Reinstall from package.json
npm install
```

---

## 📖 GIT IGNORE RULES

```
# Don't commit these:
node_modules/               # Too big, install locally
.next/                      # Build cache, rebuild locally
.env.local                  # Secrets - never share!
dist/                       # Build artifacts
*.log                       # Log files
.DS_Store                   # macOS files
```

**Do commit:**
```
✅ src/
✅ docs/
✅ public/
✅ package.json
✅ package-lock.json
✅ tsconfig.json
✅ tailwind.config.ts
✅ .gitignore
✅ etc.
```

---

## 🔍 FINDING THINGS

**Need to modify styling?**
```
tailwind.config.ts          (colors, theme)
src/app/globals.css         (global styles)
src/components/...tsx       (component styles with className)
```

**Need to modify map?**
```
src/components/map-view.tsx
```

**Need to modify calculations?**
```
src/lib/stress-calc.ts
```

**Need to modify state?**
```
src/store/layer-store.ts
```

**Need to modify data?**
```
src/data/mock-geo.ts
```

**Need to change title/description?**
```
src/app/layout.tsx          (HTML metadata)
src/app/page.tsx            (Page content)
```

---

## 🎯 COMMON TASKS

### Start development
```bash
npm run dev
# Opens http://localhost:3000
```

### Build for production
```bash
npm run build
npm start
```

### Check for errors
```bash
npm run type-check
npm run lint
```

### Update dependencies
```bash
npm update
npm audit fix
```

---

## ✅ CHECKLIST - SỬ DỤNG LẦN ĐẦU

- [ ] Đọc `docs/GIỚI_THIỆU.md`
- [ ] Chạy `npm install`
- [ ] Chạy `npm run dev`
- [ ] Mở http://localhost:3000
- [ ] Xem tất cả features hoạt động
- [ ] Đọc `docs/HƯỚNG_DẪN_CÀI_ĐẶT_ĐẦY_ĐỦ.md` để hiểu thêm
- [ ] Đọc `docs/KIẾN_TRÚC_HỆ_THỐNG.md` nếu muốn sửa code
- [ ] Đọc `CẤUTRÚC_DỰ_ÁN.md` nếu muốn thêm feature

---

## 🆘 TROUBLESHOOTING

**Map không hiển thị?**
→ Check `src/components/map-view.tsx`

**Dependencies bị lỗi?**
→ Run `npm install --legacy-peer-deps`

**TypeScript errors?**
→ Check `src/` files have proper types

**Styles không áp dụng?**
→ Check `tailwind.config.ts` & `src/app/globals.css`

**Port 3000 đang dùng?**
→ `npm run dev -- -p 3001` (use port 3001)

---

## 📞 SUPPORT

**Cần help?**
1. Check folder structure in this file
2. Read relevant guide in `docs/`
3. Check source code comments
4. Review `docs/KIẾN_TRÚC_HỆ_THỐNG.md`

**Muốn thêm feature?**
1. Plan where it goes (component? lib? store?)
2. Follow file naming conventions
3. Use `@/` import paths
4. Test with `npm run dev`

---

**Status:** ✅ Organized  
**Last Verified:** January 28, 2026  
**Project:** Delta Stress Lens MVP 1.0.0
