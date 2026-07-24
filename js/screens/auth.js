// ============================================================
// Smart Stock - Auth Screens
// ============================================================
window.Screens = window.Screens || {};

// ---- SPLASH ----
window.Screens['splash'] = function() {
  return `
  <div class="splash-screen" id="splash-screen">
    <div class="splash-particles" id="splash-particles"></div>
    <div class="splash-logo-wrap">
      <div class="splash-icon-ring">
        <div class="splash-icon-inner">
          <span class="material-icons-round">biotech</span>
        </div>
      </div>
      <div class="splash-title">Smart Stock</div>
      <div class="splash-tagline">Laboratory Intelligence Platform</div>
    </div>
    <div class="splash-footer">© 2024 Smart Stock. All rights reserved.</div>
  </div>`;
};
window.Screens['splash'].afterRender = function() {
  const container = document.getElementById('splash-particles');
  if (container) {
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'splash-particle';
      p.style.cssText = `left:${Math.random()*100}%;animation-duration:${3+Math.random()*6}s;animation-delay:${Math.random()*4}s;width:${1+Math.random()*3}px;height:${1+Math.random()*3}px;opacity:${0.2+Math.random()*0.5}`;
      container.appendChild(p);
    }
  }
  setTimeout(() => {
    window.Router.navigate('intro');
  }, 3200);
};

// ---- INTRO ----
window.Screens['intro'] = function() {
  const slides = [
    { icon: 'inventory_2', color: 'linear-gradient(135deg,#1565C0,#00BCD4)', title: 'Smart Inventory', desc: 'Track every chemical, equipment, glassware and plasticware in real-time across all research labs.' },
    { icon: 'analytics', color: 'linear-gradient(135deg,#00796B,#00E676)', title: 'Live Analytics', desc: 'Monitor lab utilization, stock health and student activity with beautiful interactive charts and reports.' },
    { icon: 'groups', color: 'linear-gradient(135deg,#6A1B9A,#E040FB)', title: 'Role-Based Access', desc: 'Dedicated dashboards for Auditors, Lab Heads and Students — everyone gets exactly what they need.' }
  ];
  return `
  <div class="intro-screen" id="intro-screen">
    <div class="intro-slides" id="intro-slides">
      ${slides.map((s, i) => `
        <div class="intro-slide ${i===0?'active':''}" id="intro-slide-${i}">
          <div class="intro-slide-icon" style="background:${s.color};box-shadow:0 0 40px rgba(33,150,243,0.3)">
            <span class="material-icons-round" style="color:#fff">${s.icon}</span>
          </div>
          <h2 class="intro-slide-title">${s.title}</h2>
          <p class="intro-slide-desc">${s.desc}</p>
        </div>`).join('')}
    </div>
    <div class="intro-dots" id="intro-dots">
      ${slides.map((_,i) => `<div class="intro-dot ${i===0?'active':''}" id="intro-dot-${i}"></div>`).join('')}
    </div>
    <div class="intro-controls">
      <button class="btn btn-ghost" id="intro-skip-btn" onclick="window.Router.navigate('role-select')">Skip</button>
      <button class="btn btn-primary" id="intro-next-btn">
        Next <span class="material-icons-round">arrow_forward</span>
      </button>
    </div>
  </div>`;
};
window.Screens['intro'].afterRender = function() {
  let current = 0;
  const total = 3;
  const nextBtn = document.getElementById('intro-next-btn');
  const skipBtn = document.getElementById('intro-skip-btn');
  function goTo(idx) {
    document.querySelectorAll('.intro-slide').forEach((s, i) => {
      s.classList.remove('active', 'exit');
      if (i === idx) s.classList.add('active');
      else if (i < idx) s.classList.add('exit');
    });
    document.querySelectorAll('.intro-dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });
    current = idx;
    if (nextBtn) nextBtn.innerHTML = current === total-1 ? `Get Started <span class="material-icons-round">rocket_launch</span>` : `Next <span class="material-icons-round">arrow_forward</span>`;
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (current < total - 1) goTo(current + 1);
      else window.Router.navigate('role-select');
    });
  }
};

// ---- ROLE SELECT ----
window.Screens['role-select'] = function() {
  return `
  <div class="role-screen">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:36px">
      <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--primary),var(--cyan));display:flex;align-items:center;justify-content:center">
        <span class="material-icons-round" style="color:#fff;font-size:22px">biotech</span>
      </div>
      <span style="font-family:'Outfit',sans-serif;font-size:22px;font-weight:800;background:linear-gradient(90deg,#fff,var(--cyan-bright));-webkit-background-clip:text;-webkit-text-fill-color:transparent">Smart Stock</span>
    </div>
    <h1 class="role-title">Select Your Role</h1>
    <p class="role-subtitle">Choose how you want to use Smart Stock</p>
    <div class="role-cards">
      <div class="role-card" onclick="window.Router.navigate('auditor-login')">
        <div class="role-card-icon" style="background:linear-gradient(135deg,rgba(21,101,192,0.3),rgba(33,150,243,0.2));color:var(--primary-bright)">
          <span class="material-icons-round">verified_user</span>
        </div>
        <div class="role-card-content">
          <div class="role-card-title">Auditor</div>
          <div class="role-card-sub">Full system access & compliance oversight</div>
        </div>
        <span class="material-icons-round arrow">chevron_right</span>
      </div>
      <div class="role-card" onclick="window.Router.navigate('labhead-login')">
        <div class="role-card-icon" style="background:linear-gradient(135deg,rgba(0,121,107,0.3),rgba(0,230,118,0.2));color:var(--success)">
          <span class="material-icons-round">science</span>
        </div>
        <div class="role-card-content">
          <div class="role-card-title">Lab Head</div>
          <div class="role-card-sub">Manage your lab, students & inventory</div>
        </div>
        <span class="material-icons-round arrow">chevron_right</span>
      </div>
      <div class="role-card" onclick="window.Router.navigate('student-login')">
        <div class="role-card-icon" style="background:linear-gradient(135deg,rgba(106,27,154,0.3),rgba(224,64,251,0.2));color:#E040FB">
          <span class="material-icons-round">school</span>
        </div>
        <div class="role-card-content">
          <div class="role-card-title">Student</div>
          <div class="role-card-sub">Submit activities, track tasks & attendance</div>
        </div>
        <span class="material-icons-round arrow">chevron_right</span>
      </div>
    </div>
  </div>`;
};

