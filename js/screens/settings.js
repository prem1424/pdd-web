// ============================================================
// Smart Stock - Settings & Utility Screens
// ============================================================
window.Screens = window.Screens || {};

// ---- SETTINGS MENU ----
window.Screens['settings'] = function() {
  return `
  <div>
    ${window.Components.pageHeader('Settings','System configuration and preferences')}
    <div class="cards-grid-2">
      <div class="card mb-20">
        <div class="card-header"><div class="card-title">Account</div></div>
        <div class="list-group">
          <a href="#" class="list-item" onclick="window.Router.navigate('profile')">
            <span class="material-icons-round" style="color:var(--text-secondary)">person</span>
            <div style="flex:1;margin-left:12px">
              <div style="font-size:14px;font-weight:600;color:var(--text-primary)">Profile Information</div>
              <div style="font-size:12px;color:var(--text-muted)">Update your name, email, and details</div>
            </div>
            <span class="material-icons-round" style="color:var(--text-muted)">chevron_right</span>
          </a>
          <a href="#" class="list-item" onclick="window.Router.navigate('security-settings')">
            <span class="material-icons-round" style="color:var(--text-secondary)">lock</span>
            <div style="flex:1;margin-left:12px">
              <div style="font-size:14px;font-weight:600;color:var(--text-primary)">Security & Password</div>
              <div style="font-size:12px;color:var(--text-muted)">Change password and 2FA</div>
            </div>
            <span class="material-icons-round" style="color:var(--text-muted)">chevron_right</span>
          </a>
        </div>
      </div>
      
      <div class="card mb-20">
        <div class="card-header"><div class="card-title">Preferences</div></div>
        <div class="list-group">
          <div class="list-item">
            <span class="material-icons-round" style="color:var(--text-secondary)">notifications</span>
            <div style="flex:1;margin-left:12px">
              <div style="font-size:14px;font-weight:600;color:var(--text-primary)">Push Notifications</div>
              <div style="font-size:12px;color:var(--text-muted)">Receive alerts for low stock</div>
            </div>
            <label class="switch">
              <input type="checkbox" id="push-notif-toggle" checked>
              <span class="slider"></span>
            </label>
          </div>
          <div class="list-item">
            <span class="material-icons-round" style="color:var(--text-secondary)">dark_mode</span>
            <div style="flex:1;margin-left:12px">
              <div style="font-size:14px;font-weight:600;color:var(--text-primary)">Dark Theme</div>
              <div style="font-size:12px;color:var(--text-muted)">App appearance</div>
            </div>
            <label class="switch">
              <input type="checkbox" id="dark-theme-toggle" checked>
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>
      
      ${window.AppState.role === 'auditor' ? `
      <div class="card mb-20" style="grid-column:1/-1">
        <div class="card-header"><div class="card-title">System Administration</div></div>
        <div class="list-group">
          <a href="#" class="list-item" onclick="window.Router.navigate('manage-labs')">
            <span class="material-icons-round" style="color:var(--text-secondary)">business</span>
            <div style="flex:1;margin-left:12px">
              <div style="font-size:14px;font-weight:600;color:var(--text-primary)">Manage Laboratories</div>
              <div style="font-size:12px;color:var(--text-muted)">Add or edit lab details and locations</div>
            </div>
            <span class="material-icons-round" style="color:var(--text-muted)">chevron_right</span>
          </a>
          <a href="#" class="list-item" onclick="window.Router.navigate('manage-users')">
            <span class="material-icons-round" style="color:var(--text-secondary)">manage_accounts</span>
            <div style="flex:1;margin-left:12px">
              <div style="font-size:14px;font-weight:600;color:var(--text-primary)">User Management</div>
              <div style="font-size:12px;color:var(--text-muted)">Manage lab heads and system access</div>
            </div>
            <span class="material-icons-round" style="color:var(--text-muted)">chevron_right</span>
          </a>
        </div>
      </div>` : ''}
    </div>
    
    <div style="margin-top:20px;text-align:center">
      <button class="btn btn-danger" style="margin:0 auto" onclick="window.AppActions.logout()">
        <span class="material-icons-round">logout</span> Sign Out
      </button>
      <div style="margin-top:20px;font-size:11px;color:var(--text-muted)">Smart Stock Web v1.0.0<br>Powered by Advanced Intelligence</div>
    </div>
  </div>`;
};

