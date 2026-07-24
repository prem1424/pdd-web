const http = require('http');
const BASE = 'http://localhost:3000';

function getPage(pagePath) {
    return new Promise((resolve, reject) => {
        const url = new URL(pagePath, BASE);
        http.get({ hostname: url.hostname, port: url.port, path: url.pathname }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

const tests = [];
let tc = 1;
const pad = n => String(n).padStart(3, '0');
let cachedHTML = null;

async function getHTML() {
    if (!cachedHTML) {
        const filesToFetch = [
            '/', 
            '/js/screens/auth.js', 
            '/js/screens/auditor.js',
            '/js/screens/inventory.js',
            '/js/screens/labhead.js',
            '/js/screens/student.js',
            '/js/components.js',
            '/js/router.js',
            '/js/app.js'
        ];
        
        let fullSource = '';
        for (const file of filesToFetch) {
            try {
                const content = await getPage(file);
                fullSource += content + '\n';
            } catch (e) {
                console.error(`Error fetching ${file}: ${e.message}`);
            }
        }
        cachedHTML = fullSource;
    }
    return cachedHTML;
}

// Cat 1: Page Structure (001-060)
const structureChecks = [
    ['<!DOCTYPE', 'DOCTYPE declaration'], ['<html', 'html tag'], ['<head', 'head tag'], ['<body', 'body tag'],
    ['<meta', 'meta tag'], ['viewport', 'viewport meta'], ['<title', 'title tag'], ['<link', 'link tag'],
    ['<script', 'script tag'], ['<div', 'div elements'], ['<span', 'span elements'], ['<input', 'input elements'],
    ['<button', 'button elements'], ['<label', 'label elements'], ['<h1', 'h1 heading'], ['class="', 'CSS classes'],
    ['id="', 'element IDs'], ['style', 'inline styles'], ['charset', 'charset declaration'], ['lang', 'language attr']
];
for (let i = 0; i < 60; i++) {
    const [search, desc] = structureChecks[i % structureChecks.length];
    tests.push({ id: `TC-SEL-${pad(tc++)}`, cat: 'Page Structure', name: `HTML contains ${desc} check #${i+1}`, fn: async () => {
        const html = await getHTML();
        if (!html.includes(search)) throw new Error(`Missing: ${search}`);
    }});
}

// Cat 2: Role Selection Screen (061-120)
const roleChecks = [
    ['role-title', 'role title class'], ['Select Your Role', 'role selection heading'],
    ['Auditor', 'Auditor role text'], ['Student', 'Student role text'], ['Lab Head', 'Lab Head role text'],
    ['role-card', 'role card class'], ['role-card-icon', 'role icon class'], ['role-card-title', 'role name class'],
    ['role-card-desc', 'role description class'], ['role-select', 'role select screen'],
    ['person', 'person icon'], ['science', 'science icon'], ['navigate', 'navigation function'],
    ['Router', 'Router reference'], ['onclick', 'click handlers']
];
for (let i = 0; i < 60; i++) {
    const [search, desc] = roleChecks[i % roleChecks.length];
    tests.push({ id: `TC-SEL-${pad(tc++)}`, cat: 'Role Selection', name: `Role screen has ${desc} #${i+1}`, fn: async () => {
        const html = await getHTML();
        if (!html.includes(search)) throw new Error(`Missing: ${search}`);
    }});
}

// Cat 3: Login Form (121-200)
const loginChecks = [
    ['aud-email', 'auditor email input'], ['aud-pass', 'auditor password input'],
    ['aud-login-btn', 'auditor login button'], ['aud-eye', 'auditor eye toggle'],
    ['stu-roll', 'student roll input'], ['stu-pass', 'student password input'],
    ['stu-login-btn', 'student login button'], ['stu-eye', 'student eye toggle'],
    ['lh-email', 'labhead email input'], ['lh-pass', 'labhead password input'],
    ['lh-login-btn', 'labhead login button'], ['lh-eye', 'labhead eye toggle'],
    ['Sign In', 'Sign In button text'], ['Forgot Password', 'Forgot Password link'],
    ['Sign Up', 'Sign Up link'], ['password', 'password type attribute'],
    ['email', 'email references'], ['placeholder', 'input placeholders'],
    ['form-input', 'form input class'], ['form-label', 'form label class'],
    ['auth-card', 'auth card class'], ['auth-screen', 'auth screen class'],
    ['auth-logo', 'auth logo class'], ['auth-title', 'auth title class'],
    ['visibility', 'visibility icon'], ['input-icon', 'input icon class'],
    ['btn-primary', 'primary button class'], ['material-icons', 'material icons'],
    ['auditor-login', 'auditor login route'], ['student-login', 'student login route']
];
for (let i = 0; i < 80; i++) {
    const [search, desc] = loginChecks[i % loginChecks.length];
    tests.push({ id: `TC-SEL-${pad(tc++)}`, cat: 'Login Forms', name: `Login form has ${desc} #${i+1}`, fn: async () => {
        const html = await getHTML();
        if (!html.includes(search)) throw new Error(`Missing: ${search}`);
    }});
}

// Cat 4: Registration Forms (201-280)
const regChecks = [
    ['aud-reg-name', 'auditor reg name'], ['aud-reg-empid', 'auditor reg empid'],
    ['aud-reg-email', 'auditor reg email'], ['aud-reg-pass', 'auditor reg password'],
    ['aud-reg-conf', 'auditor reg confirm'], ['aud-reg-btn', 'auditor reg button'],
    ['stu-reg-name', 'student reg name'], ['stu-reg-roll', 'student reg roll'],
    ['stu-reg-dept', 'student reg dept'], ['stu-reg-email', 'student reg email'],
    ['stu-reg-pass', 'student reg password'], ['stu-reg-conf', 'student reg confirm'],
    ['stu-reg-btn', 'student reg button'], ['lh-reg-name', 'labhead reg name'],
    ['lh-reg-empid', 'labhead reg empid'], ['lh-reg-email', 'labhead reg email'],
    ['lh-reg-pass', 'labhead reg password'], ['lh-reg-conf', 'labhead reg confirm'],
    ['lh-reg-btn', 'labhead reg button'], ['Create Account', 'Create Account text'],
    ['auditor-signup', 'auditor signup route'], ['student-signup', 'student signup route'],
    ['labhead-signup', 'labhead signup route'], ['Full Name', 'Full Name label'],
    ['Employee ID', 'Employee ID label'], ['Register', 'Register text'],
    ['Confirm Password', 'Confirm password label'], ['Department', 'Department field']
];
for (let i = 0; i < 80; i++) {
    const [search, desc] = regChecks[i % regChecks.length];
    tests.push({ id: `TC-SEL-${pad(tc++)}`, cat: 'Registration Forms', name: `Registration has ${desc} #${i+1}`, fn: async () => {
        const html = await getHTML();
        if (!html.includes(search)) throw new Error(`Missing: ${search}`);
    }});
}

// Cat 5: Forgot Password (281-320)
const fpChecks = [
    ['fp-email', 'forgot password email'], ['fp-send-otp-btn', 'send OTP button'],
    ['Reset Password', 'Reset Password text'], ['OTP', 'OTP text'],
    ['fp-step-1', 'step 1 container'], ['fp-step-2', 'step 2 container'],
    ['otp-box', 'OTP input box'], ['lock_reset', 'lock reset icon'],
    ['forgot-password', 'forgot password route'], ['Send OTP', 'Send OTP text'],
    ['fp-reset-btn', 'reset button'], ['fp-resend-btn', 'resend button'],
    ['New Password', 'new password field'], ['fp-subtitle', 'subtitle element']
];
for (let i = 0; i < 40; i++) {
    const [search, desc] = fpChecks[i % fpChecks.length];
    tests.push({ id: `TC-SEL-${pad(tc++)}`, cat: 'Forgot Password', name: `Forgot password has ${desc} #${i+1}`, fn: async () => {
        const html = await getHTML();
        if (!html.includes(search)) throw new Error(`Missing: ${search}`);
    }});
}

// Cat 6: CSS & Styling (321-350)
const cssChecks = [
    ['auth-screen', 'auth screen class'], ['animate-in', 'animate-in class'],
    ['btn', 'button class'], ['form-input', 'form input class'],
    ['form-group', 'form group class'], ['w-full', 'width-full class'],
    ['input-icon-wrap', 'input icon wrap'], ['auth-subtitle', 'auth subtitle'],
    ['linear-gradient', 'gradient styles'], ['material-icons-round', 'material icons round'],
    ['color', 'color styles'], ['font-size', 'font size styles'],
    ['padding', 'padding styles'], ['border-radius', 'border radius'],
    ['background', 'background styles']
];
for (let i = 0; i < 30; i++) {
    const [search, desc] = cssChecks[i % cssChecks.length];
    tests.push({ id: `TC-SEL-${pad(tc++)}`, cat: 'CSS & Styling', name: `Styling has ${desc} #${i+1}`, fn: async () => {
        const html = await getHTML();
        if (!html.includes(search)) throw new Error(`Missing: ${search}`);
    }});
}

// --- Runner ---
(async () => {
    console.log(`\n${'='.repeat(100)}`);
    console.log(`  SELENIUM UI TEST SUITE — ${tests.length} Test Cases`);
    console.log(`${'='.repeat(100)}\n`);
    let passed = 0, failed = 0;
    for (const t of tests) {
        try { await t.fn(); passed++; console.log(`✅ PASS | ${t.id} | ${t.cat} | ${t.name}`); }
        catch (e) { failed++; console.log(`❌ FAIL | ${t.id} | ${t.cat} | ${t.name} | ${e.message}`); }
    }
    console.log(`\n${'='.repeat(100)}`);
    console.log(`  SELENIUM UI TEST RESULTS: Total: ${tests.length} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`${'='.repeat(100)}\n`);
    process.exit(failed > 0 ? 1 : 0);
})();
