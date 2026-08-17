// ============================================================
// Smart Stock - Auditor Screens
// ============================================================
window.Screens = window.Screens || {};

const _labIcons = ['microbiology','science','biotech','genetics','health_and_safety','computer'];
const _labColors = [
  'linear-gradient(135deg,#1565C0,#00BCD4)',
  'linear-gradient(135deg,#00796B,#00E676)',
  'linear-gradient(135deg,#6A1B9A,#E040FB)',
  'linear-gradient(135deg,#E65100,#FF6D00)',
  'linear-gradient(135deg,#B71C1C,#F44336)',
  'linear-gradient(135deg,#1A237E,#7986CB)'
];

function _labCard(lab, i) {
  const statusClass = lab.status === 'active' ? 'success' : 'warning';
  const slug = lab.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z-]/g,'');
  return `
  <div class="lab-card animate-in" onclick="window.AppState.selectedLab='${lab.name}'; window.AppState.save(); window.Router.navigate('${slug}')" style="cursor:pointer">
    <div class="lab-card-header">
      <div style="display:flex;align-items:center;gap:12px">
        <div class="lab-card-icon" style="background:${_labColors[i % _labColors.length]};color:#fff">
          <span class="material-icons-round">science</span>
        </div>
        <div>
          <div class="lab-card-name">${lab.name}</div>
          <div class="lab-card-meta">${lab.location} · ${lab.code}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;">
        <span class="badge badge-${statusClass}">${lab.status}</span>

        ${window.AppState?.role === 'auditor' ? `
        <button class="btn btn-ghost btn-icon btn-sm" style="margin-left:4px;padding:4px;min-height:auto;color:var(--primary)" onclick="event.stopPropagation(); window.editLabOverview('${lab.id}')" title="Edit Lab">
          <span class="material-icons-round" style="font-size:16px;">edit</span>
        </button>
        <button class="btn btn-ghost btn-icon btn-sm" style="margin-left:4px;padding:4px;min-height:auto;color:var(--danger)" onclick="event.stopPropagation(); window.deleteLabOverview('${lab.id}')" title="Delete Lab">
          <span class="material-icons-round" style="font-size:16px;">delete</span>
        </button>
        ` : ''}
      </div>
    </div>
    <div class="lab-card-stats">
      <div class="lab-card-stat"><div class="lab-card-stat-val">${lab.students}</div><div class="lab-card-stat-lab">Students</div></div>
      <div class="lab-card-stat"><div class="lab-card-stat-val" style="color:var(--cyan)">${lab.equipment}</div><div class="lab-card-stat-lab">Equipment</div></div>
      <div class="lab-card-stat"><div class="lab-card-stat-val" style="color:var(--warning)">${lab.chemicals}</div><div class="lab-card-stat-lab">Chemicals</div></div>
    </div>
    <div class="lab-utilization">
      <div class="lab-util-label"><span>Utilization</span><span style="font-weight:700;color:var(--primary-bright)">${lab.utilization}%</span></div>
      <div class="progress-bar-wrap"><div class="progress-bar-fill ${lab.utilization>85?'danger':lab.utilization>65?'':'success'}" style="width:${lab.utilization}%"></div></div>
    </div>
  </div>`;
}

// ---- AUDITOR DASHBOARD ----
window.Screens['auditor-dashboard'] = function() {
  const u = window.AppState.user || window.AppData.users.auditor;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const notifs = window.AppData.notifications.filter(n=>!n.read).length;
  
  const dStats = (window.AppData.dashboardStats && window.AppData.dashboardStats.stats) ? window.AppData.dashboardStats.stats : {};
  const totalLabs = dStats.labs || window.AppData.labs.length;
  const totalEquip = dStats.equipment || 0;
  const totalChem = dStats.chemicals || 0;
  const lowStock = dStats.low_stock || 0;
  
  return `
  <div>
    <div class="dashboard-welcome animate-in">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <div class="welcome-greeting">${greeting}, 👋</div>
          <div class="welcome-name">${u.name}</div>
          <div class="welcome-subtitle">System Administrator · Quality Control</div>
        </div>
        <div style="background:rgba(255,255,255,0.1);border-radius:16px;padding:14px;text-align:center">
          <div style="font-size:28px;font-weight:800;color:#fff">${totalLabs}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.7)">Active Labs</div>
        </div>
      </div>
      <div class="welcome-stats">
        <div><div class="welcome-stat-val">${totalLabs}</div><div class="welcome-stat-lab">Labs</div></div>
        <div><div class="welcome-stat-val">${totalEquip}</div><div class="welcome-stat-lab">Equipment</div></div>
        <div><div class="welcome-stat-val">${totalChem}</div><div class="welcome-stat-lab">Chemicals</div></div>
      </div>
    </div>

    <div class="stats-grid animate-in-2">
      ${window.Components.statCard('science','Total Labs',totalLabs,'+0','','blue')}
      ${window.Components.statCard('precision_manufacturing','Equipment',totalEquip,'+2','','cyan')}
      ${window.Components.statCard('science','Chemicals',totalChem,'+5','success','success')}
      ${window.Components.statCard('warning','Low Stock Items',lowStock,'+1','warning','warning')}
    </div>

    <h2 class="section-title animate-in-3">Quick Access</h2>
    <div class="cards-grid-3 animate-in-3 mb-24">
      ${[
        {icon:'location_on',label:'Labs Overview',route:'labs-overview',color:'linear-gradient(135deg,#1565C0,#00BCD4)'},
        {icon:'analytics',label:'Analytics',route:'analytics-overview',color:'linear-gradient(135deg,#6A1B9A,#E040FB)'},
        {icon:'inventory_2',label:'Inventory',route:'equipment-inventory',color:'linear-gradient(135deg,#00796B,#00E676)'},
        {icon:'warning',label:'Low Stock',route:'low-stock-alerts',color:'linear-gradient(135deg,#E65100,#FF6D00)'},
        {icon:'event_busy',label:'Expiry Alerts',route:'expiry-alerts',color:'linear-gradient(135deg,#B71C1C,#F44336)'},
        {icon:'bar_chart',label:'Reports',route:'monthly-reports',color:'linear-gradient(135deg,#00897B,#00E5FF)'},
      ].map(q=>`
        <div class="card" style="cursor:pointer;padding:20px;text-align:center" onclick="window.Router.navigate('${q.route}')" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
          <div style="width:52px;height:52px;border-radius:14px;background:${q.color};display:flex;align-items:center;justify-content:center;margin:0 auto 12px">
            <span class="material-icons-round" style="color:#fff;font-size:24px">${q.icon}</span>
          </div>
          <div style="font-weight:700;font-size:14px;color:var(--text-primary)">${q.label}</div>
        </div>`).join('')}
    </div>

    <h2 class="section-title animate-in-4">Recent Notifications</h2>
    <div class="card animate-in-4">
      ${window.AppData.notifications.length > 0 ? window.AppData.notifications.slice(0,4).map(n => `
        <div class="notif-item ${n.read?'':'unread'}">
          <div class="notif-icon ${n.type}"><span class="material-icons-round">${n.icon}</span></div>
          <div class="notif-content">
            <div class="notif-title">${n.title}</div>
            <div class="notif-message">${n.message}</div>
            <div class="notif-time">${n.time}</div>
          </div>
          ${!n.read?'<div class="notif-dot"></div>':''}
        </div>`).join('') : '<div style="font-size:13px;color:var(--text-secondary);text-align:center;padding:20px 0">No recent notifications.</div>'}
      <div style="padding:12px 20px;text-align:center">
        <a href="#" onclick="window.Router.navigate('auditor-notifications')" style="font-size:13px;color:var(--primary-bright);font-weight:600">View All Notifications →</a>
      </div>
    </div>
  </div>`;
};
window.Screens['auditor-dashboard'].afterRender = function() {
  document.getElementById('topbar-title') && (document.getElementById('topbar-title').textContent = 'Dashboard');
};

