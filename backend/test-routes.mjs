#!/usr/bin/env node

/**
 * 🔥 Test Mekong Backend Routes (Node Script)
 * Dùng để verify routes không 404
 * 
 * Usage:
 *   node test-routes.mjs
 */

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 5000,
});

const tests = [
  {
    name: '✅ Health Check',
    method: 'GET',
    url: '/health',
    expectedStatus: 200,
  },
  {
    name: '🔓 Register (Public)',
    method: 'POST',
    url: '/api/auth/register',
    data: {
      phone: '0123456789',
      password: 'Test@1234',
      fullName: 'Test User',
      role: 'FARMER',
    },
    expectedStatus: [201, 409], // 409 = số điện thoại đã tồn tại (OK)
  },
  {
    name: '🔓 Login (Public)',
    method: 'POST',
    url: '/api/auth/login',
    data: {
      phone: '0123456789',
      password: 'Test@1234',
    },
    expectedStatus: [200, 401], // 401 = sai pass (route tồn tại)
  },
];

console.log(`
╔═══════════════════════════════════════════════════╗
║       🧪 MEKONG BACKEND ROUTE VERIFICATION        ║
║       Testing: http://localhost:3001              ║
╚═══════════════════════════════════════════════════╝
`);

async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const response = await API({
        method: test.method,
        url: test.url,
        data: test.data,
        validateStatus: () => true, // Accept any status
      });

      const expectedStatuses = Array.isArray(test.expectedStatus)
        ? test.expectedStatus
        : [test.expectedStatus];

      const isPass = expectedStatuses.includes(response.status);

      if (isPass) {
        console.log(`
✅ ${test.name}
   Method: ${test.method} ${test.url}
   Status: ${response.status} ✓
   Response: ${JSON.stringify(response.data, null, 2).substring(0, 100)}...
        `);
        passed++;
      } else {
        console.log(`
❌ ${test.name}
   Method: ${test.method} ${test.url}
   Expected: [${expectedStatuses.join(', ')}]
   Got: ${response.status}
   Message: ${response.data?.error || response.data?.message || 'No message'}
        `);
        failed++;
      }
    } catch (error) {
      console.log(`
💥 ${test.name}
   Method: ${test.method} ${test.url}
   Error: ${error?.message || error}
   Hint: Server chưa chạy? (npm run dev)
        `);
      failed++;
    }
  }

  console.log(`
╔════════════════════════════════════════════════════╗
║ 📊 TEST RESULTS                                    ║
║ ✅ Passed: ${passed}                                      ║
║ ❌ Failed: ${failed}                                      ║
║                                                    ║
${failed === 0 ? '║ 🎉 ALL ROUTES working! Deploy safe! ✅            ║' : '║ 💡 Fix errors above, then re-run            ║'}
╚════════════════════════════════════════════════════╝
  `);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
