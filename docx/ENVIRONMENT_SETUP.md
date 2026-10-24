# 🛠️ **ENVIRONMENT SETUP CHECKLIST**

## 📋 **Current Status (2026-02-09)**

✅ **Node.js**: v24.13.0
✅ **npm**: 11.6.2
✅ **MongoDB**: Running (Service: MongoDB Server)
✅ **Frontend**: 150 npm packages installed
✅ **Backend**: 150 npm packages installed
✅ **Backend Build (dist/)**: ✓ Compiled and ready
✅ **Extensions**: 80+ VS Code extensions installed

---

## **🚀 FULL SETUP GUIDE (For New VS Code User/Computer)**

### **1️⃣ System Requirements (Install First)**

#### **Windows:**
```powershell
# Check versions
node --version    # Should be v18+ (current: v24.13.0)
npm --version     # Should be npm 9+ (current: 11.6.2)
```

#### **Downloads:**
- **Node.js 20+ LTS**: https://nodejs.org/
- **MongoDB 8.2.4**: https://www.mongodb.com/try/download/community
  - Choose: Community Server, Windows 64-bit, msi installer
  - Install as Service: ✅ (will auto-run on startup)

---

### **2️⃣ Clone / Setup Project**

```bash
git clone <repo>
cd "c:\Users\[YourName]\Documents\mekong\web\Backup2\Mekong Delta"

# Install dependencies (both frontend & backend)
npm install
cd backend
npm install
cd ..
```

---

### **3️⃣ VS Code Extensions (ESSENTIAL - Install These)**

**Must Have:**
- `ms-windows-ai-studio.windows-ai-studio` - Windows AI Studio (for development)
- `github.copilot-chat` - GitHub Copilot Chat
- `ms-python.python` - Python support
- `ms-dotnettools.csharp` - C# support (for potential .NET work)

**Frontend Development:**
- `bradlc.vscode-tailwindcss` - Tailwind CSS intellisense
- `ecmel.vscode-html-css` - HTML/CSS support
- `zignd.html-css-class-completion` - CSS class completion

**Backend/Node Development:**
- `1yib.nodejs-bundle` - Node.js bundle
- `abdoseadaa.node-js-snippet` - Node.js snippets

**Database:**
- `mjstudio.db-viewer` - Database viewer
- `yurialvesguernsey.localastrodb` - Local Astro DB viewer

**Code Quality:**
- `ms-vscode.powershell` - PowerShell support
- `ms-python.vscode-pylance` - Python linter
- `standard.vscode-standard` - JavaScript standard linter
- `rvest.vs-code-prettier-eslint` - Prettier + ESLint

**Optional (Nice to Have):**
- `ritwickdey.liveserver` - Live Server for HTML preview
- `bito.bito` - Bito AI (alternative to Copilot)
- `codeium.codeium` - Codeium AI autocomplete

**Install Extensions:**
```bash
code --install-extension ms-windows-ai-studio.windows-ai-studio
code --install-extension github.copilot-chat
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-python.python
code --install-extension ms-dotnettools.csharp
# ... etc (or just manually install via VSCode Extensions tab)
```

---

### **4️⃣ Environment Files (.env)**

**backend/.env**
```env
MONGO_URI=mongodb://127.0.0.1:27017/agritech_db
JWT_SECRET=your-secret-key-here-change-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:5073
```

**root/.env.local**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

---

### **5️⃣ Verify Installation**

```bash
# Test backend
cd backend
npm run build          # Should complete without errors
node dist/server.js   # Should show "✅ Running on http://localhost:3001"

# Test frontend
cd ..
npm run dev           # Should show "ready - started server on..."

# Test from another terminal
curl http://localhost:3001/health      # Should return { "status": "OK" }
curl http://localhost:5073             # Should return HTML
```

---

### **6️⃣ ONE-CLICK START (After Everything Installed)**

```bash
cd "c:\Users\[YourName]\Documents\mekong\web\Backup2\Mekong Delta"
.\start-all.bat

# Or manual:
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
npm run dev
```

---

## **📦 Complete Extensions List (All Installed)**

### **AI/Chat Tools:**
- bito.bito
- codeium.codeium
- danielsanmedium.dscodegpt
- fittentech.fitten-code
- genieai.chatgpt-vscode
- github.copilot-chat
- kush572.aiexample

### **Programming Languages:**
- ionide.ionide-fsharp
- kreativ-software.csharpextensions
- redhat.java
- svelte.svelte-vscode
- ms-dotnettools.csdevkit
- ms-dotnettools.csharp
- ms-python.python

### **Web Development:**
- 1yib.nodejs-bundle
- 1yib.svelte-bundle
- bradlc.vscode-tailwindcss
- clinyong.vscode-css-modules
- ecmel.vscode-html-css
- ritwickdey.liveserver
- rvest.vs-code-prettier-eslint
- sidthesloth.html5-boilerplate
- svelte.svelte-vscode
- yandeu.five-server
- zignd.html-css-class-completion

