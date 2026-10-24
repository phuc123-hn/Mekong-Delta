# 🚀 GIAI ĐOẠN 3: DỰ BÁO & VỆ TINH (FORECASTING & SATELLITE)

## Tổng Quan Chiến Lược

### 1️⃣ DỰ BÁO THỜI TIẾT (7 NGÀY)

**Mục tiêu:** Tích hợp API dự báo để cảnh báo rủi ro trước 7 ngày

#### Nguồn Dữ Liệu
- **OpenWeatherMap One Call API 3.0**
  - Miễn phí: 1.000 call/ngày
  - Endpoint: `https://api.openweathermap.org/data/3.0/onecall`
  - Dữ liệu: Nhiệt độ, độ ẩm, mưa, gió, áp suất
  
#### Tối ưu Hiệu suất
- **TanStack Query (React Query)**: Cache dữ liệu, không gọi API lặp lại
- **Debounce**: Khi kéo timeline slider, chỉ gọi API sau 300ms dừng
- **ISR (Incremental Static Regeneration)**: Cache dữ liệu trên server

#### Code Mẫu (Tương lai)
```tsx
import { useQuery } from '@tanstack/react-query';

function ForecastPanel({ lat, lng, day }) {
  const { data: forecast } = useQuery({
    queryKey: ['forecast', lat, lng],
    queryFn: () => 
      fetch(`/api/forecast?lat=${lat}&lng=${lng}&day=${day}`)
        .then(r => r.json()),
    staleTime: 30 * 60 * 1000, // 30 phút
  });
  
  return <ForecastChart data={forecast} />;
}
```

---

### 2️⃣ DỮ LIỆU VỆ TINH (NDVI - VEGETATION INDEX)

**Mục tiêu:** Hiển thị sức khỏe cây trồng trên bản đồ qua lớp VỆ TINH

#### Nguồn Dữ Liệu Miễn Phí
1. **Sentinel Hub (Copernicus)** - TỰA NHẤT
   - NDVI (Normalized Difference Vegetation Index)
   - NDWI (Normalized Difference Water Index)
   - WMS (Web Map Service): Có thể nhúng trực tiếp vào Leaflet
   - Link: https://www.sentinel-hub.com/

2. **NASA GIBS (Global Imagery Browse Services)**
   - MODIS True Color, NDVI
   - Miễn phí, không cần API key
   - Link: https://gibs.earthdata.nasa.gov/

3. **Google Earth Engine** (Nặng hơn, cần xử lý)
   - Dữ liệu Sentinel-2, Landsat 8
   - Cần JavaScript API

#### Chiến Lược Tối Ưu
- **Thay vì xử lý ảnh vệ tinh** (nặng), hãy dùng **Tile Layer có sẵn**
- **Overlay lên GeoJSON** với opacity 0.3-0.5 để thấy bản đồ dưới
- **Hover Legend** để xem giá trị NDVI: 
  - NDVI > 0.7: Cây khỏe ✅
  - NDVI 0.4-0.7: Bình thường 🟡
  - NDVI < 0.4: Stress cao 🔴

---

## 🛠️ CÁC THƯ VIỆN CẦN CÀI

```bash
# Caching API responses
npm install @tanstack/react-query

# Optimize render khi dữ liệu lớn
npm install react-window

# Chart visualizations
npm install recharts

# Debounce utilities
npm install lodash-es
```

---

## 📊 ROADMAP CHI TIẾ GIAI ĐOẠN 3

### Tuần 1: Setup & Forecast API
- [ ] Đăng ký OpenWeatherMap API
- [ ] Tạo `/api/forecast` endpoint
- [ ] Setup TanStack Query
- [ ] Thêm Timeline Slider vào Map Page

### Tuần 2: Forecast UI & Chart
- [ ] Vẽ Forecast Chart (Recharts)
- [ ] Hiển thị biểu đồ 7 ngày
- [ ] Risk color coding theo dự báo
- [ ] Cảnh báo "Ngày mai mặn cao"

### Tuần 3: Satellite Layer
- [ ] Thêm Sentinel Hub NDVI layer
- [ ] Toggle satellite view on/off
- [ ] Legend NDVI: Green (khỏe) → Red (stress)

### Tuần 4: Optimization & Polish
- [ ] Debounce slider changes
- [ ] Cache strategy
- [ ] Mobile responsive
- [ ] Dark mode (already done ✅)

---

## 🎯 PRIORITIZE CÁI NÀO?

**HIGH PRIORITY** ⭐⭐⭐
1. Timeline Slider (đã tạo ✅) + Forecast API
2. Simple line chart (hôm nay vs +7 ngày)

**MEDIUM PRIORITY** ⭐⭐
3. NDVI satellite layer
4. Risk prediction alerts

**LOW PRIORITY** ⭐
5. Advanced satellite analysis
6. Machine learning model training

---

## 📚 THAM KHẢO CÓ SẴN

### Components vừa tạo:
- ✅ `src/components/timeline-slider.tsx` - Slider 7 ngày
- ✅ `src/components/citizen-science.tsx` - Report form
- ✅ `src/components/citizen-science-map.tsx` - Map with reports

### Chuẩn bị cho GIAI ĐOẠN 3:
- Tạo `/api/forecast` route
- Thêm `.env.local` với OpenWeatherMap API key
- Intergrate Timeline Slider vào map page

---

## 🔗 HELPFUL LINKS

**OpenWeatherMap API:**
https://openweathermap.org/api/one-call-api

**Sentinel Hub WMS:**
https://www.sentinel-hub.com/explore/sentinelhub/

**TanStack Query Docs:**
https://tanstack.com/query/latest

**Recharts Examples:**
https://recharts.org/examples

---

**ĐÂY LÀ PLAN 3 THÁNG ĐẦU CHO DELTA STRESS LENS!** 🎯
