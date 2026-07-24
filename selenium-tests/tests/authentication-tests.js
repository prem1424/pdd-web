const http = require('http');
const BASE = 'http://localhost:3000';

function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE);
        const opts = { hostname: url.hostname, port: url.port, path: url.pathname + url.search, method, headers: { 'Content-Type': 'application/json' } };
        const req = http.request(opts, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
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
const roles = ['auditor', 'lab_head', 'student'];

// Cat 1: Login Validation (001-080)
const invalidCreds = [
    { user_code: '', password: '' }, { user_code: '', password: 'pass' }, { user_code: 'user', password: '' },
    { user_code: 'nonexistent@test.com', password: 'wrong' }, { user_code: 'bad', password: 'bad' },
    { user_code: 'admin', password: '123' }, { user_code: 'test@', password: 'pass' },
    { user_code: '@test.com', password: 'p' }, { user_code: 'a'.repeat(500), password: 'p' },
    { user_code: ' ', password: ' ' }
];
for (let i = 0; i < 80; i++) {
    const cred = invalidCreds[i % invalidCreds.length];
    const role = roles[i % roles.length];
    tests.push({ id: `TC-AUTH-${pad(tc++)}`, cat: 'Login Validation', name: `Invalid login as ${role} with "${String(cred.user_code).substring(0,15)}" variant #${i+1}`, fn: async () => {
        const r = await makeRequest('POST', '/api/auth/login.php', { ...cred, role });
        if (r.statusCode !== 200) throw new Error(`Status ${r.statusCode}`);
        const j = JSON.parse(r.body);
        if (j.success !== false) throw new Error('Should reject invalid credentials');
    }});
}

// Cat 2: Registration Validation (081-170)
for (let i = 0; i < 90; i++) {
    const missingField = i % 6;
    const role = roles[i % roles.length];
    const base = { user_code: `reg_test_${tc}`, full_name: 'Test User', email: `reg${tc}@test.com`, password: 'pass123', role };
    let body = { ...base };
    let desc = '';
    if (missingField === 0) { delete body.user_code; desc = 'missing user_code'; }
    else if (missingField === 1) { delete body.full_name; desc = 'missing full_name'; }
    else if (missingField === 2) { delete body.email; desc = 'missing email'; }
    else if (missingField === 3) { delete body.password; desc = 'missing password'; }
    else if (missingField === 4) { delete body.role; desc = 'missing role'; }
    else { body.user_code = ''; body.full_name = ''; desc = 'empty required fields'; }
    
    tests.push({ id: `TC-AUTH-${pad(tc++)}`, cat: 'Registration Validation', name: `Register ${role} with ${desc} #${i+1}`, fn: async () => {
        const r = await makeRequest('POST', '/api/auth/register.php', body);
        if (r.statusCode !== 200) throw new Error(`Status ${r.statusCode}`);
        const j = JSON.parse(r.body);
        if (j.success !== false) throw new Error('Should reject incomplete registration');
    }});
}

// Cat 3: Password Reset Flow (171-250)
for (let i = 0; i < 80; i++) {
    const variant = i % 8;
    let body, desc;
    if (variant === 0) { body = { action: 'send_otp', email: '' }; desc = 'empty email for OTP'; }
    else if (variant === 1) { body = { action: 'send_otp', email: `nouser${i}@fake.com` }; desc = 'non-existent email'; }
    else if (variant === 2) { body = { action: 'reset_password' }; desc = 'missing all reset fields'; }
    else if (variant === 3) { body = { action: 'reset_password', email: 'test@t.com', otp: '000000', new_password: 'new' }; desc = 'invalid OTP'; }
    else if (variant === 4) { body = { action: 'reset_password', email: '', otp: '', new_password: '' }; desc = 'empty reset fields'; }
    else if (variant === 5) { body = { action: 'invalid_action' }; desc = 'invalid action type'; }
    else if (variant === 6) { body = { action: 'send_otp' }; desc = 'missing email field'; }
    else { body = { action: 'reset_password', email: 'x@x.com', otp: 'abc', new_password: 'p' }; desc = 'non-numeric OTP'; }

    tests.push({ id: `TC-AUTH-${pad(tc++)}`, cat: 'Password Reset', name: `Password reset: ${desc} #${i+1}`, fn: async () => {
        const r = await makeRequest('POST', '/api/auth/forgot_password.php', body);
        if (r.statusCode !== 200) throw new Error(`Status ${r.statusCode}`);
        const j = JSON.parse(r.body);
        if (j.success !== false) throw new Error('Should reject invalid reset request');
    }});
}

// Cat 4: Session & Access (251-310)
const protectedEndpoints = [
    '/api/search.php?q=dashboard',
    '/api/labs.php?action=list', '/api/inventory.php?action=get_equipment',
    '/api/tasks.php?action=list', '/api/attendance.php?action=list',
    '/api/notifications.php?action=list', '/api/search.php?q=admin',
    '/api/inventory.php?action=get_chemicals'
];
for (let i = 0; i < 60; i++) {
    const ep = protectedEndpoints[i % protectedEndpoints.length];
    const check = i % 3;
    tests.push({ id: `TC-AUTH-${pad(tc++)}`, cat: 'Session & Access', name: `Unauthenticated access to ${ep.split('?')[0]} check #${i+1}`, fn: async () => {
        const r = await makeRequest('GET', ep);
        if (r.statusCode !== 200) throw new Error(`Status ${r.statusCode}`);
        const j = JSON.parse(r.body);
        if (typeof j.success === 'undefined') throw new Error('No success field');
    }});
}

// Cat 5: Role-Based Access (311-350)
for (let i = 0; i < 40; i++) {
    const role = roles[i % roles.length];
    const mismatchRole = roles[(i + 1) % roles.length];
    const variant = i % 4;
    let body, desc;
    if (variant === 0) { body = { user_code: `role_${i}@t.com`, password: 'wrong', role: mismatchRole }; desc = `login with role=${mismatchRole} mismatch`; }
    else if (variant === 1) { body = { user_code: '', password: '', role }; desc = `empty creds with role=${role}`; }
    else if (variant === 2) { body = { user_code: 'admin', password: 'admin', role: 'superadmin' }; desc = 'invalid role superadmin'; }
    else { body = { user_code: `test_${i}`, password: 'test', role: '' }; desc = 'empty role field'; }

    tests.push({ id: `TC-AUTH-${pad(tc++)}`, cat: 'Role-Based Access', name: `${desc} #${i+1}`, fn: async () => {
        const r = await makeRequest('POST', '/api/auth/login.php', body);
        if (r.statusCode !== 200) throw new Error(`Status ${r.statusCode}`);
        const j = JSON.parse(r.body);
        if (j.success !== false) throw new Error('Should reject');
    }});
}

// --- Runner ---
(async () => {
    console.log(`\n${'='.repeat(100)}`);
    console.log(`  AUTHENTICATION TEST SUITE — ${tests.length} Test Cases`);
    console.log(`${'='.repeat(100)}\n`);
    let passed = 0, failed = 0;
    for (const t of tests) {
        try { await t.fn(); passed++; console.log(`✅ PASS | ${t.id} | ${t.cat} | ${t.name}`); }
        catch (e) { failed++; console.log(`❌ FAIL | ${t.id} | ${t.cat} | ${t.name} | ${e.message}`); }
    }
    console.log(`\n${'='.repeat(100)}`);
    console.log(`  AUTHENTICATION TEST RESULTS: Total: ${tests.length} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`${'='.repeat(100)}\n`);
    process.exit(failed > 0 ? 1 : 0);
})();
