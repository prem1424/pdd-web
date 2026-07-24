// ============================================================
// Smart Stock - Student Screens
// ============================================================
window.Screens = window.Screens || {};

// ---- STUDENT DASHBOARD ----
window.Screens['student-dashboard'] = function() {
  try {
    const u = window.AppState.user || (window.AppData && window.AppData.users ? window.AppData.users.student : {name: 'Student'});
    const labName = window.AppState.selectedLab || u.lab || 'Microbiology Lab';
    const todayStr = new Date().toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'});
    
    const dStats = (window.AppData && window.AppData.dashboardStats && window.AppData.dashboardStats.stats) ? window.AppData.dashboardStats.stats : {};
    const attPercent = dStats.attendance_percent || '92%';
    const todayAtt = dStats.today_attendance || 'Present';
    const assignedTasks = dStats.assigned_tasks || 0;
    
    const myAssignedTasks = (window.AppData && window.AppData.tasks && Array.isArray(window.AppData.tasks)) ? window.AppData.tasks.filter(t => {
      if (!t.assignedTo) return false;
      const a = t.assignedTo.trim().toLowerCase();
      const name = (u.name || u.full_name || '').trim().toLowerCase();
      const roll = (u.rollNo || u.roll_no || u.user_code || '').trim().toLowerCase();
      return a === name || a === roll || (name && a.includes(name)) || (name && name.includes(a));
    }) : [];

    const myActivities = (window.AppData && window.AppData.activities && Array.isArray(window.AppData.activities)) ? window.AppData.activities.filter(a => {
      const st = (a.student || '').toString().trim().toLowerCase();
      const name = (u.name || u.full_name || '').toString().trim().toLowerCase();
      const roll = (u.rollNo || u.roll_no || u.user_code || '').toString().trim().toLowerCase();
      const empid = (u.empid || u.id || '').toString().trim().toLowerCase();
      return !st || st === name || st === roll || st === empid || (name && st.includes(name)) || (roll && st.includes(roll));
    }) : [];

    const activityPoints = myActivities.length > 0 ? (myActivities.length * 120) : 840;

    const tasksHtml = myAssignedTasks.length > 0 
          ? myAssignedTasks.slice(0,2).map(t=>`
              <div style="padding:10px;border-bottom:1px solid var(--border-color)">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                  <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${t.title}</div>
                  <span class="badge badge-${window.AppUtils && window.AppUtils.getStatusColor ? window.AppUtils.getStatusColor(t.status) : 'info'}">${t.status}</span>
                </div>
                <div style="font-size:11px;color:var(--text-secondary)">Due: ${window.AppUtils && window.AppUtils.formatDate ? window.AppUtils.formatDate(t.dueDate) : t.dueDate}</div>
              </div>`).join('') 
          : '<div style="font-size:13px;color:var(--text-secondary);text-align:center;padding:20px 0">No assigned tasks.</div>';
      
    const recentActHtml = myActivities.length > 0
          ? myActivities.slice(0,3).map(act=>`
              <div style="padding:10px;border-bottom:1px solid var(--border-color);cursor:pointer" onclick="window.Router.navigate('daily-activity')">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                  <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${act.experiment || 'Untitled Activity'}</div>
                  <span class="badge badge-${window.AppUtils && window.AppUtils.getStatusColor ? window.AppUtils.getStatusColor(act.status) : 'info'}">${act.status || 'Completed'}</span>
                </div>
                <div style="font-size:11px;color:var(--text-secondary)">Date: ${window.AppUtils && window.AppUtils.formatDate ? window.AppUtils.formatDate(act.date) : act.date} · Lab: ${act.lab || labName}</div>
              </div>`).join('')
          : '<div style="font-size:13px;color:var(--text-secondary);text-align:center;padding:20px 0">No recent activities logged.</div>';

    const notifsHtml = (window.AppData && window.AppData.notifications && Array.isArray(window.AppData.notifications))
      ? (window.AppData.notifications.length > 0 
          ? window.AppData.notifications.slice(0,3).map(n=>`
              <div class="notif-item" style="padding:10px 16px">
                <div class="notif-icon ${n.type}" style="width:32px;height:32px"><span class="material-icons-round" style="font-size:16px">${n.icon}</span></div>
                <div class="notif-content">
                  <div class="notif-title" style="font-size:12px">${n.title}</div>
                  <div class="notif-time">${n.time}</div>
                </div>
              </div>`).join('') 
          : '<div style="font-size:13px;color:var(--text-secondary);text-align:center;padding:20px 0">No new notifications.</div>')
      : '<div style="font-size:13px;color:var(--text-secondary);text-align:center;padding:20px 0">No new notifications.</div>';
    
    return `
    <div>
      <div class="dashboard-welcome animate-in" style="background:linear-gradient(135deg,#6A1B9A 0%,#E040FB 100%)">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div class="welcome-greeting">${todayStr}</div>
            <div class="welcome-name">Hello, ${(u.name || '').split(' ')[0]}</div>
            <div class="welcome-subtitle">${labName} · ${u.roll_no || u.rollNo || ''}</div>
          </div>
          <div style="background:rgba(255,255,255,0.1);border-radius:16px;padding:14px;text-align:center">
            <div style="font-size:28px;font-weight:800;color:#fff">${attPercent}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.7)">Attendance</div>
          </div>
        </div>
        <div class="welcome-stats">
          <div><div class="welcome-stat-val" style="display:flex;align-items:center;gap:4px"><span class="material-icons-round" style="font-size:20px;color:#69F0AE">check_circle</span> ${todayAtt}</div><div class="welcome-stat-lab">Today's Status</div></div>
          <div><div class="welcome-stat-val">${myActivities.length}</div><div class="welcome-stat-lab">Logged Activities</div></div>
          <div><div class="welcome-stat-val">${activityPoints}</div><div class="welcome-stat-lab">Activity Points <span class="material-icons-round" style="font-size:14px;color:#FFD54F">stars</span></div></div>
        </div>
      </div>
  
      <h2 class="section-title animate-in-2">Quick Actions</h2>
      <div class="cards-grid-3 animate-in-2 mb-24">
        ${[
          {icon:'add_task',label:'Submit Activity',route:'daily-activity',color:'linear-gradient(135deg,#4527A0,#7E57C2)'},
          {icon:'qr_code',label:'My QR Code',route:'qr-scanner',color:'linear-gradient(135deg,#6A1B9A,#E040FB)'},
          {icon:'inventory',label:'Update Stock',route:'stock-usage-update',color:'linear-gradient(135deg,#2E7D32,#4CAF50)'},
          {icon:'assignment',label:'My Tasks',route:'assigned-tasks',color:'linear-gradient(135deg,#1565C0,#2196F3)'},
          {icon:'event_note',label:'Attendance',route:'attendance-status',color:'linear-gradient(135deg,#E65100,#FF9800)'},
          {icon:'calendar_month',label:'Calendar',route:'student-calendar',color:'linear-gradient(135deg,#C2185B,#E91E63)'}
        ].map(q=>`
          <div class="card" style="cursor:pointer;padding:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center" onclick="window.Router.navigate('${q.route}')" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
            <div style="width:46px;height:46px;border-radius:12px;background:${q.color};display:flex;align-items:center;justify-content:center;margin-bottom:10px">
              <span class="material-icons-round" style="color:#fff">${q.icon}</span>
            </div>
            <div style="font-weight:600;font-size:13px;color:var(--text-primary)">${q.label}</div>
          </div>`).join('')}
      </div>
  
      <div class="cards-grid-3 animate-in-3" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px">
        <div class="card">
          <div class="card-header"><div class="card-title">My Tasks</div><button class="btn btn-ghost btn-sm" onclick="window.Router.navigate('assigned-tasks')">View</button></div>
          <div class="card-body" style="padding:12px">
            ${tasksHtml}
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Recent Activities</div><button class="btn btn-ghost btn-sm" onclick="window.Router.navigate('daily-activity')">View All</button></div>
          <div class="card-body" style="padding:12px">
            ${recentActHtml}
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Notifications</div><button class="btn btn-ghost btn-sm" onclick="window.Router.navigate('notifications')">View</button></div>
          <div class="card-body" style="padding:0">
            ${notifsHtml}
          </div>
        </div>
      </div>
    </div>`;
  } catch (err) {
    console.error("student-dashboard render error:", err);
    return `<div style="padding:40px;text-align:center;color:var(--danger)">Error rendering dashboard: ${err.message}</div>`;
  }
};
window.Screens['student-dashboard'].afterRender = function() {
  document.getElementById('topbar-title') && (document.getElementById('topbar-title').textContent = 'Student Portal');
};