// ---- AUDITOR LOGIN ----
window.Screens['auditor-login'] = function() {
  return `
  <div class="auth-screen">
    <div class="auth-card animate-in">
      <div class="auth-logo">
        <div class="auth-logo-icon"><span class="material-icons-round">verified_user</span></div>
        <h1 class="auth-title">Auditor Login</h1>
        <p class="auth-subtitle">Quality Control & Compliance</p>
      </div>
      <div class="form-group">
        <label class="form-label">Email Address</label>
        <div class="input-icon-wrap">
          <span class="material-icons-round input-icon">email</span>
          <input class="form-input" id="aud-email" type="email" placeholder="auditor@smartstock.in">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <div class="input-icon-wrap">
          <span class="material-icons-round input-icon">lock</span>
          <input class="form-input" id="aud-pass" type="password" placeholder="Enter your password">
          <span class="material-icons-round input-eye" id="aud-eye">visibility</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-secondary);cursor:pointer">
          <input type="checkbox" id="aud-remember" checked style="accent-color:var(--primary-bright)"> Remember me
        </label>
        <a href="#" onclick="window.Router.navigate('forgot-password')" style="font-size:13px;color:var(--primary-bright)">Forgot Password?</a>
      </div>
      <button class="btn btn-primary w-full" id="aud-login-btn" style="justify-content:center;padding:13px">
        <span class="material-icons-round">login</span> Sign In as Auditor
      </button>
      <p class="auth-link">New auditor? <a href="#" onclick="window.Router.navigate('auditor-signup')">Sign Up</a></p>
      <p class="auth-link"><a href="#" onclick="window.Router.navigate('role-select')">← Back to Role Selection</a></p>
    </div>
  </div>`;
};
window.Screens['auditor-login'].afterRender = function() {
  const codeInput = document.getElementById('aud-email');
  const passInput = document.getElementById('aud-pass');
  const rememberBox = document.getElementById('aud-remember');
  if (codeInput && passInput && rememberBox) {
    const savedCode = localStorage.getItem('saved_auditor_code');
    const savedPass = localStorage.getItem('saved_auditor_pass');
    if (savedCode && savedPass) {
      codeInput.value = savedCode;
      passInput.value = savedPass;
      rememberBox.checked = true;
    }
  }

  const eye = document.getElementById('aud-eye');
  const pass = document.getElementById('aud-pass');
  if (eye && pass) { eye.addEventListener('click', () => { pass.type = pass.type==='password'?'text':'password'; eye.textContent = pass.type==='password'?'visibility':'visibility_off'; }); }
  const btn = document.getElementById('aud-login-btn');
  if (btn) {
    btn.addEventListener('click', async () => {
      const email = document.getElementById('aud-email').value.trim();
      const password = pass.value.trim();
      if (!email || !password) {
        window.Components.toast('Please enter both email and password', 'warning');
        return;
      }
      btn.disabled = true;
      btn.innerHTML = `<span class="material-icons-round animate-spin">sync</span> Signing In...`;
      const res = await window.fetchAPI('auth/login.php', {
        method: 'POST',
        body: { user_code: email, password }
      });
      btn.disabled = false;
      btn.innerHTML = `<span class="material-icons-round">login</span> Sign In as Auditor`;
      if (res.success) {
        if (res.user.role !== 'auditor') {
          window.Components.toast('Access Denied: You are not registered as an Auditor.', 'danger');
          return;
        }
        window.AppState.user = res.user;
        window.AppState.role = 'auditor';
        const remember = document.getElementById('aud-remember').checked;
        if (remember) {
          localStorage.setItem('saved_auditor_code', email);
          localStorage.setItem('saved_auditor_pass', password);
        } else {
          localStorage.removeItem('saved_auditor_code');
          localStorage.removeItem('saved_auditor_pass');
        }
        window.AppState.save(remember);
        window.Router.navigate('auditor-dashboard');
        window.Components.toast('Login successful', 'success');
      } else {
        window.Components.toast(res.message || 'Login failed', 'danger');
      }
    });
  }
};

