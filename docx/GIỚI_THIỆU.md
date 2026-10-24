# Delta Stress Lens 🌊

**Environmental Risk Visualization for the Mekong Delta**

Delta Stress Lens is a high-performance, interactive geospatial analytics tool designed to visualize compound environmental risks (Salinity, Heat, Flood, Pollution) in the Mekong Delta region.

![Status](https://img.shields.io/badge/Status-MVP-success)
![Stack](https://img.shields.io/badge/Stack-Next.js_14_|_Mapbox_|_Zustand-blue)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 Key Features

### Interactive Map Engine
- **High-Performance WebGL Rendering:** Powered by Mapbox GL JS with 60FPS smooth zooming and panning
- **Dynamic Color Mapping:** Province polygons change color in real-time from Green (Low Risk) → Red (Extreme Risk)
- **Compound Risk Calculation:** Real-time logic combines multiple stress layers with configurable amplification factors

### Advanced Analytics
- **Detail Analytics Panel:** Click any province to reveal a glass-morphism panel with:
  - Recharts bar chart breakdown of 4 stress dimensions
  - AI-powered risk analysis insights
  - Station metadata and temporal information
- **Layer Control:** Toggle individual data layers (Salinity, Heat, Flood, Pollution) on/off
- **Opacity & Amplification:** Fine-tune visualization with global opacity slider and risk amplification (0.5x - 2.0x)

### User Experience
- **Mobile First Design:** Responsive detail panels that slide up from bottom on mobile, right side on desktop
- **Hover Tooltips:** Quick preview of risk level and compound index when hovering over provinces
- **Smooth Animations:** Framer Motion transitions for panel slide-in/out effects
- **Export Capability:** Capture high-resolution PNG snapshots of the current view for reports and sharing

### Accessibility
- **ARIA Labels:** All interactive elements include semantic labels for screen readers
- **Keyboard Support:** Layer toggles respond to Enter/Space keys
- **Focus Management:** Clear focus indicators on interactive elements
- **Dark Mode Optimized:** Enterprise-grade dark theme optimized for extended viewing

## 🛠 Tech Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Next.js** | React framework with App Router | 14.0.0 |
| **TypeScript** | Type-safe development | 5.x |
| **Mapbox GL JS** | Interactive vector maps | 3.0.0 |
| **Zustand** | Lightweight state management | 4.4.2 |
| **Tailwind CSS** | Utility-first styling | 3.3.5 |
| **Framer Motion** | Animation library | 10.16.4 |
| **Recharts** | React charts library | 2.10.0 |
| **html2canvas** | Client-side screenshot utility | 1.4.1 |

## ⚙️ Setup Instructions

### Prerequisites
- **Node.js:** v20.x LTS or later ([Download](https://nodejs.org/))
- **npm:** Comes with Node.js (v10.x or later)
- **Mapbox Account:** Free account at [mapbox.com](https://mapbox.com)

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone https://github.com/your-username/delta-stress-lens.git
cd delta-stress-lens

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Get your public token from mapbox.com/account/tokens
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijo............
```

**Important:** Never commit `.env.local` to version control. It's added to `.gitignore` automatically.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app will auto-reload on code changes.

### 4. Build for Production

```bash
npm run build
npm start
```

## 📚 Project Structure

```
delta-stress-lens/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles + Mapbox overrides
│   │   ├── layout.tsx           # Root layout + metadata
│   │   └── page.tsx             # Main page (Map + UI)
│   │
│   ├── components/
│   │   ├── map-view.tsx         # Mapbox integration & interactions
│   │   ├── sidebar.tsx          # Control panel with layer toggles
│   │   ├── detail-panel.tsx     # Province details with charts
│   │   └── legend.tsx           # Risk index color legend
│   │
│   ├── store/
│   │   └── layer-store.ts       # Zustand state (layers, selection)
│   │
│   ├── lib/
│   │   ├── utils.ts             # Class name merging utility
│   │   └── stress-calc.ts       # Compound index calculation logic
│   │
│   └── data/
│       └── mock-geo.ts          # Mock GeoJSON province data
│
├── public/                       # Static assets
├── tailwind.config.ts           # Tailwind + custom Delta theme
├── tsconfig.json                # TypeScript configuration
├── next.config.js               # Next.js configuration
└── README.md                    # This file
```

## 🎮 Usage Guide

### Map Interactions
| Action | Result |
|--------|--------|
| **Hover** | Province highlights with tooltip showing Name, Risk, Index |
| **Click** | Province selected, detail panel opens on right (or bottom on mobile) |
| **Drag** | Pan the map (standard Mapbox behavior) |
| **Scroll** | Zoom in/out |
| **Click Empty Area** | Close detail panel |

### Sidebar Controls
- **Data Layers:** Toggle visibility of Salinity, Heat, Flood, and Pollution layers
- **Layer Opacity:** Adjust transparency of all overlay polygons (0-100%)
- **Amplify Factor:** Increase risk calculation severity (0.5x - 2.0x) for compound scenarios
- **Export Button:** Download current map view as PNG

### Understanding the Colors
- **🟢 Green (0.0-0.25):** Low risk environment
- **🟡 Yellow (0.25-0.5):** Moderate risk levels
- **🟠 Orange (0.5-0.75):** High risk alert
- **🔴 Red (0.75-1.0):** Extreme risk - immediate action needed

## 🧮 Calculation Engine

The **Compound Index** combines multiple risk factors:

```
1. Average Risk = (Salinity + Heat + Flood + Pollution) / Active Layers
2. Amplification = Average Risk × 1.15 (if 3+ layers active)
3. Final Score = Amplification × User Amplify Factor
4. Risk Level Classification:
   - Low:       0.00-0.25
   - Moderate:  0.25-0.50
   - High:      0.50-0.75
   - Extreme:   0.75-1.00
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial Delta Stress Lens MVP"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select "Next.js" framework preset

3. **Configure Environment Variable:**
   - In Vercel Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_MAPBOX_TOKEN` with your Mapbox token value
   - Deploy!

### Deploy to Other Platforms
- **Netlify:** Supports Next.js with build command `npm run build`
- **Self-hosted:** `npm run build && npm start`

## 🐛 Troubleshooting

### Map Displays Blank
- ✅ Check `.env.local` has valid `NEXT_PUBLIC_MAPBOX_TOKEN`
- ✅ Restart dev server after environment changes (`npm run dev`)
- ✅ Verify token is "Public" (starts with `pk.eyJ...`)

### "Module not found" Errors
- ✅ Confirm file names use lowercase (e.g., `map-view.tsx` not `MapView.tsx`)
- ✅ Check import paths use `@/` alias (e.g., `@/components/sidebar`)
- ✅ Run `npm install` if dependencies are missing

### Performance Issues
- ✅ Reduce number of provinces in mock data if testing locally
- ✅ Check browser DevTools → Performance tab for bottlenecks
- ✅ Ensure `preserveDrawingBuffer: true` is set in MapView (for screenshot)

### Export PNG Shows Black Map
- ✅ This is the WebGL issue - confirm `preserveDrawingBuffer: true` in map-view.tsx
- ✅ Close other browser tabs to reduce memory usage
- ✅ Try again if texture loading failed

## 📖 Documentation

- **Mapbox GL JS Docs:** https://docs.mapbox.com/mapbox-gl-js/
- **Next.js 14 Docs:** https://nextjs.org/docs
- **Zustand Guide:** https://github.com/pmndrs/zustand
- **Tailwind CSS:** https://tailwindcss.com/docs

## 🤝 Contributing

This MVP is locked for feature development. Bug fixes and performance improvements welcome:

1. Fork the repository
2. Create feature branch (`git checkout -b fix/issue-name`)
3. Commit changes (`git commit -m 'Fix: description'`)
4. Push to branch (`git push origin fix/issue-name`)
5. Open Pull Request

## 📋 Development Checklist (MVP Release)

- [x] Mapbox GL JS integration with dark theme
- [x] Zustand state management for layers & selection
- [x] Compound risk calculation with amplification
- [x] Interactive map with click/hover interactions
- [x] Detail panel with Recharts visualization
- [x] Mobile-responsive design (sheet + desktop)
- [x] Export PNG functionality (html2canvas)
- [x] Legend with color mapping
- [x] Accessibility (ARIA labels, keyboard support)
- [x] Tailwind CSS + custom Delta theme
- [x] TypeScript strict mode
- [x] README documentation

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built with ❤️ for the Mekong Delta Environmental Analytics initiative.

Special thanks to:
- Mapbox for excellent geospatial visualization tools
- Vercel for seamless Next.js deployment
- React ecosystem for amazing libraries

## 📞 Support

For questions or issues:
- 📧 Email: [your-email@example.com]
- 🐙 GitHub Issues: [github.com/your-username/delta-stress-lens/issues](https://github.com/your-username/delta-stress-lens/issues)
- 💬 Discussions: [github.com/your-username/delta-stress-lens/discussions](https://github.com/your-username/delta-stress-lens/discussions)

---

**Current Version:** 1.0.0 MVP  
**Last Updated:** January 28, 2026  
**Status:** Ready for Production Demo