// ---- LABS OVERVIEW ----
window.Screens['labs-overview'] = function() {
  let labsToShow = window.AppData.labs || [];
  if (window.AppState?.role === 'labhead' || window.AppState?.role === 'lab_head') {
    const assignedLab = window.AppState?.selectedLab || window.AppState?.user?.lab || 'Microbiology Lab';
    labsToShow = labsToShow.filter(l => l.name.toLowerCase() === assignedLab.toLowerCase() || l.name.toLowerCase().includes(assignedLab.toLowerCase()) || assignedLab.toLowerCase().includes(l.name.toLowerCase()));
  }
  return `
  <div>
    ${window.Components.pageHeader('Labs Overview','Managing Research Laboratories', null,
      window.AppState?.role === 'auditor' ? `<button class="btn btn-primary btn-sm" onclick="window.Components.showModal('add-lab-modal-overview')"><span class="material-icons-round">add</span> Add Lab</button>` : '')}
    <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap">
      ${window.Components.searchBar('Search labs...','labs-search')}
    </div>
    <div class="filter-bar mb-20" id="lab-filters">
      <button class="filter-chip active" data-filter="all">All Labs</button>
      <button class="filter-chip" data-filter="active">Active</button>
      <button class="filter-chip" data-filter="maintenance">Maintenance</button>
    </div>
    <div class="cards-grid-2" id="labs-cards-container">
      ${labsToShow.map((lab, i) => _labCard(lab, i)).join('')}
    </div>

    <!-- Add Lab Modal -->
    ${window.Components.modal('add-lab-modal-overview', 'Add New Laboratory', `
      <div class="form-group"><label class="form-label">Laboratory Name</label><input class="form-input" id="alo-name" placeholder="e.g. Immunology Lab"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Lab Code</label><input class="form-input" id="alo-code" placeholder="e.g. IM-07"></div>
        <div class="form-group"><label class="form-label">Lab Head</label><input class="form-input" id="alo-head" placeholder="e.g. Dr. Ramesh Gupta"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Location</label><input class="form-input" id="alo-loc" placeholder="e.g. Block C, Floor 3"></div>
        <div class="form-group"><label class="form-label">Initial Status</label>
          <select class="form-input form-select" id="alo-status">
            <option>active</option><option>maintenance</option>
          </select>
        </div>
      </div>
    `, `
      <button class="btn btn-ghost" onclick="window.Components.closeModal('add-lab-modal-overview')">Cancel</button>
      <button class="btn btn-primary" id="save-new-lab-overview-btn">Create Laboratory</button>
    `)}

    <!-- Edit Lab Modal -->
    ${window.Components.modal('edit-lab-modal-overview', 'Edit Laboratory', `
      <input type="hidden" id="elo-id">
      <input type="hidden" id="elo-old-name">
      <div class="form-group"><label class="form-label">Laboratory Name</label><input class="form-input" id="elo-name"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Lab Code</label><input class="form-input" id="elo-code"></div>
        <div class="form-group"><label class="form-label">Lab Head</label><input class="form-input" id="elo-head"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Location</label><input class="form-input" id="elo-loc"></div>
        <div class="form-group"><label class="form-label">Status</label>
          <select class="form-input form-select" id="elo-status">
            <option value="active">active</option><option value="maintenance">maintenance</option>
          </select>
        </div>
      </div>
    `, `
      <button class="btn btn-ghost" onclick="window.Components.closeModal('edit-lab-modal-overview')">Cancel</button>
      <button class="btn btn-primary" id="save-edit-lab-overview-btn">Save Changes</button>
    `)}
  </div>`;
};
window.Screens['labs-overview'].afterRender = function() {
  let query = '';
  let activeFilter = 'all';

  function filterLabs() {
    const cards = document.querySelectorAll('#labs-cards-container .lab-card');
    cards.forEach((card, index) => {
      const lab = window.AppData.labs[index];
      if (!lab) return;

      const matchesQuery = !query || 
                           lab.name.toLowerCase().includes(query) || 
                           lab.code.toLowerCase().includes(query) || 
                           lab.location.toLowerCase().includes(query) || 
                           lab.head.toLowerCase().includes(query);

      const matchesFilter = activeFilter === 'all' || lab.status === activeFilter;

      card.style.display = (matchesQuery && matchesFilter) ? '' : 'none';
    });
  }

  window.Components.setupSearch('labs-search', q => {
    query = q.trim();
    filterLabs();
  });

  window.Components.setupFilterChips('#lab-filters', f => {
    activeFilter = f;
    filterLabs();
  });

  window.toggleLabStatus = async function(id) {
    const lab = window.AppData.labs.find(l => String(l.id) === String(id));
    if (!lab) return;
    
    const newStatus = lab.status === 'active' ? 'maintenance' : 'active';
    const payload = { action: 'edit', id: lab.id, status: newStatus };
    const res = await window.fetchAPI('labs.php?action=edit', { method: 'POST', body: JSON.stringify(payload) });
    
    lab.status = newStatus;
    if (res && res.success) {
      window.Components.toast(`Lab status changed to ${newStatus}`, 'success');
    } else {
      window.Components.toast(`Lab status changed locally (Backend error: ${res?.message || 'unknown'})`, 'warning');
    }
    
    // Re-render
    const container = document.getElementById('labs-cards-container');
    if (container) {
      container.innerHTML = window.AppData.labs.map((l, i) => _labCard(l, i)).join('');
      filterLabs();
    }
  };

  window.deleteLabOverview = async function(id) {
    if (!confirm('Are you sure you want to delete this lab?')) return;
    const lab = window.AppData.labs.find(l => String(l.id) === String(id));
    if (!lab) return;
    
    const payload = { action: 'delete', id: lab.id, name: lab.name };
    const res = await window.fetchAPI('labs.php?action=delete', { method: 'POST', body: JSON.stringify(payload) });
    
    if (res && res.success) {
      window.Components.toast('Lab deleted successfully', 'success');
    } else {
      window.Components.toast(`Lab deleted locally (Backend error: ${res?.message || 'unknown'})`, 'warning');
    }
    
    window.AppData.labs = window.AppData.labs.filter(l => String(l.id) !== String(id));
    
    // Re-render
    const container = document.getElementById('labs-cards-container');
    if (container) {
      container.innerHTML = window.AppData.labs.map((l, i) => _labCard(l, i)).join('');
      filterLabs();
    }
  };

  window.editLabOverview = function(id) {
    const lab = window.AppData.labs.find(l => String(l.id) === String(id));
    if (!lab) return;
    document.getElementById('elo-id').value = lab.id;
    document.getElementById('elo-old-name').value = lab.name;
    document.getElementById('elo-name').value = lab.name;
    document.getElementById('elo-code').value = lab.code;
    document.getElementById('elo-head').value = lab.head;
    document.getElementById('elo-loc').value = lab.location;
    document.getElementById('elo-status').value = lab.status;
    window.Components.showModal('edit-lab-modal-overview');
  };

  const editSaveBtn = document.getElementById('save-edit-lab-overview-btn');
  if (editSaveBtn) {
    editSaveBtn.onclick = async function() {
      const id = document.getElementById('elo-id').value;
      const old_name = document.getElementById('elo-old-name').value;
      const name = document.getElementById('elo-name').value.trim();
      const code = document.getElementById('elo-code').value.trim();
      const head = document.getElementById('elo-head').value.trim();
      const location = document.getElementById('elo-loc').value.trim();
      const status = document.getElementById('elo-status').value;

      if (!name || !code || !head || !location) {
        window.Components.toast('Please fill all fields', 'error');
        return;
      }

      const payload = { action: 'edit', id, old_name, name, code, head, location, status };
      const res = await window.fetchAPI('labs.php?action=edit', { method: 'POST', body: JSON.stringify(payload) });

      if (res && res.success) {
        window.Components.toast('Laboratory updated successfully!', 'success');
      } else {
        window.Components.toast('Lab updated locally (Backend error: ' + (res?.message || 'unknown') + ')', 'warning');
      }

      window.Components.closeModal('edit-lab-modal-overview');
      
      if (window.AppActions && window.AppActions.syncData) {
        await window.AppActions.syncData();
      }
      
      const container = document.getElementById('labs-cards-container');
      if (container) {
        container.innerHTML = window.AppData.labs.map((l, i) => _labCard(l, i)).join('');
      }
      filterLabs();
    };
  }

  const saveBtn = document.getElementById('save-new-lab-overview-btn');
  if (saveBtn) {
    saveBtn.onclick = async function() {
      const name = document.getElementById('alo-name').value.trim();
      const code = document.getElementById('alo-code').value.trim();
      const head = document.getElementById('alo-head').value.trim();
      const location = document.getElementById('alo-loc').value.trim();
      const status = document.getElementById('alo-status').value;

      if (!name || !code || !head || !location) {
        window.Components.toast('Please fill all fields', 'error');
        return;
      }

      const payload = { action: 'add', name, code, head, location, status };
      const res = await window.fetchAPI('labs.php?action=add', { method: 'POST', body: JSON.stringify(payload) });

      if (res && res.success) {
        window.Components.toast('Laboratory added successfully!', 'success');
      } else {
        // Fallback: Optimistic update if backend not actually fully implemented
        window.Components.toast('Lab created locally (Backend error: ' + (res?.message || 'unknown') + ')', 'warning');
        const id = window.AppData.labs.length + 1;
        window.AppData.labs.push({ id, name, code, head, students: 0, location, status, equipment: 0, chemicals: 0, utilization: 0 });
      }

      document.getElementById('alo-name').value = '';
      document.getElementById('alo-code').value = '';
      document.getElementById('alo-head').value = '';
      document.getElementById('alo-loc').value = '';

      window.Components.closeModal('add-lab-modal-overview');
      
      // Re-render
      if (window.AppActions && window.AppActions.syncData) {
        await window.AppActions.syncData();
      }
      
      const container = document.getElementById('labs-cards-container');
      if (container) {
        container.innerHTML = window.AppData.labs.map((lab, i) => _labCard(lab, i)).join('');
      }
      filterLabs();
    };
  }
};