// ---- AUDITOR SIGNUP ----
window.Screens['auditor-signup'] = function() {
  return `
  <div class="auth-screen">
    <div class="auth-card animate-in">
      <div class="auth-logo">
        <div class="auth-logo-icon"><span class="material-icons-round">verified_user</span></div>
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-subtitle">Auditor Registration</p>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Full Name</label><input id="aud-reg-name" class="form-input" placeholder="Dr. John Smith"></div>
        <div class="form-group"><label class="form-label">Employee ID</label><input id="aud-reg-empid" class="form-input" placeholder="EMP-2024-001"></div>
      </div>
      <div class="form-group"><label class="form-label">Department</label>
        <select id="aud-reg-dept" class="form-input form-select"><option>Quality Control</option><option>Compliance</option><option>Research</option></select>
      </div>
      <div class="form-group"><label class="form-label">Email Address</label><input id="aud-reg-email" class="form-input" type="email" placeholder="email@smartstock.in"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Password</label><input id="aud-reg-pass" class="form-input" type="password" placeholder="Create password"></div>
        <div class="form-group"><label class="form-label">Confirm Password</label><input id="aud-reg-conf" class="form-input" type="password" placeholder="Repeat password"></div>
      </div>
      <button id="aud-reg-btn" class="btn btn-primary w-full" style="justify-content:center;padding:13px">
        <span class="material-icons-round">person_add</span> Create Auditor Account
      </button>
      <p class="auth-link">Already have an account? <a href="#" onclick="window.Router.navigate('auditor-login')">Sign In</a></p>
    </div>
  </div>`;
};
window.Screens['auditor-signup'].afterRender = function() {
  const btn = document.getElementById('aud-reg-btn');
  if (btn) {
    btn.addEventListener('click', async () => {
      const name = document.getElementById('aud-reg-name').value.trim();
      const empid = document.getElementById('aud-reg-empid').value.trim();
      const dept = document.getElementById('aud-reg-dept').value.trim();
      const email = document.getElementById('aud-reg-email').value.trim();
      const password = document.getElementById('aud-reg-pass').value.trim();
      const confirm = document.getElementById('aud-reg-conf').value.trim();
      
      if (!name || !empid || !dept || !email || !password || !confirm) {
        window.Components.toast('Please fill in all fields', 'warning');
        return;
      }
      if (password !== confirm) {
        window.Components.toast('Passwords do not match', 'warning');
        return;
      }
      
      btn.disabled = true;
      btn.innerHTML = `<span class="material-icons-round animate-spin">sync</span> Registering...`;
      const res = await window.fetchAPI('auth/register.php', {
        method: 'POST',
        body: {
          user_code: empid,
          full_name: name,
          email: email,
          password: password,
          role: 'auditor',
          department: dept
        }
      });
      btn.disabled = false;
      btn.innerHTML = `<span class="material-icons-round">person_add</span> Create Auditor Account`;
      if (res.success) {
        window.Components.toast('Account created successfully! Please login.', 'success');
        window.Router.navigate('auditor-login');
      } else {
        window.Components.toast(res.message || 'Registration failed', 'danger');
      }
    });
  }
};