// ---- DAILY ACTIVITY SUBMISSION ----
window.Screens['daily-activity'] = function() {
  try {
    const appData = window.AppData || {};
    if (!Array.isArray(window.Screens['daily-activity'].chemicals)) {
      window.Screens['daily-activity'].chemicals = [];
    }
    if (!Array.isArray(window.Screens['daily-activity'].equipments)) {
      window.Screens['daily-activity'].equipments = [];
    }
    const _d = new Date();
    const todayDateStr = `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`;
    const u = window.AppState.user || (appData.users ? appData.users.student : {name: 'Student'});
    const selectedLabName = window.AppState.selectedLab || u.lab || 'Microbiology Lab';
    const labName = selectedLabName;
    const supervisorMap = {
      'Microbiology Lab': 'Dr. Priya Sharma',
      'Molecular Biology Lab': 'Dr. Rajesh Kumar',
      'Biotechnology Lab': 'Dr. Anita Patel',
      'Clinical Genetics Lab': 'Dr. Suresh Nair',
      'Pathology Lab': 'Dr. Meena Iyer',
      'Bioinformatics Lab': 'Dr. Arun Menon'
    };
    const lab = (appData.labs && Array.isArray(appData.labs)) ? appData.labs.find(l => l.name === selectedLabName || l.name.toLowerCase() === selectedLabName.toLowerCase() || (selectedLabName && l.name.includes(selectedLabName))) : null;
    const supervisorName = (lab && lab.head) ? lab.head : (supervisorMap[selectedLabName] || 'Dr. Priya Sharma');
    const myActivities = (appData.activities && Array.isArray(appData.activities)) ? appData.activities.filter(a => {
      const st = (a.student || '').toString().trim().toLowerCase();
      const name = (u.name || u.full_name || '').toString().trim().toLowerCase();
      const roll = (u.rollNo || u.roll_no || u.user_code || '').toString().trim().toLowerCase();
      const empid = (u.empid || u.id || '').toString().trim().toLowerCase();
      return !st || st === name || st === roll || st === empid || (name && st.includes(name)) || (roll && st.includes(roll));
    }) : [];
  
    const sq = (window.Screens['daily-activity'].searchQuery || '').toLowerCase().trim();
    const filteredActivities = myActivities.filter(act => {
      if (!sq) return true;
      return (act.experiment || '').toLowerCase().includes(sq) ||
             (act.chemicals || '').toString().toLowerCase().includes(sq) ||
             (act.equipment || '').toString().toLowerCase().includes(sq) ||
             (act.notes || '').toLowerCase().includes(sq) ||
             (act.status || '').toLowerCase().includes(sq) ||
             (act.date || '').toLowerCase().includes(sq);
    });

    const rawChems = (Array.isArray(appData.chemicals) ? appData.chemicals : []).concat(Array.isArray(appData.plasticware) ? appData.plasticware : []).concat(Array.isArray(appData.glassware) ? appData.glassware : []);
    const chemsList = [];
    const _seenChems = new Set();
    rawChems.forEach(c => { if (c && c.name && !_seenChems.has(c.name.toLowerCase())) { _seenChems.add(c.name.toLowerCase()); chemsList.push(c); } });

    const rawEquip = Array.isArray(appData.equipment) ? appData.equipment : [];
    const equipList = [];
    const _seenEquip = new Set();
    rawEquip.forEach(e => { if (e && e.name && !_seenEquip.has(e.name.toLowerCase())) { _seenEquip.add(e.name.toLowerCase()); equipList.push(e); } });

    const historyHtml = filteredActivities.length === 0
      ? `<div style="padding:24px;text-align:center;color:var(--text-secondary)">
           <span class="material-icons-round" style="font-size:40px;color:var(--text-muted)">history</span>
           <div style="margin-top:8px;font-size:13px">${sq ? 'No activity logs matching your search.' : 'No past activity logs yet.'}</div>
         </div>`
      : filteredActivities.map(act => {
          const chemsStr = Array.isArray(act.chemicals) ? act.chemicals.join(', ') : (act.chemicals || '');
          const equipStr = Array.isArray(act.equipment) ? act.equipment.join(', ') : (act.equipment || '');
          return `
        <div style="padding:16px 20px;border-bottom:1px solid var(--border-color);cursor:pointer;transition:background 0.2s" class="card-hover" id="act-row-${act.id}" onclick="window.Screens['daily-activity'].openEdit(${act.id})">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
            <div style="flex:1;min-width:0">
              <div style="font-weight:700;font-size:14px;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${act.experiment || 'Untitled Experiment'}</div>
              <div style="font-size:11px;color:var(--text-secondary);margin-top:3px">
                ${window.AppUtils && window.AppUtils.formatDate ? window.AppUtils.formatDate(act.date) : act.date} &nbsp;·&nbsp; ${act.duration || '--'}
                &nbsp;·&nbsp; <span class="badge badge-${window.AppUtils && window.AppUtils.getStatusColor ? window.AppUtils.getStatusColor(act.status) : 'info'}" style="font-size:10px">${act.status || 'Completed'}</span>
              </div>
              ${chemsStr ? `<div style="font-size:11px;color:var(--text-muted);margin-top:4px"><b>Chemicals:</b> ${chemsStr}</div>` : ''}
              ${equipStr ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px"><b>Equipment:</b> ${equipStr}</div>` : ''}
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0" onclick="event.stopPropagation()">
              <button class="btn btn-outline btn-sm" title="Edit Activity" onclick="window.Screens['daily-activity'].openEdit(${act.id})">
                <span class="material-icons-round" style="font-size:15px">edit</span> Edit
              </button>
              <button class="btn btn-sm" style="background:rgba(244,67,54,0.12);color:var(--danger);border:1px solid rgba(244,67,54,0.3)" title="Delete Activity" onclick="window.Screens['daily-activity'].deleteActivity(${act.id})">
                <span class="material-icons-round" style="font-size:15px">delete</span>
              </button>
            </div>
          </div>
        </div>`;
      }).join('');
  
    return `
    <div>
      <!-- Edit Modal (hidden by default) -->
      <div id="edit-activity-modal" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);align-items:center;justify-content:center;padding:16px">
        <div style="background:var(--bg-card);border-radius:20px;padding:28px;width:100%;max-width:560px;box-shadow:0 24px 64px rgba(0,0,0,0.4);position:relative;max-height:90vh;overflow-y:auto">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
            <div style="font-size:18px;font-weight:700;color:var(--text-primary)">Edit Activity Log</div>
            <button onclick="window.Screens['daily-activity'].closeEdit()" style="background:var(--bg-base);border:none;border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-secondary)">
              <span class="material-icons-round">close</span>
            </button>
          </div>
          <input type="hidden" id="edit-act-id">
          <div class="form-row">
            <div class="form-group"><label class="form-label">Date</label><input type="date" id="edit-da-date" class="form-input"></div>
            <div class="form-group"><label class="form-label">Status</label><select id="edit-da-status" class="form-input form-select"><option>Completed</option><option>In Progress</option><option>Failed</option></select></div>
          </div>
          <div class="form-group"><label class="form-label">Experiment / Activity Title</label><input type="text" id="edit-da-title" class="form-input"></div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Start Time</label><input type="time" id="edit-da-start" class="form-input"></div>
            <div class="form-group"><label class="form-label">End Time</label><input type="time" id="edit-da-end" class="form-input"></div>
          </div>
          <div class="form-group">
            <label class="form-label">Chemicals Used (Select from dropdown or type to add)</label>
            <div style="display:flex;gap:8px;margin-bottom:8px">
              <select id="edit-chem-select" class="form-input form-select" style="flex:1">
                <option value="">-- Select chemical --</option>
                ${chemsList.map(c=>`<option value="${c.name}">${c.name} (${c.unit||'pcs'})</option>`).join('')}
              </select>
              <input type="text" id="edit-chemical-input" class="form-input" style="flex:1" placeholder="Or type & press Enter" onkeydown="if(event.key==='Enter'){event.preventDefault();window.Screens['daily-activity'].handleEditAddClick('chemical');}">
              <button type="button" class="btn btn-outline" onclick="window.Screens['daily-activity'].handleEditAddClick('chemical')">Add</button>
            </div>
            <div id="edit-chemical-badges" style="display:flex;flex-wrap:wrap;gap:8px;min-height:36px;padding:8px;background:var(--bg-base);border:1px solid var(--border-color);border-radius:var(--border-radius-sm)"></div>
          </div>
          <div class="form-group">
            <label class="form-label">Equipment Used (Select from dropdown or type to add)</label>
            <div style="display:flex;gap:8px;margin-bottom:8px">
              <select id="edit-equip-select" class="form-input form-select" style="flex:1">
                <option value="">-- Select equipment --</option>
                ${equipList.map(e=>`<option value="${e.name}">${e.name} (${e.category||'General'})</option>`).join('')}
              </select>
              <input type="text" id="edit-equipment-input" class="form-input" style="flex:1" placeholder="Or type & press Enter" onkeydown="if(event.key==='Enter'){event.preventDefault();window.Screens['daily-activity'].handleEditAddClick('equipment');}">
              <button type="button" class="btn btn-outline" onclick="window.Screens['daily-activity'].handleEditAddClick('equipment')">Add</button>
            </div>
            <div id="edit-equipment-badges" style="display:flex;flex-wrap:wrap;gap:8px;min-height:36px;padding:8px;background:var(--bg-base);border:1px solid var(--border-color);border-radius:var(--border-radius-sm)"></div>
          </div>
          <div class="form-group"><label class="form-label">Observations / Notes</label><textarea id="edit-da-notes" class="form-input form-textarea" style="min-height:80px"></textarea></div>
          <div style="display:flex;gap:12px;justify-content:space-between;align-items:center;margin-top:20px;border-top:1px solid var(--border-color);padding-top:16px">
            <button type="button" class="btn btn-sm" style="background:rgba(244,67,54,0.12);color:var(--danger);border:1px solid rgba(244,67,54,0.3)" onclick="window.Screens['daily-activity'].deleteFromEdit()">
              <span class="material-icons-round" style="font-size:16px">delete</span> Delete Log
            </button>
            <div style="display:flex;gap:12px">
              <button type="button" class="btn btn-ghost" onclick="window.Screens['daily-activity'].closeEdit()">Cancel</button>
              <button type="button" class="btn btn-primary" onclick="window.Screens['daily-activity'].saveEdit()">
                <span class="material-icons-round">save</span> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      ${window.Components.pageHeader('Submit Daily Activity','Log your laboratory experiments and work')}
      <div class="card mb-24">
        <div class="card-body">
          <div class="form-row">
            <div class="form-group"><label class="form-label">Date</label><input type="date" id="da-date" class="form-input" value="${todayDateStr}"></div>
            <div class="form-group"><label class="form-label">Supervisor</label><input class="form-input" value="${supervisorName}" readonly style="background:var(--bg-base)"></div>
            <div class="form-group"><label class="form-label">Assigned Lab</label><select id="da-lab" class="form-input form-select" disabled style="background:var(--bg-base);cursor:not-allowed;opacity:0.8"><option value="${labName}">${labName}</option></select></div>
          </div>
          <div class="form-group"><label class="form-label">Experiment / Activity Title</label><input type="text" id="da-title" class="form-input" placeholder="e.g. DNA Extraction Protocol"></div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Start Time</label><input type="time" id="da-start" class="form-input" value="09:30"></div>
            <div class="form-group"><label class="form-label">End Time</label><input type="time" id="da-end" class="form-input" value="13:00"></div>
          </div>
          <div class="form-group">
            <label class="form-label">Chemicals Used (Select from dropdown or type custom name to add multiple)</label>
            <div style="display:flex;gap:8px;margin-bottom:8px">
              <select id="da-chem-select" class="form-input form-select" style="flex:1">
                <option value="">-- Select chemical or consumable --</option>
                ${chemsList.map(c=>`<option value="${c.name}">${c.name} (${c.unit||'pcs'})</option>`).join('')}
              </select>
              <input type="text" id="da-chem-input" class="form-input" style="flex:1" placeholder="Or type custom chemical & press Enter" onkeydown="if(event.key==='Enter'){event.preventDefault();window.Screens['daily-activity'].handleAddClick('chemical');}">
              <button type="button" class="btn btn-outline" onclick="window.Screens['daily-activity'].handleAddClick('chemical')">Add</button>
            </div>
            <div id="chemical-badges" style="display:flex;flex-wrap:wrap;gap:8px;min-height:36px;padding:8px;background:var(--bg-base);border:1px solid var(--border-color);border-radius:var(--border-radius-sm)"></div>
          </div>
          <div class="form-group">
            <label class="form-label">Equipment Used (Select from dropdown or type custom name to add multiple)</label>
            <div style="display:flex;gap:8px;margin-bottom:8px">
              <select id="da-equip-select" class="form-input form-select" style="flex:1">
                <option value="">-- Select equipment --</option>
                ${equipList.map(e=>`<option value="${e.name}">${e.name} (${e.category||'General'})</option>`).join('')}
              </select>
              <input type="text" id="da-equip-input" class="form-input" style="flex:1" placeholder="Or type custom equipment & press Enter" onkeydown="if(event.key==='Enter'){event.preventDefault();window.Screens['daily-activity'].handleAddClick('equipment');}">
              <button type="button" class="btn btn-outline" onclick="window.Screens['daily-activity'].handleAddClick('equipment')">Add</button>
            </div>
            <div id="equipment-badges" style="display:flex;flex-wrap:wrap;gap:8px;min-height:36px;padding:8px;background:var(--bg-base);border:1px solid var(--border-color);border-radius:var(--border-radius-sm)"></div>
          </div>
          <div class="form-group"><label class="form-label">Observations / Notes</label><textarea id="da-notes" class="form-input form-textarea" placeholder="Detailed results and observations..."></textarea></div>
          <div class="form-group"><label class="form-label">Status</label><select id="da-status" class="form-input form-select"><option>Completed</option><option>In Progress</option><option>Failed</option></select></div>
          <button type="button" class="btn btn-primary w-full" style="justify-content:center" onclick="window.Screens['daily-activity'].submitForm()">
            <span class="material-icons-round">send</span> Submit Activity Log
          </button>
        </div>
      </div>
    </div>

    <div class="animate-in-2" style="margin:32px 0 16px 0;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <h3 class="section-title" style="margin:0" id="da-history-title">Past Activity Logs (${filteredActivities.length})</h3>
      <div style="display:flex;gap:8px;flex:1;min-width:240px;max-width:360px">
        <div style="position:relative;flex:1">
          <span class="material-icons-round" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:18px;color:var(--text-secondary)">search</span>
          <input type="text" id="da-search-input" class="form-input" placeholder="Search experiment, chemicals, date..." value="${window.Screens['daily-activity'].searchQuery || ''}" oninput="window.Screens['daily-activity'].onSearch(this.value)" style="padding-left:38px;padding-right:32px">
          <span id="da-search-clear" class="material-icons-round" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:18px;color:var(--text-secondary);cursor:pointer;display:${sq ? 'block' : 'none'}" onclick="window.Screens['daily-activity'].onSearch('')">close</span>
        </div>
      </div>
    </div>
    <div class="card animate-in-2 mb-24" id="da-history-list">
      ${historyHtml}
    </div>
  </div>`;
  } catch (err) {
    console.error("daily-activity render error:", err);
    return `<div style="padding:40px;text-align:center;color:var(--danger)">Error rendering activity: ${err.message}</div>`;
  }
};

window.Screens['daily-activity'].onSearch = function(val) {
  window.Screens['daily-activity'].searchQuery = val;
  const input = document.getElementById('da-search-input');
  if (input && input.value !== val) {
    input.value = val;
  }
  const clearBtn = document.getElementById('da-search-clear');
  if (clearBtn) {
    clearBtn.style.display = (val && val.trim().length > 0) ? 'block' : 'none';
  }
  window.Screens['daily-activity'].updateList();
};

window.Screens['daily-activity'].updateList = function() {
  const appData = window.AppData || {};
  const u = window.AppState.user || (appData.users ? appData.users.student : {name: 'Student'});
  const myActivities = (appData.activities && Array.isArray(appData.activities)) ? appData.activities.filter(a => {
    const st = (a.student || '').toString().trim().toLowerCase();
    const name = (u.name || u.full_name || '').toString().trim().toLowerCase();
    const roll = (u.rollNo || u.roll_no || u.user_code || '').toString().trim().toLowerCase();
    const empid = (u.empid || u.id || '').toString().trim().toLowerCase();
    return !st || st === name || st === roll || st === empid || (name && st.includes(name)) || (roll && st.includes(roll));
  }) : [];
  const sq = (window.Screens['daily-activity'].searchQuery || '').toLowerCase().trim();
  const filteredActivities = myActivities.filter(act => {
    if (!sq) return true;
    return (act.experiment || '').toLowerCase().includes(sq) ||
           (act.chemicals || '').toString().toLowerCase().includes(sq) ||
           (act.equipment || '').toString().toLowerCase().includes(sq) ||
           (act.notes || '').toLowerCase().includes(sq) ||
           (act.status || '').toLowerCase().includes(sq) ||
           (act.date || '').toLowerCase().includes(sq);
  });

  const titleEl = document.getElementById('da-history-title');
  if (titleEl) {
    titleEl.textContent = `Past Activity Logs (${filteredActivities.length})`;
  }

  const listEl = document.getElementById('da-history-list');
  if (!listEl) return;

  const historyHtml = filteredActivities.length === 0
    ? `<div style="padding:24px;text-align:center;color:var(--text-secondary)">
         <span class="material-icons-round" style="font-size:40px;color:var(--text-muted)">history</span>
         <div style="margin-top:8px;font-size:13px">${sq ? 'No activity logs matching your search.' : 'No past activity logs yet.'}</div>
       </div>`
    : filteredActivities.map(act => {
        const chemsStr = Array.isArray(act.chemicals) ? act.chemicals.join(', ') : (act.chemicals || '');
        const equipStr = Array.isArray(act.equipment) ? act.equipment.join(', ') : (act.equipment || '');
        return `
      <div style="padding:16px 20px;border-bottom:1px solid var(--border-color);cursor:pointer;transition:background 0.2s" class="card-hover" id="act-row-${act.id}" onclick="window.Screens['daily-activity'].openEdit(${act.id})">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;font-size:14px;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${act.experiment || 'Untitled Experiment'}</div>
            <div style="font-size:11px;color:var(--text-secondary);margin-top:3px">
              ${window.AppUtils && window.AppUtils.formatDate ? window.AppUtils.formatDate(act.date) : act.date} &nbsp;·&nbsp; ${act.duration || '--'}
              &nbsp;·&nbsp; <span class="badge badge-${window.AppUtils && window.AppUtils.getStatusColor ? window.AppUtils.getStatusColor(act.status) : 'info'}" style="font-size:10px">${act.status || 'Completed'}</span>
            </div>
            ${chemsStr ? `<div style="font-size:11px;color:var(--text-muted);margin-top:4px"><b>Chemicals:</b> ${chemsStr}</div>` : ''}
            ${equipStr ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px"><b>Equipment:</b> ${equipStr}</div>` : ''}
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0" onclick="event.stopPropagation()">
            <button class="btn btn-outline btn-sm" title="Edit Activity" onclick="window.Screens['daily-activity'].openEdit(${act.id})">
              <span class="material-icons-round" style="font-size:15px">edit</span> Edit
            </button>
            <button class="btn btn-sm" style="background:rgba(244,67,54,0.12);color:var(--danger);border:1px solid rgba(244,67,54,0.3)" title="Delete Activity" onclick="window.Screens['daily-activity'].deleteActivity(${act.id})">
              <span class="material-icons-round" style="font-size:15px">delete</span>
            </button>
          </div>
        </div>
      </div>`;
    }).join('');

  listEl.innerHTML = historyHtml;
};

window.Screens['daily-activity'].afterRender = function() {
  window.Screens['daily-activity'].chemicals = [];
  window.Screens['daily-activity'].equipments = [];

  function updateChemBadges() {
    const container = document.getElementById('chemical-badges');
    if (!container) return;
    container.innerHTML = window.Screens['daily-activity'].chemicals.length === 0 ? `<span style="color:var(--text-muted);font-size:12px">No chemicals added</span>` : window.Screens['daily-activity'].chemicals.map((chem, idx) => `
      <div class="badge badge-primary" style="padding:6px 12px; display:inline-flex; align-items:center; gap:6px; margin:2px">
        ${chem}
        <span class="material-icons-round" style="font-size:14px;cursor:pointer" onclick="window.Screens['daily-activity'].removeChemical(${idx})">close</span>
      </div>
    `).join('');
  }

  function updateEquipBadges() {
    const container = document.getElementById('equipment-badges');
    if (!container) return;
    container.innerHTML = window.Screens['daily-activity'].equipments.length === 0 ? `<span style="color:var(--text-muted);font-size:12px">No equipment added</span>` : window.Screens['daily-activity'].equipments.map((eq, idx) => `
      <div class="badge badge-info" style="padding:6px 12px; display:inline-flex; align-items:center; gap:6px; margin:2px">
        ${eq}
        <span class="material-icons-round" style="font-size:14px;cursor:pointer" onclick="window.Screens['daily-activity'].removeEquipment(${idx})">close</span>
      </div>
    `).join('');
  }

  window.Screens['daily-activity'].addChemical = function(val) {
    if (!val || !val.trim()) return;
    const clean = val.trim();
    if (!window.Screens['daily-activity'].chemicals.includes(clean)) {
      window.Screens['daily-activity'].chemicals.push(clean);
      updateChemBadges();
    } else {
      window.Components.toast(`${clean} already added`, 'info');
    }
  };

  window.Screens['daily-activity'].removeChemical = function(idx) {
    window.Screens['daily-activity'].chemicals.splice(idx, 1);
    updateChemBadges();
  };

  window.Screens['daily-activity'].addEquipment = function(val) {
    if (!val || !val.trim()) return;
    const clean = val.trim();
    if (!window.Screens['daily-activity'].equipments.includes(clean)) {
      window.Screens['daily-activity'].equipments.push(clean);
      updateEquipBadges();
    } else {
      window.Components.toast(`${clean} already added`, 'info');
    }
  };

  window.Screens['daily-activity'].removeEquipment = function(idx) {
    window.Screens['daily-activity'].equipments.splice(idx, 1);
    updateEquipBadges();
  };

  window.Screens['daily-activity'].handleAddClick = function(type) {
    if (type === 'chemical') {
      const sel = document.getElementById('da-chem-select');
      const inp = document.getElementById('da-chem-input');
      const selVal = sel && sel.value ? sel.value.trim() : '';
      const inpVal = inp && inp.value ? inp.value.trim() : '';
      if (!selVal && !inpVal) {
        window.Components.toast('Please select a chemical or type custom name', 'info');
        return;
      }
      if (selVal) window.Screens['daily-activity'].addChemical(selVal);
      if (inpVal && inpVal !== selVal) window.Screens['daily-activity'].addChemical(inpVal);
      if (sel) sel.value = '';
      if (inp) inp.value = '';
    } else if (type === 'equipment') {
      const sel = document.getElementById('da-equip-select');
      const inp = document.getElementById('da-equip-input');
      const selVal = sel && sel.value ? sel.value.trim() : '';
      const inpVal = inp && inp.value ? inp.value.trim() : '';
      if (!selVal && !inpVal) {
        window.Components.toast('Please select equipment or type custom name', 'info');
        return;
      }
      if (selVal) window.Screens['daily-activity'].addEquipment(selVal);
      if (inpVal && inpVal !== selVal) window.Screens['daily-activity'].addEquipment(inpVal);
      if (sel) sel.value = '';
      if (inp) inp.value = '';
    }
  };

  window.Screens['daily-activity'].handleEditAddClick = function(type) {
    if (type === 'chemical') {
      const sel = document.getElementById('edit-chem-select');
      const inp = document.getElementById('edit-chemical-input');
      const selVal = sel && sel.value ? sel.value.trim() : '';
      const inpVal = inp && inp.value ? inp.value.trim() : '';
      if (!selVal && !inpVal) {
        window.Components.toast('Please select a chemical or type custom name', 'info');
        return;
      }
      if (selVal) window.Screens['daily-activity'].addEditChemical(selVal);
      if (inpVal && inpVal !== selVal) window.Screens['daily-activity'].addEditChemical(inpVal);
      if (sel) sel.value = '';
      if (inp) inp.value = '';
    } else if (type === 'equipment') {
      const sel = document.getElementById('edit-equip-select');
      const inp = document.getElementById('edit-equipment-input');
      const selVal = sel && sel.value ? sel.value.trim() : '';
      const inpVal = inp && inp.value ? inp.value.trim() : '';
      if (!selVal && !inpVal) {
        window.Components.toast('Please select equipment or type custom name', 'info');
        return;
      }
      if (selVal) window.Screens['daily-activity'].addEditEquipment(selVal);
      if (inpVal && inpVal !== selVal) window.Screens['daily-activity'].addEditEquipment(inpVal);
      if (sel) sel.value = '';
      if (inp) inp.value = '';
    }
  };

  updateChemBadges();
  updateEquipBadges();
};

window.Screens['daily-activity'].submitForm = async function() {
  const titleVal = document.getElementById('da-title').value.trim();
  const dateVal = document.getElementById('da-date').value;
  const startTime = document.getElementById('da-start').value;
  const endTime = document.getElementById('da-end').value;
  const equipmentVal = (window.Screens['daily-activity'].equipments || []).join(', ');
  const notesVal = document.getElementById('da-notes').value.trim();
  const statusVal = document.getElementById('da-status').value;

  if (!titleVal) {
    window.Components.toast('Please enter an experiment title', 'error');
    return;
  }

  const appData = window.AppData || {};
  const u = window.AppState.user || (appData.users ? appData.users.student : {name: 'Student'});
  const studentIdOrName = u.name || u.rollNo || u.roll_no || u.empid || u.id || 'Student';
  const labName = window.AppState.selectedLab || u.lab || 'Microbiology Lab';

  // Calculate simple duration string
  let durationStr = '3h 30m';
  try {
    const [h1, m1] = startTime.split(':').map(Number);
    const [h2, m2] = endTime.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff > 0) {
      const dh = Math.floor(diff / 60);
      const dm = diff % 60;
      durationStr = `${dh}h ${dm > 0 ? dm + 'm' : '00m'}`;
    }
  } catch(e) {}

  const chemicalsStr = (window.Screens['daily-activity'].chemicals || []).join(', ');

  const submitBtn = document.querySelector('button[onclick="window.Screens[\'daily-activity\'].submitForm()"]');
  if (submitBtn) submitBtn.disabled = true;

  const res = await window.fetchAPI('activities.php?action=submit', {
    method: 'POST',
    body: {
      student: studentIdOrName,
      date: dateVal,
      lab: labName,
      experiment: titleVal,
      duration: durationStr,
      chemicals: chemicalsStr,
      equipment: equipmentVal,
      notes: notesVal || 'Logged activity protocols',
      status: statusVal.toLowerCase()
    }
  });

  if (submitBtn) submitBtn.disabled = false;

  if (res.success) {
    window.Components.toast('Activity submitted successfully!', 'success');
    document.getElementById('da-title').value = '';
    document.getElementById('da-notes').value = '';
    const newAct = {
      id: res.id || Date.now(),
      student: studentIdOrName,
      date: dateVal,
      lab: labName,
      experiment: titleVal,
      duration: durationStr,
      chemicals: chemicalsStr ? chemicalsStr.split(',').map(s => s.trim()) : [],
      equipment: equipmentVal ? equipmentVal.split(',').map(s => s.trim()) : [],
      notes: notesVal || 'Logged activity protocols',
      status: statusVal.toLowerCase() || 'completed'
    };
    if (!window.AppData.activities) window.AppData.activities = [];
    window.AppData.activities.unshift(newAct);
    window.Screens['daily-activity'].chemicals = [];
    window.Screens['daily-activity'].equipments = [];
    if (window.AppActions && window.AppActions.syncData) {
      await window.AppActions.syncData();
    }
    window.Screens['daily-activity'].updateList();
  } else {
    window.Components.toast(res.message || 'Failed to submit activity', 'danger');
  }
};

// ---- EDIT ACTIVITY MODAL LOGIC ----
window.Screens['daily-activity']._editChemicals = [];
window.Screens['daily-activity']._editEquipments = [];

window.Screens['daily-activity'].openEdit = function(id) {
  const appData = window.AppData || {};
  const act = (appData.activities || []).find(a => a.id === id);
  if (!act) return;

  let chems = [];
  if (Array.isArray(act.chemicals)) {
    chems = [...act.chemicals];
  } else if (typeof act.chemicals === 'string' && act.chemicals.trim()) {
    chems = act.chemicals.split(',').map(s => s.trim()).filter(Boolean);
  }
  window.Screens['daily-activity']._editChemicals = chems;

  let equips = [];
  if (Array.isArray(act.equipment)) {
    equips = [...act.equipment];
  } else if (typeof act.equipment === 'string' && act.equipment.trim()) {
    equips = act.equipment.split(',').map(s => s.trim()).filter(Boolean);
  }
  window.Screens['daily-activity']._editEquipments = equips;

  document.getElementById('edit-act-id').value = id;
  document.getElementById('edit-da-date').value = act.date || '';
  document.getElementById('edit-da-title').value = act.experiment || '';
  document.getElementById('edit-da-notes').value = act.notes || '';

  const statusSel = document.getElementById('edit-da-status');
  const statusMap = { 'completed': 'Completed', 'in-progress': 'In Progress', 'failed': 'Failed' };
  statusSel.value = statusMap[act.status] || act.status || 'Completed';

  document.getElementById('edit-da-start').value = act.startTime || '09:30';
  document.getElementById('edit-da-end').value = act.endTime || '13:00';

  window.Screens['daily-activity']._renderEditBadges();
  window.Screens['daily-activity']._renderEditEquipBadges();

  const modal = document.getElementById('edit-activity-modal');
  modal.style.display = 'flex';
};

window.Screens['daily-activity']._renderEditBadges = function() {
  const container = document.getElementById('edit-chemical-badges');
  if (!container) return;
  container.innerHTML = window.Screens['daily-activity']._editChemicals.length === 0 ? `<span style="color:var(--text-muted);font-size:12px">No chemicals added</span>` : window.Screens['daily-activity']._editChemicals.map((chem, idx) => `
    <div class="badge badge-primary" style="padding:6px 12px;display:inline-flex;align-items:center;gap:6px;margin:2px">
      ${chem}
      <span class="material-icons-round" style="font-size:14px;cursor:pointer" onclick="window.Screens['daily-activity']._removeEditChemical(${idx})">close</span>
    </div>
  `).join('');
};

window.Screens['daily-activity']._removeEditChemical = function(idx) {
  window.Screens['daily-activity']._editChemicals.splice(idx, 1);
  window.Screens['daily-activity']._renderEditBadges();
};

window.Screens['daily-activity'].addEditChemical = function(val) {
  if (!val || !val.trim()) return;
  const clean = val.trim();
  if (!window.Screens['daily-activity']._editChemicals.includes(clean)) {
    window.Screens['daily-activity']._editChemicals.push(clean);
    window.Screens['daily-activity']._renderEditBadges();
  }
};

window.Screens['daily-activity']._renderEditEquipBadges = function() {
  const container = document.getElementById('edit-equipment-badges');
  if (!container) return;
  container.innerHTML = window.Screens['daily-activity']._editEquipments.length === 0 ? `<span style="color:var(--text-muted);font-size:12px">No equipment added</span>` : window.Screens['daily-activity']._editEquipments.map((eq, idx) => `
    <div class="badge badge-info" style="padding:6px 12px;display:inline-flex;align-items:center;gap:6px;margin:2px">
      ${eq}
      <span class="material-icons-round" style="font-size:14px;cursor:pointer" onclick="window.Screens['daily-activity']._removeEditEquipment(${idx})">close</span>
    </div>
  `).join('');
};

window.Screens['daily-activity']._removeEditEquipment = function(idx) {
  window.Screens['daily-activity']._editEquipments.splice(idx, 1);
  window.Screens['daily-activity']._renderEditEquipBadges();
};

window.Screens['daily-activity'].addEditEquipment = function(val) {
  if (!val || !val.trim()) return;
  const clean = val.trim();
  if (!window.Screens['daily-activity']._editEquipments.includes(clean)) {
    window.Screens['daily-activity']._editEquipments.push(clean);
    window.Screens['daily-activity']._renderEditEquipBadges();
  }
};

window.Screens['daily-activity'].closeEdit = function() {
  const modal = document.getElementById('edit-activity-modal');
  if (modal) modal.style.display = 'none';
};

window.Screens['daily-activity'].deleteFromEdit = async function() {
  const id = parseInt(document.getElementById('edit-act-id').value);
  if (id && confirm('Are you sure you want to delete this activity log?')) {
    await window.Screens['daily-activity'].deleteActivity(id);
    window.Screens['daily-activity'].closeEdit();
  }
};

window.Screens['daily-activity'].saveEdit = async function() {
  const id = parseInt(document.getElementById('edit-act-id').value);
  const titleVal = document.getElementById('edit-da-title').value.trim();
  if (!titleVal) {
    window.Components.toast('Activity title cannot be empty', 'error');
    return;
  }

  const startTime = document.getElementById('edit-da-start').value;
  const endTime = document.getElementById('edit-da-end').value;
  let durationStr = '3h 30m';
  try {
    const [h1, m1] = startTime.split(':').map(Number);
    const [h2, m2] = endTime.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff > 0) {
      const dh = Math.floor(diff / 60);
      const dm = diff % 60;
      durationStr = `${dh}h ${dm > 0 ? dm + 'm' : '00m'}`;
    }
  } catch(e) {}

  const statusRaw = document.getElementById('edit-da-status').value;
  const statusMap = { 'Completed': 'completed', 'In Progress': 'in-progress', 'Failed': 'failed' };
  const appData = window.AppData || {};
  const u = window.AppState.user || (appData.users ? appData.users.student : {name: 'Student'});
  const studentIdOrName = u.name || u.rollNo || u.roll_no || u.empid || u.id || 'Student';
  const labName = window.AppState.selectedLab || u.lab || 'Microbiology Lab';

  const res = await window.fetchAPI('activities.php?action=update', {
    method: 'POST',
    body: {
      id: id,
      student: studentIdOrName,
      date: document.getElementById('edit-da-date').value,
      lab: labName,
      experiment: titleVal,
      notes: document.getElementById('edit-da-notes').value.trim(),
      status: statusMap[statusRaw] || statusRaw || 'completed',
      duration: durationStr,
      chemicals: (window.Screens['daily-activity']._editChemicals || []).join(', '),
      equipment: (window.Screens['daily-activity']._editEquipments || []).join(', ')
    }
  });

  if (res.success) {
    window.Screens['daily-activity'].closeEdit();
    window.Components.toast('Activity updated successfully!', 'success');
    if (window.AppActions && window.AppActions.syncData) {
      await window.AppActions.syncData();
    }
    window.Screens['daily-activity'].updateList();
  } else {
    window.Components.toast(res.message || 'Failed to update activity', 'danger');
  }
};

window.Screens['daily-activity'].deleteActivity = async function(id) {
  if (!confirm('Are you sure you want to delete this activity?')) return;
  const res = await window.fetchAPI(`activities.php?action=delete&id=${id}`);
  if (res.success) {
    window.Components.toast('Activity deleted.', 'success');
    if (window.AppActions && window.AppActions.syncData) {
      await window.AppActions.syncData();
    }
    window.Router.render();
  } else {
    window.Components.toast(res.message || 'Failed to delete activity', 'danger');
  }
};

window.Screens['daily-activity'].deleteFromEdit = async function() {
  const idEl = document.getElementById('edit-act-id');
  if (!idEl || !idEl.value) return;
  const id = parseInt(idEl.value);
  if (isNaN(id)) return;
  window.Screens['daily-activity'].closeEdit();
  await window.Screens['daily-activity'].deleteActivity(id);
};

// ---- QR CODE DISPLAY (Student QR) ----
window.Screens['qr-scanner'] = function() {
  const u = window.AppState.user || window.AppData.users.student;
  const labName = window.AppState.selectedLab || u.lab || 'Microbiology Lab';
  const qrData = u.rollNo || 'MB2024001';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}&color=6A1B9A&bgcolor=FFFFFF`;

  return `
  <div style="display:flex;flex-direction:column;align-items:center;padding:20px 10px">
    ${window.Components.pageHeader('My QR Code','Show this code to scan for attendance or verification')}
    
    <div class="card animate-in" style="width:100%;max-width:400px;text-align:center;padding:32px 24px;border-radius:24px;box-shadow:0 12px 32px rgba(106, 27, 154, 0.15);background:var(--bg-card);margin-top:20px">
      <div style="display:flex;flex-direction:column;align-items:center">
        <!-- Student Avatar / Initials -->
        <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#6A1B9A,#E040FB);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:24px;margin-bottom:16px;box-shadow:0 4px 12px rgba(106,27,154,0.3)">
          ${u.name.split(' ').map(n=>n[0]).join('')}
        </div>
        
        <h3 style="font-size:20px;font-weight:700;color:var(--text-primary);margin:0 0 6px 0">${u.name}</h3>
        <p style="font-size:13px;color:var(--text-secondary);margin:0 0 24px 0">${labName} · ${u.year || '3rd Year'}</p>
        
        <!-- QR Code Container -->
        <div style="background:#fff;padding:16px;border-radius:18px;box-shadow:0 8px 24px rgba(0,0,0,0.06);margin-bottom:24px;display:flex;align-items:center;justify-content:center">
          <img src="${qrUrl}" alt="Student QR Code" style="width:200px;height:200px;display:block" onerror="this.onerror=null;this.src='https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${u.rollNo}';">
        </div>
        
        <!-- Student ID (Roll No) -->
        <div style="background:var(--bg-base);border:1px solid var(--border-color);border-radius:12px;padding:12px 20px;width:100%;display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:12px;color:var(--text-secondary);font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Student ID</span>
          <span style="font-size:15px;color:var(--primary-bright);font-weight:700;font-family:monospace;letter-spacing:1px">${u.rollNo}</span>
        </div>
        
        <div style="font-size:11px;color:var(--text-muted);margin-top:12px;display:flex;align-items:center;gap:4px">
          <span class="material-icons-round" style="font-size:14px;color:var(--success)">verified</span>
          <span>Valid Student ID for Smart Stock System</span>
        </div>
      </div>
    </div>
  </div>`;
};
window.Screens['qr-scanner'].afterRender = function() {
  document.getElementById('topbar-title') && (document.getElementById('topbar-title').textContent = 'My QR Code');
};

// ---- ATTENDANCE STATUS ----
window.Screens['attendance-status'] = function() {
  const u = window.AppState.user || window.AppData.users.student;
  
  // Find logs for this student
  const logs = [];
  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;

  (window.AppData.attendance || []).forEach(day => {
    const studentIdentifier = (u.rollNo || u.user_code || '').toLowerCase().trim();
    const record = day.students.find(s => {
      if (studentIdentifier && s.rollNo && s.rollNo.toLowerCase().trim() === studentIdentifier) return true;
      if (s.id && u.id && s.id === u.id) return true;
      if (s.name && u.name && s.name.toLowerCase().trim() === u.name.toLowerCase().trim() && (!s.rollNo || !studentIdentifier || s.rollNo.toLowerCase().trim() === studentIdentifier)) return true;
      return false;
    });
    if (record) {
      logs.push({ date: day.date, record });
      const statusLower = record.status.toLowerCase();
      if (statusLower === 'present') presentCount++;
      else if (statusLower === 'late') lateCount++;
      else if (statusLower === 'absent') absentCount++;
    }
  });

  // Sort logs by date descending
  logs.sort((a, b) => b.date.localeCompare(a.date));

  const totalDays = logs.length;
  const attendedDays = presentCount + lateCount;
  const attendancePercent = totalDays > 0 ? Math.round((attendedDays * 100) / totalDays) : 100;

  return `
  <div>
    ${window.Components.pageHeader('My Attendance','View your attendance record')}
    <div class="card mb-20" style="background:linear-gradient(135deg,var(--bg-primary),rgba(33,150,243,0.1))">
      <div class="card-body" style="display:flex;align-items:center;justify-content:center;gap:40px;padding:30px">
        <div style="position:relative;width:120px;height:120px">
          <svg viewBox="0 0 36 36" width="120" height="120">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(33,150,243,0.2)" stroke-width="3"/>
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--success)" stroke-width="3" stroke-dasharray="${attendancePercent}, 100" stroke-linecap="round"/>
          </svg>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column">
            <div style="font-size:28px;font-weight:800;color:var(--text-primary);line-height:1">${attendancePercent}%</div>
            <div style="font-size:10px;color:var(--text-secondary);text-transform:uppercase;margin-top:4px">Present</div>
          </div>
        </div>
        <div>
          <div style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:12px">Current Semester</div>
          <div style="display:flex;gap:20px">
            <div><div style="font-size:20px;font-weight:800;color:var(--success)">${presentCount + lateCount}</div><div style="font-size:11px;color:var(--text-secondary)">Present Days</div></div>
            <div><div style="font-size:20px;font-weight:800;color:var(--danger)">${absentCount}</div><div style="font-size:11px;color:var(--text-secondary)">Absent Days</div></div>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Recent Records</div></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Status</th><th>Time In</th><th>Time Out</th></tr></thead>
          <tbody>
            ${logs.length === 0 ? `
              <tr><td colspan="4" style="text-align:center;color:var(--text-secondary)">No attendance records found</td></tr>
            ` : logs.map(l => `
              <tr>
                <td>${window.AppUtils.formatDate(l.date)}</td>
                <td><span class="badge badge-${window.AppUtils.getStatusColor(l.record.status)}">${l.record.status}</span></td>
                <td style="font-family:monospace;color:var(--text-secondary)">${l.record.timeIn || '--:--'}</td>
                <td style="font-family:monospace;color:var(--text-secondary)">${l.record.timeOut || '--:--'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  </div>`;
};

// ---- UPDATE STOCK USAGE ----
window.Screens['stock-usage-update'] = function() {
  window.Screens['stock-usage-update'].selectedItems = window.Screens['stock-usage-update'].selectedItems || [];
  const u = window.AppState.user || window.AppData.users.student || {};
  const labName = window.AppState.selectedLab || u.lab || 'Microbiology Lab';

  return `
  <div>
    ${window.Components.pageHeader('Update Stock Usage', 'Log materials used across lab experiments')}
    
    <div class="card animate-in">
      <div class="card-body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Assigned Lab</label>
            <select class="form-input form-select" id="su-lab" disabled style="background:var(--bg-base);cursor:not-allowed;opacity:0.8">
              <option value="${labName}">${labName}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Category Filter</label>
            <select class="form-input form-select" id="su-category" onchange="window.Screens['stock-usage-update'].populateItems()">
              <option value="all">All Categories</option>
              <option value="chemicals">Chemicals</option>
              <option value="equipment">Equipment</option>
              <option value="plasticware">Plasticware</option>
              <option value="glassware">Glassware</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Select Equipment or Chemical (Multi-select)</label>
          <select class="form-input form-select" id="su-item-select" onchange="window.Screens['stock-usage-update'].addItem(this.value)">
            <option value="">-- Select an item to add --</option>
          </select>
        </div>

        <div id="su-selected-container" style="margin: 16px 0;"></div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Usage Date</label>
            <input type="date" id="su-date" class="form-input" value="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="form-group">
            <label class="form-label">Reason / Experiment</label>
            <input type="text" id="su-reason" class="form-input" placeholder="e.g. Media preparation, DNA extraction">
          </div>
        </div>
        
        <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:8px">
          <button class="btn btn-ghost" onclick="history.back()">Cancel</button>
          <button class="btn btn-primary" id="su-submit-btn">
            <span class="material-icons-round">check_circle</span> Update Stock Usage
          </button>
        </div>
      </div>
    </div>
  </div>`;
};

window.Screens['stock-usage-update'].populateItems = function() {
  const categorySelect = document.getElementById('su-category');
  const itemSelect = document.getElementById('su-item-select');
  if (!itemSelect) return;

  const u = window.AppState.user || window.AppData.users.student || {};
  const currentLab = window.AppState.selectedLab || u.lab || 'Microbiology Lab';
  const category = categorySelect ? categorySelect.value : 'all';

  let pool = [];
  const getLabMatch = (itemLab) => !itemLab || itemLab === 'All Labs' || itemLab === currentLab;

  if (category === 'all' || category === 'chemicals') {
    (window.AppData.chemicals || []).filter(i => getLabMatch(i.lab)).forEach(i => pool.push({ ...i, _type: 'Chemical', _catLabel: 'Chemical' }));
  }
  if (category === 'all' || category === 'equipment') {
    (window.AppData.equipment || []).filter(i => getLabMatch(i.lab)).forEach(i => pool.push({ ...i, _type: 'Equipment', _catLabel: 'Equipment' }));
  }
  if (category === 'all' || category === 'plasticware') {
    (window.AppData.plasticware || []).forEach(i => pool.push({ ...i, _type: 'Chemical', _catLabel: 'Plasticware' }));
  }
  if (category === 'all' || category === 'glassware') {
    (window.AppData.glassware || []).forEach(i => pool.push({ ...i, _type: 'Chemical', _catLabel: 'Glassware' }));
  }

  pool.sort((a,b) => (a.name || '').localeCompare(b.name || ''));

  itemSelect.innerHTML = `<option value="">-- Select item to add (${pool.length} available) --</option>` +
    pool.map(item => `<option value="${item.id}|${item._type}|${encodeURIComponent(item.name)}|${item.unit || 'pcs'}|${item.stock || 1}|${item._catLabel}">${item.name} (${item._catLabel} - Stock: ${item.stock || 0} ${item.unit || 'pcs'})</option>`).join('');
};

window.Screens['stock-usage-update'].addItem = function(val) {
  if (!val) return;
  const [id, type, encName, unit, maxStock, catLabel] = val.split('|');
  const name = decodeURIComponent(encName);
  const exists = window.Screens['stock-usage-update'].selectedItems.some(i => i.id == id && i.name === name);
  if (!exists) {
    window.Screens['stock-usage-update'].selectedItems.push({ id, name, type, unit, maxStock: parseFloat(maxStock) || 9999, catLabel, qty: 1 });
  } else {
    window.Components.toast(`${name} is already in the list`, 'info');
  }
  const sel = document.getElementById('su-item-select');
  if (sel) sel.value = '';
  window.Screens['stock-usage-update'].renderSelectedItems();
};

window.Screens['stock-usage-update'].removeItem = function(idx) {
  window.Screens['stock-usage-update'].selectedItems.splice(idx, 1);
  window.Screens['stock-usage-update'].renderSelectedItems();
};

window.Screens['stock-usage-update'].updateQty = function(idx, val) {
  const item = window.Screens['stock-usage-update'].selectedItems[idx];
  if (!item) return;
  const num = parseFloat(val) || 0;
  item.qty = num;
};

window.Screens['stock-usage-update'].renderSelectedItems = function() {
  const container = document.getElementById('su-selected-container');
  if (!container) return;
  const items = window.Screens['stock-usage-update'].selectedItems || [];
  if (items.length === 0) {
    container.innerHTML = `<div style="padding: 16px; border: 1px dashed var(--border-color); border-radius: 10px; text-align: center; color: var(--text-secondary); font-size: 13px;">No items selected yet. Pick items from the dropdown above to log usage.</div>`;
    return;
  }

  container.innerHTML = `
    <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Selected Items (${items.length}):</div>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      ${items.map((item, idx) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-base); border: 1px solid var(--border-color); border-radius: 10px; gap: 12px;">
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 600; font-size: 14px; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>
            <div style="font-size: 11px; color: var(--text-secondary); display: flex; gap: 8px;">
              <span>Type: ${item.catLabel}</span>
              <span>•</span>
              <span>Available Stock: ${item.maxStock} ${item.unit}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="number" value="${item.qty}" min="0.1" max="${item.maxStock}" step="any" onchange="window.Screens['stock-usage-update'].updateQty(${idx}, this.value)" style="width: 85px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); font-size: 13px; text-align: center;">
            <span style="font-size: 13px; color: var(--text-secondary); min-width: 28px;">${item.unit}</span>
            <button class="btn btn-ghost btn-icon" onclick="window.Screens['stock-usage-update'].removeItem(${idx})" title="Remove item" style="color: var(--danger); padding: 4px; border: none; background: transparent; cursor: pointer;"><span class="material-icons-round">delete</span></button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

window.Screens['stock-usage-update'].afterRender = function() {
  document.getElementById('topbar-title') && (document.getElementById('topbar-title').textContent = 'Update Stock');

  window.Screens['stock-usage-update'].selectedItems = [];
  window.Screens['stock-usage-update'].populateItems();
  window.Screens['stock-usage-update'].renderSelectedItems();

  const btn = document.getElementById('su-submit-btn');
  if (!btn) return;

  btn.onclick = async () => {
    const items = window.Screens['stock-usage-update'].selectedItems || [];
    const u = window.AppState.user || window.AppData.users.student || {};
    const labName = window.AppState.selectedLab || u.lab || 'Microbiology Lab';
    const date = document.getElementById('su-date').value;
    const reason = document.getElementById('su-reason').value.trim() || 'Laboratory Experiment';

    if (items.length === 0) {
      window.Components.toast('Please select at least one item from the dropdown', 'error');
      return;
    }

    const invalidItem = items.find(i => !i.qty || i.qty <= 0);
    if (invalidItem) {
      window.Components.toast(`Invalid quantity for ${invalidItem.name}`, 'error');
      return;
    }

    const overStock = items.find(i => i.qty > i.maxStock);
    if (overStock) {
      window.Components.toast(`Insufficient stock for ${overStock.name} (Max: ${overStock.maxStock})`, 'error');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block"></span> Updating...`;

    const promises = items.map(item => window.fetchAPI('inventory.php?action=update_stock', {
      method: 'POST',
      body: {
        type: item.type || 'Chemical',
        item_id: parseInt(item.id),
        quantity: -item.qty,
        by_user: u.name || 'Student',
        lab: labName,
        reason: `${reason} (${date})`
      }
    }));

    const results = await Promise.all(promises);
    const allSuccess = results.every(r => r && r.success);

    btn.disabled = false;
    btn.innerHTML = `<span class="material-icons-round">check_circle</span> Update Stock Usage`;

    if (allSuccess) {
      window.Components.toast(`Successfully logged usage for ${items.length} item(s)!`, 'success');
      if (window.AppActions && window.AppActions.syncData) {
        await window.AppActions.syncData();
      }
      setTimeout(() => history.back(), 800);
    } else {
      window.Components.toast('Some items failed to update. Please check network.', 'error');
    }
  };
};

// ---- ASSIGNED TASKS (My Tasks) ----
window.Screens['assigned-tasks'] = function() {
  const u = window.AppState.user || window.AppData.users.student;
  
  if (window.Screens['assigned-tasks'].activeFilter === undefined) {
    window.Screens['assigned-tasks'].activeFilter = 'all';
  }
  
  const activeFilter = window.Screens['assigned-tasks'].activeFilter;
  
  // Filter student's tasks flexibly by name or roll number
  const myTasks = (window.AppData.tasks || []).filter(t => {
    if (!t.assignedTo) return false;
    const a = t.assignedTo.trim().toLowerCase();
    const name = (u.name || u.full_name || '').trim().toLowerCase();
    const roll = (u.rollNo || u.roll_no || u.user_code || '').trim().toLowerCase();
    return a === name || a === roll || (name && a.includes(name)) || (name && name.includes(a));
  });
  const filteredTasks = myTasks.filter(t => activeFilter === 'all' || t.status === activeFilter);
  
  return `
  <div>
    ${window.Components.pageHeader('My Tasks', `${myTasks.filter(t=>t.status!=='completed').length} pending tasks`)}
    
    <div class="filter-bar mb-20 animate-in">
      <button class="filter-chip ${activeFilter === 'all' ? 'active' : ''}" onclick="window.Screens['assigned-tasks'].setFilter('all')">All (${myTasks.length})</button>
      <button class="filter-chip ${activeFilter === 'pending' ? 'active' : ''}" onclick="window.Screens['assigned-tasks'].setFilter('pending')">Pending (${myTasks.filter(t=>t.status==='pending').length})</button>
      <button class="filter-chip ${activeFilter === 'in-progress' ? 'active' : ''}" onclick="window.Screens['assigned-tasks'].setFilter('in-progress')">In Progress (${myTasks.filter(t=>t.status==='in-progress').length})</button>
      <button class="filter-chip ${activeFilter === 'completed' ? 'active' : ''}" onclick="window.Screens['assigned-tasks'].setFilter('completed')">Completed (${myTasks.filter(t=>t.status==='completed').length})</button>
    </div>
    
    <div style="display:flex;flex-direction:column;gap:14px" class="animate-in-2">
      ${filteredTasks.length === 0 ? `
        <div class="card" style="padding:48px 20px;text-align:center;color:var(--text-secondary)">
          <span class="material-icons-round" style="font-size:48px;color:var(--text-muted);margin-bottom:12px">assignment_turned_in</span>
          <div style="font-weight:600">No tasks found.</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px">You're all caught up!</div>
        </div>
      ` : filteredTasks.map(t=>`
        <div class="card" style="border-left:4px solid var(--${window.AppUtils.getPriorityColor(t.priority)})">
          <div class="card-body" style="padding:18px 20px">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px">
              <div>
                <div style="font-weight:700;font-size:15px;color:var(--text-primary)">${t.title}</div>
                <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">Assigned by: <strong>${t.assignedBy}</strong></div>
              </div>
              <span class="badge badge-${window.AppUtils.getStatusColor(t.status)}">${t.status.replace('-',' ')}</span>
            </div>
            
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.5;margin-bottom:14px">${t.description}</div>
            
            <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--border-color);padding-top:12px;gap:12px;flex-wrap:wrap">
              <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)">
                <span class="material-icons-round" style="font-size:16px;color:${window.AppUtils.daysUntil(t.dueDate)<3&&t.status!=='completed'?'var(--danger)':''}">event</span> 
                <span style="color:${window.AppUtils.daysUntil(t.dueDate)<3&&t.status!=='completed'?'var(--danger)':''};font-weight:${window.AppUtils.daysUntil(t.dueDate)<3&&t.status!=='completed'?'600':'500'}">Due: ${window.AppUtils.formatDate(t.dueDate)}</span>
              </div>
              
              <div style="display:flex;gap:8px;align-items:center">
                ${t.status === 'pending' ? `
                  <button class="btn btn-outline btn-sm" onclick="window.Screens['assigned-tasks'].updateStatus(${t.id}, 'in-progress')">
                    <span class="material-icons-round">play_arrow</span> Start Task
                  </button>
                ` : ''}
                ${t.status === 'in-progress' ? `
                  <button class="btn btn-primary btn-sm" onclick="window.Screens['assigned-tasks'].updateStatus(${t.id}, 'completed')">
                    <span class="material-icons-round">check</span> Complete Task
                  </button>
                ` : ''}
                ${t.status === 'completed' ? `
                  <div style="display:flex;align-items:center;gap:4px;font-size:12px;color:var(--success);font-weight:600">
                    <span class="material-icons-round" style="font-size:16px">verified</span> Done
                  </div>
                ` : ''}
                <button class="btn btn-ghost btn-sm" style="padding:4px 8px;border:1px solid var(--border-color);border-radius:6px;display:flex;align-items:center;gap:4px" title="Re-edit Options" onclick="window.Screens['assigned-tasks'].showEditModal(${t.id})">
                  <span class="material-icons-round" style="font-size:16px;color:var(--text-secondary)">edit</span> Edit
                </button>
              </div>
            </div>
          </div>
        </div>`).join('')}
    </div>
    
    ${window.Components.modal('edit-task-status-modal', 'Re-edit Task Status', `
      <input type="hidden" id="edit-task-id">
      <div class="form-group">
        <label class="form-label">Select Task Status</label>
        <select id="edit-task-status-select" class="form-input form-select">
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    `, `
      <button class="btn btn-ghost" onclick="window.Components.closeModal('edit-task-status-modal')">Cancel</button>
      <button class="btn btn-primary" onclick="window.Screens['assigned-tasks'].saveEditedStatus()">Save Status</button>
    `)}
  </div>`;
};

window.Screens['assigned-tasks'].afterRender = function() {
  document.getElementById('topbar-title') && (document.getElementById('topbar-title').textContent = 'My Tasks');
};

window.Screens['assigned-tasks'].setFilter = function(filter) {
  window.Screens['assigned-tasks'].activeFilter = filter;
  window.Router.render();
};

window.Screens['assigned-tasks'].showEditModal = function(id) {
  const task = window.AppData.tasks.find(t => t.id === id);
  if (task) {
    window.Components.showModal('edit-task-status-modal');
    const idInput = document.getElementById('edit-task-id');
    const statusSelect = document.getElementById('edit-task-status-select');
    if (idInput && statusSelect) {
      idInput.value = id;
      statusSelect.value = task.status;
    }
  }
};

window.Screens['assigned-tasks'].saveEditedStatus = function() {
  const idInput = document.getElementById('edit-task-id');
  const statusSelect = document.getElementById('edit-task-status-select');
  if (idInput && statusSelect) {
    const id = parseInt(idInput.value);
    const newStatus = statusSelect.value;
    window.Components.closeModal('edit-task-status-modal');
    window.Screens['assigned-tasks'].updateStatus(id, newStatus);
  }
};

window.Screens['assigned-tasks'].updateStatus = async function(id, newStatus) {
  try {
    const res = await window.fetchAPI('tasks.php?action=update_status', {
      method: 'POST',
      body: JSON.stringify({ task_id: id, status: newStatus })
    });
    if (res && res.success) {
      const task = window.AppData.tasks.find(t => t.id === id);
      if (task) task.status = newStatus;
      window.Components.toast(`Task status updated to ${newStatus.replace('-',' ')}!`, 'success');
      window.Router.render();
    } else {
      window.Components.toast('Failed to update task status: ' + (res.message || 'Error'), 'error');
    }
  } catch (e) {
    window.Components.toast('Error updating task status', 'error');
  }
};

// ---- STUDENT CALENDAR ----
window.Screens['student-calendar'] = function() {
  const u = window.AppState.user || window.AppData.users.student;
  
  if (window.Screens['student-calendar'].year === undefined) {
    const today = new Date();
    window.Screens['student-calendar'].year = today.getFullYear();
    window.Screens['student-calendar'].month = today.getMonth();
    window.Screens['student-calendar'].selectedDay = today.getDate();
  }
  
  const year = window.Screens['student-calendar'].year;
  const month = window.Screens['student-calendar'].month;
  const selectedDay = window.Screens['student-calendar'].selectedDay;
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Calculate calendar grid days (Noon-based calculation is DST/Timezone-shift resilient)
  const firstDayIndex = new Date(year, month, 1, 12, 0, 0).getDay();
  const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const totalDays = daysInMonth[month];
  
  // Retrieve events for the active month
  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    
    const tasks = (window.AppData.tasks || []).filter(t => {
      if (!t.assignedTo) return false;
      const a = t.assignedTo.trim().toLowerCase();
      const name = (u.name || u.full_name || '').trim().toLowerCase();
      const roll = (u.rollNo || u.roll_no || u.user_code || '').trim().toLowerCase();
      return (a === name || a === roll || (name && a.includes(name)) || (name && name.includes(a))) && t.dueDate === dateStr;
    });
    
    // Attendance
    const attRecord = (window.AppData.attendance || []).find(a => a.date === dateStr);
    const attendance = attRecord ? (attRecord.students || []).find(s => s.name === u.name || s.id === u.id || s.rollNo === u.rollNo || s.roll_no === u.roll_no || s.rollNo === u.roll_no) : null;
    
    // Activity logged
    const activities = (window.AppData.activities || []).filter(a => {
      const st = (a.student || '').toString().trim().toLowerCase();
      const name = (u.name || u.full_name || '').toString().trim().toLowerCase();
      const roll = (u.rollNo || u.roll_no || u.user_code || '').toString().trim().toLowerCase();
      const empid = (u.empid || u.id || '').toString().trim().toLowerCase();
      return (!st || st === name || st === roll || st === empid || (name && st.includes(name)) || (roll && st.includes(roll))) && a.date === dateStr;
    });
    
    return { tasks, attendance, activities };
  };

  // Build calendar days HTML
  let daysHtml = '';
  // Empty slots before 1st day (use layout spacers with no hover triggers)
  for (let i = 0; i < firstDayIndex; i++) {
    daysHtml += `<div style="aspect-ratio:1;pointer-events:none"></div>`;
  }
  // Days of the month
  for (let day = 1; day <= totalDays; day++) {
    const { tasks, attendance, activities } = getEventsForDay(day);
    const hasEvent = tasks.length > 0 || attendance || activities.length > 0;
    
    const realToday = new Date();
    const isRealToday = realToday.getDate() === day && realToday.getMonth() === month && realToday.getFullYear() === year;
    const isSelected = day === selectedDay;
    
    let classes = ['calendar-day'];
    if (hasEvent) classes.push('has-event');
    if (isRealToday) classes.push('today');
    
    let inlineStyle = '';
    if (isSelected) {
      inlineStyle = 'style="border: 2px solid var(--primary-bright); box-shadow: 0 0 10px var(--primary-glow); font-weight: 700; background: rgba(33,150,243,0.12);"';
    }
    
    daysHtml += `
      <div class="${classes.join(' ')}" ${inlineStyle} onclick="window.Screens['student-calendar'].selectDay(${day})">
        ${day}
      </div>`;
  }
  
  // Get events of the selected day to show below
  const selectedDateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`;
  const dayData = getEventsForDay(selectedDay);
  
  return `
  <div>
    ${window.Components.pageHeader('My Calendar','Track assignments, events and attendance')}
    
    <div class="card mb-20 animate-in">
      <div class="card-body">
        <div class="calendar-nav">
          <button class="page-header-back" style="margin: 0; width: 36px; height: 36px; border-radius: 8px" onclick="window.Screens['student-calendar'].prevMonth()">
            <span class="material-icons-round">chevron_left</span>
          </button>
          <div class="calendar-month">${monthNames[month]} ${year}</div>
          <button class="page-header-back" style="margin: 0; width: 36px; height: 36px; border-radius: 8px" onclick="window.Screens['student-calendar'].nextMonth()">
            <span class="material-icons-round">chevron_right</span>
          </button>
        </div>
        
        <div class="calendar-grid">
          <div class="calendar-day-header">Sun</div>
          <div class="calendar-day-header">Mon</div>
          <div class="calendar-day-header">Tue</div>
          <div class="calendar-day-header">Wed</div>
          <div class="calendar-day-header">Thu</div>
          <div class="calendar-day-header">Fri</div>
          <div class="calendar-day-header">Sat</div>
          ${daysHtml}
        </div>
      </div>
    </div>
    
    <h3 class="section-title animate-in-2">Details for ${window.AppUtils.formatDate(selectedDateStr)}</h3>
    <div class="animate-in-2">
      ${!dayData.attendance && dayData.tasks.length === 0 && dayData.activities.length === 0 ? `
        <div class="card" style="padding: 24px; text-align: center; color: var(--text-secondary)">
          <span class="material-icons-round" style="font-size: 36px; color: var(--text-muted); margin-bottom: 8px">event_note</span>
          <div>No tasks, activity logs, or attendance records on this date.</div>
        </div>
      ` : `
        <div style="display:flex;flex-direction:column;gap:12px">
          <!-- Attendance status -->
          ${dayData.attendance ? `
            <div class="card" style="border-left: 3px solid var(--${window.AppUtils.getStatusColor(dayData.attendance.status)})">
              <div class="card-body" style="padding: 14px 20px; display: flex; align-items: center; justify-content: space-between">
                <div>
                  <div style="font-weight: 700; font-size: 14px; color: var(--text-primary)">Attendance Marked</div>
                  <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px">
                    Time In: ${dayData.attendance.timeIn || '--:--'} · Time Out: ${dayData.attendance.timeOut || '--:--'}
                  </div>
                </div>
                <span class="badge badge-${window.AppUtils.getStatusColor(dayData.attendance.status)}">${dayData.attendance.status}</span>
              </div>
            </div>
          ` : ''}
          
          <!-- Tasks list -->
          ${dayData.tasks.map(t => `
            <div class="card" style="border-left: 3px solid var(--${window.AppUtils.getPriorityColor(t.priority)})">
              <div class="card-body" style="padding: 14px 20px">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px">
                  <div style="font-weight: 700; font-size: 14px; color: var(--text-primary)">Task: ${t.title}</div>
                  <span class="badge badge-${window.AppUtils.getStatusColor(t.status)}">${t.status}</span>
                </div>
                <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4">${t.description}</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px">Priority: <strong class="text-${window.AppUtils.getPriorityColor(t.priority)}">${t.priority}</strong> · Assigned by: ${t.assignedBy}</div>
              </div>
            </div>
          `).join('')}
          
          <!-- Activities list -->
          ${dayData.activities.map(act => `
            <div class="card" style="border-left: 3px solid var(--primary-bright)">
              <div class="card-body" style="padding: 14px 20px">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px">
                  <div style="font-weight: 700; font-size: 14px; color: var(--text-primary)">Logged Activity: ${act.experiment}</div>
                  <span class="badge badge-primary">Submitted</span>
                </div>
                <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4"><strong>Duration:</strong> ${act.duration} · <strong>Notes:</strong> ${act.notes}</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px">Chemicals: ${act.chemicals.join(', ')} · Equipment: ${act.equipment.join(', ')}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  </div>`;
};

window.Screens['student-calendar'].afterRender = function() {
  document.getElementById('topbar-title') && (document.getElementById('topbar-title').textContent = 'My Calendar');
};

window.Screens['student-calendar'].selectDay = function(day) {
  window.Screens['student-calendar'].selectedDay = day;
  window.Router.render();
};

window.Screens['student-calendar'].prevMonth = function() {
  let m = window.Screens['student-calendar'].month - 1;
  let y = window.Screens['student-calendar'].year;
  if (m < 0) {
    m = 11;
    y--;
  }
  window.Screens['student-calendar'].month = m;
  window.Screens['student-calendar'].year = y;
  window.Screens['student-calendar'].selectedDay = 1;
  window.Router.render();
};

window.Screens['student-calendar'].nextMonth = function() {
  let m = window.Screens['student-calendar'].month + 1;
  let y = window.Screens['student-calendar'].year;
  if (m > 11) {
    m = 0;
    y++;
  }
  window.Screens['student-calendar'].month = m;
  window.Screens['student-calendar'].year = y;
  window.Screens['student-calendar'].selectedDay = 1;
  window.Router.render();
};
