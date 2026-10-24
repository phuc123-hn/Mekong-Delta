# 📌 VERSION REQUIREMENTS & COMPATIBILITY

**Last Updated:** January 28, 2026  
**Project:** Delta Stress Lens MVP 1.0.0

---

## 🔧 REQUIRED VERSIONS

### Core Runtime
| Package | Min Version | Recommended | Notes |
|---------|-------------|-------------|-------|
| **Node.js** | v18.0.0 | v24.13.0 | LTS versions only |
| **npm** | v9.0.0 | v11.6.2 | Comes with Node.js |

**Cách check:**
```bash
node --version    # v24.13.0
npm --version     # 11.6.2
```

---

## 📦 PROJECT DEPENDENCIES

### Production Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "next": "14.0.0",
  "typescript": "^5.3.3",
  "zustand": "^4.4.2",
  "framer-motion": "^10.16.4",
  "recharts": "^2.10.0",
  "leaflet": "^1.9.4",
  "@types/leaflet": "^1.9.4",
  "html2canvas": "^1.4.1",
  "lucide-react": "^0.294.0",
  "tailwindcss": "^3.3.5",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.2.0"
}
```

### Development Dependencies
```json
{
  "eslint": "^8.57.1",
  "@types/node": "^20.10.6",
  "@types/react": "^18.2.46",
  "@types/react-dom": "^18.2.18",
  "autoprefixer": "^10.4.14",
  "postcss": "^8.4.32"
}
```

---

## ⚠️ CRITICAL VERSION CONSTRAINTS

### ❌ DO NOT USE
```
Node.js < 18.0.0          ❌ Too old, missing ES2020 features
Node.js 21+ (odd versions) ❌ Unstable, not recommended
Next.js < 13.0.0          ❌ Missing App Router
Next.js > 15.0.0          ❌ Breaking changes (not tested)
React < 18.0.0            ❌ Missing hooks & features
Leaflet < 1.9.0           ❌ Missing features
TypeScript < 5.0.0        ❌ Old type system
```

### ✅ SAFE VERSIONS
```
Node.js: v20.x LTS (20.11.0+) or v24.x LTS (24.13.0+)
npm: v10.x (10.2.4+) or v11.x (11.6.2+)
Next.js: 14.0.0 (exact)
React: 18.2.0+
TypeScript: 5.2.0+
Leaflet: 1.9.4
```

---

## 🔄 UPGRADE GUIDE

### If You Have Older Versions

**Step 1: Check current versions**
```bash
node -v
npm -v
```

**Step 2: Upgrade Node.js to LTS**
- Go to https://nodejs.org/
- Download v24.13.0 LTS
- Run installer (will upgrade npm automatically)

**Step 3: Verify**
```bash
node -v    # Should be v24.13.0
npm -v     # Should be v11.6.2+
```

**Step 4: Clean install project**
```bash
cd project-folder
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 VERSION COMPATIBILITY MATRIX

| Node.js | npm | Next.js | React | Leaflet | Status |
|---------|-----|---------|-------|---------|--------|
| 18.x LTS | 9.x | 14.x | 18.x | 1.9.4 | ✅ SUPPORTED |
| 20.x LTS | 10.x | 14.x | 18.x | 1.9.4 | ✅ SUPPORTED |
| 24.x LTS | 11.x | 14.x | 18.x | 1.9.4 | ✅ **RECOMMENDED** |
| 22.x | 10.x | 14.x | 18.x | 1.9.4 | ⚠️ OK but not LTS |
| < 18 | < 9 | - | - | - | ❌ NOT SUPPORTED |
| > 24 | > 11 | - | - | - | ❌ NOT TESTED |

---

## 🗂️ File Version Information

### Critical Files That Define Versions

**`package.json`** - Lists all dependencies
```json
{
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

**`tsconfig.json`** - TypeScript 5.x configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}
```