### **Database/Data Tools:**
- alarm.pkl-viewer
- jock.svg
- mjstudio.db-viewer
- percy.vscode-pydata-viewer
- tomoki1207.pdf
- yurialvesguernsey.localastrodb
- randomfractalsinc.geo-data-viewer

### **Code Quality/Formatting:**
- aflalo.dbml-formatter
- jaakko.black
- michelemelluso.code-beautifier
- ms-vscode.powershell
- njpwerner.autodocstring
- standard.vscode-standard
- yatki.vscode-surround

### **Azure/Cloud:**
- ms-azuretools.vscode-azureresourcegroups
- ms-azuretools.vscode-containers
- teamsdevapp.vscode-ai-foundry
- vscjava.migrate-java-to-azure

### **Utilities:**
- abdoseadaa.node-js-snippet
- adrianwilczynski.asp-net-core-switcher
- ardenivanov.svelte-intellisense
- blackboxapp.blackbox
- blackboxapp.blackboxagent
- fivethree.vscode-svelte-snippets
- keploy.keployio
- levibickel.net-core-mvc-scaffolding
- ms-dotnettools.dotnet-interactive-vscode
- ms-dotnettools.vscode-dotnet-modernize
- ms-dotnettools.vscode-dotnet-pack
- ms-dotnettools.vscode-dotnet-runtime
- ms-toolsai.jupyter
- ms-toolsai.jupyter-keymap
- ms-toolsai.jupyter-renderers
- ms-toolsai.vscode-jupyter-cell-tags
- ms-toolsai.vscode-jupyter-slideshow
- ms-vscode.cmake-tools
- ms-vscode.cpptools
- ms-vscode.cpptools-extension-pack
- ms-vscode.cpptools-themes
- ms-vscode.makefile-tools
- ms-python.debugpy
- ms-python.vscode-pylance
- ms-python.vscode-python-envs
- ms-windows-ai-studio.windows-ai-studio
- piyushvscode.nodejs-snippets
- pyxploiter.pickler
- tht13.python
- vscjava.vscode-gradle
- vscjava.vscode-java-debug
- vscjava.vscode-java-dependency
- vscjava.vscode-java-pack
- vscjava.vscode-java-test
- vscjava.vscode-java-upgrade
- vscjava.vscode-maven
- devsense.intelli-php-vscode

---

## **💾 SYNC TO NEW PC/ACCOUNT**

### **Option 1: VS Code Settings Sync (Built-in)**
1. Open VS Code
2. Click ⚙️ → Settings Sync is ON
3. Sign in with Microsoft/GitHub account
4. Extensions, settings, keybindings auto-sync

### **Option 2: Manual Export/Import**

**Export current settings:**
```bash
# Extensions list
code --list-extensions > extensions-list.txt

# Settings location
~/.config/Code/User/settings.json          # Linux
~/Library/Application\ Support/Code/User/settings.json  # macOS
%APPDATA%\Code\User\settings.json          # Windows
```

**Import on new machine:**
```bash
# Copy files and reinstall extensions
cat extensions-list.txt | xargs -I {} code --install-extension {}
```

---

## **🔄 When Switching GitHub Accounts**

### **DO THIS:**
```bash
# 1. Commit and push your current work
git add .
git commit -m "checkpoint before account switch"
git push

# 2. Trust the workspace again (VS Code will ask)
# 3. Re-authenticate: git config --global user.email "new@email.com"
# 4. Re-login to GitHub through VS Code

# 5. Click "Clone from GitHub" if needed
git clone <repo>
npm install
npm run build
```

### **What STAYS the same:**
- Project files
- package.json / package-lock.json
- .tsconfig, .prettier, .eslint configs
- node_modules (after npm install)

### **What you LOSE (Reset on new user):**
- VS Code extensions (need reinstall)
- VS Code settings (need recopy)
- Git credentials (need re-auth)
- Terminal history

---

## **✅ QUICK SYNC CHECKLIST (New PC/Account)**

```
[ ] Install Node.js v20+ LTS
[ ] Install MongoDB 8.2.4 (with Service)
[ ] Clone repository
[ ] npm install (root)
[ ] npm install (backend/)
[ ] npm run build (backend/)
[ ] Create .env files (see section 4)
[ ] Install VS Code extensions (see list above)
[ ] Test: npm run dev (frontend)
[ ] Test: npm run dev (backend)
[ ] Test: .\start-all.bat
[ ] Verify: http://localhost:5073
[ ] Verify: http://localhost:3001/health
```

---

## **❓ TROUBLESHOOTING**

**Port already in use:**
```bash
taskkill /F /IM node.exe
```

**Node_modules corrupted:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**MongoDB won't start:**
```bash
# Windows: Services → MongoDB → Start
# Or: net start MongoDB
```

**Extensions won't install:**
```bash
code --install-extension ms-windows-ai-studio.windows-ai-studio --force
```

---

**Status**: ✅ All systems operational
**Last Verified**: 2026-02-09 @ 04:45 UTC
**Ready for team sync**: YES ✓
