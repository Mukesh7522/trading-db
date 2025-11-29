// test-api.js - Clean API Endpoint Tester (Only Real Endpoints)
// Save this in: backend/test-api.js
// Run with: node test-api.js

const http = require('http');

const API_BASE = 'localhost';
const API_PORT = 3001;

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

// ONLY endpoints that your frontend actually uses
const endpoints = [
  { name: 'Root', path: '/', method: 'GET' },
  { name: 'Health Check', path: '/health', method: 'GET' },
  { name: 'All Stocks', path: '/api/stocks', method: 'GET' },
  { name: 'Real-time Quotes', path: '/api/quotes', method: 'GET' },
  { name: 'Stock Details (AAPL)', path: '/api/stocks/AAPL', method: 'GET' },
  { name: 'Historical Prices (AAPL)', path: '/api/prices/AAPL?period=1m', method: 'GET' },
  { name: 'Technical Indicators (AAPL)', path: '/api/indicators/AAPL', method: 'GET' },
  { name: 'Sector Performance', path: '/api/sectors', method: 'GET' },
  { name: 'Portfolio Returns', path: '/api/returns', method: 'GET' },
  { name: 'Financial Statements (AAPL)', path: '/api/financials/AAPL', method: 'GET' },
  { name: 'Trading Signals (AAPL)', path: '/api/signals/AAPL', method: 'GET' },
  { name: 'Market Summary', path: '/api/summary', method: 'GET' },
];

function makeRequest(path, method) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      port: API_PORT,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => reject(error));
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

async function testEndpoint(endpoint) {
  const { name, path, method } = endpoint;
  
  try {
    const result = await makeRequest(path, method);
    const { statusCode, data } = result;
    
    if (statusCode >= 200 && statusCode < 300) {
      console.log(`${colors.green}✅ PASS${colors.reset} | ${colors.bold}${name}${colors.reset}`);
      console.log(`   ${colors.blue}${method} ${path}${colors.reset}`);
      console.log(`   Status: ${statusCode}`);
      
      if (Array.isArray(data)) {
        console.log(`   Response: Array with ${data.length} items`);
        if (data.length > 0) {
          console.log(`   Sample: ${JSON.stringify(data[0]).substring(0, 80)}...`);
        }
      } else if (typeof data === 'object') {
        const keys = Object.keys(data);
        console.log(`   Response: Object with keys: ${keys.join(', ')}`);
      }
      console.log('');
      return { success: true, name, statusCode };
    } else {
      console.log(`${colors.red}❌ FAIL${colors.reset} | ${colors.bold}${name}${colors.reset}`);
      console.log(`   ${colors.blue}${method} ${path}${colors.reset}`);
      console.log(`   Status: ${statusCode}`);
      console.log(`   Error: ${JSON.stringify(data)}`);
      console.log('');
      return { success: false, name, statusCode, error: data };
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR${colors.reset} | ${colors.bold}${name}${colors.reset}`);
    console.log(`   ${colors.blue}${method} ${path}${colors.reset}`);
    console.log(`   ${colors.red}${error.message}${colors.reset}`);
    console.log('');
    return { success: false, name, error: error.message };
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.bold}${colors.blue}  🚀 STOCK DASHBOARD API - ENDPOINT TESTER${colors.reset}`);
  console.log('='.repeat(70));
  console.log(`Testing API at: ${colors.yellow}http://${API_BASE}:${API_PORT}${colors.reset}`);
  console.log('='.repeat(70) + '\n');

  const results = [];

  for (let i = 0; i < endpoints.length; i++) {
    console.log(`[${i + 1}/${endpoints.length}] Testing...`);
    const result = await testEndpoint(endpoints[i]);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n' + '='.repeat(70));
  console.log(`${colors.bold}  📊 TEST SUMMARY${colors.reset}`);
  console.log('='.repeat(70) + '\n');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;

  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`${colors.blue}📝 Total:  ${total}${colors.reset}\n`);

  if (failed > 0) {
    console.log(`${colors.red}${colors.bold}Failed Endpoints:${colors.reset}`);
    results.filter(r => !r.success).forEach(r => {
      console.log(`${colors.red}  • ${r.name}${colors.reset}`);
      if (r.error) console.log(`    ${JSON.stringify(r.error)}`);
    });
    console.log('');
  }

  const successRate = ((passed / total) * 100).toFixed(1);
  
  if (successRate === '100.0') {
    console.log(`${colors.green}${colors.bold}🎉 ALL TESTS PASSED! Success Rate: ${successRate}%${colors.reset}\n`);
    console.log(`${colors.green}✅ Your API is ready for deployment!${colors.reset}\n`);
  } else if (successRate >= '70') {
    console.log(`${colors.yellow}${colors.bold}⚠️  SOME TESTS FAILED. Success Rate: ${successRate}%${colors.reset}\n`);
  } else {
    console.log(`${colors.red}${colors.bold}❌ MANY TESTS FAILED. Success Rate: ${successRate}%${colors.reset}\n`);
  }

  console.log('='.repeat(70) + '\n');

  if (failed === total) {
    console.log(`${colors.red}${colors.bold}⚠️  WARNING: ALL TESTS FAILED!${colors.reset}`);
    console.log(`${colors.yellow}Make sure your backend server is running:${colors.reset}`);
    console.log(`${colors.blue}  cd backend${colors.reset}`);
    console.log(`${colors.blue}  npm start${colors.reset}\n`);
  }
}

console.log('\n🔍 Starting API tests in 2 seconds...\n');
setTimeout(() => {
  runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
}, 2000);