**`.next/` folder** - Built by specific Next.js version (don't edit)

---

## 🚀 INSTALLATION FROM SCRATCH

If starting on a brand new machine:

```bash
# 1. Install Node.js v24.13.0 from nodejs.org
# 2. Verify installation
node --version    # v24.13.0
npm --version     # 11.6.2+

# 3. Navigate to project
cd "path/to/delta-stress-lens"

# 4. Install dependencies
npm install

# 5. Verify all dependencies installed
npm list --depth=0

# 6. Run development server
npm run dev

# 7. Open http://localhost:3000
```

---

## ⚙️ COMMON VERSION ISSUES & FIXES

### Issue 1: "npm ERR! ERESOLVE unable to resolve dependency tree"
**Cause:** React version mismatch  
**Fix:**
```bash
npm install --legacy-peer-deps
```

### Issue 2: "Error: Cannot find module 'leaflet'"
**Cause:** Dependencies not installed  
**Fix:**
```bash
npm install
# or
npm install --legacy-peer-deps
```

### Issue 3: "TypeScript error: Cannot use JSX"
**Cause:** TypeScript < 5.0  
**Fix:** Update Node.js to v20+ (includes TS 5+)

### Issue 4: "Next.js version mismatch"
**Cause:** Wrong Next.js version  
**Fix:**
```bash
npm uninstall next
npm install next@14.0.0
```

### Issue 5: "React error: Invalid hook call"
**Cause:** React 17 or older  
**Fix:** Update to Node v20+ which brings React 18

---

## 📱 Browser Version Requirements

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Mobile Chrome | 90+ |
| Mobile Safari (iOS) | 14+ |

---

## 🔐 Security Notes

### Dependency Vulnerabilities
```bash
# Check for vulnerabilities
npm audit

# Fix critical issues
npm audit fix

# Review before fixing (breaking changes may occur)
npm audit fix --force --legacy-peer-deps
```

### Current Status
- ✅ No critical vulnerabilities in core dependencies
- ⚠️ Some npm packages have old code (but low severity)
- ✅ Production-safe versions

---

## 📚 How to Stay Updated

### Check for updates
```bash
npm outdated
```

### Update packages safely
```bash
# Minor/patch updates (safe)
npm update

# Major updates (test first!)
npm install package@latest
```

### DO NOT automatically update
```bash
# AVOID - breaks compatibility
npm install -g npm@latest
npm update --save
npm audit fix --force
```

---

## 🎯 DEPLOYMENT VERSIONS

### Vercel Deployment
```
Environment: Node.js 18.x LTS (default)
npm version: auto-detected
Build: `npm run build`
Start: `npm start`
```

Vercel will use the versions in `package.json` automatically.

### Docker Deployment (if needed)
```dockerfile
FROM node:24.13.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## 🔄 Version Update Timeline

| Date | Version | Changes | Status |
|------|---------|---------|--------|
| 2026-01-28 | 1.0.0 | Initial MVP (OpenStreetMap) | ✅ Current |
| TBD | 1.1.0 | Real GeoJSON + Supabase | 🔄 Planned |
| TBD | 2.0.0 | Real-time data + API | 🔄 Planned |

---

## ✅ VERIFICATION CHECKLIST

Before deploying:

- [ ] `node --version` shows v20+ or v24+
- [ ] `npm --version` shows v10+ or v11+
- [ ] `npm install` completes without error
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts without errors
- [ ] http://localhost:3000 loads correctly
- [ ] No red errors in browser console (F12)
- [ ] All features work (map, layers, export)

---

## 🆘 Support

**Version-specific issues?**
1. Check this file for your current versions
2. Compare with [REQUIRED VERSIONS](#required-versions)
3. Follow the fix in [COMMON ISSUES](#common-version-issues--fixes)
4. Contact support with output of: `node -v && npm -v && npm list`

---

**Project Status:** ✅ MVP Ready  
**Last Verified:** January 28, 2026  
**Maintainer:** Delta Team
