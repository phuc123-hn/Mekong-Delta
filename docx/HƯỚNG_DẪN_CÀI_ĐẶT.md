# 🚀 DELTA STRESS LENS - QUICK START GUIDE

## Các Lỗi Có Thể Gặp & Cách Fix

### 1. **"Cannot find module 'geojson'"**
**Lỗi:** TypeScript báo không tìm thấy type `GeoJSON`

**Fix:**
```bash
npm install --save-dev @types/geojson
```

Hoặc xóa import này từ `src/data/mock-geo.ts`:
```typescript
// Xóa dòng này:
import GeoJSON from 'geojson';

// Dùng inline type thay vì:
export const MEKONG_GEOJSON: {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: ProvinceProperties;
    geometry: { type: string; coordinates: any };
  }>;
} = { ... }
```

---

### 2. **"Cannot find name 'GeoJSONSource'"**
**Lỗi:** MapBox type error

**Fix:** Thêm dòng này ở đầu `src/components/map-view.tsx`:
```typescript
type GeoJSONSource = mapboxgl.GeoJSONSource;
```

---

### 3. **Map Hiển Thị Trắng Bóc**
**Lỗi:** Map không load được

**Checks:**
1. ✅ Xem `.env.local` có `NEXT_PUBLIC_MAPBOX_TOKEN` không?
2. ✅ Token có bắt đầu bằng `pk.eyJ...` không?
3. ✅ Restart server: `Ctrl+C` rồi `npm run dev`
4. ✅ Xem console (F12) có error không?

---

### 4. **"Module not found: Can't resolve '@/components/...'"**
**Lỗi:** Import path sai

**Checks:**
1. ✅ Tên file phải **chữ thường** (kebab-case): `map-view.tsx`, không phải `MapView.tsx`
2. ✅ Check folder structure có đúng không: `src/components/map-view.tsx`
3. ✅ Import phải dùng `@/` alias, ví dụ: `import MapView from "@/components/map-view"`

---

### 5. **"Zustand store not updating"**
**Lỗi:** State không thay đổi khi click layer toggle

**Fix:** Kiểm tra `src/store/layer-store.ts` xem tên function là `toggleLayer` không, không phải `toggle`.

---

### 6. **Mapbox Vỡ Giao Diện (Buttons, Controls Lỗi)**
**Lỗi:** Mapbox controls không styling đúng

**Fix:** Kiểm tra `src/app/globals.css` có import Mapbox CSS không:
```css
@import 'mapbox-gl/dist/mapbox-gl.css';
```

---

## ⚡ Cài Đặt Từ Đầu (Zero to Hero)

### Bước 1: Chuẩn Bị Node.js
```bash
# Kiểm tra version
node -v    # Phải là v20.x.x trở lên
npm -v     # Phải là v10.x.x trở lên
```

### Bước 2: Tạo Thư Mục & Clone Project
```bash
# Vào thư mục muốn lưu code
cd "C:\Users\VivoBook\Documents"

# Clone (hoặc tạo folder delta-stress-lens)
mkdir delta-stress-lens
cd delta-stress-lens
```

### Bước 3: Cài Dependencies
```bash
# Copy toàn bộ file từ guide vào từng file
# (Hoặc git clone nếu đã push lên GitHub)

# Cài npm packages
npm install
```

### Bước 4: Setup Mapbox Token
1. Vào https://mapbox.com/account/tokens
2. Copy "Default public token" (bắt đầu `pk.eyJ...`)
3. Tạo file `.env.local` ở root project
4. Paste vào:
```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijo...........
```

### Bước 5: Chạy Dev Server
```bash
npm run dev
```
Mở browser: http://localhost:3000

### Bước 6: Test Các Tính Năng
- ✅ Map hiển thị không (nếu token sai sẽ thấy lỗi)
- ✅ Click layer toggle (Salinity, Heat, etc) - nó phải đổi màu map
- ✅ Click vào tỉnh (ví dụ Cà Mau màu đỏ) - panel phải pop ra từ phải
- ✅ Di chuột vào tỉnh - tooltip phải hiển thị
- ✅ Kéo thanh Opacity & Amplify - map phải thay đổi mượt
- ✅ Click Export - download PNG file

---

## 📦 Production Build

```bash
# Build optimized version
npm run build

# Test production locally
npm start
```

---

## 🎯 Summary

**Tổng cộng files cần tạo:** 18 files
- 6 Config files (package.json, tsconfig, tailwind, etc)
- 5 Component files (MapView, Sidebar, DetailPanel, Legend, page)
- 2 Store/Lib files (layer-store, stress-calc, utils)
- 1 Data file (mock-geo)
- 1 Style file (globals.css, layout)
- 1 README
- 1 Setup guide (file này)

**Time estimate:** 10-15 phút setup + 5 phút test

**MVP Status:** ✅ Ready for Demo/Production

---

## 🆘 Vướng Mắc?

Kiểm tra các bước này theo thứ tự:
1. ✅ Node.js v20+, npm v10+ có cài không?
2. ✅ Folder structure có đúng không? (src/components, src/store, etc)
3. ✅ `.env.local` có token không?
4. ✅ Dependencies đã cài xong (`npm install`)?
5. ✅ Server đã restart sau khi tạo `.env.local`?
6. ✅ Console (F12) có error đỏ không? Copy lỗi lên đây anh xem!

**Chúc anh setup sướng tay! 🚀**
