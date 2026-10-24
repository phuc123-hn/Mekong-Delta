# 🏗️ DELTA STRESS LENS - ARCHITECTURE GUIDE

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     USER INTERFACE LAYER                 │
│  [Sidebar] [MapView] [DetailPanel] [Legend]             │
└──────────────┬────────────────────────────────────────┬──┘
               │                                          │
               ├─────────────────────────────────────────┤
               │   ZUSTAND STATE MANAGEMENT              │
               │   (layer-store.ts)                      │
               │   - activeLayers: Record                │
               │   - opacity: number                     │
               │   - amplifyFactor: number               │
               │   - selectedProvince: ProvinceProperties│
               └──────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   [Calculations]    [Map Updates]        [Interactions]
   ├─ stress-calc.ts ├─ Dynamic GeoJSON ├─ Click Handler
   │ calculateIndex()│ Render            │ Hover Tooltip
   │                │                   │ Export PNG
   └────────────────┴────────────────────┴──────────────
        │
        ▼
   [DATA LAYER]
   ├─ mock-geo.ts (Static Province Data)
   └─ MEKONG_GEOJSON (Feature Collection)
```

---

## Data Flow (Click Province Example)

```
User clicks "Can Tho" on map
        │
        ▼
map-view.tsx detects click
        │
        ├─► extracts Province properties
        │
        ▼
setSelectedProvince(provinceData)
        │
        ├─► Updates Zustand store
        │
        ▼
Detail Panel triggers re-render
        │
        ├─► Framer Motion slide-in animation
        ├─► chartData computed from properties
        ├─► Recharts renders bar chart
        │
        ▼
Map highlights province with cyan line
        │
        └─► setFilter("province-highlight", ["==", "id", "CT"])
```

---

## Component Breakdown

### 1. **map-view.tsx** (Map Engine)
**Responsibility:** Render Mapbox, handle layer rendering, interactions

**Key Logic:**
- Initialize Mapbox with `preserveDrawingBuffer: true` (for PNG export)
- Add GeoJSON source dynamically
- Listen to `calculatedGeoJSON` changes (useMemo dependency)
- Update map layer paint properties when state changes
- Handle click/hover interactions

**Dependencies:**
- `mapboxgl` (Mapbox library)
- `useLayerStore` (read activeLayers, opacity, amplifyFactor, setSelectedProvince)
- `calculateCompoundIndex` (compute risk scores)
- `MEKONG_GEOJSON` (raw province data)

**Important Notes:**
- ⚠️ Map initialization happens ONCE (useEffect with empty dependency array)
- ⚠️ Data updates happen in separate useEffect (depend on calculatedGeoJSON)
- ⚠️ `preserveDrawingBuffer: true` is CRITICAL for html2canvas

---

### 2. **sidebar.tsx** (Control Panel)
**Responsibility:** Layer toggles, opacity/amplify sliders, export button

**Key Logic:**
- Read & update `activeLayers`, `opacity`, `amplifyFactor` from store
- Call `toggleLayer()` on checkbox click
- Call `handleExport()` with html2canvas
- Render LayerItem sub-components with accessibility features

**Accessibility:**
- `aria-label` on all inputs
- Keyboard support (Enter/Space to toggle)
- `role="checkbox"` on layer items
- Focus rings with `focus:ring-2`

**Dependencies:**
- `useLayerStore`
- `html2canvas` (for export)
- `lucide-react` (icons)

---

### 3. **detail-panel.tsx** (Analytics View)
**Responsibility:** Show detailed metrics, charts, AI insights for selected province

**Key Logic:**
- Read `selectedProvince` from store
- Compute `chartData` from province properties
- Render Recharts BarChart
- AnimatePresence for slide-in/out animation
- Responsive design (mobile: bottom sheet, desktop: right panel)

**Features:**
- **Risk Badge:** Color-coded (green/yellow/orange/red) based on risk level
- **Chart:** Horizontal bar chart with 4 stress dimensions
- **AI Insight:** Simulated risk analysis text
- **Mobile Responsive:** `h-[70vh]` on mobile, `bottom-0` slide-up; `md:right-4 md:bottom-4` desktop

**Dependencies:**
- `useLayerStore`
- `framer-motion` (AnimatePresence, motion.div)
- `recharts` (BarChart, Bar, XAxis, YAxis, Tooltip, Cell)

---

### 4. **legend.tsx** (Color Reference)
**Responsibility:** Display color scale for risk index (0.0 → 1.0)

**Key Logic:**
- Fade-in animation on mount (delay 1s after map loads)
- Gradient bar visual + labels + categories
- Hidden on small screens (`hidden sm:block`)

**Dependencies:**
- `framer-motion`

---

### 5. **page.tsx** (Layout Assembly)
**Responsibility:** Compose all components into single page

**Key Logic:**
- Map as absolute background (z-0)
- UI components layered on top (z-10) with `pointer-events-none`
- Detail panel has own z-index (z-30) with `pointer-events-auto`

---

## State Management (Zustand Store)

```typescript
interface LayerState {
  // Layer visibility
  activeLayers: {
    salinity: boolean;    // Default: true
    heat: boolean;        // Default: false
    flood: boolean;       // Default: false
    pollution: boolean;   // Default: false
  };