// ---- LAB HEAD LOGIN ----
window.Screens['labhead-login'] = function() {
  return `
  <div class="auth-screen">
    <div class="auth-card animate-in">
      <div class="auth-logo">
        <div class="auth-logo-icon" style="background:linear-gradient(135deg,var(--teal),var(--success))">
          <span class="material-icons-round">science</span>
        </div>
        <h1 class="auth-title">Lab Head Login</h1>
        <p class="auth-subtitle">Laboratory Management Access</p>
      </div>
      <div class="form-group">
        <label class="form-label">Select Lab</label>
        <div class="input-icon-wrap">
          <span class="material-icons-round input-icon">biotech</span>
          <select id="lh-login-lab" class="form-input form-select" style="padding-left:38px">
            <option value="">-- Select Lab to Enter --</option>
            ${(window.AppData?.labs || []).map(l => `<option value="${l.name}">${l.name}</option>`).join('')}
            ${!(window.AppData?.labs?.length) ? `
            <option value="Microbiology Lab">Microbiology Lab</option>
            <option value="Molecular Biology Lab">Molecular Biology Lab</option>
            <option value="Clean Room Lab">Clean Room Lab</option>
            <option value="Analytical Chemistry Lab">Analytical Chemistry Lab</option>
            <option value="Physics Lab">Physics Lab</option>
            ` : ''}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Email Address</label>
        <div class="input-icon-wrap">
          <span class="material-icons-round input-icon">email</span>
          <input class="form-input" id="lh-email" type="email" placeholder="labhead@smartstock.in">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <div class="input-icon-wrap">
          <span class="material-icons-round input-icon">lock</span>
          <input class="form-input" id="lh-pass" type="password" placeholder="Enter password">
          <span class="material-icons-round input-eye" id="lh-eye">visibility</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-secondary);cursor:pointer">
          <input type="checkbox" id="lh-remember" checked style="accent-color:var(--teal)"> Remember me
        </label>
        <a href="#" onclick="window.Router.navigate('forgot-password')" style="font-size:13px;color:var(--teal)">Forgot Password?</a>
      </div>
      <button class="btn btn-primary w-full" id="lh-login-btn" style="justify-content:center;padding:13px;background:linear-gradient(135deg,var(--teal),#388E3C)">
        <span class="material-icons-round">login</span> Sign In as Lab Head
      </button>
      <p class="auth-link">New Lab Head? <a href="#" onclick="window.Router.navigate('labhead-signup')">Sign Up</a></p>
      <p class="auth-link"><a href="#" onclick="window.Router.navigate('role-select')">← Back to Role Selection</a></p>
    </div>
  </div>`;
};
window.Screens['labhead-login'].afterRender = function() {
  const codeInput = document.getElementById('lh-email');
  const passInput = document.getElementById('lh-pass');
  const rememberBox = document.getElementById('lh-remember');
  if (codeInput && passInput && rememberBox) {
    const savedCode = localStorage.getItem('saved_lab_head_code');
    const savedPass = localStorage.getItem('saved_lab_head_pass');
    const savedLab = localStorage.getItem('saved_lab_head_lab');
    if (savedCode && savedPass) {
      codeInput.value = savedCode;
      passInput.value = savedPass;
      rememberBox.checked = true;
      if (savedLab && document.getElementById('lh-login-lab')) document.getElementById('lh-login-lab').value = savedLab;
    }
  }

  const eye = document.getElementById('lh-eye'), pass = document.getElementById('lh-pass');
  if (eye && pass) { eye.addEventListener('click', () => { pass.type = pass.type==='password'?'text':'password'; eye.textContent = pass.type==='password'?'visibility':'visibility_off'; }); }
  const btn = document.getElementById('lh-login-btn');
  if (btn) {
    btn.addEventListener('click', async () => {
      const email = document.getElementById('lh-email').value.trim();
      const password = pass.value.trim();
      const selectedLab = document.getElementById('lh-login-lab')?.value.trim() || '';
      if (!email || !password || !selectedLab) {
        window.Components.toast('Please select your lab and enter both email and password', 'warning');
        return;
      }
      btn.disabled = true;
      btn.innerHTML = `<span class="material-icons-round animate-spin">sync</span> Signing In...`;
      const res = await window.fetchAPI('auth/login.php', {
        method: 'POST',
        body: { user_code: email, password, role: 'labhead', lab: selectedLab }
      });
      btn.disabled = false;
      btn.innerHTML = `<span class="material-icons-round">login</span> Sign In as Lab Head`;
      if (res.success) {
        if (res.user.role !== 'labhead' && res.user.role !== 'lab_head') {
          window.Components.toast('Access Denied: You are not a Lab Head.', 'danger');
          return;
        }
        const userLab = (res.user.lab || res.user.department || '').trim();
        if (selectedLab && userLab && selectedLab.toLowerCase() !== userLab.toLowerCase()) {
          window.Components.toast(`Access Denied: Your mail id does not belong to ${selectedLab}. You are assigned to ${userLab}.`, 'danger');
          return;
        }
        window.AppState.selectedLab = selectedLab || userLab || 'Microbiology Lab';
        window.AppState.user = res.user;
        window.AppState.role = 'labhead';
        const remember = document.getElementById('lh-remember').checked;
        if (remember) {
          localStorage.setItem('saved_lab_head_code', email);
          localStorage.setItem('saved_lab_head_pass', password);
          localStorage.setItem('saved_lab_head_lab', selectedLab);
        } else {
          localStorage.removeItem('saved_lab_head_code');
          localStorage.removeItem('saved_lab_head_pass');
          localStorage.removeItem('saved_lab_head_lab');
        }
        window.AppState.save(remember);
        window.Router.navigate('labhead-dashboard');
        window.Components.toast('Login successful', 'success');
      } else {
        window.Components.toast(res.message || 'Login failed', 'danger');
      }
    });
  }
};

// ---- LAB HEAD SIGNUP ----
window.Screens['labhead-signup'] = function() {
  return `
  <div class="auth-screen">
    <div class="auth-card animate-in">
      <div class="auth-logo">
        <div class="auth-logo-icon" style="background:linear-gradient(135deg,var(--teal),var(--success))"><span class="material-icons-round">science</span></div>
        <h1 class="auth-title">Lab Head Registration</h1>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Full Name</label><input id="lh-reg-name" class="form-input" placeholder="Dr. Full Name"></div>
        <div class="form-group"><label class="form-label">Staff ID</label><input id="lh-reg-empid" class="form-input" placeholder="STAFF-001"></div>
      </div>
      <div class="form-group"><label class="form-label">Assigned Lab</label>
        <select id="lh-reg-lab" class="form-input form-select">${window.AppData.labs.map(l=>`<option>${l.name}</option>`).join('')}</select>
      </div>
      <div class="form-group"><label class="form-label">Qualification</label><input id="lh-reg-qual" class="form-input" placeholder="Ph.D., M.Sc., etc."></div>
      <div class="form-group"><label class="form-label">Email</label><input id="lh-reg-email" class="form-input" type="email" placeholder="email@smartstock.in"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Password</label><input id="lh-reg-pass" class="form-input" type="password" placeholder="Create password"></div>
        <div class="form-group"><label class="form-label">Confirm</label><input id="lh-reg-conf" class="form-input" type="password" placeholder="Repeat"></div>
      </div>
      <button id="lh-reg-btn" class="btn btn-primary w-full" style="justify-content:center;padding:13px;background:linear-gradient(135deg,var(--teal),#388E3C)">
        <span class="material-icons-round">person_add</span> Create Account
      </button>
      <p class="auth-link">Already registered? <a href="#" onclick="window.Router.navigate('labhead-login')">Sign In</a></p>
    </div>
  </div>`;
};
window.Screens['labhead-signup'].afterRender = function() {
  const btn = document.getElementById('lh-reg-btn');
  if (btn) {
    btn.addEventListener('click', async () => {
      const name = document.getElementById('lh-reg-name').value.trim();
      const empid = document.getElementById('lh-reg-empid').value.trim();
      const lab = document.getElementById('lh-reg-lab').value.trim();
      const qual = document.getElementById('lh-reg-qual').value.trim();
      const email = document.getElementById('lh-reg-email').value.trim();
      const password = document.getElementById('lh-reg-pass').value.trim();
      const confirm = document.getElementById('lh-reg-conf').value.trim();
      if (!name || !empid || !lab || !email || !password || !confirm) {
        window.Components.toast('Please fill in all fields', 'warning');
        return;
      }
      if (password !== confirm) {
        window.Components.toast('Passwords do not match', 'warning');
        return;
      }
      btn.disabled = true;
      btn.innerHTML = `<span class="material-icons-round animate-spin">sync</span> Registering...`;
      const res = await window.fetchAPI('auth/register.php', {
        method: 'POST',
        body: {
          user_code: empid,
          full_name: name,
          email,
          password,
          role: 'labhead',
          lab,
          department: qual
        }
      });
      btn.disabled = false;
      btn.innerHTML = `<span class="material-icons-round">person_add</span> Create Account`;
      if (res.success) {
        window.Components.toast('Account created successfully! Please login.', 'success');
        window.Router.navigate('labhead-login');
      } else {
        window.Components.toast(res.message || 'Registration failed', 'danger');
      }
    });
  }
};

