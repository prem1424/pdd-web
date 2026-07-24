// ============================================================
// Smart Stock - Application Core
// ============================================================

// Restore session from localStorage on page load
window.AppState = {
  user: null,
  role: null,
  selectedLab: null
};

// Try restoring persisted session
(function restoreSession() {
  try {
    const sessionStr = sessionStorage.getItem('smartstock_session') || localStorage.getItem('smartstock_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session && session.role) {
        window.AppState.role = session.role;
        window.AppState.user = session.user;
        window.AppState.selectedLab = session.selectedLab;
      }
    }
  } catch (e) { /* ignore parse errors */ }

  try {
    // Restore theme
    const theme = localStorage.getItem('smartstock_theme');
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    } else if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    }
  } catch (e) { /* ignore parse errors */ }
})();

// Helper to persist session
window.AppState.save = function(rememberMe = true) {
  try {
    const data = JSON.stringify({
      role: window.AppState.role,
      user: window.AppState.user,
      selectedLab: window.AppState.selectedLab
    });
    if (rememberMe) {
      localStorage.setItem('smartstock_session', data);
      sessionStorage.removeItem('smartstock_session');
    } else {
      sessionStorage.setItem('smartstock_session', data);
      localStorage.removeItem('smartstock_session');
    }
  } catch (e) {}
};