  // Global settings
  opacity: number;        // 0.0 - 1.0, Default: 0.7
  amplifyFactor: number;  // 0.5 - 2.0, Default: 1.0

  // Selected province for detail panel
  selectedProvince: ProvinceProperties | null;

  // Actions
  toggleLayer(layer: LayerType) → void;
  setOpacity(val: number) → void;
  setAmplify(val: number) → void;
  setSelectedProvince(prov: ProvinceProperties | null) → void;
}
```

**Design Principle:**
- Single source of truth for UI state
- No Redux overhead (Zustand is simpler for MVP)
- Immutable updates with object spread syntax

---

## Calculation Pipeline

### Compound Index Calculation
```
For each Province:
  1. Sum active stress values:
     - if salinity active: sum += salinity
     - if heat active: sum += heat
     - if flood active: sum += flood
     - if pollution active: sum += pollution

  2. Calculate average:
     score = sum / activeCount

  3. Apply amplification:
     if activeCount >= 3:
       score = score × 1.15 × amplifyFactor
     else:
       score = score × amplifyFactor

  4. Clamp to 0-1:
     score = Math.min(Math.max(score, 0), 1)

  5. Classify risk level:
     if score > 0.75: "extreme" (red)
     if score > 0.5:  "high" (orange)
     if score > 0.25: "moderate" (yellow)
     else:            "low" (green)
```

**memoization:** useMemo recalculates ONLY when `activeLayers` or `amplifyFactor` changes

---

## Map Styling Strategy

### Mapbox Paint Properties
```javascript
// Fill color: interpolate linearly between compound_index values
"fill-color": [
  "interpolate", ["linear"], ["get", "compound_index"],
  0.0,   "transparent",   // 0% risk: transparent
  0.2,   "#10b981",       // 20% risk: green
  0.5,   "#f59e0b",       // 50% risk: amber
  0.8,   "#ef4444",       // 80% risk: red
  1.0,   "#7f1d1d"        // 100% risk: dark red
]

// Opacity global control
"fill-opacity": opacity // Updated via store

// Outline fixed
"fill-outline-color": "#ffffff"
"line-opacity": 0.3
```

**Why Interpolation?**
- Smooth color transition (not step-wise)
- Visual hierarchy: redder = more danger
- Compatible with real-time updates (no layer re-adding)

---

## Performance Considerations

### Optimization Techniques Used:
1. **useMemo for Calculations**
   - `calculatedGeoJSON` only recalcs when `activeLayers` or `amplifyFactor` changes
   - Avoids re-computing all provinces on every render

2. **Separate useEffects**
   - Map initialization (once)
   - Data updates (when calculatedGeoJSON changes)
   - Highlight updates (when selectedProvince changes)
   - Prevents unnecessary GeoJSON source updates

3. **preserveDrawingBuffer on Demand**
   - Set to `true` for screenshot capability
   - Minor performance cost, acceptable for MVP

4. **Pointer-events CSS Optimization**
   - Sidebar/Legend use `pointer-events-none` by default
   - Children override with `pointer-events-auto`
   - Allows map clicks to pass through transparent areas

### Potential Bottlenecks (Future Optimization):
- Large GeoJSON with 100+ features → lazy load by zoom level
- Export PNG with complex map → consider canvas size limits
- Real-time data updates → batch updates to avoid re-renders

---

## Export PNG Implementation

```
User clicks "Download" button
         │
         ▼