// ---- STUDENT LOGIN ----
window.Screens['student-login'] = function() {
  return `
  <div class="auth-screen">
    <div class="auth-card animate-in">
      <div class="auth-logo">
        <div class="auth-logo-icon" style="background:linear-gradient(135deg,#6A1B9A,#E040FB)">
          <span class="material-icons-round">school</span>
        </div>
        <h1 class="auth-title">Student Login</h1>
        <p class="auth-subtitle">Research Lab Access Portal</p>
      </div>
      <div class="form-group">
        <label class="form-label">Roll Number / User ID</label>
        <div class="input-icon-wrap">
          <span class="material-icons-round input-icon">badge</span>
          <input class="form-input" id="stu-roll" placeholder="Enter Roll Number">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <div class="input-icon-wrap">
          <span class="material-icons-round input-icon">lock</span>
          <input class="form-input" id="stu-pass" type="password" placeholder="Enter Password">
          <span class="material-icons-round input-eye" id="stu-eye">visibility</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-secondary);cursor:pointer">
          <input type="checkbox" id="stu-remember" checked style="accent-color:#8E24AA"> Remember me
        </label>
        <a href="#" onclick="window.Router.navigate('forgot-password')" style="font-size:13px;color:#8E24AA">Forgot Password?</a>
      </div>
      <button class="btn btn-primary w-full" id="stu-login-btn" style="justify-content:center;padding:13px;background:linear-gradient(135deg,#6A1B9A,#8E24AA)">
        <span class="material-icons-round">login</span> Sign In as Student
      </button>
      <p class="auth-link">New student? <a href="#" onclick="window.Router.navigate('student-signup')">Register</a></p>
      <p class="auth-link"><a href="#" onclick="window.Router.navigate('role-select')">← Back to Role Selection</a></p>
    </div>
  </div>`;
};
window.Screens['student-login'].afterRender = function() {
  const codeInput = document.getElementById('stu-roll');
  const passInput = document.getElementById('stu-pass');
  const rememberBox = document.getElementById('stu-remember');
  if (codeInput && passInput && rememberBox) {
    const savedCode = localStorage.getItem('saved_student_code');
    const savedPass = localStorage.getItem('saved_student_pass');
    if (savedCode && savedPass) {
      codeInput.value = savedCode;
      passInput.value = savedPass;
      rememberBox.checked = true;
    }
  }

  const eye = document.getElementById('stu-eye');
  const pass = document.getElementById('stu-pass');
  if (eye && pass) { eye.addEventListener('click', () => { pass.type = pass.type==='password'?'text':'password'; eye.textContent = pass.type==='password'?'visibility':'visibility_off'; }); }
  const btn = document.getElementById('stu-login-btn');
  if (btn) {
    btn.addEventListener('click', async () => {
      const roll_no = document.getElementById('stu-roll').value.trim();
      const password = pass.value.trim();
      if (!roll_no || !password) {
        window.Components.toast('Please enter both roll number and password', 'warning');
        return;
      }
      btn.disabled = true;
      btn.innerHTML = `<span class="material-icons-round animate-spin">sync</span> Signing In...`;
      const res = await window.fetchAPI('auth/login.php', {
        method: 'POST',
        body: { user_code: roll_no, password }
      });
      btn.disabled = false;
      btn.innerHTML = `<span class="material-icons-round">login</span> Sign In as Student`;
      if (res.success) {
        if (res.user.role !== 'student') {
          window.Components.toast('Access Denied: You are not a Student.', 'danger');
          return;
        }
        window.AppState.user = res.user;
        window.AppState.role = 'student';
        window.AppState.selectedLab = null; // Clear lab so they select it again
        const remember = document.getElementById('stu-remember').checked;
        if (remember) {
          localStorage.setItem('saved_student_code', roll_no);
          localStorage.setItem('saved_student_pass', password);
        } else {
          localStorage.removeItem('saved_student_code');
          localStorage.removeItem('saved_student_pass');
        }
        window.AppState.save(remember);
        window.Router.navigate('student-lab-selection');
        window.Components.toast('Login successful', 'success');
      } else {
        window.Components.toast(res.message || 'Login failed', 'danger');
      }
    });
  }
};