window.AppActions = {
  async syncData() {
    if (!window.AppState.user) return;
    
    const user = window.AppState.user;
    const labFilter = window.AppState.selectedLab || user.lab || '';

    window.AppData = window.AppData || {};
    ['labs','equipment','chemicals','plasticware','glassware','students','tasks','attendance','notifications','activities','stockHistory','approvalRequests','messages'].forEach(k => {
      if (!Array.isArray(window.AppData[k])) window.AppData[k] = [];
    });
    if (!window.AppData.chartData || typeof window.AppData.chartData !== 'object') window.AppData.chartData = {};
    if (!window.AppData.users || typeof window.AppData.users !== 'object') window.AppData.users = {};

    try {
      const [labsRes, equipRes, chemRes, tasksRes, attendanceRes, activitiesRes, notificationsRes, approvalsRes, historyRes, dashboardRes, studentsRes] = await Promise.all([
        window.fetchAPI('labs.php?action=list').catch(() => ({ success: false })),
        window.fetchAPI(`inventory.php?action=get_equipment&lab=${encodeURIComponent(labFilter)}`).catch(() => ({ success: false })),
        window.fetchAPI(`inventory.php?action=get_chemicals&lab=${encodeURIComponent(labFilter)}`).catch(() => ({ success: false })),
        window.fetchAPI(`tasks.php?action=list&lab=${encodeURIComponent(labFilter)}`).catch(() => ({ success: false })),
        window.fetchAPI('attendance.php?action=list').catch(() => ({ success: false })),
        window.fetchAPI(`activities.php?action=list&lab=${encodeURIComponent(labFilter)}`).catch(() => ({ success: false })),
        window.fetchAPI(`notifications.php?action=list&lab=${encodeURIComponent(labFilter)}`).catch(() => ({ success: false })),
        window.fetchAPI(`approvals.php?action=list&lab=${encodeURIComponent(labFilter)}`).catch(() => ({ success: false })),
        window.fetchAPI('inventory.php?action=get_history').catch(() => ({ success: false })),
        window.fetchAPI(`dashboard.php?role=${window.AppState.role}&user_code=${user.user_code}&lab=${encodeURIComponent(labFilter)}`).catch(() => ({ success: false })),
        window.fetchAPI(`student.php?action=list&lab=${encodeURIComponent(labFilter)}`).catch(() => ({ success: false }))
      ]);

      if (dashboardRes && dashboardRes.success) {
        window.AppData.dashboardStats = dashboardRes;
        if (dashboardRes.user) {
          window.AppState.user = dashboardRes.user;
          window.AppState.save();
          this.renderSidebar();
        }
      }

      if (studentsRes && studentsRes.success) {
        window.AppData.students = studentsRes.students;
      }

      if (labsRes && labsRes.success) {
        window.AppData.labs = labsRes.labs;
        if (typeof _labDetailScreen === 'function') {
          window.AppData.labs.forEach(lab => {
            const slug = lab.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z-]/g,'');
            if (!window.Screens[slug]) {
              window.Screens[slug] = _labDetailScreen(lab.name);
              window.Screens[slug].afterRender = window._labDetailAfterRender || function(){};
            }
          });
        }
      }

      if (equipRes && equipRes.success) {
        window.AppData.equipment = equipRes.equipment.map(e => ({
          ...e,
          lastMaintenance: e.last_maintenance,
          nextMaintenance: e.next_maintenance
        }));
      }
      if (chemRes && chemRes.success) {
        const allItems = chemRes.chemicals.map(c => ({
          ...c,
          minStock: c.min_stock,
          maxStock: c.max_stock
        }));
        window.AppData.chemicals = allItems.filter(c => c.category !== 'Plasticware' && c.category !== 'Glassware' && !['Tubes','Tips','Dishes','Vials','Flasks','Beakers','Cylinders','Burettes','Pipettes'].includes(c.category));
        window.AppData.plasticware = allItems.filter(c => c.category === 'Plasticware' || ['Tubes','Tips','Dishes','Vials','Flasks'].includes(c.category));
        window.AppData.glassware = allItems.filter(c => c.category === 'Glassware' || ['Beakers','Cylinders','Burettes','Pipettes'].includes(c.category));
      }
      if (tasksRes && tasksRes.success && Array.isArray(tasksRes.tasks)) {
        window.AppData.tasks = tasksRes.tasks.map(t => ({
          id: t.id,
          title: t.title,
          assignedTo: t.assigned_to,
          assignedBy: t.assigned_by,
          lab: t.lab,
          dueDate: t.due_date,
          priority: t.priority,
          status: t.status,
          description: t.description
        }));
      }
      if (attendanceRes && attendanceRes.success && Array.isArray(attendanceRes.attendance)) {
        const grouped = {};
        attendanceRes.attendance.forEach(row => {
          if (!grouped[row.date]) {
            grouped[row.date] = [];
          }
          grouped[row.date].push({
            id: row.id,
            name: row.student_name,
            rollNo: row.roll_no,
            status: row.status,
            timeIn: row.time_in,
            timeOut: row.time_out
          });
        });
        window.AppData.attendance = Object.keys(grouped).map(date => ({
          date: date,
          students: grouped[date]
        }));
      }
      if (activitiesRes && activitiesRes.success && Array.isArray(activitiesRes.activities)) {
        window.AppData.activities = activitiesRes.activities.map(act => ({
          id: act.id,
          student: act.student,
          date: act.date,
          lab: act.lab,
          experiment: act.experiment,
          duration: act.duration,
          chemicals: act.chemicals ? act.chemicals.split(',').map(s => s.trim()) : [],
          equipment: act.equipment ? act.equipment.split(',').map(s => s.trim()) : [],
          notes: act.notes,
          status: act.status
        }));
      }
      if (notificationsRes && notificationsRes.success && Array.isArray(notificationsRes.notifications)) {
        window.AppData.notifications = notificationsRes.notifications.map(n => ({
          id: n.id,
          type: n.type === 'low-stock' || n.type === 'expiry-alert' ? 'alert' : n.type,
          title: n.title,
          message: n.message,
          time: n.time,
          read: n.is_read ? true : false,
          icon: n.icon
        }));
        this.updateNotifBadge();
      }
      if (approvalsRes && approvalsRes.success && Array.isArray(approvalsRes.requests)) {
        window.AppData.approvalRequests = approvalsRes.requests.map(r => ({
          id: r.id,
          type: r.type,
          title: r.title,
          requestedBy: r.requested_by,
          lab: r.lab,
          quantity: r.quantity,
          urgency: r.urgency,
          date: r.date,
          status: r.status,
          notes: r.notes
        }));
      }
      if (historyRes && historyRes.success && Array.isArray(historyRes.history)) {
        window.AppData.stockHistory = historyRes.history.map(h => ({
          id: h.id,
          item: h.item,
          action: h.action,
          quantity: h.quantity,
          unit: h.unit,
          by: h.by_user,
          lab: h.lab,
          date: h.date,
          reason: h.reason
        }));
      }
    } catch (err) {
      console.error("syncData failed:", err);
    }
  },

  logout() {
    window.AppState.user = null;
    window.AppState.role = null;
    window.AppState.selectedLab = null;
    localStorage.removeItem('smartstock_session');
    sessionStorage.removeItem('smartstock_session');
    window.Router.history = [];
    window.Router.navigate('role-select');
    window.Components.toast('Logged out successfully', 'info');
    this.renderSidebar();
  },
  
  // Re-renders the sidebar links based on the active role
  renderSidebar() {
    const sidebarMenu = document.getElementById('sidebar-menu');
    const bottomNav = document.getElementById('app-bottom-nav');
    if (!sidebarMenu || !window.AppState.role) return;
    
    let links = [];
    let bLinks = []; // bottom nav
    
    if (window.AppState.role === 'auditor') {
      links = [
        { icon: 'dashboard', label: 'Dashboard', route: 'auditor-dashboard' },
        { icon: 'location_on', label: 'Labs Overview', route: 'labs-overview' },
        { icon: 'inventory_2', label: 'Equipment', route: 'equipment-inventory' },
        { icon: 'science', label: 'Chemicals', route: 'chemicals-inventory' },
        { icon: 'history', label: 'Stock History', route: 'stock-history' },
        { icon: 'warning', label: 'Alerts', route: 'low-stock-alerts' },
        { icon: 'analytics', label: 'Analytics', route: 'analytics-overview' },
        { icon: 'settings', label: 'Settings', route: 'settings' }
      ];
      bLinks = [
        { icon: 'dashboard', label: 'Home', route: 'auditor-dashboard' },
        { icon: 'location_on', label: 'Labs', route: 'labs-overview' },
        { icon: 'inventory_2', label: 'Stock', route: 'equipment-inventory' },
        { icon: 'person', label: 'Profile', route: 'profile' }
      ];
    } else if (window.AppState.role === 'labhead') {
      links = [
        { icon: 'dashboard', label: 'Dashboard', route: 'labhead-dashboard' },
        { icon: 'school', label: 'Students', route: 'student-monitoring' },
        { icon: 'group_add', label: 'Enrollments', route: 'lab-enrollments' },
        { icon: 'how_to_reg', label: 'Attendance', route: 'labhead-attendance' },
        { icon: 'assignment', label: 'Tasks', route: 'task-management' },
        { icon: 'inventory_2', label: 'Inventory', route: 'equipment-inventory' },
        { icon: 'history', label: 'Stock History', route: 'stock-history' },
        { icon: 'fact_check', label: 'Approvals', route: 'approval-requests' },
        { icon: 'settings', label: 'Settings', route: 'settings' }
      ];
      bLinks = [
        { icon: 'dashboard', label: 'Home', route: 'labhead-dashboard' },
        { icon: 'school', label: 'Students', route: 'student-monitoring' },
        { icon: 'inventory_2', label: 'Stock', route: 'equipment-inventory' },
        { icon: 'person', label: 'Profile', route: 'profile' }
      ];
    } else if (window.AppState.role === 'student') {
      links = [
        { icon: 'dashboard', label: 'Dashboard', route: 'student-dashboard' },
        { icon: 'science', label: 'Labs Overview', route: 'labs-overview' },
        { icon: 'add_task', label: 'Submit Activity', route: 'daily-activity' },
        { icon: 'inventory', label: 'Update Stock', route: 'stock-usage-update' },
        { icon: 'assignment', label: 'My Tasks', route: 'assigned-tasks' },
        { icon: 'event_note', label: 'Attendance', route: 'attendance-status' },
        { icon: 'settings', label: 'Settings', route: 'settings' }
      ];
      bLinks = [
        { icon: 'dashboard', label: 'Home', route: 'student-dashboard' },
        { icon: 'science', label: 'Labs', route: 'labs-overview' },
        { icon: 'qr_code', label: 'My QR', route: 'qr-scanner', center: true },
        { icon: 'add_task', label: 'Log', route: 'daily-activity' },
        { icon: 'person', label: 'Profile', route: 'profile' }
      ];
    }
    
    // Toggle Global QR FAB
    const globalQrFab = document.getElementById('global-qr-fab');
    if (globalQrFab) {
      if (window.AppState.role === 'labhead') {
        globalQrFab.style.display = 'flex';
      } else {
        globalQrFab.style.display = 'none';
      }
    }
    
    // Render Sidebar
    sidebarMenu.innerHTML = links.map(l => `
      <a href="#${l.route}" class="sidebar-nav-item ${window.Router.currentRoute===l.route?'active':''}">
        <span class="material-icons-round nav-icon" style="margin-right:12px;font-size:22px">${l.icon}</span>
        <span style="font-size:15px;font-weight:500">${l.label}</span>
      </a>
    `).join('');
    
    // Render Bottom Nav (hidden on desktop/web)
    if (bottomNav) {
      bottomNav.style.display = 'none';
      bottomNav.innerHTML = '';
    }
    
    // Update user info in sidebar
    const si = document.getElementById('sidebar-user-info');
    if (si && window.AppState.user) {
      si.innerHTML = `
        <div style="font-weight:700;font-size:14px;color:var(--text-primary);margin-bottom:2px">${window.AppState.user.name}</div>
        <div style="font-size:12px;color:var(--text-secondary);text-transform:capitalize">${window.AppState.role}</div>
      `;
      const sAva = document.getElementById('sidebar-avatar');
      if (sAva) {
        sAva.innerHTML = window.AppState.user.name.split(' ').map(n=>n[0]).join('');
        sAva.style.width = '40px';
        sAva.style.height = '40px';
        sAva.style.borderRadius = '12px';
        sAva.style.background = 'linear-gradient(135deg,var(--primary),var(--cyan))';
        sAva.style.display = 'flex';
        sAva.style.alignItems = 'center';
        sAva.style.justifyContent = 'center';
        sAva.style.color = '#fff';
        sAva.style.fontWeight = '700';
      }
      
      const tAva = document.getElementById('topbar-avatar');
      if (tAva) {
        tAva.innerHTML = window.AppState.user.name.split(' ').map(n=>n[0]).join('');
      }
    }
  },
  
  updateNavigationActiveStates() {
    this.updateNotifBadge();
    const route = window.Router.currentRoute;
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.remove('active');
      el.style.color = 'var(--text-secondary)';
      el.style.background = 'transparent';
      const href = el.getAttribute('href');
      if (href === '#' + route) {
        el.classList.add('active');
        el.style.color = 'var(--primary-bright)';
        el.style.background = 'rgba(33,150,243,0.1)';
        el.style.borderRadius = '10px';
      }
    });
    
    document.querySelectorAll('.bottom-nav-item').forEach(el => {
      if (el.querySelector('.bottom-nav-icon')) {
        el.classList.remove('active');
        el.style.color = 'var(--text-secondary)';
        const onclick = el.getAttribute('onclick');
        if (onclick && onclick.includes(route)) {
          el.classList.add('active');
          el.style.color = 'var(--primary-bright)';
        }
      }
    });
  },

  updateNotifBadge() {
    const badge = document.getElementById('notif-btn')?.querySelector('.notif-badge') || document.querySelector('.notif-badge');
    if (badge) {
      const count = window.AppData.notifications.filter(n => !n.read).length;
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Setup mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.style.display = 'flex';
      if (overlay) overlay.style.display = 'block';
    });
  }
  
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.style.display = 'none';
      overlay.style.display = 'none';
    });
  }
  
  const closeBtn = document.getElementById('sidebar-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      sidebar.style.display = 'none';
      if (overlay) overlay.style.display = 'none';
    });
  }
  
  // Intercept nav calls to update sidebar
  const originalNav = window.Router.navigate;
  window.Router.navigate = async function(route, update) {
    await originalNav.call(this, route, update);
    window.AppActions.renderSidebar();
  };
  
  // Boot router
  window.Router.init();
});