handleExport() {
  html2canvas(document.body, {
    useCORS: true,           // Load cross-origin images
    allowTaint: true,        // Allow tainted canvas
    backgroundColor: "#020617" // Match bg color
  })
  .then(canvas => {
    // Create downloadable link
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `delta-stress-lens-${timestamp}.png`;
    link.click();
  })
}
```

**Why preserveDrawingBuffer?**
- WebGL canvas (Mapbox uses this) clears buffer after render
- `preserveDrawingBuffer: true` keeps the rendered frame
- Allows html2canvas to capture the canvas content
- Without it: map appears black in PNG

---

## TypeScript Type Safety

### Key Types:
```typescript
// Province data structure
interface ProvinceProperties {
  id: string;
  name: string;
  salinity: number;      // 0.0 - 1.0
  heat: number;          // 0.0 - 1.0
  flood: number;         // 0.0 - 1.0
  pollution: number;     // 0.0 - 1.0
  compound_index?: number;  // Computed
  risk_level?: string;      // Computed: "low" | "moderate" | "high" | "extreme"
}

// Layer types
type LayerType = 'salinity' | 'heat' | 'flood' | 'pollution';

// Store type
type LayerState = { ... };

// Active layers
type ActiveLayers = Record<LayerType, boolean>;
```

**Benefits:**
- IDE autocomplete
- Runtime type checking
- Prevents property typos

---

## Testing Workflow

### Unit Test Example (stress-calc.ts):
```typescript
import { calculateCompoundIndex } from '@/lib/stress-calc';

test('compound index calculation with 2 layers', () => {
  const result = calculateCompoundIndex(
    { salinity: 0.6, heat: 0.8, flood: 0, pollution: 0 },
    { salinity: true, heat: true, flood: false, pollution: false },
    1.0
  );
  expect(result.score).toBe(0.7);  // (0.6 + 0.8) / 2 = 0.7
  expect(result.level).toBe('high');
});

test('compound index with 3+ layers applies amplification', () => {
  const result = calculateCompoundIndex(
    { salinity: 0.5, heat: 0.5, flood: 0.5, pollution: 0 },
    { salinity: true, heat: true, flood: true, pollution: false },
    1.0
  );
  // (0.5 + 0.5 + 0.5) / 3 × 1.15 = 0.575
  expect(result.score).toBeCloseTo(0.575);
  expect(result.level).toBe('moderate');
});
```

---

## Future Roadmap (Post-MVP)

### Backend Integration:
- Replace MEKONG_GEOJSON with real Supabase query
- Real-time updates via websockets
- User preferences saved to DB

### Advanced Features:
- Time-series data (slider to animate historical data)
- Multi-layer composite analysis
- Custom risk formulas per user
- Shareable dashboard links

### Mobile App:
- React Native version for iOS/Android
- Native map interactions
- Offline data support

### Accessibility Enhancements:
- High contrast mode
- Screen reader testing
- Keyboard navigation for all controls

---

## Debugging Tips

### Enable Mapbox Debug Mode:
```typescript
// In map-view.tsx, inside map.on("load", ...)
map.showTileBoundaries = true;  // Show tile grid
map.showPadding = true;         // Show padding area
```

### Log State Changes:
```typescript
// In sidebar.tsx or any hook
useEffect(() => {
  console.log('Active layers:', activeLayers);
  console.log('Opacity:', opacity);
}, [activeLayers, opacity]);
```

### Check Calculated Values:
```typescript
// In map-view.tsx
console.log('Calculated GeoJSON:', calculatedGeoJSON);
// Will show compound_index for each province
```

---

**Last Updated:** January 28, 2026  
**MVP Version:** 1.0.0  
**Status:** Production Ready
