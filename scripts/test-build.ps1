@echo off
REM 🔧 Git Bisect Test Script (Windows PowerShell version)
REM Usage: git bisect run powershell -File .\scripts\test-build.ps1
REM Returns 0 if build succeeds, 1 if fails

echo.
echo 🧪 Testing build at commit: %GIT_SHORT_COMMIT%
echo ---

REM Test Backend Build
echo 📦 Backend TypeScript compilation...
cd backend
call npm run build >nul 2>&1
if errorlevel 1 (
  echo ❌ Backend build FAILED
  exit /b 1
)
echo ✅ Backend build OK
cd ..

REM Test Frontend TypeScript
echo 🎨 Frontend TypeScript check...
call npx tsc --noEmit >nul 2>&1
if errorlevel 1 (
  echo ❌ Frontend types FAILED
  exit /b 1
)
echo ✅ Frontend types OK

REM Check critical env vars
echo 🔐 Checking .env.local...
if exist .env.local (
  findstr /C:"NEXT_PUBLIC_BACKEND_URL" .env.local >nul
  if errorlevel 1 (
    echo ❌ NEXT_PUBLIC_BACKEND_URL missing in .env.local
    exit /b 1
  )
  echo ✅ NEXT_PUBLIC_BACKEND_URL found
) else (
  echo ⚠️  .env.local not found ^(OK for production, needs setup^)
)

echo ---
echo ✅ Build test PASSED - commit is good
exit /b 0