// ---- INDIVIDUAL LAB SCREENS ----
function _labDetailScreen(labName) {
  return function() {
    const lab = window.AppData.labs.find(l => l.name === labName) || window.AppData.labs[0];
    return `
    <div id="lab-detail-container" data-labname="${lab.name}">
      ${window.Components.pageHeader(lab.name, `${lab.location} A Head: ${lab.head}`, 'labs-overview',
        `<span class="badge badge-${lab.status==='active'?'success':'warning'}">${lab.status}</span>`)}
      <div class="stats-grid mb-24">
        ${window.Components.statCard('groups','Students',lab.students,'','','blue')}
        ${window.Components.statCard('precision_manufacturing','Equipment',lab.equipment,'','','cyan')}
        ${window.Components.statCard('science','Chemicals',lab.chemicals,'','','success')}
        ${window.Components.statCard('speed','Utilization',lab.utilization+'%','','','warning')}
      </div>
      <div class="tab-bar mb-20" id="lab-tabs">
        <div class="tab-item active" data-tab="overview">Overview</div>
        <div class="tab-item" data-tab="equipment">Equipment</div>
        <div class="tab-item" data-tab="chemicals">Chemicals</div>
        <div class="tab-item" data-tab="students">Students</div>
        <div class="tab-item" data-tab="usage">Student Usage & Activity Logs</div>
      </div>
      <div id="tab-content-overview">
        <div class="cards-grid-2">
          <div class="card"><div class="card-body">
            <div class="card-title mb-12">Lab Utilization</div>
            <div style="margin-bottom:8px;display:flex;justify-content:space-between"><span style="font-size:13px;color:var(--text-secondary)">Overall</span><span style="font-weight:700;color:var(--primary-bright)">${lab.utilization}%</span></div>
            <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${lab.utilization}%"></div></div>
            <div style="margin-top:16px;margin-bottom:8px;display:flex;justify-content:space-between"><span style="font-size:13px;color:var(--text-secondary)">Equipment Active</span><span style="font-weight:700;color:var(--cyan)">78%</span></div>
            <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:78%;background:var(--cyan)"></div></div>
            <div style="margin-top:16px;margin-bottom:8px;display:flex;justify-content:space-between"><span style="font-size:13px;color:var(--text-secondary)">Stock Availability</span><span style="font-weight:700;color:var(--success)">91%</span></div>
            <div class="progress-bar-wrap"><div class="progress-bar-fill success" style="width:91%"></div></div>
          </div></div>
          <div class="card"><div class="card-body">
            <div class="card-title mb-12">Quick Info</div>
            ${[['Lab Code',lab.code],['Lab Head',lab.head],['Location',lab.location],['Status',lab.status]].map(([k,v])=>`
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color)">
                <span style="font-size:13px;color:var(--text-secondary)">${k}</span>
                <span style="font-size:13px;font-weight:600;color:var(--text-primary);text-transform:capitalize">${v}</span>
              </div>`).join('')}
          </div></div>
        </div>
      </div>
      <div id="tab-content-equipment" style="display:none">
        <div class="card">
          <div class="table-wrap">
            <table id="lab-eq-table">
              <thead><tr><th>Equipment</th><th>Category</th><th>Status</th><th>Qty</th></tr></thead>
              <tbody>
                <tr><td colspan="4" style="text-align:center;padding:20px">Loading equipment...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div id="tab-content-chemicals" style="display:none">
        <div class="card">
          <div class="table-wrap">
            <table id="lab-ch-table">
              <thead><tr><th>Chemical</th><th>Category</th><th>Stock</th><th>Unit</th></tr></thead>
              <tbody>
                <tr><td colspan="4" style="text-align:center;padding:20px">Loading chemicals...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div id="tab-content-students" style="display:none">
        <div class="card">
          <div class="table-wrap">
            <table id="lab-st-table">
              <thead><tr><th>Student</th><th>Year</th><th>Attendance</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                <tr><td colspan="5" style="text-align:center;padding:20px">Loading students...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div id="tab-content-usage" style="display:none">
        <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
          <div style="font-weight:600;font-size:15px;color:var(--text-primary)" id="auditor-usage-filter-label">All Student Usage & Experiment Activity</div>
          <button class="btn btn-ghost btn-sm" id="auditor-usage-clear-btn" style="display:none" onclick="window._auditorClearStudentFilter()">Reset Filter (Show All Students)</button>
        </div>
        <div class="cards-grid-2 mb-24">
          <div class="card">
            <div class="card-header"><div class="card-title">Stock & Equipment Usage Logs</div></div>
            <div class="card-body" style="padding:0;max-height:350px;overflow-y:auto" id="auditor-stock-history-list">
              <div style="padding:24px;text-align:center;color:var(--text-secondary)">Loading stock logs...</div>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><div class="card-title">Daily Experiment Activity Logs</div></div>
            <div class="card-body" style="padding:0;max-height:350px;overflow-y:auto" id="auditor-activity-history-list">
              <div style="padding:24px;text-align:center;color:var(--text-secondary)">Loading experiment activities...</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  };
}
function _labDetailAfterRender() {
  const tabs = document.querySelectorAll('#lab-tabs .tab-item');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      ['overview','equipment','chemicals','students','usage'].forEach(t => {
        const el = document.getElementById(`tab-content-${t}`);
        if(el) el.style.display = (t === tab.dataset.tab) ? 'block' : 'none';
      });
    });
  });

  const container = document.getElementById('lab-detail-container');
  if (container) {
    const labName = container.dataset.labname;
    window._currentAuditorLabName = labName;
    window._auditorRenderUsageTab(labName);

    window.fetchAPI('labs.php?action=list&name=' + encodeURIComponent(labName)).then(res => {
      const eqBody = document.querySelector('#lab-eq-table tbody');
      const stBody = document.querySelector('#lab-st-table tbody');
      
      if (res.success) {
        if (eqBody) {
          if (res.equipment && res.equipment.length > 0) {
            eqBody.innerHTML = res.equipment.map(e => `
              <tr>
                <td><div class="td-label">${e.name}</div></td>
                <td style="color:var(--text-secondary);font-size:13px">${e.category || ''}</td>
                <td><span class="badge badge-${window.AppUtils.getStatusColor(e.status)}">${e.status || 'active'}</span></td>
                <td style="font-weight:700;color:var(--primary-bright)">${e.quantity || 1}</td>
              </tr>
            `).join('');
          } else {
            eqBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-secondary)">No equipment found in this lab.</td></tr>';
          }
        }
        
        const chBody = document.querySelector('#lab-ch-table tbody');
        if (chBody) {
          if (res.chemicals && res.chemicals.length > 0) {
            chBody.innerHTML = res.chemicals.map(c => `
              <tr>
                <td><div class="td-label">${c.name}</div></td>
                <td style="color:var(--text-secondary);font-size:13px">${c.category || ''}</td>
                <td style="font-weight:700;color:var(--warning)">${c.stock || 0}</td>
                <td style="color:var(--text-secondary);font-size:13px">${c.unit || ''}</td>
              </tr>
            `).join('');
          } else {
            chBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-secondary)">No chemicals found in this lab.</td></tr>';
          }
        }
        if (stBody) {
          if (res.students && res.students.length > 0) {
            stBody.innerHTML = res.students.map(s => `
              <tr>
                <td><div style="display:flex;align-items:center;gap:10px">${window.Components.avatar(s.name.split(' ').map(n=>n[0]).join(''),'sm')}<div><div class="td-label">${s.name}</div><div class="td-sub">${s.roll_no}</div></div></div></td>
                <td style="font-size:13px;color:var(--text-secondary)">${s.year || '1st Year'}</td>
                <td><span style="font-weight:700;color:${s.attendance>=85?'var(--success)':s.attendance>=75?'var(--warning)':'var(--danger)'}">${s.attendance || 0}%</span></td>
                <td><span class="badge badge-${window.AppUtils.getStatusColor(s.status)}">${s.status || 'active'}</span></td>
                <td><button class="btn btn-outline btn-sm" onclick="window._auditorFilterStudentLogs('${s.name}', '${s.roll_no}', '${labName}')" style="gap:4px;font-size:12px"><span class="material-icons-round" style="font-size:14px">history</span> View Logs</button></td>
              </tr>
            `).join('');
          } else {
            stBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-secondary)">No students enrolled yet.</td></tr>';
          }
        }
      }
    });
  }
}

window._auditorRenderUsageTab = function(labName, stName, stRoll) {
  const stockContainer = document.getElementById('auditor-stock-history-list');
  const actContainer = document.getElementById('auditor-activity-history-list');
  const labelEl = document.getElementById('auditor-usage-filter-label');
  const clearBtn = document.getElementById('auditor-usage-clear-btn');
  if (!stockContainer || !actContainer) return;

  if (labelEl && clearBtn) {
    if (stName) {
      labelEl.textContent = `Usage & Activities for Student: ${stName} (${stRoll || ''})`;
      clearBtn.style.display = 'inline-flex';
    } else {
      labelEl.textContent = `All Student Usage & Experiment Activity in ${labName}`;
      clearBtn.style.display = 'none';
    }
  }

  const stockList = (window.AppData.stockHistory || []).filter(h => {
    const labMatch = !h.lab || h.lab === labName || labName === 'All Labs';
    if (!labMatch) return false;
    if (!stName && !stRoll) return true;
    const by = (h.by || h.by_user || '').toLowerCase();
    return by === stName.toLowerCase() || (stRoll && by === stRoll.toLowerCase());
  });

  const actList = (window.AppData.activities || []).filter(a => {
    const labMatch = !a.lab || a.lab === labName || labName === 'All Labs';
    if (!labMatch) return false;
    if (!stName && !stRoll) return true;
    const st = (a.student || '').toString().toLowerCase();
    return st === stName.toLowerCase() || (stRoll && st === stRoll.toLowerCase());
  });

  if (stockList.length === 0) {
    stockContainer.innerHTML = `<div style="padding:32px 16px;text-align:center;color:var(--text-secondary);font-size:13px">No stock or equipment usage found${stName ? ` for ${stName}` : ''}.</div>`;
  } else {
    stockContainer.innerHTML = `
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="border-bottom:1px solid var(--border-color);background:var(--bg-base);text-align:left">
            <th style="padding:10px 14px;font-size:12px;color:var(--text-secondary)">Student</th>
            <th style="padding:10px 14px;font-size:12px;color:var(--text-secondary)">Item</th>
            <th style="padding:10px 14px;font-size:12px;color:var(--text-secondary)">Qty</th>
            <th style="padding:10px 14px;font-size:12px;color:var(--text-secondary)">Date / Reason</th>
          </tr>
        </thead>
        <tbody>
          ${stockList.map(h => `
            <tr style="border-bottom:1px solid var(--border-color)">
              <td style="padding:10px 14px;font-size:13px;font-weight:600;color:var(--text-primary)">${h.by || h.by_user || 'Student'}</td>
              <td style="padding:10px 14px;font-size:13px;color:var(--text-primary)">${h.item}</td>
              <td style="padding:10px 14px;font-size:13px;font-weight:700;color:var(--primary-bright)">${Math.abs(h.quantity || 1)} ${h.unit || 'pcs'}</td>
              <td style="padding:10px 14px;font-size:12px;color:var(--text-secondary)">
                <div>${window.AppUtils.formatDate(h.date)}</div>
                <div style="font-size:11px;color:var(--text-muted)">${h.reason || '--'}</div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  if (actList.length === 0) {
    actContainer.innerHTML = `<div style="padding:32px 16px;text-align:center;color:var(--text-secondary);font-size:13px">No daily activities logged${stName ? ` for ${stName}` : ''}.</div>`;
  } else {
    actContainer.innerHTML = `
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="border-bottom:1px solid var(--border-color);background:var(--bg-base);text-align:left">
            <th style="padding:10px 14px;font-size:12px;color:var(--text-secondary)">Student</th>
            <th style="padding:10px 14px;font-size:12px;color:var(--text-secondary)">Experiment</th>
            <th style="padding:10px 14px;font-size:12px;color:var(--text-secondary)">Materials Used</th>
            <th style="padding:10px 14px;font-size:12px;color:var(--text-secondary)">Date / Status</th>
          </tr>
        </thead>
        <tbody>
          ${actList.map(a => `
            <tr style="border-bottom:1px solid var(--border-color)">
              <td style="padding:10px 14px;font-size:13px;font-weight:600;color:var(--text-primary)">${a.student || 'Student'}</td>
              <td style="padding:10px 14px;font-size:13px;color:var(--text-primary)">
                <div style="font-weight:600">${a.experiment || 'Lab Activity'}</div>
                <div style="font-size:11px;color:var(--text-secondary)">${a.notes || ''}</div>
              </td>
              <td style="padding:10px 14px;font-size:12px">
                <div style="margin-bottom:2px">Chem: ${Array.isArray(a.chemicals)?a.chemicals.join(', '):(a.chemicals||'--')}</div>
                <div style="color:var(--cyan)">Equip: ${Array.isArray(a.equipment)?a.equipment.join(', '):(a.equipment||'--')}</div>
              </td>
              <td style="padding:10px 14px;font-size:12px;color:var(--text-secondary)">
                <div>${window.AppUtils.formatDate(a.date)}</div>
                <span class="badge badge-${window.AppUtils.getStatusColor(a.status || 'completed')}">${a.status || 'completed'}</span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
};

window._auditorFilterStudentLogs = function(stName, stRoll, labName) {
  const usageTabBtn = document.querySelector('#lab-tabs .tab-item[data-tab="usage"]');
  if (usageTabBtn) usageTabBtn.click();
  window._auditorRenderUsageTab(labName || window._currentAuditorLabName || 'Microbiology Lab', stName, stRoll);
};

window._auditorClearStudentFilter = function() {
  window._auditorRenderUsageTab(window._currentAuditorLabName || 'Microbiology Lab');
};

window.Screens['microbiology-lab'] = _labDetailScreen('Microbiology Lab');
window.Screens['microbiology-lab'].afterRender = _labDetailAfterRender;
window.Screens['molecular-biology-lab'] = _labDetailScreen('Molecular Biology Lab');
window.Screens['molecular-biology-lab'].afterRender = _labDetailAfterRender;
window.Screens['biotechnology-lab'] = _labDetailScreen('Biotechnology Lab');
window.Screens['biotechnology-lab'].afterRender = _labDetailAfterRender;
window.Screens['clinical-genetics-lab'] = _labDetailScreen('Clinical Genetics Lab');
window.Screens['clinical-genetics-lab'].afterRender = _labDetailAfterRender;
window.Screens['pathology-lab'] = _labDetailScreen('Pathology Lab');
window.Screens['pathology-lab'].afterRender = _labDetailAfterRender;
window.Screens['bioinformatics-lab'] = _labDetailScreen('Bioinformatics Lab');
window.Screens['bioinformatics-lab'].afterRender = _labDetailAfterRender;

// ---- AUDITOR NOTIFICATIONS ----
window.Screens['auditor-notifications'] = function() {
  return `
  <div>
    ${window.Components.pageHeader('Notifications','System Alerts & Updates','back',
      '<div style="display:flex;gap:8px"><button class="btn btn-ghost btn-sm" id="notif-mark-all-read"><span class="material-icons-round" style="font-size:16px;">done_all</span> Mark All Read</button><button class="btn btn-ghost btn-sm" id="notif-clear-all" style="color:var(--danger)"><span class="material-icons-round" style="font-size:16px;">delete_sweep</span> Clear All</button></div>')}
    <div class="filter-bar mb-16" id="notif-filters">
      <button class="filter-chip active" data-filter="all">All</button>
      <button class="filter-chip" data-filter="low-stock">Alerts</button>
      <button class="filter-chip" data-filter="maintenance">Info</button>
      <button class="filter-chip" data-filter="system">System</button>
    </div>
    <div class="card" id="notifications-list">
      <div style="padding:40px;text-align:center;color:var(--text-secondary)">
        <span class="material-icons-round" style="font-size:48px;display:block;margin-bottom:12px">hourglass_top</span>
        Loading notifications...
      </div>
    </div>
  </div>`;
};
window.Screens['auditor-notifications'].afterRender = async function() {
  const listEl      = document.getElementById('notifications-list');
  const markAllBtn  = document.getElementById('notif-mark-all-read');
  const clearAllBtn = document.getElementById('notif-clear-all');
  let allNotifs = [];
  let activeFilter = 'all';

  function renderList(items) {
    if (!items || items.length === 0) {
      listEl.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-secondary)"><span class="material-icons-round" style="font-size:48px;display:block;margin-bottom:12px">notifications_none</span>No notifications</div>';
      return;
    }
    listEl.innerHTML = items.map(n =>
      '<div class="notif-item ' + (n.is_read?'':'unread') + '" data-type="' + n.type + '" data-id="' + n.id + '" style="display:flex;align-items:center">' +
      '<div class="notif-icon ' + n.type + '"><span class="material-icons-round">' + (n.icon||'info') + '</span></div>' +
      '<div class="notif-content" style="flex:1"><div class="notif-title">' + n.title + '</div><div class="notif-message">' + n.message + '</div><div class="notif-time">' + (n.time||'Just now') + ' &middot; ' + (n.lab_name||'System') + '</div></div>' +
      (!n.is_read?'<div class="notif-dot"></div>':'') +
      '<button onclick="window._delNotif(' + n.id + ')" style="background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:4px;margin-left:8px" title="Dismiss"><span class="material-icons-round" style="font-size:18px">close</span></button>' +
      '</div>'
    ).join('');
    applyFilter();
  }

  function applyFilter() {
    document.querySelectorAll('#notifications-list .notif-item').forEach(item => {
      item.style.display = (activeFilter==='all' || item.dataset.type===activeFilter) ? '' : 'none';
    });
  }

  async function reload() {
    listEl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-secondary)">Loading...</div>';
    try {
      const res = await window.fetchAPI('notifications.php?action=list');
      allNotifs = res.notifications || [];
      window.AppData.notifications = allNotifs;
      renderList(allNotifs);
    } catch(e) {
      listEl.innerHTML = '<div style="padding:24px;text-align:center;color:var(--danger)">Failed to load.</div>';
    }
  }

  await reload();

  window.Components.setupFilterChips('#notif-filters', f => { activeFilter = f; applyFilter(); });

  markAllBtn && markAllBtn.addEventListener('click', async () => {
    markAllBtn.disabled = true;
    const res = await window.fetchAPI('notifications.php?action=mark_read', { method:'POST', body:JSON.stringify({action:'mark_read'}) });
    markAllBtn.disabled = false;
    if (res.success) { allNotifs.forEach(n=>n.is_read=true); renderList(allNotifs); window.Components.toast('All marked as read','success'); }
    else window.Components.toast(res.message||'Failed','danger');
  });

  clearAllBtn && clearAllBtn.addEventListener('click', async () => {
    if (!confirm('Delete ALL notifications? This cannot be undone.')) return;
    clearAllBtn.disabled = true;
    const res = await window.fetchAPI('notifications.php?action=clear', { method:'POST', body:JSON.stringify({action:'clear'}) });
    clearAllBtn.disabled = false;
    if (res.success) { allNotifs=[]; window.AppData.notifications=[]; renderList([]); window.Components.toast('All cleared','success'); }
    else window.Components.toast(res.message||'Failed','danger');
  });

  window._delNotif = async function(id) {
    const res = await window.fetchAPI('notifications.php?action=delete_one', { method:'POST', body:JSON.stringify({action:'delete_one',id}) });
    if (res.success) { allNotifs=allNotifs.filter(n=>n.id!=id); window.AppData.notifications=allNotifs; renderList(allNotifs); window.Components.toast('Notification removed','success'); }
  };
};
window.Screens['auditor-profile'] = function() {
  const u = window.AppState.user || window.AppData.users.auditor;
  return `
  <div>
    ${window.Components.pageHeader('My Profile','Account Settings','back')}
    <div class="card mb-20" style="padding:28px;text-align:center">
      <div style="width:80px;height:80px;border-radius:22px;background:linear-gradient(135deg,var(--primary),var(--cyan));display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-family:'Outfit',sans-serif;font-weight:800;font-size:28px;color:#fff">${(u.name||'').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}</div>
      <div style="font-size:22px;font-weight:800;color:var(--text-primary)">${u.name}</div>
      <div style="margin-top:6px"><span class="badge badge-primary">Auditor</span></div>
      <div style="font-size:13px;color:var(--text-secondary);margin-top:8px">${u.email}</div>
    </div>
    <div class="card mb-16"><div class="card-header"><div class="card-title">Personal Information</div>
      <button class="btn btn-ghost btn-sm" id="edit-profile-btn">Edit</button></div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" value="${u.name}" id="prof-name" readonly></div>
          <div class="form-group"><label class="form-label">Employee ID</label><input class="form-input" value="AUD-2024-001" id="prof-id" readonly></div>
        </div>
        <div class="form-group"><label class="form-label">Department</label><input class="form-input" value="${u.department}" id="prof-dept" readonly></div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" value="${u.email}" id="prof-email" readonly></div>
      </div>
    </div>
    <div class="card"><div class="card-header"><div class="card-title">Security</div></div>
      <div class="card-body">
        <button class="btn btn-outline w-full mb-12" style="justify-content:center" onclick="window.Router.navigate('security-settings')">
          <span class="material-icons-round">lock</span> Change Password
        </button>
        <button class="btn btn-danger w-full" style="justify-content:center" onclick="window.AppActions.logout()">
          <span class="material-icons-round">logout</span> Logout
        </button>
      </div>
    </div>
  </div>`;
};
window.Screens['auditor-profile'].afterRender = function() {
  const btn = document.getElementById('edit-profile-btn');
  let editing = false;
  if (btn) {
    btn.addEventListener('click', () => {
      editing = !editing;
      ['prof-name','prof-id','prof-dept','prof-email'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.readOnly = !editing;
      });
      btn.textContent = editing ? 'Save' : 'Edit';
      if (!editing) {
        btn.disabled = true;
        btn.textContent = 'Saving...';
        const nameVal = document.getElementById('prof-name').value;
        const idVal = document.getElementById('prof-id').value;
        const deptVal = document.getElementById('prof-dept').value;
        window.fetchAPI('profile.php', {
          method: 'POST',
          body: {
            action: 'update',
            empid: idVal,
            old_empid: window.AppState.user.user_code,
            name: nameVal,
            dept: deptVal
          }
        }).then(res => {
          btn.disabled = false;
          btn.textContent = 'Edit';
          if (res.success && res.user) {
            window.AppState.user = res.user;
            window.AppState.save();
            window.AppActions.renderSidebar();
            window.Components.toast('Profile updated successfully!', 'success');
          } else {
            window.Components.toast(res.error || 'Failed to update profile', 'error');
          }
        }).catch(err => {
          btn.disabled = false;
          btn.textContent = 'Edit';
          window.Components.toast('Network error', 'error');
        });
      }
    });
  }
};

// ---- LAB HEAD PROFILE ----
window.Screens['labhead-profile'] = function() {
  const u = window.AppState.user || window.AppData.users.labhead;
  return `
  <div>
    ${window.Components.pageHeader('My Profile','Lab Manager Profile','back')}
    <div class="card mb-20" style="padding:28px;text-align:center">
      <div style="width:80px;height:80px;border-radius:22px;background:linear-gradient(135deg,var(--teal),var(--success));display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-family:'Outfit',sans-serif;font-weight:800;font-size:28px;color:#fff">${(u.name||'').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}</div>
      <div style="font-size:22px;font-weight:800;color:var(--text-primary)">${u.name}</div>
      <div style="margin-top:6px"><span class="badge badge-success">Lab Head</span></div>
      <div style="font-size:13px;color:var(--text-secondary);margin-top:8px">${u.email}</div>
    </div>
    <div class="card mb-16"><div class="card-header"><div class="card-title">Laboratory & Personal Details</div>
      <button class="btn btn-ghost btn-sm" id="edit-labhead-btn">Edit</button></div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" value="${u.name}" id="lh-name" readonly></div>
          <div class="form-group"><label class="form-label">Assigned Lab</label><input class="form-input" value="${u.lab || 'Microbiology Lab'}" id="lh-lab" readonly></div>
        </div>
        <div class="form-group"><label class="form-label">Department</label><input class="form-input" value="${u.department || 'Microbiology'}" id="lh-dept" readonly></div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" value="${u.email}" id="lh-email" readonly></div>
      </div>
    </div>
    <div class="card"><div class="card-header"><div class="card-title">Security</div></div>
      <div class="card-body">
        <button class="btn btn-outline w-full mb-12" style="justify-content:center" onclick="window.Router.navigate('security-settings')">
          <span class="material-icons-round">lock</span> Change Password
        </button>
        <button class="btn btn-danger w-full" style="justify-content:center" onclick="window.AppActions.logout()">
          <span class="material-icons-round">logout</span> Logout
        </button>
      </div>
    </div>
  </div>`;
};
window.Screens['labhead-profile'].afterRender = function() {
  const btn = document.getElementById('edit-labhead-btn');
  let editing = false;
  if (btn) {
    btn.addEventListener('click', () => {
      editing = !editing;
      ['lh-name','lh-lab','lh-dept','lh-email'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.readOnly = !editing;
      });
      btn.textContent = editing ? 'Save' : 'Edit';
      if (!editing) {
        btn.disabled = true;
        btn.textContent = 'Saving...';
        const nameVal = document.getElementById('lh-name').value;
        const deptVal = document.getElementById('lh-dept').value;
        window.fetchAPI('profile.php', {
          method: 'POST',
          body: {
            action: 'update',
            empid: window.AppState.user.user_code,
            old_empid: window.AppState.user.user_code,
            name: nameVal,
            dept: deptVal
          }
        }).then(res => {
          btn.disabled = false;
          btn.textContent = 'Edit';
          if (res.success && res.user) {
            window.AppState.user = res.user;
            window.AppState.save();
            window.AppActions.renderSidebar();
            window.Components.toast('Profile updated successfully!', 'success');
          } else {
            window.Components.toast(res.error || 'Failed to update profile', 'error');
          }
        }).catch(err => {
          btn.disabled = false;
          btn.textContent = 'Edit';
          window.Components.toast('Network error', 'error');
        });
      }
    });
  }
};

// ---- STUDENT PROFILE ----
window.Screens['student-profile'] = function() {
  const u = window.AppState.user || window.AppData.users.student;
  return `
  <div>
    ${window.Components.pageHeader('My Profile','Student Profile','back')}
    <div class="card mb-20" style="padding:28px;text-align:center">
      <div style="width:80px;height:80px;border-radius:22px;background:linear-gradient(135deg,var(--purple),#E040FB);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-family:'Outfit',sans-serif;font-weight:800;font-size:28px;color:#fff">${(u.name||'').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}</div>
      <div style="font-size:22px;font-weight:800;color:var(--text-primary)">${u.name}</div>
      <div style="margin-top:6px"><span class="badge badge-warning">Student</span></div>
      <div style="font-size:13px;color:var(--text-secondary);margin-top:8px">${u.email}</div>
    </div>
    <div class="card mb-16"><div class="card-header"><div class="card-title">Academic & Portal Details</div>
      <button class="btn btn-ghost btn-sm" id="edit-student-btn">Edit</button></div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" value="${u.name}" id="st-name" readonly></div>
          <div class="form-group"><label class="form-label">Roll Number</label><input class="form-input" value="${u.rollNo || 'MB2024001'}" id="st-roll" readonly></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Assigned Lab</label><input class="form-input" value="${u.lab || 'Microbiology Lab'}" id="st-lab" readonly></div>
          <div class="form-group"><label class="form-label">Academic Year</label><input class="form-input" value="${u.year || '3rd Year'}" id="st-year" readonly></div>
        </div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" value="${u.email}" id="st-email" readonly></div>
      </div>
    </div>
    <div class="card"><div class="card-header"><div class="card-title">Security</div></div>
      <div class="card-body">
        <button class="btn btn-outline w-full mb-12" style="justify-content:center" onclick="window.Router.navigate('security-settings')">
          <span class="material-icons-round">lock</span> Change Password
        </button>
        <button class="btn btn-danger w-full" style="justify-content:center" onclick="window.AppActions.logout()">
          <span class="material-icons-round">logout</span> Logout
        </button>
      </div>
    </div>
  </div>`;
};
window.Screens['student-profile'].afterRender = function() {
  const btn = document.getElementById('edit-student-btn');
  let editing = false;
  if (btn) {
    btn.addEventListener('click', () => {
      editing = !editing;
      ['st-name','st-roll','st-lab','st-year','st-email'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.readOnly = !editing;
      });
      btn.textContent = editing ? 'Save' : 'Edit';
      if (!editing) {
        btn.disabled = true;
        btn.textContent = 'Saving...';
        const nameVal = document.getElementById('st-name').value;
        const rollVal = document.getElementById('st-roll').value;
        window.fetchAPI('profile.php', {
          method: 'POST',
          body: {
            action: 'update',
            empid: rollVal,
            old_empid: window.AppState.user.user_code,
            name: nameVal,
            dept: window.AppState.user.department || ''
          }
        }).then(res => {
          btn.disabled = false;
          btn.textContent = 'Edit';
          if (res.success && res.user) {
            window.AppState.user = res.user;
            window.AppState.save();
            window.AppActions.renderSidebar();
            window.Components.toast('Profile updated successfully!', 'success');
          } else {
            window.Components.toast(res.error || 'Failed to update profile', 'error');
          }
        }).catch(err => {
          btn.disabled = false;
          btn.textContent = 'Edit';
          window.Components.toast('Network error', 'error');
        });
      }
    });
  }
};

// ---- NOTIFICATIONS (alias) ----
window.Screens['notifications'] = window.Screens['auditor-notifications'];
window.Screens['notifications'].afterRender = window.Screens['auditor-notifications'].afterRender;

// ---- PROFILE (alias / role-aware) ----
window.Screens['profile'] = function() {
  const role = window.AppState.role;
  if (role === 'auditor') return window.Screens['auditor-profile']();
  if (role === 'labhead') return window.Screens['labhead-profile']();
  return window.Screens['student-profile']();
};
window.Screens['profile'].afterRender = function() {
  const role = window.AppState.role;
  if (role === 'auditor') {
    window.Screens['auditor-profile'].afterRender();
  } else if (role === 'labhead') {
    window.Screens['labhead-profile'].afterRender();
  } else {
    window.Screens['student-profile'].afterRender();
  }
};



