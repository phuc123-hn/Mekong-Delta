#!/bin/bash
# 🔧 Git Bisect Test Script
# Usage: git bisect run ./scripts/test-build.sh
# Returns 0 if build succeeds, 1 if fails (for bisect)

set -e  # Exit on first error

echo "🧪 Testing build at commit: $(git rev-parse --short HEAD)"
echo "---"

# Test Backend Build
echo "📦 Backend TypeScript compilation..."
cd backend
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Backend build OK"
else
  echo "❌ Backend build FAILED"
  exit 1
fi
cd ..

# Test Frontend TypeScript (without full build)
echo "🎨 Frontend TypeScript check..."
npx tsc --noEmit > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Frontend types OK"
else
  echo "❌ Frontend types FAILED"
  exit 1
fi

# Check critical env vars
echo "🔐 Checking .env.local..."
if [ -f .env.local ]; then
  if grep -q "NEXT_PUBLIC_BACKEND_URL" .env.local; then
    echo "✅ NEXT_PUBLIC_BACKEND_URL found"
  else
    echo "❌ NEXT_PUBLIC_BACKEND_URL missing"
    exit 1
  fi
else
  echo "⚠️  .env.local not found (OK for production, but needs setup)"
fi

echo "---"
echo "✅ Build test PASSED - commit is good"
exit 0
