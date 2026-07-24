// ============================================================
// Smart Stock - Lab Head Screens
// ============================================================
window.Screens = window.Screens || {};

// ---- LAB HEAD DASHBOARD ----
window.Screens['labhead-dashboard'] = function() {
  const u = window.AppState.user || window.AppData.users.labhead;
  const labName = window.AppState.selectedLab || u.lab || 'Microbiology Lab';
  const todayStr = new Date().toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'});
  
  // Calculate stats dynamically
  const dStats = (window.AppData.dashboardStats && window.AppData.dashboardStats.stats) ? window.AppData.dashboardStats.stats : {};
  const presentCountStr = dStats.present_today || '0/0';
  const presentCount = presentCountStr.split('/')[0];
  const totalCount = presentCountStr.split('/')[1] || '0';
  
  const pendingTasks = dStats.pending_tasks || 0;
  const lowStockItems = dStats.low_stock || 0;
  const pendingApprovals = dStats.pending_approvals || 0;

  return `
  <div>
    <div class="dashboard-welcome animate-in" style="background:linear-gradient(135deg,var(--teal) 0%,rgba(0,230,118,0.8) 100%)">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <div class="welcome-greeting">${todayStr}</div>
          <div class="welcome-name">${labName}</div>
          <div class="welcome-subtitle">Welcome back, ${u.name}</div>
        </div>
        <div style="background:rgba(255,255,255,0.1);border-radius:16px;padding:14px;text-align:center">
          <div style="font-size:28px;font-weight:800;color:#fff">${presentCount}/${totalCount}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.7)">Present Today</div>
        </div>
      </div>
      <div class="welcome-stats">
        <div><div class="welcome-stat-val">${pendingTasks}</div><div class="welcome-stat-lab">Pending Tasks</div></div>
        <div><div class="welcome-stat-val">${lowStockItems}</div><div class="welcome-stat-lab">Low Stock Items</div></div>
        <div><div class="welcome-stat-val">${pendingApprovals}</div><div class="welcome-stat-lab">Approval Requests</div></div>
      </div>
    </div>

    <div class="cards-grid-2 mb-24 animate-in-2">
      <div class="card">
        <div class="card-header"><div class="card-title">Today's Attendance</div><button class="btn btn-ghost btn-sm" onclick="window.Router.navigate('labhead-attendance')">View All</button></div>
        <div class="card-body" style="padding:12px 20px">
          ${(window.AppData.attendance && window.AppData.attendance.length > 0 && (window.AppData.attendance && window.AppData.attendance.length > 0 && window.AppData.attendance[0].students ? window.AppData.attendance[0].students : [])) ? (window.AppData.attendance && window.AppData.attendance.length > 0 && window.AppData.attendance[0].students ? window.AppData.attendance[0].students : []).slice(0,4).map(s=>`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-color)">
              <div style="display:flex;align-items:center;gap:10px">
                ${window.Components.avatar(s.name.split(' ').map(n=>n[0]).join(''),'sm')}
                <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${s.name}</div>
              </div>
              <span class="badge badge-${window.AppUtils.getStatusColor(s.status)}">${s.status}</span>
            </div>
          `).join('') : '<div style="font-size:13px;color:var(--text-secondary);text-align:center;padding:10px 0">No attendance records for today.</div>'}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Pending Approvals</div><button class="btn btn-ghost btn-sm" onclick="window.Router.navigate('approval-requests')">View</button></div>
        <div class="card-body" style="padding:12px 20px">
          ${(window.AppData.approvalRequests || []).filter(r=>r.status==='pending').length > 0 ? (window.AppData.approvalRequests || []).filter(r=>r.status==='pending').slice(0,2).map(r=>`
            <div style="padding:12px 0;border-bottom:1px solid var(--border-color)">
              <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${r.title}</div>
                <span class="badge badge-${r.urgency==='urgent'?'danger':r.urgency==='high'?'warning':'info'}">${r.urgency}</span>
              </div>
              <div style="font-size:11px;color:var(--text-secondary)">By ${r.requestedBy} · ${r.quantity}</div>
            </div>
          `).join('') : '<div style="font-size:13px;color:var(--text-secondary);text-align:center;padding:20px 0">No pending approvals.</div>'}
        </div>
      </div>
    </div>

    <h2 class="section-title animate-in-3">Lab Management</h2>
    <div class="cards-grid-3 animate-in-3 mb-24">
      ${[
        {icon:'how_to_reg',label:'Attendance',route:'labhead-attendance',color:'linear-gradient(135deg,#00897B,#00BFA5)'},
        {icon:'assignment',label:'Tasks',route:'task-management',color:'linear-gradient(135deg,#1565C0,#00BCD4)'},
        {icon:'fact_check',label:'Approvals',route:'approval-requests',color:'linear-gradient(135deg,#F57C00,#FF9800)'},
        {icon:'inventory_2',label:'Inventory',route:'equipment-inventory',color:'linear-gradient(135deg,#6A1B9A,#E040FB)'},
        {icon:'school',label:'Students',route:'student-monitoring',color:'linear-gradient(135deg,#0277BD,#03A9F4)'},
        {icon:'assignment_ind',label:'Enrollments',route:'lab-enrollments',color:'linear-gradient(135deg,#D81B60,#EC407A)'},
        {icon:'summarize',label:'Reports',route:'lab-reports',color:'linear-gradient(135deg,#4527A0,#7E57C2)'}
      ].map(q=>`
        <div class="card" style="cursor:pointer;padding:20px;display:flex;align-items:center;gap:16px" onclick="window.Router.navigate('${q.route}')" onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform='translateX(0)'">
          <div style="width:48px;height:48px;border-radius:14px;background:${q.color};display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <span class="material-icons-round" style="color:#fff">${q.icon}</span>
          </div>
          <div style="font-weight:700;font-size:14px;color:var(--text-primary)">${q.label}</div>
          <span class="material-icons-round" style="color:var(--text-muted);margin-left:auto;font-size:18px">chevron_right</span>
        </div>`).join('')}
    </div>
  </div>`;
};
window.Screens['labhead-dashboard'].afterRender = function() {
  document.getElementById('topbar-title') && (document.getElementById('topbar-title').textContent = 'Lab Dashboard');
};

