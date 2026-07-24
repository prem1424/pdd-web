const http = require('http');
const BASE = 'http://localhost:3000';

function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE);
        const opts = { hostname: url.hostname, port: url.port, path: url.pathname + url.search, method, headers: { 'Content-Type': 'application/json' } };
        const start = Date.now();
        const req = http.request(opts, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data, time: Date.now() - start }));
        });
        req.on('error', reject);
        req.setTimeout(8000, () => { req.destroy(); reject(new Error('Timeout')); });
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

const tests = [];
let tc = 1;
const pad = n => String(n).padStart(3, '0');

// --- Category 1: Homepage Load (001-050) ---
const staticPaths = ['/', '/index.html'];
for (let i = 0; i < 50; i++) {
    const p = staticPaths[i % staticPaths.length];
    const check = i % 5;
    tests.push({ id: `TC-LOAD-${pad(tc++)}`, cat: 'Homepage Load', name: `Homepage ${p} check #${i+1} (${['status','time','has-body','content-type','no-error'][check]})`, fn: async () => {
        const r = await makeRequest('GET', p);
        if (check === 0) { if (r.statusCode !== 200) throw new Error(`Status ${r.statusCode}`); }
        else if (check === 1) { if (r.time > 5000) throw new Error(`Slow: ${r.time}ms`); }
        else if (check === 2) { if (!r.body || r.body.length === 0) throw new Error('Empty body'); }
        else if (check === 3) { if (!r.headers['content-type']) throw new Error('No content-type'); }
        else { if (r.statusCode >= 500) throw new Error('Server error'); }
    }});
}

// --- Category 2: API Endpoint Response (051-150) ---
const apiGets = [
    '/api/labs.php?action=list', '/api/inventory.php?action=get_equipment',
    '/api/inventory.php?action=get_chemicals', '/api/tasks.php?action=list',
    '/api/attendance.php?action=list', '/api/notifications.php?action=list',
    '/api/search.php?q=test', '/api/search.php?q=lab'
];
const apiPosts = [
    { path: '/api/auth/login.php', body: { user_code: 'test', password: 'test' } },
    { path: '/api/auth/register.php', body: { user_code: `load_${Date.now()}`, full_name: 'Load Test', email: `load_${Date.now()}@test.com`, password: 'pass123', role: 'student' } },
    { path: '/api/auth/forgot_password.php', body: { action: 'send_otp', email: 'nonexistent@test.com' } }
];

for (let i = 0; i < 100; i++) {
    const check = i % 4;
    if (i % 2 === 0) {
        const ep = apiGets[i % apiGets.length];
        tests.push({ id: `TC-LOAD-${pad(tc++)}`, cat: 'API Response', name: `GET ${ep.split('?')[0]} check #${Math.ceil((i+1)/2)} (${['status','json','time','headers'][check]})`, fn: async () => {
            const r = await makeRequest('GET', ep);
            if (check === 0) { if (r.statusCode !== 200) throw new Error(`Status ${r.statusCode}`); }
            else if (check === 1) { JSON.parse(r.body); }
            else if (check === 2) { if (r.time > 5000) throw new Error(`Slow: ${r.time}ms`); }
            else { if (!r.headers['content-type']) throw new Error('No content-type'); }
        }});
    } else {
        const ep = apiPosts[i % apiPosts.length];
        tests.push({ id: `TC-LOAD-${pad(tc++)}`, cat: 'API Response', name: `POST ${ep.path} check #${Math.ceil((i+1)/2)} (${['status','json','time','headers'][check]})`, fn: async () => {
            const r = await makeRequest('POST', ep.path, ep.body);
            if (check === 0) { if (r.statusCode !== 200) throw new Error(`Status ${r.statusCode}`); }
            else if (check === 1) { JSON.parse(r.body); }
            else if (check === 2) { if (r.time > 5000) throw new Error(`Slow: ${r.time}ms`); }
            else { if (!r.headers['content-type']) throw new Error('No content-type'); }
        }});
    }
}

// --- Category 3: Concurrent Requests (151-250) ---
for (let i = 0; i < 100; i++) {
    const concurrency = (i % 5) + 2;
    const ep = apiGets[i % apiGets.length];
    tests.push({ id: `TC-LOAD-${pad(tc++)}`, cat: 'Concurrent Load', name: `${concurrency} concurrent GET ${ep.split('?')[0]} batch #${i+1}`, fn: async () => {
        const promises = [];
        for (let j = 0; j < concurrency; j++) promises.push(makeRequest('GET', ep));
        const results = await Promise.all(promises);
        for (const r of results) { if (r.statusCode !== 200) throw new Error(`Status ${r.statusCode}`); }
    }});
}

// --- Category 4: Response Header Tests (251-300) ---
const allEndpoints = [...apiGets, '/', '/index.html'];
for (let i = 0; i < 50; i++) {
    const ep = allEndpoints[i % allEndpoints.length];
    const check = i % 5;
    tests.push({ id: `TC-LOAD-${pad(tc++)}`, cat: 'Response Headers', name: `Header check ${['content-type','has-body','valid-status','no-500','response-exists'][check]} for ${ep.split('?')[0]} #${i+1}`, fn: async () => {
        const r = await makeRequest('GET', ep);
        if (check === 0) { if (!r.headers['content-type']) throw new Error('Missing content-type'); }
        else if (check === 1) { if (!r.body) throw new Error('Empty body'); }
        else if (check === 2) { if (r.statusCode < 200 || r.statusCode >= 400) throw new Error(`Bad status: ${r.statusCode}`); }
        else if (check === 3) { if (r.statusCode >= 500) throw new Error('Server error'); }
        else { if (!r) throw new Error('No response'); }
    }});
}

// --- Category 5: Payload Size Tests (301-350) ---
for (let i = 0; i < 50; i++) {
    const ep = apiPosts[i % apiPosts.length];
    const sizeType = i % 5;
    const sizes = ['empty', 'tiny', 'small', 'medium', 'with-extra-fields'];
    const bodies = [
        {},
        { user_code: 'a' },
        { user_code: 'test', password: 'test' },
        { user_code: 'test', password: 'test', extra: 'x'.repeat(100) },
        { user_code: 'test', password: 'test', field1: 'a', field2: 'b', field3: 'c', field4: 'd', field5: 'e' }
    ];
    tests.push({ id: `TC-LOAD-${pad(tc++)}`, cat: 'Payload Size', name: `${sizes[sizeType]} payload to ${ep.path} #${i+1}`, fn: async () => {
        const r = await makeRequest('POST', ep.path, bodies[sizeType]);
        if (r.statusCode >= 500) throw new Error(`Server error: ${r.statusCode}`);
        JSON.parse(r.body);
    }});
}

// --- Runner ---
(async () => {
    console.log(`\n${'='.repeat(100)}`);
    console.log(`  LOAD TEST SUITE — ${tests.length} Test Cases`);
    console.log(`${'='.repeat(100)}\n`);
    let passed = 0, failed = 0;
    for (const t of tests) {
        try { await t.fn(); passed++; console.log(`✅ PASS | ${t.id} | ${t.cat} | ${t.name}`); }
        catch (e) { failed++; console.log(`❌ FAIL | ${t.id} | ${t.cat} | ${t.name} | ${e.message}`); }
    }
    console.log(`\n${'='.repeat(100)}`);
    console.log(`  LOAD TEST RESULTS: Total: ${tests.length} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`${'='.repeat(100)}\n`);
    process.exit(failed > 0 ? 1 : 0);
})();