// ---- STUDENT SIGNUP ----
window.Screens['student-signup'] = function() {
  return `
  <div class="auth-screen">
    <div class="auth-card animate-in">
      <div class="auth-logo">
        <div class="auth-logo-icon" style="background:linear-gradient(135deg,#6A1B9A,#E040FB)"><span class="material-icons-round">school</span></div>
        <h1 class="auth-title">Student Registration</h1>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Full Name</label><input id="stu-reg-name" class="form-input" placeholder="Your full name"></div>
        <div class="form-group"><label class="form-label">Roll Number</label><input id="stu-reg-roll" class="form-input" placeholder="MB2024001"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Year</label>
          <select id="stu-reg-year" class="form-input form-select"><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option></select>
        </div>
        <div class="form-group"><label class="form-label">Department</label><input id="stu-reg-dept" class="form-input" placeholder="Microbiology"></div>
      </div>
      <div class="form-group"><label class="form-label">Select Lab</label>
        <select id="stu-reg-lab" class="form-input form-select">${window.AppData.labs.map(l=>`<option>${l.name}</option>`).join('')}</select>
      </div>
      <div class="form-group"><label class="form-label">Email</label><input id="stu-reg-email" class="form-input" type="email" placeholder="student@lab.in"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Password</label><input id="stu-reg-pass" class="form-input" type="password" placeholder="Create password"></div>
        <div class="form-group"><label class="form-label">Confirm</label><input id="stu-reg-conf" class="form-input" type="password" placeholder="Repeat"></div>
      </div>
      <button id="stu-reg-btn" class="btn btn-primary w-full" style="justify-content:center;padding:13px;background:linear-gradient(135deg,#6A1B9A,#8E24AA)">
        <span class="material-icons-round">person_add</span> Register
      </button>
      <p class="auth-link">Already registered? <a href="#" onclick="window.Router.navigate('student-login')">Sign In</a></p>
    </div>
  </div>`;
};
window.Screens['student-signup'].afterRender = function() {
  const btn = document.getElementById('stu-reg-btn');
  if (btn) {
    btn.addEventListener('click', async () => {
      const name = document.getElementById('stu-reg-name').value.trim();
      const roll = document.getElementById('stu-reg-roll').value.trim();
      const year = document.getElementById('stu-reg-year').value.trim();
      const dept = document.getElementById('stu-reg-dept').value.trim();
      const lab = document.getElementById('stu-reg-lab').value.trim();
      const email = document.getElementById('stu-reg-email').value.trim();
      const password = document.getElementById('stu-reg-pass').value.trim();
      const confirm = document.getElementById('stu-reg-conf').value.trim();
      if (!name || !roll || !year || !dept || !lab || !email || !password || !confirm) {
        window.Components.toast('Please fill in all fields', 'warning');
        return;
      }
      if (password !== confirm) {
        window.Components.toast('Passwords do not match', 'warning');
        return;
      }
      btn.disabled = true;
      btn.innerHTML = `<span class="material-icons-round animate-spin">sync</span> Registering...`;
      const res = await window.fetchAPI('auth/register.php', {
        method: 'POST',
        body: {
          user_code: roll,
          full_name: name,
          email,
          password,
          role: 'student',
          roll_no: roll,
          year,
          lab,
          department: dept
        }
      });
      btn.disabled = false;
      btn.innerHTML = `<span class="material-icons-round">person_add</span> Register`;
      if (res.success) {
        window.Components.toast('Account created successfully! Please login.', 'success');
        window.Router.navigate('student-login');
      } else {
        window.Components.toast(res.message || 'Registration failed', 'danger');
      }
    });
  }
};

// ---- STUDENT LAB SELECTION ----
window.Screens['student-lab-selection'] = function() {
  setTimeout(() => window.Screens['student-lab-selection'].fetchStatus(), 0);
  return `
  <div class="auth-screen" style="padding-top:40px;justify-content:flex-start">
    <div style="width:100%;max-width:600px">
      <div style="text-align:center;margin-bottom:32px">
        <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:16px">
          <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--primary),var(--cyan));display:flex;align-items:center;justify-content:center">
            <span class="material-icons-round" style="color:#fff">biotech</span>
          </div>
        </div>
        <h1 style="font-size:26px;font-weight:800;color:var(--text-primary);margin-bottom:8px">Select Your Lab</h1>
        <p style="color:var(--text-secondary);font-size:14px">Request access or enter your enrolled lab</p>
      </div>
      <div class="cards-grid-2" style="gap:14px" id="student-labs-container">
        <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">Loading labs...</div>
      </div>
    </div>
  </div>`;
};

window.Screens['student-lab-selection'].fetchStatus = async function() {
  const u = window.AppState.user || (window.AppData && window.AppData.users ? window.AppData.users.student : {name: 'Student', roll_no: 'MB2024001'});
  const rollNo = u.roll_no || u.rollNo || 'MB2024001';
  
  try {
    const data = await window.fetchAPI(`enrollment.php?action=status&student_roll=${encodeURIComponent(rollNo)}`);
    let statuses = {};
    if (data && data.success && data.enrollments) {
      data.enrollments.forEach(e => { statuses[e.lab_name] = e.status; });
    }
    window.Screens['student-lab-selection'].renderLabs(statuses);
  } catch (e) {
    console.error(e);
    window.Screens['student-lab-selection'].renderLabs({});
  }
};

window.Screens['student-lab-selection'].requestAccess = async function(labName) {
  const u = window.AppState.user || (window.AppData && window.AppData.users ? window.AppData.users.student : {name: 'Student', roll_no: 'MB2024001'});
  const rollNo = u.roll_no || u.rollNo || 'MB2024001';
  const name = u.name || 'Student';
  
  try {
    const data = await window.fetchAPI('enrollment.php?action=request', {
      method: 'POST',
      body: {student_roll: rollNo, student_name: name, lab_name: labName}
    });
    if (data && data.success) {
      window.Components.toast('Request sent for ' + labName, 'success');
      window.Screens['student-lab-selection'].fetchStatus();
    } else {
      window.Components.toast('Error: ' + (data ? data.error : 'Failed'), 'error');
    }
  } catch (e) {
    console.error(e);
    window.Components.toast('Failed to send request', 'danger');
  }
};