// ---- STUDENT MONITORING ----
window.Screens['student-monitoring'] = function() {
  const labName = window.AppState?.selectedLab || window.AppState?.user?.lab || 'Microbiology Lab';
  const myStudents = (window.AppData.students || []).filter(s => !s.lab || s.lab.toLowerCase() === labName.toLowerCase() || labName.toLowerCase().includes(s.lab.toLowerCase()));
  const activeCount = myStudents.filter(s => s.status === 'active').length;
  const totalStudents = myStudents.length;
  const totalAtt = myStudents.reduce((acc, s) => acc + (s.attendance || 0), 0);
  const avgAtt = totalStudents > 0 ? Math.round(totalAtt / totalStudents) : 0;
  const completedTasks = window.AppData.tasks.filter(t => (!t.lab || t.lab.toLowerCase() === labName.toLowerCase() || labName.toLowerCase().includes(t.lab.toLowerCase())) && t.status === 'completed').length;
  const warningCount = myStudents.filter(s => s.status === 'warning').length;

  return `
  <div>
    ${window.Components.pageHeader('Student Monitoring','Track student progress and performance','',
      `<button class="btn btn-primary btn-sm" onclick="window.Screens['student-monitoring'].openAddStudentModal()"><span class="material-icons-round">person_add</span> Register Student</button>`)}
    ${window.Components.searchBar('Search students by name or roll number...','sm-search')}
    <div class="stats-grid mb-20">
      ${window.Components.statCard('groups','Active Students',`${activeCount}/${totalStudents}`,'','','blue')}
      ${window.Components.statCard('how_to_reg','Avg Attendance',`${avgAtt}%`,'','success','success')}
      ${window.Components.statCard('task_alt','Tasks Completed',`${completedTasks}`,'','','cyan')}
      ${window.Components.statCard('warning','Need Attention',`${warningCount}`,'','warning','warning')}
    </div>
    <div class="card">
      <div class="table-wrap">
        <table id="sm-table">
          <thead><tr><th>Student</th><th>Roll No</th><th>Year</th><th>Attendance</th><th>Tasks</th><th>Last Activity</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${myStudents.map(s=>`
              <tr>
                <td><div style="display:flex;align-items:center;gap:10px">${window.Components.avatar(s.name.split(' ').map(n=>n[0]).join(''),'sm')}<div class="td-label">${s.name}</div></div></td>
                <td style="font-size:13px;color:var(--text-secondary);font-family:monospace">${s.rollNo}</td>
                <td style="font-size:13px;color:var(--text-secondary)">${s.year}</td>
                <td><span style="font-weight:700;color:${s.attendance>=85?'var(--success)':s.attendance>=75?'var(--warning)':'var(--danger)'}">${s.attendance}%</span></td>
                <td style="font-size:13px;color:var(--text-secondary)">${s.tasks} assigned</td>
                <td style="font-size:12px;color:var(--text-muted)">${window.AppUtils.formatDate(s.lastActivity)}</td>
                <td><span class="badge badge-${window.AppUtils.getStatusColor(s.status)}">${s.status}</span></td>
                <td><button class="btn btn-outline btn-sm" onclick="window.Screens['student-monitoring'].viewPerformance(${s.id})" style="gap:4px;font-size:12px"><span class="material-icons-round" style="font-size:15px">analytics</span> Logs & Details</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    ${window.Components.modal('add-student-modal','Register New Student',`
      <div class="form-group">
        <label class="form-label">Full Name</label>
        <input type="text" id="add-student-name" class="form-input" placeholder="e.g. Riya Sharma">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Roll Number</label>
          <input type="text" id="add-student-roll" class="form-input" placeholder="e.g. MB2024007">
        </div>
        <div class="form-group">
          <label class="form-label">Year</label>
          <select id="add-student-year" class="form-input form-select">
            <option>1st Year</option>
            <option>2nd Year</option>
            <option selected>3rd Year</option>
            <option>4th Year</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Email Address</label>
        <input type="email" id="add-student-email" class="form-input" placeholder="e.g. riya@lab.in">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Initial Status</label>
          <select id="add-student-status" class="form-input form-select">
            <option value="active">Active</option>
            <option value="warning">Warning</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Initial Attendance (%)</label>
          <input type="number" id="add-student-attendance" class="form-input" value="100" min="0" max="100">
        </div>
      </div>
    `, `
      <button class="btn btn-ghost" onclick="window.Components.closeModal('add-student-modal')">Cancel</button>
      <button class="btn btn-primary" onclick="window.Screens['student-monitoring'].submitAddStudent()">Register Student</button>
    `)}
  </div>`;
};
window.Screens['student-monitoring'].afterRender = function() {
  window.Components.setupSearch('sm-search', q => {
    document.querySelectorAll('#sm-table tbody tr').forEach(r => { r.style.display = r.textContent.toLowerCase().includes(q)?'':'none'; });
  });
};

window.Screens['student-monitoring'].openAddStudentModal = function() {
  window.Components.showModal('add-student-modal');
  document.getElementById('add-student-name').value = '';
  document.getElementById('add-student-roll').value = '';
  document.getElementById('add-student-email').value = '';
  document.getElementById('add-student-year').value = '3rd Year';
  document.getElementById('add-student-status').value = 'active';
  document.getElementById('add-student-attendance').value = '100';
};

window.Screens['student-monitoring'].submitAddStudent = function() {
  const nameVal = document.getElementById('add-student-name').value.trim();
  const rollVal = document.getElementById('add-student-roll').value.trim();
  const yearVal = document.getElementById('add-student-year').value;
  const emailVal = document.getElementById('add-student-email').value.trim() || `${rollVal.toLowerCase()}@lab.in`;
  const statusVal = document.getElementById('add-student-status').value;
  const attVal = parseInt(document.getElementById('add-student-attendance').value) || 100;

  if (!nameVal || !rollVal) {
    window.Components.toast('Please enter name and roll number', 'error');
    return;
  }

  const duplicate = window.AppData.students.find(s => s.rollNo.toLowerCase() === rollVal.toLowerCase());
  if (duplicate) {
    window.Components.toast(`Roll number ${rollVal} already registered`, 'error');
    return;
  }

  const nextId = Math.max(...window.AppData.students.map(s => s.id), 0) + 1;
  
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const newStudent = {
    id: nextId,
    name: nameVal,
    rollNo: rollVal,
    lab: 'Microbiology Lab',
    year: yearVal,
    email: emailVal,
    attendance: attVal,
    tasks: 0,
    status: statusVal,
    lastActivity: todayStr
  };

  window.AppData.students.push(newStudent);

  // Also add to today's attendance if not already in it
  const att = window.AppData.attendance.find(a => a.date === todayStr);
  if (att) {
    const exists = att.students.some(s => s.id === nextId);
    if (!exists) {
      att.students.push({
        id: nextId,
        name: nameVal,
        status: 'absent',
        timeIn: null,
        timeOut: null
      });
    }
  }

  window.Components.toast(`Student ${nameVal} registered successfully!`, 'success');
  window.Components.closeModal('add-student-modal');
  window.Router.render();
};

window.Screens['student-monitoring'].viewPerformance = function(studentId) {
  window.Screens['student-performance'].selectedStudentId = studentId;
  window.Router.navigate('student-performance');
};

// ---- STUDENT PERFORMANCE ----
window.Screens['student-performance'] = function() {
  const studentId = window.Screens['student-performance'].selectedStudentId || (window.AppData.students[0] ? window.AppData.students[0].id : null);
  const student = window.AppData.students.find(s => s.id === studentId);
  if (!student) {
    return `
    <div>
      ${window.Components.pageHeader('Student Performance', '', 'student-monitoring')}
      <div class="card" style="padding:40px 20px;text-align:center;color:var(--text-secondary)">
        <span class="material-icons-round" style="font-size:48px;color:var(--text-muted);margin-bottom:12px">error_outline</span>
        <div>Student profile not found.</div>
      </div>
    </div>`;
  }

  const studentTasks = window.AppData.tasks.filter(t => t.assignedTo === student.name);
  const completedTasksCount = studentTasks.filter(t => t.status === 'completed').length;
  const pendingTasksCount = studentTasks.filter(t => t.status === 'pending').length;
  const inProgressTasksCount = studentTasks.filter(t => t.status === 'in-progress').length;

  const studentUsage = (window.AppData.stockHistory || []).filter(h => {
    const by = (h.by || h.by_user || '').toLowerCase();
    return by === student.name.toLowerCase() || by === student.rollNo.toLowerCase();
  });
  const studentActivities = (window.AppData.activities || []).filter(a => {
    const st = (a.student || '').toString().toLowerCase();
    return st === student.name.toLowerCase() || st === student.rollNo.toLowerCase() || st === student.id.toString();
  });

  return `
  <div>
    ${window.Components.pageHeader(student.name, `Roll No: ${student.rollNo} · ${student.year}`, 'student-monitoring',
      `<button class="btn btn-outline btn-sm" style="border-color:var(--danger);color:var(--danger)" onclick="window.Screens['student-performance'].deleteStudent(${student.id})"><span class="material-icons-round">delete</span> Delete Student</button>`)}
    
    <div class="stats-grid mb-24 animate-in">
      ${window.Components.statCard('how_to_reg', 'Attendance Rate', `${student.attendance}%`, '', student.attendance >= 85 ? 'success' : student.attendance >= 75 ? 'warning' : 'danger')}
      ${window.Components.statCard('task_alt', 'Tasks Completed', `${completedTasksCount}/${studentTasks.length}`, '', 'cyan')}
      ${window.Components.statCard('inventory', 'Logged Usages', `${studentUsage.length}`, '', 'blue')}
      ${window.Components.statCard('science', 'Activities Logged', `${studentActivities.length}`, '', 'warning')}
    </div>

    <div class="cards-grid-2 animate-in-2 mb-24">
      <div class="card">
        <div class="card-header"><div class="card-title">Student Profile</div></div>
        <div class="card-body">
          <div style="display:flex;flex-direction:column;gap:14px">
            <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border-color);padding-bottom:10px">
              <span style="color:var(--text-secondary)">Email:</span>
              <span style="font-weight:600;color:var(--text-primary)">${student.email || `${student.rollNo.toLowerCase()}@lab.in`}</span>
            </div>
            <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border-color);padding-bottom:10px">
              <span style="color:var(--text-secondary)">Current Status:</span>
              <span class="badge badge-${window.AppUtils.getStatusColor(student.status)}">${student.status}</span>
            </div>
            <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border-color);padding-bottom:10px">
              <span style="color:var(--text-secondary)">Last Active:</span>
              <span style="font-weight:600;color:var(--text-primary)">${window.AppUtils.formatDate(student.lastActivity)}</span>
            </div>
            
            <div class="form-group" style="margin-top:10px">
              <label class="form-label">Update Student Status</label>
              <select class="form-input form-select" onchange="window.Screens['student-performance'].updateStatus(${student.id}, this.value)">
                <option value="active" ${student.status === 'active' ? 'selected' : ''}>Active</option>
                <option value="warning" ${student.status === 'warning' ? 'selected' : ''}>Warning</option>
                <option value="inactive" ${student.status === 'inactive' ? 'selected' : ''}>Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Assigned Tasks</div></div>
        <div class="card-body" style="max-height: 350px; overflow-y: auto; padding: 0;">
          ${studentTasks.length === 0 ? `
            <div style="text-align:center;padding:40px 20px;color:var(--text-secondary)">
              <span class="material-icons-round" style="font-size:36px;color:var(--text-muted)">assignment</span>
              <p style="margin-top:8px">No tasks assigned to this student yet.</p>
            </div>` : `
            <table style="width:100%;border-collapse:collapse">
              <tbody>
                ${studentTasks.map(t => `
                  <tr style="border-bottom:1px solid var(--border-color)">
                    <td style="padding:12px;font-size:13px;color:var(--text-primary)">
                      <div style="font-weight:600">${t.title}</div>
                      <div style="font-size:11px;color:var(--text-secondary)">Due: ${window.AppUtils.formatDate(t.dueDate)}</div>
                    </td>
                    <td style="padding:12px;text-align:right">
                      <span class="badge badge-${window.AppUtils.getStatusColor(t.status)}">${t.status}</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
      </div>
    </div>

    <div class="card animate-in-2 mb-24">
      <div class="card-header" style="display:flex;justify-content:space-between;align-items:center">
        <div class="card-title">Student Logged Usage (${studentUsage.length})</div>
      </div>
      <div class="card-body" style="padding:0;max-height:300px;overflow-y:auto">
        ${studentUsage.length === 0 ? `
          <div style="text-align:center;padding:32px 20px;color:var(--text-secondary)">
            <span class="material-icons-round" style="font-size:32px;color:var(--text-muted)">inventory_2</span>
            <p style="margin-top:6px;font-size:13px">No stock or equipment usage logged by ${student.name} yet.</p>
          </div>
        ` : `
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="border-bottom:1px solid var(--border-color);background:var(--bg-base);text-align:left">
                <th style="padding:10px 16px;font-size:12px;color:var(--text-secondary)">Item</th>
                <th style="padding:10px 16px;font-size:12px;color:var(--text-secondary)">Action / Type</th>
                <th style="padding:10px 16px;font-size:12px;color:var(--text-secondary)">Quantity</th>
                <th style="padding:10px 16px;font-size:12px;color:var(--text-secondary)">Date</th>
                <th style="padding:10px 16px;font-size:12px;color:var(--text-secondary)">Notes / Reason</th>
              </tr>
            </thead>
            <tbody>
              ${studentUsage.map(h => `
                <tr style="border-bottom:1px solid var(--border-color)">
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:var(--text-primary)">${h.item}</td>
                  <td style="padding:12px 16px;font-size:13px"><span class="badge badge-warning">${h.action || 'usage'}</span></td>
                  <td style="padding:12px 16px;font-size:13px;font-weight:700;color:var(--primary-bright)">${Math.abs(h.quantity || 1)} ${h.unit || 'pcs'}</td>
                  <td style="padding:12px 16px;font-size:12px;color:var(--text-secondary)">${window.AppUtils.formatDate(h.date)}</td>
                  <td style="padding:12px 16px;font-size:12px;color:var(--text-secondary)">${h.reason || '--'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>

    <div class="card animate-in-2">
      <div class="card-header" style="display:flex;justify-content:space-between;align-items:center">
        <div class="card-title">Logged Daily Activities (${studentActivities.length})</div>
      </div>
      <div class="card-body" style="padding:0;max-height:300px;overflow-y:auto">
        ${studentActivities.length === 0 ? `
          <div style="text-align:center;padding:32px 20px;color:var(--text-secondary)">
            <span class="material-icons-round" style="font-size:32px;color:var(--text-muted)">science</span>
            <p style="margin-top:6px;font-size:13px">No daily experiment activities submitted by ${student.name} yet.</p>
          </div>
        ` : `
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="border-bottom:1px solid var(--border-color);background:var(--bg-base);text-align:left">
                <th style="padding:10px 16px;font-size:12px;color:var(--text-secondary)">Experiment Title</th>
                <th style="padding:10px 16px;font-size:12px;color:var(--text-secondary)">Chemicals Used</th>
                <th style="padding:10px 16px;font-size:12px;color:var(--text-secondary)">Equipment Used</th>
                <th style="padding:10px 16px;font-size:12px;color:var(--text-secondary)">Date</th>
                <th style="padding:10px 16px;font-size:12px;color:var(--text-secondary)">Status</th>
              </tr>
            </thead>
            <tbody>
              ${studentActivities.map(a => `
                <tr style="border-bottom:1px solid var(--border-color)">
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:var(--text-primary)">
                    <div>${a.experiment || a.title || 'Lab Activity'}</div>
                    <div style="font-size:11px;color:var(--text-secondary)">${a.notes || ''}</div>
                  </td>
                  <td style="padding:12px 16px;font-size:12px">
                    ${Array.isArray(a.chemicals) ? a.chemicals.map(c=>`<span class="badge badge-primary" style="margin:2px;font-size:11px">${c}</span>`).join('') : (a.chemicals || '--')}
                  </td>
                  <td style="padding:12px 16px;font-size:12px">
                    ${Array.isArray(a.equipment) ? a.equipment.map(e=>`<span class="badge badge-info" style="margin:2px;font-size:11px">${e}</span>`).join('') : (a.equipment || '--')}
                  </td>
                  <td style="padding:12px 16px;font-size:12px;color:var(--text-secondary)">${window.AppUtils.formatDate(a.date)}</td>
                  <td style="padding:12px 16px;font-size:12px"><span class="badge badge-${window.AppUtils.getStatusColor(a.status || 'completed')}">${a.status || 'completed'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  </div>`;
};

window.Screens['student-performance'].deleteStudent = async function(studentId) {
  if (confirm("Are you sure you want to delete this student and all their records?")) {
    const idx = window.AppData.students.findIndex(s => s.id === studentId);
    if (idx !== -1) {
      const student = window.AppData.students[idx];
      try {
        await window.fetchAPI('student.php?action=delete&roll=' + encodeURIComponent(student.rollNo || student.id));
      } catch(e) {}
      window.AppData.students.splice(idx, 1);
      window.Components.toast(`Student ${student.name} deleted successfully.`, 'success');
      window.Router.navigate('student-monitoring');
    }
  }
};

window.Screens['student-performance'].updateStatus = function(studentId, newStatus) {
  const student = window.AppData.students.find(s => s.id === studentId);
  if (student) {
    student.status = newStatus;
    window.Components.toast(`Status updated to ${newStatus}`, 'success');
    window.Router.render();
  }
};

window.Screens['student-performance'].afterRender = function() {
  document.getElementById('topbar-title') && (document.getElementById('topbar-title').textContent = 'Student Performance');
};

// ---- ATTENDANCE ----
window.Screens['labhead-attendance'] = function() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  
  // Default to today's date
  let activeDate = window.Screens['labhead-attendance'].selectedDate || todayStr;
  
  window.Screens['labhead-attendance'].getOrCreateAtt = function(dateStr) {
    window.AppData.attendance = window.AppData.attendance || [];
    let attObj = window.AppData.attendance.find(a => a.date === dateStr);
    if (!attObj) {
      attObj = {
        date: dateStr,
        students: (window.AppData.students || []).map(s => ({
          id: s.id,
          name: s.name,
          rollNo: s.rollNo,
          status: 'absent',
          timeIn: null,
          timeOut: null
        }))
      };
      window.AppData.attendance.push(attObj);
    } else {
      (window.AppData.students || []).forEach(s => {
        if (!attObj.students.some(x => (x.rollNo && s.rollNo && x.rollNo.toLowerCase() === s.rollNo.toLowerCase()) || (x.name && s.name && x.name.toLowerCase() === s.name.toLowerCase()))) {
          attObj.students.push({
            id: s.id || Date.now(),
            name: s.name,
            rollNo: s.rollNo,
            status: 'absent',
            timeIn: null,
            timeOut: null
          });
        }
      });
    }
    return attObj;
  };

  let att = window.Screens['labhead-attendance'].getOrCreateAtt(activeDate);
  let displayStudents = (att.students || []).map(s => ({
    id: s.id,
    name: s.name,
    rollNo: s.rollNo,
    status: s.status || 'absent',
    timeIn: s.timeIn || null,
    timeOut: s.timeOut || null
  }));
  
  const present = displayStudents.filter(s=>s.status==='present').length;
  const absent = displayStudents.filter(s=>s.status==='absent').length;
  const late = displayStudents.filter(s=>s.status==='late').length;
  
  const studentsToSelect = window.AppData.students;
  const isCurrentDate = (activeDate === todayStr);
  
  return `
  <div>
    ${window.Components.pageHeader('Attendance Management','Track daily student attendance','',
      isCurrentDate ? `
      <div style="display:flex;gap:10px">
        <button class="btn btn-outline btn-sm" onclick="window.Screens['labhead-attendance'].openManualModal()"><span class="material-icons-round">add</span> Add Student Manually</button>
        <button class="btn btn-primary btn-sm" onclick="window.Screens['labhead-attendance'].startScanner()"><span class="material-icons-round">qr_code_scanner</span> Scan QR</button>
      </div>` : `<span class="badge badge-primary" style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;font-size:12px;font-weight:600"><span class="material-icons-round" style="font-size:16px">lock</span> View Only Mode</span>`)}
    
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;background:var(--bg-card);padding:12px 20px;border-radius:var(--border-radius);border:1px solid var(--border-color)">
      <div style="display:flex;align-items:center;gap:12px">
        <span class="material-icons-round" style="color:var(--text-secondary)">calendar_today</span>
        <input type="date" class="form-input" id="attendance-date-picker" style="background:transparent;border:none;padding:0;width:130px;font-weight:600;color:var(--text-primary)" value="${activeDate}" onchange="window.Screens['labhead-attendance'].changeDate(this.value)">
      </div>
      <div style="display:flex;gap:16px">
        <div style="text-align:center"><div style="font-size:18px;font-weight:800;color:var(--success)">${present}</div><div style="font-size:10px;color:var(--text-muted)">Present</div></div>
        <div style="text-align:center"><div style="font-size:18px;font-weight:800;color:var(--warning)">${late}</div><div style="font-size:10px;color:var(--text-muted)">Late</div></div>
        <div style="text-align:center"><div style="font-size:18px;font-weight:800;color:var(--danger)">${absent}</div><div style="font-size:10px;color:var(--text-muted)">Absent</div></div>
      </div>
    </div>

    <div class="card animate-in-2">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Status</th>
              <th>Time In</th>
              <th>Time Out</th>
              ${isCurrentDate ? '<th>Actions</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${displayStudents.map(s=>`
              <tr>
                <td><div style="display:flex;align-items:center;gap:10px">${window.Components.avatar(s.name.split(' ').map(n=>n[0]).join(''),'sm')}<div class="td-label">${s.name}</div></div></td>
                <td><span class="badge badge-${window.AppUtils.getStatusColor(s.status)}">${s.status}</span></td>
                <td><input type="time" class="form-input" style="width:110px;padding:6px;font-size:12px;font-family:monospace;background:transparent;border:1px solid var(--border-color)" value="${s.timeIn||''}" ${!isCurrentDate?'disabled':''} onchange="window.Screens['labhead-attendance'].updateTime('${(s.rollNo || s.id || '').toString()}', 'in', this.value)"></td>
                <td><input type="time" class="form-input" style="width:110px;padding:6px;font-size:12px;font-family:monospace;background:transparent;border:1px solid var(--border-color)" value="${s.timeOut||''}" ${!isCurrentDate?'disabled':''} onchange="window.Screens['labhead-attendance'].updateTime('${(s.rollNo || s.id || '').toString()}', 'out', this.value)"></td>
                ${isCurrentDate ? `
                <td>
                  <select class="form-input form-select" style="width:110px;padding:6px 28px 6px 10px;font-size:12px" onchange="window.Screens['labhead-attendance'].updateStatus('${(s.rollNo || s.id || '').toString()}', this.value)">
                    <option value="present" ${s.status==='present'?'selected':''}>Present</option>
                    <option value="absent" ${s.status==='absent'?'selected':''}>Absent</option>
                    <option value="late" ${s.status==='late'?'selected':''}>Late</option>
                  </select>
                </td>` : ''}
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    ${window.Components.modal('mark-attendance-modal','Scan QR / Attendance Scanner','')}

    ${window.Components.modal('manual-attendance-modal','Add Student Manually',`
      <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border-color);padding:14px;border-radius:8px;margin-bottom:18px">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" id="manual-student-name" class="form-input" placeholder="e.g. Rahul Verma">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Roll Number / ID</label>
            <input type="text" id="manual-student-roll" class="form-input" placeholder="e.g. MB2024015">
          </div>
          <div class="form-group">
            <label class="form-label">Year</label>
            <select id="manual-student-year" class="form-input form-select">
              <option>1st Year</option>
              <option>2nd Year</option>
              <option selected>3rd Year</option>
              <option>4th Year</option>
            </select>
          </div>
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label class="form-label">Email Address</label>
          <input type="email" id="manual-student-email" class="form-input" placeholder="e.g. rahul@smartstock.in">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Attendance Status</label>
          <select id="manual-student-status" class="form-input form-select" onchange="window.Screens['labhead-attendance'].onManualStatusChange(this.value)">
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Check-in Time</label>
          <input type="text" id="manual-time-in" class="form-input" value="09:00">
        </div>
      </div>
      <div class="form-group" style="margin-bottom:0">
        <label class="form-label">Check-out Time</label>
        <input type="text" id="manual-time-out" class="form-input" value="17:00">
      </div>
    `, `
      <button class="btn btn-ghost" onclick="window.Components.closeModal('manual-attendance-modal')">Cancel</button>
      <button class="btn btn-primary" onclick="window.Screens['labhead-attendance'].submitManualAttendance()">Add to Attendance</button>
    `)}
  </div>`;
};

window.Screens['labhead-attendance'].changeDate = function(val) {
  window.Screens['labhead-attendance'].selectedDate = val;
  let att = window.AppData.attendance.find(a => a.date === val);
  if (!att) {
    const list = window.AppData.students.map(s => ({
      id: s.id,
      name: s.name,
      status: 'absent',
      timeIn: null,
      timeOut: null
    }));
    window.AppData.attendance.push({ date: val, students: list });
  }
  window.Router.render();
};

window.Screens['labhead-attendance'].updateStatus = async function(identifier, newStatus) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const activeDate = window.Screens['labhead-attendance'].selectedDate || todayStr;
  
  if (activeDate !== todayStr) {
    window.Components.toast("Historical records cannot be modified.", "error");
    return;
  }

  let att = window.Screens['labhead-attendance'].getOrCreateAtt(activeDate);
  if (!att || !att.students) return;

  let existing = att.students.find(x => x.id == identifier || (x.rollNo && identifier && String(x.rollNo).toLowerCase() === String(identifier).toLowerCase()) || (x.name && identifier && String(x.name).toLowerCase() === String(identifier).toLowerCase()));
  let student = (window.AppData.students || []).find(s => s.id == identifier || (s.rollNo && identifier && String(s.rollNo).toLowerCase() === String(identifier).toLowerCase()) || (s.name && identifier && String(s.name).toLowerCase() === String(identifier).toLowerCase()));

  if (!existing && !student) {
    window.Components.toast("Student record not found", "error");
    return;
  }

  const status = newStatus.toLowerCase();
  
  if (existing) {
    existing.status = status;
    if (status === 'absent') {
      existing.timeIn = "";
      existing.timeOut = "";
    } else if (!existing.timeIn && status === 'present') {
      const now = new Date();
      existing.timeIn = now.toTimeString().substring(0, 5);
    } else if (!existing.timeIn && status === 'late') {
      existing.timeIn = '10:30';
      existing.timeOut = '16:00';
    }
  } else if (student) {
    existing = {
      id: student.id || Date.now(),
      name: student.name,
      rollNo: student.rollNo,
      status: status,
      timeIn: status === 'present' ? new Date().toTimeString().substring(0, 5) : (status === 'late' ? '10:30' : null),
      timeOut: status === 'late' ? '16:00' : null
    };
    att.students.push(existing);
  }

  const fullRecords = att.students.map(s => ({
    roll_no: s.rollNo,
    name: s.name,
    status: s.status || 'absent',
    time_in: s.timeIn || null,
    time_out: s.timeOut || null
  }));

  const res = await window.fetchAPI('attendance.php?action=submit_list', {
    method: 'POST',
    body: {
      date: activeDate,
      records: fullRecords
    }
  });

  const targetName = existing?.name || student?.name || 'Student';
  if (res.success) {
    window.Components.toast(`Attendance updated for ${targetName}`, 'success');
    if (window.AppActions && window.AppActions.syncData) {
      await window.AppActions.syncData();
    }
    window.Router.render();
  } else {
    window.Components.toast(res.message || 'Failed to update attendance', 'danger');
  }
};

window.Screens['labhead-attendance'].updateTime = async function(identifier, type, newTime) {
  const activeDate = window.Screens['labhead-attendance'].selectedDate || new Date().toISOString().split('T')[0];
  
  let att = window.Screens['labhead-attendance'].getOrCreateAtt(activeDate);
  if (!att || !att.students) return;
  
  let existing = att.students.find(x => x.id == identifier || (x.rollNo && identifier && String(x.rollNo).toLowerCase() === String(identifier).toLowerCase()) || (x.name && identifier && String(x.name).toLowerCase() === String(identifier).toLowerCase()));
  let student = (window.AppData.students || []).find(s => s.id == identifier || (s.rollNo && identifier && String(s.rollNo).toLowerCase() === String(identifier).toLowerCase()) || (s.name && identifier && String(s.name).toLowerCase() === String(identifier).toLowerCase()));

  if (!existing && !student) return;

  if (existing) {
    if (type === 'in') existing.timeIn = newTime;
    if (type === 'out') existing.timeOut = newTime;
    
    // Automatically change status to present if setting time while absent
    if (existing.status === 'absent' && newTime && newTime !== '--:--') {
      existing.status = 'present';
    }
  }

  const fullRecords = att.students.map(s => ({
    roll_no: s.rollNo,
    name: s.name,
    status: s.status || 'absent',
    time_in: s.timeIn || null,
    time_out: s.timeOut || null
  }));

  const res = await window.fetchAPI('attendance.php?action=submit_list', {
    method: 'POST',
    body: {
      date: activeDate,
      records: fullRecords
    }
  });

  const targetName = existing?.name || student?.name || 'Student';
  if (res.success) {
    window.Components.toast(`Time updated for ${targetName}`, 'success');
    if (window.AppActions && window.AppActions.syncData) {
      await window.AppActions.syncData();
    }
    window.Router.render();
  } else {
    window.Components.toast(res.message || 'Failed to update time', 'danger');
  }
};

window.Screens['labhead-attendance'].startScanner = function() {
  window.Components.showModal('mark-attendance-modal');
  
  const modalBody = document.querySelector('#mark-attendance-modal .modal-body');
  if (!modalBody) return;
  
  modalBody.innerHTML = `
    <div style="text-align:center;padding:10px 0">
      <div id="qr-reader-container" style="position:relative;width:100%;max-width:360px;margin:0 auto;border-radius:12px;overflow:hidden;border:1px solid var(--border-color);background:var(--bg-input)">
        <div id="qr-reader" style="width:100%;min-height:220px;display:flex;align-items:center;justify-content:center">
          <div id="qr-loading-placeholder" style="padding:20px;color:var(--text-secondary);font-size:13px">
            <div class="spinner" style="margin-bottom:10px"></div>
            Detecting camera devices...
          </div>
        </div>
        <div class="qr-scanner-line" style="z-index:10;pointer-events:none"></div>
      </div>
      
      <div style="margin-top:16px;display:flex;flex-direction:column;gap:12px;align-items:center">
        <div class="form-group" style="width:100%;max-width:320px;text-align:left;margin-bottom:0">
          <label class="form-label" style="font-size:11px">Camera Source</label>
          <select id="qr-camera-select" class="form-input form-select" style="font-size:12px;padding:8px 36px 8px 12px;height:auto">
            <option value="">Detecting cameras...</option>
          </select>
        </div>
        
        <div style="display:flex;gap:10px;width:100%;max-width:320px">
          <label class="btn btn-outline btn-sm" style="flex:1;justify-content:center;margin:0;cursor:pointer">
            <span class="material-icons-round">image</span> Upload Picture
            <input type="file" id="qr-file-input" accept="image/*" style="display:none">
          </label>
          <button class="btn btn-ghost btn-sm" style="flex:1;justify-content:center" onclick="window.Screens['labhead-attendance'].simulateScan()">
            <span class="material-icons-round">bolt</span> Simulate Scan
          </button>
        </div>
      </div>
    </div>
  `;

  const modalFooter = document.querySelector('#mark-attendance-modal .modal-footer');
  if (modalFooter) {
    modalFooter.innerHTML = `
      <button class="btn btn-ghost" onclick="window.Screens['labhead-attendance'].stopScanner();window.Components.closeModal('mark-attendance-modal')">Close Scanner</button>
    `;
  }

  const closeButton = document.querySelector('#mark-attendance-modal .modal-close');
  if (closeButton) {
    closeButton.setAttribute('onclick', "window.Screens['labhead-attendance'].stopScanner();window.Components.closeModal('mark-attendance-modal')");
  }

  if (typeof Html5Qrcode === 'undefined') {
    document.getElementById('qr-reader').innerHTML = `
      <div style="padding:40px 20px;color:var(--text-secondary);font-size:12px">
        <span class="material-icons-round" style="font-size:40px;color:var(--danger)">warning</span>
        <p style="margin-top:8px">Scanner library failed to load.</p>
        <p style="font-size:10px;color:var(--text-muted)">Please reload the page or check network connection.</p>
      </div>`;
    return;
  }

  const html5QrCode = new Html5Qrcode("qr-reader");
  window.Screens['labhead-attendance'].scannerInstance = html5QrCode;

  const fileInput = document.getElementById('qr-file-input');
  if (fileInput) {
    fileInput.addEventListener('change', e => {
      if (e.target.files.length === 0) return;
      const file = e.target.files[0];
      
      // Use our custom, taint-safe, and robust scanPictureFile function!
      window.Screens['labhead-attendance'].scanPictureFile(file)
        .then(decodedText => {
          window.Screens['labhead-attendance'].onScanSuccess(decodedText);
        })
        .catch(err => {
          console.error(err);
          window.Components.toast("No valid QR code found in the picture", "error");
        });
    });
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    const select = document.getElementById('qr-camera-select');
    if (select) select.innerHTML = `<option value="">Browser block / Not secure</option>`;
    document.getElementById('qr-reader').innerHTML = `
      <div style="padding:30px 20px;color:var(--text-secondary);font-size:12px">
        <span class="material-icons-round" style="font-size:40px;color:var(--warning)">security</span>
        <p style="margin-top:8px;font-weight:600">Webcam disabled by browser</p>
        <p style="font-size:11px;color:var(--text-muted);margin-top:4px">Webcams require HTTPS or localhost. Since you are running locally on file:// or HTTP, please use **Upload Picture** or **Simulate Scan** fallbacks.</p>
      </div>`;
    return;
  }

  const startScanning = (cameraConstraintOrId) => {
    const config = { fps: 15, qrbox: { width: 220, height: 220 } };
    
    // Clear any previous error messages/placeholders in qr-reader
    const readerContainer = document.getElementById('qr-reader');
    if (readerContainer && !html5QrCode.isScanning) {
      readerContainer.innerHTML = `
        <div id="qr-loading-placeholder" style="padding:20px;color:var(--text-secondary);font-size:13px">
          <div class="spinner" style="margin-bottom:10px"></div>
          Starting camera stream...
        </div>`;
    }
    
    html5QrCode.start(
      cameraConstraintOrId,
      config,
      (decodedText) => {
        window.Screens['labhead-attendance'].onScanSuccess(decodedText);
      },
      (errorMessage) => {}
    ).then(() => {
      // Camera started successfully! Now fetch camera devices to populate dropdown.
      Html5Qrcode.getCameras().then(cameras => {
        const select = document.getElementById('qr-camera-select');
        if (!select) return;
        
        if (cameras && cameras.length > 0) {
          select.innerHTML = cameras.map((cam) => {
            const isSelected = (cam.id === cameraConstraintOrId) || 
                               (typeof cameraConstraintOrId === 'object' && cam.label && cam.label.toLowerCase().includes('back')); 
            return `<option value="${cam.id}" ${isSelected ? 'selected' : ''}>${cam.label || `Camera`}</option>`;
          }).join('');
          
          select.onchange = () => {
            if (select.value) {
              if (html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                  startScanning(select.value);
                }).catch(err => {
                  startScanning(select.value);
                });
              } else {
                startScanning(select.value);
              }
            }
          };
        } else {
          select.innerHTML = `<option value="">Default Camera</option>`;
        }
      }).catch(err => {
        console.warn("Error getting cameras in then callback", err);
        const select = document.getElementById('qr-camera-select');
        if (select) select.innerHTML = `<option value="">Default Camera</option>`;
      });
    }).catch(err => {
      console.error("Camera start error", err);
      
      // Fallback: if environment camera failed, try user facing camera
      if (typeof cameraConstraintOrId === 'object' && cameraConstraintOrId.facingMode === 'environment') {
        console.log("Failed to start with environment camera, trying user facing camera...");
        startScanning({ facingMode: "user" });
        return;
      }
      
      // Real error (e.g. user denied permission)
      const select = document.getElementById('qr-camera-select');
      if (select) select.innerHTML = `<option value="">Permission denied</option>`;
      document.getElementById('qr-reader').innerHTML = `
        <div style="padding:40px 20px;color:var(--text-secondary);font-size:12px">
          <span class="material-icons-round" style="font-size:40px;color:var(--danger)">block</span>
          <p style="margin-top:8px">Camera access permission denied / failed.</p>
          <p style="font-size:10px;color:var(--text-muted)">Please upload a QR picture or use simulator.</p>
        </div>`;
    });
  };

  try {
    // Start scanning using the environment (rear) camera by default.
    startScanning({ facingMode: "environment" });
  } catch(syncErr) {
    console.error("Camera scan sync start error", syncErr);
    const select = document.getElementById('qr-camera-select');
    if (select) select.innerHTML = `<option value="">Error initializing camera</option>`;
    document.getElementById('qr-reader').innerHTML = `
      <div style="padding:40px 20px;color:var(--text-secondary);font-size:12px">
        <span class="material-icons-round" style="font-size:40px;color:var(--danger)">error_outline</span>
        <p style="margin-top:8px">Camera initialization error.</p>
        <p style="font-size:10px;color:var(--text-muted)">Please use upload picture or simulator.</p>
      </div>`;
  }
};

window.Screens['labhead-attendance'].stopScanner = function() {
  const html5QrCode = window.Screens['labhead-attendance'].scannerInstance;
  if (html5QrCode) {
    if (html5QrCode.isScanning) {
      html5QrCode.stop().then(() => {
        console.log("Scanner stopped");
      }).catch(err => {
        console.error("Error stopping scanner", err);
      });
    }
  }
  window.Screens['labhead-attendance'].scannerInstance = null;
};

window.Screens['labhead-attendance'].scanPictureFile = function(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        try {
          // Create canvas and draw the loaded image Same-Origin
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          // Attempt decoding using html5QrCode's decoder first
          const scannerInstance = window.Screens['labhead-attendance'].scannerInstance;
          if (scannerInstance && scannerInstance.qrcode) {
            const decoder = scannerInstance.qrcode;
            const decodeFn = decoder.decodeRobustlyAsync || decoder.decodeAsync;
            if (decodeFn) {
              decodeFn.call(decoder, canvas)
                .then(result => {
                  const decodedText = result.text || result.decodedText || (typeof result === 'string' ? result : '');
                  if (decodedText) {
                    resolve(decodedText);
                  } else {
                    reject(new Error("No QR code found in image"));
                  }
                })
                .catch(err => {
                  // Fallback to native BarcodeDetector
                  detectWithBarcodeDetector(canvas, resolve, reject, err);
                });
            } else {
              detectWithBarcodeDetector(canvas, resolve, reject, new Error("Decoder function not found"));
            }
          } else {
            detectWithBarcodeDetector(canvas, resolve, reject, new Error("Scanner not initialized"));
          }
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = function() {
        reject(new Error("Failed to load image"));
      };
      img.src = event.target.result;
    };
    reader.onerror = function() {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });

  function detectWithBarcodeDetector(canvas, resolve, reject, originalErr) {
    if ('BarcodeDetector' in window) {
      const barcodeDetector = new BarcodeDetector({ formats: ['qr_code'] });
      barcodeDetector.detect(canvas)
        .then(barcodes => {
          if (barcodes.length > 0 && barcodes[0].rawValue) {
            resolve(barcodes[0].rawValue);
          } else {
            reject(originalErr || new Error("No QR code found"));
          }
        })
        .catch(err => {
          reject(originalErr || err);
        });
    } else {
      reject(originalErr || new Error("No QR code found"));
    }
  }
};

window.Screens['labhead-attendance'].onScanSuccess = async function(decodedText) {
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.connect(gain);
    gain.connect(context.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.1, context.currentTime);
    osc.start();
    osc.stop(context.currentTime + 0.12);
  } catch (e) {}

  let text = decodedText.trim();
  try {
    // Try parsing JSON if student scanned their full profile JSON
    const data = JSON.parse(text);
    text = data.rollNo || data.roll || text;
  } catch(e) {}

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const activeDate = window.Screens['labhead-attendance'].selectedDate || todayStr;
  
  if (activeDate !== todayStr) {
    window.Components.toast("Historical records cannot be modified.", "error");
    return;
  }

  const student = window.AppData.students.find(s => s.rollNo === text || s.id.toString() === text);
  if (!student) {
    window.Components.toast(`Student not found for QR: "${text}"`, 'error');
    window.Screens['labhead-attendance'].stopScanner();
    window.Components.closeModal('mark-attendance-modal');
    return;
  }

  let att = window.Screens['labhead-attendance'].getOrCreateAtt(activeDate);

  let existing = att.students.find(x => x.rollNo === student.rollNo || x.name === student.name);
  if (existing) {
    const nowStr = new Date().toTimeString().substring(0, 5);
    existing.status = 'present';
    if (!existing.timeIn) {
      existing.timeIn = nowStr;
    } else {
      existing.timeOut = nowStr;
    }
  }

  const fullRecords = att.students.map(s => ({
    roll_no: s.rollNo,
    name: s.name,
    status: s.status || 'absent',
    time_in: s.timeIn || null,
    time_out: s.timeOut || null
  }));

  const res = await window.fetchAPI('attendance.php?action=submit_list', {
    method: 'POST',
    body: {
      date: activeDate,
      records: fullRecords
    }
  });

  if (res.success) {
    window.Components.toast(`Scanned: ${student.name} marked present`, 'success');
    window.Screens['labhead-attendance'].stopScanner();
    window.Components.closeModal('mark-attendance-modal');
    if (window.AppActions && window.AppActions.syncData) {
      await window.AppActions.syncData();
    }
    window.Router.render();
  } else {
    window.Components.toast(res.message || `Failed to check in: "${text}"`, 'error');
  }
};

window.Screens['labhead-attendance'].simulateScan = function() {
  const selectHtml = `
    <div style="padding: 20px; background: var(--bg-card); border-radius: 8px; margin: 10px;">
      <div class="form-group" style="text-align:left">
        <label class="form-label" style="font-size:12px">Select Student to Simulate</label>
        <select id="simulate-student-select" class="form-input form-select" style="font-size:13px">
          ${window.AppData.students.map(s => `<option value="${s.rollNo}">${s.name} (${s.rollNo})</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-primary w-full" style="justify-content:center" onclick="const roll = document.getElementById('simulate-student-select').value; window.Screens['labhead-attendance'].onScanSuccess(roll)">Perform Simulated Scan</button>
    </div>
  `;
  const container = document.getElementById('qr-reader');
  if (container) {
    container.innerHTML = selectHtml;
  }
};

window.Screens['labhead-attendance'].openManualModal = function() {
  window.Components.showModal('manual-attendance-modal');
  const statusSelect = document.getElementById('manual-student-status');
  if (statusSelect) statusSelect.value = 'present';
  window.Screens['labhead-attendance'].onManualStatusChange('present');
  
  const nameInput = document.getElementById('manual-student-name');
  const rollInput = document.getElementById('manual-student-roll');
  const emailInput = document.getElementById('manual-student-email');
  if (nameInput) nameInput.value = '';
  if (rollInput) rollInput.value = '';
  if (emailInput) emailInput.value = '';
};

window.Screens['labhead-attendance'].onManualStatusChange = function(status) {
  const timeInInput = document.getElementById('manual-time-in');
  const timeOutInput = document.getElementById('manual-time-out');
  if (!timeInInput || !timeOutInput) return;
  
  if (status === 'present') {
    timeInInput.value = '09:00';
    timeOutInput.value = '17:00';
  } else if (status === 'late') {
    timeInInput.value = '10:30';
    timeOutInput.value = '16:00';
  } else {
    timeInInput.value = '--:--';
    timeOutInput.value = '--:--';
  }
};

window.Screens['labhead-attendance'].submitManualAttendance = async function() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const activeDate = window.Screens['labhead-attendance'].selectedDate || todayStr;
  
  if (activeDate !== todayStr) {
    window.Components.toast("Historical records cannot be modified.", "error");
    return;
  }

  const status = document.getElementById('manual-student-status').value;
  const timeIn = document.getElementById('manual-time-in').value;
  const timeOut = document.getElementById('manual-time-out').value;

  const nameVal = document.getElementById('manual-student-name').value.trim();
  const rollVal = document.getElementById('manual-student-roll').value.trim();
  const yearVal = document.getElementById('manual-student-year')?.value || '3rd Year';
  const emailVal = document.getElementById('manual-student-email').value.trim() || `${rollVal.toLowerCase()}@lab.in`;

  if (!nameVal || !rollVal) {
    window.Components.toast('Please enter both student name and roll number/ID', 'warning');
    return;
  }

  const submitBtn = document.querySelector('button[onclick="window.Screens[\'labhead-attendance\'].submitManualAttendance()"]');
  if (submitBtn) submitBtn.disabled = true;

  // Check if student already in local AppData
  let student = (window.AppData.students || []).find(s => (s.rollNo && s.rollNo.toLowerCase() === rollVal.toLowerCase()) || (s.name && s.name.toLowerCase() === nameVal.toLowerCase()));
  if (!student) {
    // Register new student in database if not already found
    await window.fetchAPI('auth/register.php', {
      method: 'POST',
      body: {
        user_code: rollVal,
        full_name: nameVal,
        email: emailVal,
        password: 'password123',
        role: 'student',
        roll_no: rollVal,
        year: yearVal,
        lab: window.AppState?.selectedLab || 'Microbiology Lab',
        department: 'Microbiology'
      }
    });
    student = {
      id: Date.now(),
      name: nameVal,
      rollNo: rollVal,
      year: yearVal,
      email: emailVal
    };
    window.AppData.students = window.AppData.students || [];
    window.AppData.students.push(student);
  }

  let att = window.Screens['labhead-attendance'].getOrCreateAtt(activeDate);

  let existing = att.students.find(x => (x.rollNo && x.rollNo.toLowerCase() === rollVal.toLowerCase()) || (x.name && x.name.toLowerCase() === nameVal.toLowerCase()));
  if (existing) {
    existing.status = status;
    existing.timeIn = timeIn !== '--:--' ? timeIn : null;
    existing.timeOut = timeOut !== '--:--' ? timeOut : null;
  } else {
    att.students.push({
      id: student.id || Date.now(),
      name: nameVal,
      rollNo: rollVal,
      status: status,
      timeIn: timeIn !== '--:--' ? timeIn : null,
      timeOut: timeOut !== '--:--' ? timeOut : null
    });
  }

  const fullRecords = att.students.map(s => ({
    roll_no: s.rollNo,
    name: s.name,
    status: s.status || 'absent',
    time_in: s.timeIn || null,
    time_out: s.timeOut || null
  }));

  const res = await window.fetchAPI('attendance.php?action=submit_list', {
    method: 'POST',
    body: {
      date: activeDate,
      records: fullRecords
    }
  });

  if (submitBtn) submitBtn.disabled = false;

  if (res.success) {
    window.Components.toast(`Attendance updated for ${nameVal}`, 'success');
    window.Components.closeModal('manual-attendance-modal');
    if (window.AppActions && window.AppActions.syncData) {
      await window.AppActions.syncData();
    }
    window.Router.render();
  } else {
    window.Components.toast(res.message || 'Failed to save attendance', 'danger');
  }
};

// ---- TASK MANAGEMENT ----
window.Screens['task-management'] = function() {
  const activeFilter = window.Screens['task-management'].activeFilter || 'all';
  const labName = window.AppState?.selectedLab || window.AppState?.user?.lab || 'Microbiology Lab';
  const filteredTasks = window.AppData.tasks.filter(t => (!t.lab || t.lab.toLowerCase() === labName.toLowerCase() || labName.toLowerCase().includes(t.lab.toLowerCase())) && (activeFilter === 'all' || t.status === activeFilter));
  
  return `
  <div>
    ${window.Components.pageHeader('Task Management','Assign and track student tasks','',
      `<button class="btn btn-primary btn-sm" onclick="window.Components.showModal('add-task-modal')"><span class="material-icons-round">add</span> Assign Task</button>`)}
    <div class="filter-bar mb-20">
      <button class="filter-chip ${activeFilter === 'all' ? 'active' : ''}" onclick="window.Screens['task-management'].setFilter('all')">All</button>
      <button class="filter-chip ${activeFilter === 'pending' ? 'active' : ''}" onclick="window.Screens['task-management'].setFilter('pending')">Pending</button>
      <button class="filter-chip ${activeFilter === 'in-progress' ? 'active' : ''}" onclick="window.Screens['task-management'].setFilter('in-progress')">In Progress</button>
      <button class="filter-chip ${activeFilter === 'completed' ? 'active' : ''}" onclick="window.Screens['task-management'].setFilter('completed')">Completed</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px">
      ${filteredTasks.length === 0 ? `
        <div class="card" style="padding:40px 20px;text-align:center;color:var(--text-secondary)">
          <span class="material-icons-round" style="font-size:48px;color:var(--text-muted);margin-bottom:12px">assignment_turned_in</span>
          <div>No tasks found in this category.</div>
        </div>
      ` : filteredTasks.map(t=>`
        <div class="card" style="border-left:3px solid var(--${window.AppUtils.getPriorityColor(t.priority)})">
          <div class="card-body" style="padding:16px 20px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <div style="font-weight:700;font-size:15px;color:var(--text-primary)">${t.title}</div>
              <span class="badge badge-${window.AppUtils.getStatusColor(t.status)}">${t.status.replace('-',' ')}</span>
            </div>
            <div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;line-height:1.5">${t.description}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--border-color);padding-top:12px">
              <div style="display:flex;align-items:center;gap:12px">
                <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)">
                  <span class="material-icons-round" style="font-size:14px">person</span> ${t.assignedTo}
                </div>
                <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)">
                  <span class="material-icons-round" style="font-size:14px;color:${window.AppUtils.daysUntil(t.dueDate)<3?'var(--danger)':''}">event</span> 
                  <span style="color:${window.AppUtils.daysUntil(t.dueDate)<3?'var(--danger)':''}">${window.AppUtils.formatDate(t.dueDate)}</span>
                </div>
              </div>
              <button class="btn btn-ghost btn-sm" onclick="window.Screens['task-management'].openTaskActions(${t.id})"><span class="material-icons-round" style="font-size:16px">more_horiz</span></button>
            </div>
          </div>
        </div>`).join('')}
    </div>

    ${window.Components.modal('add-task-modal','Assign New Task',`
      <div class="form-group"><label class="form-label">Task Title</label><input type="text" id="task-title-input" class="form-input" placeholder="e.g. Media Preparation"></div>
      <div class="form-group"><label class="form-label">Assign To</label><select id="task-assignee-input" class="form-input form-select">${window.AppData.students.map(s=>`<option>${s.name}</option>`).join('')}</select></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Due Date</label><input type="date" id="task-duedate-input" class="form-input"></div>
        <div class="form-group"><label class="form-label">Priority</label><select id="task-priority-input" class="form-input form-select"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
      </div>
      <div class="form-group"><label class="form-label">Description</label><textarea id="task-desc-input" class="form-input form-textarea" placeholder="Detailed instructions..."></textarea></div>
    `,`
      <button class="btn btn-ghost" onclick="window.Components.closeModal('add-task-modal')">Cancel</button>
      <button class="btn btn-primary" onclick="window.Screens['task-management'].submitTask()">Assign Task</button>
    `)}

    ${window.Components.modal('task-actions-modal','Task Actions',`
      <input type="hidden" id="action-task-id">
      <div class="form-group">
        <label class="form-label">Task Status</label>
        <select id="action-task-status" class="form-input form-select">
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div style="margin-top:20px;border-top:1px solid var(--border-color);padding-top:16px;display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:12px;color:var(--text-secondary)">Danger Zone:</span>
        <button class="btn btn-outline" style="border-color:var(--danger);color:var(--danger)" onclick="window.Screens['task-management'].deleteTask()"><span class="material-icons-round" style="font-size:16px">delete</span> Delete Task</button>
      </div>
    `,`
      <button class="btn btn-ghost" onclick="window.Components.closeModal('task-actions-modal')">Cancel</button>
      <button class="btn btn-primary" onclick="window.Screens['task-management'].saveTaskStatus()">Save Changes</button>
    `)}
  </div>`;
};

window.Screens['task-management'].activeFilter = 'all';

window.Screens['task-management'].setFilter = function(filter) {
  window.Screens['task-management'].activeFilter = filter;
  window.Router.render();
};

window.Screens['task-management'].submitTask = async function() {
  const title = document.getElementById('task-title-input').value.trim();
  const assignedTo = document.getElementById('task-assignee-input').value;
  const dueDate = document.getElementById('task-duedate-input').value;
  const priority = document.getElementById('task-priority-input').value;
  const description = document.getElementById('task-desc-input').value.trim();

  if (!title) {
    window.Components.toast('Please enter a task title', 'error');
    return;
  }
  if (!dueDate) {
    window.Components.toast('Please select a due date', 'error');
    return;
  }

  const u = window.AppState.user || window.AppData.users.labhead || {};
  const labName = u.lab || 'Microbiology Lab';

  const res = await window.fetchAPI('tasks.php?action=create', {
    method: 'POST',
    body: {
      title,
      assigned_to: assignedTo,
      assigned_by: u.name || 'Lab Head',
      lab: labName,
      due_date: dueDate,
      priority,
      description
    }
  });

  if (res.success) {
    window.Components.closeModal('add-task-modal');
    window.Components.toast('Task assigned successfully', 'success');
    if (window.AppActions && window.AppActions.syncData) {
      await window.AppActions.syncData();
    }
    window.Router.render();
  } else {
    window.Components.toast(res.message || 'Failed to assign task', 'danger');
  }
};

window.Screens['task-management'].openTaskActions = function(taskId) {
  const task = window.AppData.tasks.find(t => t.id === taskId);
  if (task) {
    window.Components.showModal('task-actions-modal');
    const idInput = document.getElementById('action-task-id');
    const statusSelect = document.getElementById('action-task-status');
    if (idInput && statusSelect) {
      idInput.value = taskId;
      statusSelect.value = task.status;
    }
  }
};

window.Screens['task-management'].saveTaskStatus = async function() {
  const taskId = parseInt(document.getElementById('action-task-id').value);
  const status = document.getElementById('action-task-status').value;

  const res = await window.fetchAPI('tasks.php?action=update_status', {
    method: 'POST',
    body: {
      task_id: taskId,
      status: status
    }
  });

  if (res.success) {
    window.Components.closeModal('task-actions-modal');
    window.Components.toast('Task status updated successfully', 'success');
    if (window.AppActions && window.AppActions.syncData) {
      await window.AppActions.syncData();
    }
    window.Router.render();
  } else {
    window.Components.toast(res.message || 'Failed to update task status', 'danger');
  }
};

window.Screens['task-management'].deleteTask = async function() {
  const taskId = parseInt(document.getElementById('action-task-id').value);
  if (!confirm("Are you sure you want to delete this task?")) return;

  const res = await window.fetchAPI('tasks.php?action=delete', {
    method: 'POST',
    body: {
      task_id: taskId
    }
  });

  if (res.success) {
    window.Components.closeModal('task-actions-modal');
    window.Components.toast('Task deleted successfully', 'success');
    if (window.AppActions && window.AppActions.syncData) {
      await window.AppActions.syncData();
    }
    window.Router.render();
  } else {
    window.Components.toast(res.message || 'Failed to delete task', 'danger');
  }
};

// ---- APPROVAL REQUESTS ----
window.Screens['approval-requests'] = function() {
  const activeTab = window.Screens['approval-requests'].activeTab || 'pending';
  const pendingRequests = (window.AppData.approvalRequests || []).filter(r => r.status === 'pending');
  const historyRequests = (window.AppData.approvalRequests || []).filter(r => r.status !== 'pending');
  const pendingCount = pendingRequests.length;
  
  const displayRequests = activeTab === 'pending' ? pendingRequests : historyRequests;

  return `
  <div>
    ${window.Components.pageHeader('Approval Requests','Pending items requiring your authorization')}
    <div class="tab-bar mb-20">
      <div class="tab-item ${activeTab === 'pending' ? 'active' : ''}" onclick="window.Screens['approval-requests'].setTab('pending')">Pending (${pendingCount})</div>
      <div class="tab-item ${activeTab === 'history' ? 'active' : ''}" onclick="window.Screens['approval-requests'].setTab('history')">History</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px">
      ${displayRequests.length === 0 ? `
        <div class="card" style="padding:40px 20px;text-align:center;color:var(--text-secondary)">
          <span class="material-icons-round" style="font-size:48px;color:var(--text-muted);margin-bottom:12px">check_circle_outline</span>
          <div>No ${activeTab} requests found.</div>
        </div>
      ` : displayRequests.map(r=>`
        <div class="card" style="opacity:${r.status==='pending'?1:0.85}">
          <div class="card-body">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
              <div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                  <div style="font-weight:700;font-size:16px;color:var(--text-primary)">${r.title}</div>
                  <span class="badge badge-${r.urgency==='urgent'?'danger':r.urgency==='high'?'warning':'info'}">${r.urgency}</span>
                </div>
                <div style="font-size:12px;color:var(--text-secondary)">Requested by <strong>${r.requestedBy}</strong> on ${window.AppUtils.formatDate(r.date)}</div>
              </div>
              <span class="badge badge-${r.status==='approved'?'success':r.status==='pending'?'warning':'danger'}">${r.status.toUpperCase()}</span>
            </div>
            <div style="background:var(--bg-input);border-radius:var(--border-radius-sm);padding:12px;margin-bottom:16px;border:1px solid var(--border-color)">
              <div style="font-size:13px;color:var(--text-primary);margin-bottom:6px"><strong>Type:</strong> ${r.type.replace('-',' ')} · <strong>Quantity:</strong> ${r.quantity}</div>
              <div style="font-size:13px;color:var(--text-secondary);line-height:1.4">"${r.notes}"</div>
            </div>
            ${r.status==='pending' ? `
            <div style="display:flex;gap:12px;justify-content:flex-end">
              <button class="btn btn-outline" onclick="window.Screens['approval-requests'].updateStatus(${r.id}, 'rejected')"><span class="material-icons-round">close</span> Reject</button>
              <button class="btn btn-primary" onclick="window.Screens['approval-requests'].updateStatus(${r.id}, 'approved')"><span class="material-icons-round">check</span> Approve Request</button>
            </div>` : ''}
          </div>
        </div>`).join('')}
    </div>
  </div>`;
};

window.Screens['approval-requests'].activeTab = 'pending';

window.Screens['approval-requests'].setTab = function(tab) {
  window.Screens['approval-requests'].activeTab = tab;
  window.Router.render();
};

window.Screens['approval-requests'].updateStatus = async function(id, newStatus) {
  const res = await window.fetchAPI('approvals.php?action=update_status', {
    method: 'POST',
    body: {
      id: id,
      status: newStatus
    }
  });

  if (res.success) {
    if (newStatus === 'approved') {
      window.Components.toast('Request approved successfully', 'success');
    } else if (newStatus === 'rejected') {
      window.Components.toast('Request rejected', 'error');
    }
    if (window.AppActions && window.AppActions.syncData) {
      await window.AppActions.syncData();
    }
    window.Router.render();
  } else {
    window.Components.toast(res.message || 'Failed to update request status', 'danger');
  }
};
// ---- LAB ENROLLMENTS ----
window.Screens['lab-enrollments'] = function() {
  setTimeout(() => window.Screens['lab-enrollments'].fetchData(), 0);
  return `
  <div>
    <div class="page-header animate-in">
      <div>
        <h1 class="page-title">Lab Enrollments</h1>
        <p class="page-subtitle">Manage student access to the lab</p>
      </div>
    </div>
    <div id="enrollments-container">
      <div style="text-align:center;padding:40px;color:var(--text-muted)">Loading requests...</div>
    </div>
  </div>`;
};

window.Screens['lab-enrollments'].fetchData = async function() {
  const u = window.AppState.user || window.AppData.users.labhead;
  const labName = window.AppState.selectedLab || u.lab || 'Microbiology Lab';
  
  try {
    const data = await window.fetchAPI(`enrollment.php?action=list_pending&lab_name=${encodeURIComponent(labName)}`);
    const container = document.getElementById('enrollments-container');
    if (!container) return;
    
    if (data && data.success && data.requests && data.requests.length > 0) {
      window.Screens['lab-enrollments'].pendingList = data.requests;
      container.innerHTML = '<div style="display:flex;flex-direction:column;gap:16px">' + data.requests.map(r => `
        <div class="card p-16 animate-in" style="cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;border:1px solid var(--border-color)" onclick="window.Screens['lab-enrollments'].showDetails(${r.id})" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'" onmouseout="this.style.transform='none';this.style.boxShadow='none'">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="display:flex;align-items:center;gap:16px">
              <div style="width:48px;height:48px;border-radius:12px;background:rgba(21,101,192,0.1);display:flex;align-items:center;justify-content:center;color:var(--primary-bright)">
                <span class="material-icons-round" style="font-size:26px">person_add</span>
              </div>
              <div>
                <div style="font-weight:700;font-size:16px;color:var(--text-primary)">${r.student_name}</div>
                <div style="font-size:13px;color:var(--text-secondary)">Roll No: ${r.student_roll || r.student_id || 'N/A'}</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:4px">Requested: ${r.request_date || r.created_at || 'Recently'}</div>
              </div>
            </div>
            <div style="display:flex;gap:12px">
              <button class="btn btn-outline" style="color:var(--danger);border-color:var(--danger)" onclick="event.stopPropagation(); window.Screens['lab-enrollments'].updateStatus(${r.id}, 'reject')"><span class="material-icons-round">close</span> Reject</button>
              <button class="btn btn-primary" onclick="event.stopPropagation(); window.Screens['lab-enrollments'].updateStatus(${r.id}, 'approve')"><span class="material-icons-round">check</span> Approve</button>
            </div>
          </div>
        </div>
      `).join('') + '</div>';
    } else {
      container.innerHTML = '<div class="card" style="padding:40px 20px;text-align:center;color:var(--text-secondary)"><span class="material-icons-round" style="font-size:48px;color:var(--text-muted);margin-bottom:12px">task_alt</span><div>No pending requests.</div></div>';
    }
  } catch (e) {
    console.error(e);
  }
};

window.Screens['lab-enrollments'].showDetails = function(id) {
  const r = window.Screens['lab-enrollments'].pendingList.find(x => x.id === id);
  if (!r) return;
  const modalHtml = `
            <div style="font-size:14px;opacity:0.9;margin-top:2px">Enrollment Request Details</div>
          </div>
          <button onclick="document.getElementById('enrollment-modal').remove()" style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.2);border:none;color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center"><span class="material-icons-round">close</span></button>
        </div>
        <div style="padding:24px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
            <div style="background:var(--bg-secondary);padding:12px 16px;border-radius:12px;">
              <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:700">Roll Number</div>
              <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-top:4px">${r.student_roll || r.student_id || 'N/A'}</div>
            </div>
            <div style="background:var(--bg-secondary);padding:12px 16px;border-radius:12px;">
              <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:700">Status</div>
              <div style="font-size:15px;font-weight:700;color:#FF9800;margin-top:4px">Pending Review</div>
            </div>
            <div style="background:var(--bg-secondary);padding:12px 16px;border-radius:12px;">
              <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:700">Department</div>
              <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-top:4px">${r.department || 'Biotechnology'}</div>
            </div>
            <div style="background:var(--bg-secondary);padding:12px 16px;border-radius:12px;">
              <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:700">Academic Year</div>
              <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-top:4px">${r.year || '3rd Year'}</div>
            </div>
          </div>
          <div style="background:var(--bg-secondary);padding:14px 16px;border-radius:12px;margin-bottom:24px;">
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:700">Email Address</div>
            <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-top:4px">${r.email || ((r.student_roll || 'student').toLowerCase() + '@smartstock.in')}</div>
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:700;margin-top:12px">Requested Lab</div>
            <div style="font-size:14px;font-weight:600;color:var(--cyan);margin-top:4px">${r.lab_name || 'Lab'}</div>
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:700;margin-top:12px">Request Date</div>
            <div style="font-size:14px;font-weight:600;color:var(--text-secondary);margin-top:4px">${r.request_date || r.created_at || 'Recently'}</div>
          </div>
          <div style="display:flex;gap:12px;">
            <button class="btn btn-outline" style="flex:1;color:var(--danger);border-color:var(--danger);padding:12px;" onclick="document.getElementById('enrollment-modal').remove(); window.Screens['lab-enrollments'].updateStatus(${r.id}, 'reject')"><span class="material-icons-round">close</span> Reject Request</button>
            <button class="btn btn-primary" style="flex:1;padding:12px;" onclick="document.getElementById('enrollment-modal').remove(); window.Screens['lab-enrollments'].updateStatus(${r.id}, 'approve')"><span class="material-icons-round">check</span> Approve Request</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.Screens['lab-enrollments'].updateStatus = async function(id, action) {
  try {
    const data = await window.fetchAPI('enrollment.php?action=' + action, {
      method: 'POST',
      body: {id: id}
    });
    if (data && data.success) {
      window.Components.toast('Request ' + action + 'd successfully', 'success');
      window.Screens['lab-enrollments'].fetchData();
      try {
        const labFilter = window.AppState.selectedLab || 'Microbiology Lab';
        const stRes = await window.fetchAPI(`student.php?action=list&lab=${encodeURIComponent(labFilter)}`);
        if (stRes && stRes.success) window.AppData.students = stRes.students;
      } catch(e) {}
    } else {
      window.Components.toast('Error: ' + (data ? data.error : 'Failed'), 'error');
    }
  } catch (e) {
    console.error(e);
  }
};