window.Screens['settings'].afterRender = function() {
  const notifInput = document.getElementById('push-notif-toggle');
  const themeInput = document.getElementById('dark-theme-toggle');

  // Load state from localStorage or defaults
  if (themeInput) {
    const isLight = document.body.classList.contains('light-theme');
    themeInput.checked = !isLight;
    
    themeInput.addEventListener('change', () => {
      const isChecked = themeInput.checked;
      if (isChecked) {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        localStorage.setItem('smartstock_theme', 'dark');
        window.Components.toast('Dark theme activated!', 'success');
      } else {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        localStorage.setItem('smartstock_theme', 'light');
        window.Components.toast('Light theme activated!', 'success');
      }
    });
  }

  if (notifInput) {
    notifInput.addEventListener('change', () => {
      const isChecked = notifInput.checked;
      window.Components.toast(isChecked ? 'Push alerts enabled!' : 'Push alerts disabled!', 'info');
    });
  }
};

// ---- SECURITY SETTINGS ----
window.Screens['security-settings'] = function() {
  return `
  <div>
    ${window.Components.pageHeader('Security Settings','Manage your password and authentication','settings')}
    <div class="card" style="max-width:500px">
      <div class="card-body">
        <h3 style="font-size:15px;font-weight:600;color:var(--text-primary);margin-bottom:16px">Change Password</h3>
        <div class="form-group">
          <label class="form-label">Current Password</label>
          <input type="password" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">New Password</label>
          <input type="password" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">Confirm New Password</label>
          <input type="password" class="form-input">
        </div>
        <button class="btn btn-primary" onclick="window.Components.toast('Password updated successfully!','success');history.back()">
          Update Password
        </button>
      </div>
    </div>
  </div>`;
};