window.Screens['student-lab-selection'].renderLabs = function(statuses) {
  const container = document.getElementById('student-labs-container');
  if (!container) return;
  
  const colors = ['linear-gradient(135deg,#1565C0,#00BCD4)','linear-gradient(135deg,#00796B,#00E676)','linear-gradient(135deg,#6A1B9A,#E040FB)','linear-gradient(135deg,#E65100,#FF6D00)','linear-gradient(135deg,#B71C1C,#F44336)','linear-gradient(135deg,#1A237E,#7986CB)'];
  
  if (!window.AppData.labs || window.AppData.labs.length === 0) {
    container.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted)">No labs available.</div>';
    return;
  }
  
  container.innerHTML = window.AppData.labs.map((lab, i) => {
    const status = statuses[lab.name] || 'none';
    let actionHtml = '';
    let borderStyle = 'border-color:var(--border-color)';
    let cursor = 'cursor:pointer';
    let onclick = '';
    
    if (status === 'approved') {
      borderStyle = 'border-color:var(--success);box-shadow:0 0 0 1px var(--success)';
      onclick = `onclick="window.AppState.selectedLab='${lab.name}';window.AppState.save();window.Router.navigate('student-dashboard')"`;
      actionHtml = `<div style="margin-top:12px"><button class="btn btn-primary" style="width:100%">Enter Lab</button></div>`;
    } else if (status === 'pending') {
      borderStyle = 'border-color:var(--warning)';
      cursor = 'cursor:not-allowed';
      actionHtml = `<div style="margin-top:12px;text-align:center;padding:8px;background:rgba(255,152,0,0.1);color:var(--warning);border-radius:8px;font-size:12px;font-weight:600">Pending Approval</div>`;
    } else if (status === 'rejected') {
      borderStyle = 'border-color:var(--danger)';
      onclick = `onclick="window.Screens['student-lab-selection'].requestAccess('${lab.name}')"`;
      actionHtml = `<div style="margin-top:12px;text-align:center;padding:8px;background:rgba(244,67,54,0.1);color:var(--danger);border-radius:8px;font-size:12px;font-weight:600;margin-bottom:8px">Rejected</div><button class="btn btn-outline" style="width:100%">Request Again</button>`;
    } else {
      onclick = `onclick="window.Screens['student-lab-selection'].requestAccess('${lab.name}')"`;
      actionHtml = `<div style="margin-top:12px"><button class="btn btn-outline" style="width:100%">Request Access</button></div>`;
    }
  
    return `
      <div class="card" style="padding:20px;transition:all 0.3s;${borderStyle};${cursor}" 
           ${onclick}
           onmouseover="if('${status}'!=='pending'){this.style.transform='translateY(-3px)'}"
           onmouseout="if('${status}'!=='pending'){this.style.transform='translateY(0)'}">
        <div style="width:48px;height:48px;border-radius:13px;background:${colors[i % colors.length]};display:flex;align-items:center;justify-content:center;margin-bottom:12px">
          <span class="material-icons-round" style="color:#fff;font-size:22px">science</span>
        </div>
        <div style="font-weight:700;font-size:15px;color:var(--text-primary);margin-bottom:4px">${lab.name}</div>
        <div style="font-size:12px;color:var(--text-secondary);">${lab.head}</div>
        <div style="display:flex;gap:12px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border-color)">
          <div><div style="font-size:16px;font-weight:800;color:var(--primary-bright)">${lab.students}</div><div style="font-size:10px;color:var(--text-muted)">Students</div></div>
          <div><div style="font-size:16px;font-weight:800;color:var(--cyan)">${lab.equipment}</div><div style="font-size:10px;color:var(--text-muted)">Equipment</div></div>
        </div>
        ${actionHtml}
      </div>`;
  }).join('');
};

// ---- FORGOT PASSWORD ----
window.Screens['forgot-password'] = function() {
  return `
  <div class="auth-screen">
    <div class="auth-card animate-in">
      <div class="auth-logo">
        <div class="auth-logo-icon" style="background:linear-gradient(135deg,#E65100,var(--warning))"><span class="material-icons-round">lock_reset</span></div>
        <h1 class="auth-title">Reset Password</h1>
        <p class="auth-subtitle" id="fp-subtitle">We'll send you an OTP to reset your password</p>
      </div>
      
      <div id="fp-step-1">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <div class="input-icon-wrap">
            <span class="material-icons-round input-icon">email</span>
            <input class="form-input" id="fp-email" type="email" placeholder="your@email.com">
          </div>
        </div>
        <button id="fp-send-otp-btn" class="btn btn-primary w-full" style="justify-content:center;padding:13px">
          <span class="material-icons-round">send</span> Send OTP
        </button>
      </div>

      <div id="fp-step-2" style="display:none">
        <div class="form-group">
          <label class="form-label" style="text-align:center;display:block">Enter 6-Digit OTP</label>
          <div id="otp-boxes-container" style="display:flex;gap:8px;justify-content:center;margin-top:8px;margin-bottom:16px;">
            <input class="form-input otp-box" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" style="width:45px;height:50px;text-align:center;font-size:24px;font-weight:bold;padding:0;border-radius:8px">
            <input class="form-input otp-box" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" style="width:45px;height:50px;text-align:center;font-size:24px;font-weight:bold;padding:0;border-radius:8px">
            <input class="form-input otp-box" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" style="width:45px;height:50px;text-align:center;font-size:24px;font-weight:bold;padding:0;border-radius:8px">
            <input class="form-input otp-box" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" style="width:45px;height:50px;text-align:center;font-size:24px;font-weight:bold;padding:0;border-radius:8px">
            <input class="form-input otp-box" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" style="width:45px;height:50px;text-align:center;font-size:24px;font-weight:bold;padding:0;border-radius:8px">
            <input class="form-input otp-box" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" style="width:45px;height:50px;text-align:center;font-size:24px;font-weight:bold;padding:0;border-radius:8px">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">New Password</label>
          <div class="input-icon-wrap">
            <span class="material-icons-round input-icon">lock</span>
            <input class="form-input" id="fp-new-pass" type="password" placeholder="Create new password">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <div class="input-icon-wrap">
            <span class="material-icons-round input-icon">lock</span>
            <input class="form-input" id="fp-conf-pass" type="password" placeholder="Confirm new password">
          </div>
        </div>
        <button id="fp-reset-btn" class="btn btn-primary w-full" style="justify-content:center;padding:13px">
          <span class="material-icons-round">check_circle</span> Reset Password
        </button>
        <div style="text-align:center;margin-top:16px;">
          <span style="font-size:14px;color:var(--text-secondary)">Didn't receive OTP? </span>
          <a href="#" id="fp-resend-btn" style="font-size:14px;font-weight:bold;color:var(--primary-bright);text-decoration:none">Resend OTP</a>
        </div>
      </div>

      <p class="auth-link"><a href="#" onclick="history.back()">← Back to Login</a></p>
    </div>
  </div>`;
};

window.Screens['forgot-password'].afterRender = function() {
  const sendBtn = document.getElementById('fp-send-otp-btn');
  const resetBtn = document.getElementById('fp-reset-btn');
  const resendBtn = document.getElementById('fp-resend-btn');
  const otpBoxes = document.querySelectorAll('.otp-box');

  if (otpBoxes.length > 0) {
    otpBoxes.forEach((box, index) => {
      box.addEventListener('input', (e) => {
        // Allow only numbers
        box.value = box.value.replace(/[^0-9]/g, '');
        if (box.value.length === 1 && index < otpBoxes.length - 1) {
          otpBoxes[index + 1].focus();
        }
      });
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !box.value && index > 0) {
          otpBoxes[index - 1].focus();
        }
      });
      // Handle paste
      box.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '');
        if (!pastedData) return;
        for (let i = 0; i < pastedData.length && index + i < otpBoxes.length; i++) {
          otpBoxes[index + i].value = pastedData[i];
          if (index + i < otpBoxes.length - 1) {
            otpBoxes[index + i + 1].focus();
          } else {
            otpBoxes[index + i].focus();
          }
        }
      });
    });
  }
  
  const sendOtpReq = async (btn, isResend = false) => {
    const email = document.getElementById('fp-email').value.trim();
    if (!email) return window.Components.toast('Please enter your email', 'warning');
    
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = isResend ? 'Sending...' : `<span class="material-icons-round animate-spin">sync</span> Sending...`;
    
    const res = await window.fetchAPI('auth/forgot_password.php', {
      method: 'POST',
      body: { action: 'send_otp', email: email }
    });
    
    btn.disabled = false;
    btn.innerHTML = originalText;
    
    if (res && res.success) {
      window.Components.toast(res.message, 'success');
      if (!isResend) {
        document.getElementById('fp-step-1').style.display = 'none';
        document.getElementById('fp-step-2').style.display = 'block';
        document.getElementById('fp-subtitle').innerText = "Enter the OTP and your new password";
        if (otpBoxes.length > 0) otpBoxes[0].focus();
      }
    } else {
      window.Components.toast(res?.message || 'Failed to send OTP', 'danger');
    }
  };

  if (sendBtn) {
    sendBtn.addEventListener('click', () => sendOtpReq(sendBtn, false));
  }

  if (resendBtn) {
    resendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sendOtpReq(resendBtn, true);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      const email = document.getElementById('fp-email').value.trim();
      let otp = '';
      otpBoxes.forEach(box => otp += box.value);
      
      const newPass = document.getElementById('fp-new-pass').value;
      const confPass = document.getElementById('fp-conf-pass').value;
      
      if (otp.length < 6 || !newPass || !confPass) return window.Components.toast('Please fill all fields', 'warning');
      if (newPass !== confPass) return window.Components.toast('Passwords do not match', 'warning');
      
      resetBtn.disabled = true;
      resetBtn.innerHTML = `<span class="material-icons-round animate-spin">sync</span> Resetting...`;
      
      const res = await window.fetchAPI('auth/forgot_password.php', {
        method: 'POST',
        body: { action: 'reset_password', email: email, otp: otp, new_password: newPass }
      });
      
      resetBtn.disabled = false;
      resetBtn.innerHTML = `<span class="material-icons-round">check_circle</span> Reset Password`;
      
      if (res && res.success) {
        window.Components.toast(res.message, 'success');
        history.back(); // Or navigate to login based on logic, back usually works well.
      } else {
        window.Components.toast(res?.message || 'Failed to reset password', 'danger');
      }
    });
  }
};