// ---- MANAGE LABORATORIES ----
window.Screens['manage-labs'] = function() {
  return `
  <div>
    ${window.Components.pageHeader('Manage Laboratories', 'Add, edit, or delete institutional research labs', 'settings',
      `<button class="btn btn-primary btn-sm" onclick="window.Components.showModal('add-lab-modal')"><span class="material-icons-round">add</span> Add Lab</button>`)}
    
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Laboratory</th><th>Code</th><th>Department</th><th>Lab Head</th><th>Location</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody id="manage-labs-table-body">
            ${window.AppData.labs.map(lab => `
              <tr data-lab-id="${lab.id}">
                <td><div class="td-label">${lab.name}</div><div class="td-sub">Utilisation: ${lab.utilization}%</div></td>
                <td style="font-family: monospace; font-weight: 600; font-size: 13px;">${lab.code}</td>
                <td style="font-size: 13px; color: var(--text-secondary);">${lab.name.split(' ')[0]}</td>
                <td style="font-size: 13px; font-weight: 600; color: var(--text-primary);">${lab.head}</td>
                <td style="font-size: 12px; color: var(--text-secondary);">${lab.location}</td>
                <td><span class="badge badge-${window.AppUtils.getStatusColor(lab.status)}">${lab.status}</span></td>
                <td>
                  <div style="display:flex; gap:6px;">
                    <button class="btn btn-ghost btn-sm btn-icon" onclick="editLab(${lab.id})"><span class="material-icons-round" style="font-size:16px;">edit</span></button>
                    <button class="btn btn-danger btn-sm btn-icon" style="background: rgba(255,82,82,0.15); border: none;" onclick="deleteLab(${lab.id})"><span class="material-icons-round" style="font-size:16px;">delete</span></button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Lab Modal -->
    ${window.Components.modal('add-lab-modal', 'Add New Laboratory', `
      <div class="form-group"><label class="form-label">Laboratory Name</label><input class="form-input" id="al-name" placeholder="e.g. Immunology Lab"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Lab Code</label><input class="form-input" id="al-code" placeholder="e.g. IM-07"></div>
        <div class="form-group"><label class="form-label">Lab Head</label><input class="form-input" id="al-head" placeholder="e.g. Dr. Ramesh Gupta"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Location</label><input class="form-input" id="al-loc" placeholder="e.g. Block C, Floor 3"></div>
        <div class="form-group"><label class="form-label">Initial Status</label>
          <select class="form-input form-select" id="al-status">
            <option>active</option><option>maintenance</option>
          </select>
        </div>
      </div>
    `, `
      <button class="btn btn-ghost" onclick="window.Components.closeModal('add-lab-modal')">Cancel</button>
      <button class="btn btn-primary" id="save-new-lab-btn">Create Laboratory</button>
    `)}
  </div>`;
};

window.Screens['manage-labs'].afterRender = function() {
  const saveBtn = document.getElementById('save-new-lab-btn');
  if (saveBtn) {
    saveBtn.onclick = function() {
      const name = document.getElementById('al-name').value.trim();
      const code = document.getElementById('al-code').value.trim();
      const head = document.getElementById('al-head').value.trim();
      const location = document.getElementById('al-loc').value.trim();
      const status = document.getElementById('al-status').value;

      if (!name || !code || !head || !location) {
        window.Components.toast('Please fill all fields', 'error');
        return;
      }

      const id = window.AppData.labs.length + 1;
      window.AppData.labs.push({ id, name, code, head, students: 0, location, status, equipment: 0, chemicals: 0, utilization: 0 });
      
      // Clean inputs
      document.getElementById('al-name').value = '';
      document.getElementById('al-code').value = '';
      document.getElementById('al-head').value = '';
      document.getElementById('al-loc').value = '';

      window.Components.closeModal('add-lab-modal');
      window.Components.toast('Laboratory added successfully!', 'success');
      renderLabsTable();
    };
  }

  window.deleteLab = function(id) {
    const idx = window.AppData.labs.findIndex(l => l.id === id);
    if (idx !== -1) {
      const labName = window.AppData.labs[idx].name;
      window.AppData.labs.splice(idx, 1);
      window.Components.toast(`${labName} deleted successfully`, 'warning');
      renderLabsTable();
    }
  };

  window.editLab = function(id) {
    const lab = window.AppData.labs.find(l => l.id === id);
    if (lab) {
      const newHead = prompt("Enter new Lab Head:", lab.head);
      if (newHead !== null && newHead.trim() !== "") {
        lab.head = newHead.trim();
        window.Components.toast("Lab head updated!", "success");
        renderLabsTable();
      }
    }
  };

  function renderLabsTable() {
    const tbody = document.getElementById('manage-labs-table-body');
    if (tbody) {
      tbody.innerHTML = window.AppData.labs.map(lab => `
        <tr data-lab-id="${lab.id}">
          <td><div class="td-label">${lab.name}</div><div class="td-sub">Utilisation: ${lab.utilization}%</div></td>
          <td style="font-family: monospace; font-weight: 600; font-size: 13px;">${lab.code}</td>
          <td style="font-size: 13px; color: var(--text-secondary);">${lab.name.split(' ')[0]}</td>
          <td style="font-size: 13px; font-weight: 600; color: var(--text-primary);">${lab.head}</td>
          <td style="font-size: 12px; color: var(--text-secondary);">${lab.location}</td>
          <td><span class="badge badge-${window.AppUtils.getStatusColor(lab.status)}">${lab.status}</span></td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-ghost btn-sm btn-icon" onclick="editLab(${lab.id})"><span class="material-icons-round" style="font-size:16px;">edit</span></button>
              <button class="btn btn-danger btn-sm btn-icon" style="background: rgba(255,82,82,0.15); border: none;" onclick="deleteLab(${lab.id})"><span class="material-icons-round" style="font-size:16px;">delete</span></button>
            </div>
          </td>
        </tr>`).join('');
    }
  }
};

// ---- USER MANAGEMENT ----
window.Screens['manage-users'] = function() {
  const usersList = [];
  
  Object.values(window.AppData.users).forEach(u => {
    usersList.push({ id: u.id, name: u.name, email: u.email, role: u.role, details: u.department || u.lab || 'N/A', status: 'active' });
  });
  window.AppData.students.forEach(s => {
    if (!usersList.some(u => u.email === s.email)) {
      usersList.push({ id: s.id + 100, name: s.name, email: s.email, role: 'student', details: `${s.year} · ${s.rollNo}`, status: s.status });
    }
  });

  return `
  <div>
    ${window.Components.pageHeader('User Management', 'Manage lab heads, auditors, and system access rights', 'settings',
      `<button class="btn btn-primary btn-sm" onclick="window.Components.showModal('add-user-modal')"><span class="material-icons-round">person_add</span> Add User</button>`)}
    
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>User</th><th>Email</th><th>Role</th><th>Lab / Dept</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody id="manage-users-table-body">
            ${usersList.map(user => `
              <tr data-user-email="${user.email}">
                <td><div style="display:flex; align-items:center; gap:10px">${window.Components.avatar(user.name.split(' ').map(n=>n[0]).join(''),'sm')}<div><div class="td-label">${user.name}</div></div></div></td>
                <td style="font-size: 13px; color: var(--text-secondary);">${user.email}</td>
                <td><span class="badge badge-${user.role === 'auditor' ? 'primary' : user.role === 'labhead' ? 'success' : 'warning'}">${user.role}</span></td>
                <td style="font-size: 13px; color: var(--text-secondary);">${user.details}</td>
                <td><span class="badge badge-${window.AppUtils.getStatusColor(user.status)}">${user.status}</span></td>
                <td>
                  <div style="display:flex; gap:6px;">
                    <button class="btn btn-ghost btn-sm btn-icon" onclick="toggleUserStatus('${user.email}')" title="Toggle status"><span class="material-icons-round" style="font-size:16px;">block</span></button>
                    <button class="btn btn-danger btn-sm btn-icon" style="background: rgba(255,82,82,0.15); border: none;" onclick="deleteUser('${user.email}')" title="Delete user"><span class="material-icons-round" style="font-size:16px;">delete</span></button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add User Modal -->
    ${window.Components.modal('add-user-modal', 'Add New System User', `
      <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="au-name" placeholder="e.g. Sandeep Sharma"></div>
      <div class="form-group"><label class="form-label">Email Address</label><input class="form-input" id="au-email" type="email" placeholder="e.g. sandeep@smartstock.in"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Portal Role</label>
          <select class="form-input form-select" id="au-role">
            <option value="student">Student</option>
            <option value="labhead">Lab Head</option>
            <option value="auditor">Auditor</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Department / Lab</label><input class="form-input" id="au-details" placeholder="e.g. Biotechnology Lab"></div>
      </div>
    `, `
      <button class="btn btn-ghost" onclick="window.Components.closeModal('add-user-modal')">Cancel</button>
      <button class="btn btn-primary" id="save-new-user-btn">Create User Account</button>
    `)}
  </div>`;
};

window.Screens['manage-users'].afterRender = function() {
  const saveBtn = document.getElementById('save-new-user-btn');
  if (saveBtn) {
    saveBtn.onclick = function() {
      const name = document.getElementById('au-name').value.trim();
      const email = document.getElementById('au-email').value.trim();
      const role = document.getElementById('au-role').value;
      const details = document.getElementById('au-details').value.trim();

      if (!name || !email || !details) {
        window.Components.toast('Please fill all fields', 'error');
        return;
      }

      if (role === 'student') {
        window.AppData.students.push({
          id: window.AppData.students.length + 1,
          name,
          rollNo: 'ST' + (2024000 + window.AppData.students.length + 1),
          lab: details,
          year: '1st Year',
          email,
          attendance: 100,
          tasks: 0,
          status: 'active',
          lastActivity: new Date().toISOString().split('T')[0]
        });
      } else {
        window.AppData.users[role + '_' + Date.now()] = {
          id: Object.keys(window.AppData.users).length + 1,
          name,
          email,
          role,
          avatar: name.split(' ').map(n=>n[0]).join(''),
          department: details
        };
      }

      document.getElementById('au-name').value = '';
      document.getElementById('au-email').value = '';
      document.getElementById('au-details').value = '';

      window.Components.closeModal('add-user-modal');
      window.Components.toast('User account created successfully!', 'success');
      renderUsersTable();
    };
  }

  window.deleteUser = function(email) {
    const studentIdx = window.AppData.students.findIndex(s => s.email === email);
    if (studentIdx !== -1) {
      const name = window.AppData.students[studentIdx].name;
      window.AppData.students.splice(studentIdx, 1);
      window.Components.toast(`Student ${name} deleted`, 'warning');
      renderUsersTable();
      return;
    }

    const userKey = Object.keys(window.AppData.users).find(k => window.AppData.users[k].email === email);
    if (userKey) {
      const name = window.AppData.users[userKey].name;
      delete window.AppData.users[userKey];
      window.Components.toast(`User ${name} deleted`, 'warning');
      renderUsersTable();
    }
  };

  window.toggleUserStatus = function(email) {
    const student = window.AppData.students.find(s => s.email === email);
    if (student) {
      student.status = student.status === 'active' ? 'inactive' : 'active';
      window.Components.toast(`Access status updated to ${student.status}`, 'info');
      renderUsersTable();
      return;
    }

    window.Components.toast(`Auditor/Lab head access status toggled`, 'info');
  };

  function renderUsersTable() {
    const tbody = document.getElementById('manage-users-table-body');
    if (!tbody) return;

    const usersList = [];
    Object.values(window.AppData.users).forEach(u => {
      usersList.push({ id: u.id, name: u.name, email: u.email, role: u.role, details: u.department || u.lab || 'N/A', status: 'active' });
    });
    window.AppData.students.forEach(s => {
      if (!usersList.some(u => u.email === s.email)) {
        usersList.push({ id: s.id + 100, name: s.name, email: s.email, role: 'student', details: `${s.year} · ${s.rollNo}`, status: s.status });
      }
    });

    tbody.innerHTML = usersList.map(user => `
      <tr data-user-email="${user.email}">
        <td><div style="display:flex; align-items:center; gap:10px">${window.Components.avatar(user.name.split(' ').map(n=>n[0]).join(''),'sm')}<div><div class="td-label">${user.name}</div></div></div></td>
        <td style="font-size: 13px; color: var(--text-secondary);">${user.email}</td>
        <td><span class="badge badge-${user.role === 'auditor' ? 'primary' : user.role === 'labhead' ? 'success' : 'warning'}">${user.role}</span></td>
        <td style="font-size: 13px; color: var(--text-secondary);">${user.details}</td>
        <td><span class="badge badge-${window.AppUtils.getStatusColor(user.status)}">${user.status}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="toggleUserStatus('${user.email}')" title="Toggle status"><span class="material-icons-round" style="font-size:16px;">block</span></button>
            <button class="btn btn-danger btn-sm btn-icon" style="background: rgba(255,82,82,0.15); border: none;" onclick="deleteUser('${user.email}')" title="Delete user"><span class="material-icons-round" style="font-size:16px;">delete</span></button>
          </div>
        </td>
      </tr>`).join('');
  }
};
