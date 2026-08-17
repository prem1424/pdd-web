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

      if (studentsRes && studentsRes.success && Array.isArray(studentsRes.students)) {
        window.AppData.students = studentsRes.students.map((s, i) => ({
          id: s.id || (i + 1),
          name: s.name || s.student_name || 'Student',
          rollNo: s.rollNo || s.roll_no || s.roll_number || `MB2024${String(i + 1).padStart(3, '0')}`,
          year: s.year || s.student_year || '3rd Year',
          lab: s.lab || labFilter || 'Microbiology Lab',
          attendance: s.attendance ?? s.attendance_pct ?? 92,
          tasks: s.tasks ?? s.tasks_count ?? 4,
          lastActivity: s.lastActivity || s.last_activity || s.last_login || new Date().toISOString(),
          status: s.status || 'active'
        }));
      }

      // Ensure fallback students if array is empty
      if (!window.AppData.students || window.AppData.students.length === 0) {
        window.AppData.students = [
          { id: 101, name: 'Riya Sharma', rollNo: 'MB2024001', year: '3rd Year', lab: labFilter || 'Microbiology Lab', attendance: 94, tasks: 6, lastActivity: new Date().toISOString(), status: 'active' },
          { id: 102, name: 'Anish Patel', rollNo: 'MB2024002', year: '3rd Year', lab: labFilter || 'Microbiology Lab', attendance: 88, tasks: 4, lastActivity: new Date(Date.now() - 3600000).toISOString(), status: 'active' },
          { id: 103, name: 'Kavya Nair', rollNo: 'MB2024003', year: '2nd Year', lab: labFilter || 'Microbiology Lab', attendance: 76, tasks: 2, lastActivity: new Date(Date.now() - 86400000).toISOString(), status: 'warning' },
          { id: 104, name: 'Devendra Kumar', rollNo: 'MB2024004', year: '4th Year', lab: labFilter || 'Microbiology Lab', attendance: 98, tasks: 8, lastActivity: new Date(Date.now() - 7200000).toISOString(), status: 'active' }
        ];
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

      if (equipRes && equipRes.success && Array.isArray(equipRes.equipment)) {
        window.AppData.equipment = equipRes.equipment.map(e => ({
          ...e,
          lastMaintenance: e.last_maintenance || e.lastMaintenance || new Date().toISOString(),
          nextMaintenance: e.next_maintenance || e.nextMaintenance || new Date(Date.now() + 30*86400000).toISOString()
        }));
      }

      // Ensure fallback equipment if empty
      if (!window.AppData.equipment || window.AppData.equipment.length === 0) {
        window.AppData.equipment = [
          { id: 'eq1', name: 'High-Speed Centrifuge 5424 R', model: 'Eppendorf 5424R', category: 'Centrifuges', lab: labFilter || 'Microbiology Lab', status: 'operational', location: 'Bay A3', lastMaintenance: new Date(Date.now() - 15*86400000).toISOString(), nextMaintenance: new Date(Date.now() + 45*86400000).toISOString() },
          { id: 'eq2', name: 'Biosafety Cabinet Class II Type A2', model: 'Thermo Herasafe 2020', category: 'Safety Cabinets', lab: labFilter || 'Microbiology Lab', status: 'operational', location: 'Bay B1', lastMaintenance: new Date(Date.now() - 30*86400000).toISOString(), nextMaintenance: new Date(Date.now() + 60*86400000).toISOString() },
          { id: 'eq3', name: 'UV-Vis Spectrophotometer', model: 'Shimadzu UV-1900i', category: 'Spectroscopy', lab: labFilter || 'Microbiology Lab', status: 'maintenance', location: 'Bay C2', lastMaintenance: new Date(Date.now() - 5*86400000).toISOString(), nextMaintenance: new Date(Date.now() + 10*86400000).toISOString() },
          { id: 'eq4', name: 'Orbital Shaker Incubator', model: 'New Brunswick I26', category: 'Incubators', lab: labFilter || 'Microbiology Lab', status: 'operational', location: 'Bay A1', lastMaintenance: new Date(Date.now() - 20*86400000).toISOString(), nextMaintenance: new Date(Date.now() + 40*86400000).toISOString() }
        ];
      }

      if (chemRes && chemRes.success && Array.isArray(chemRes.chemicals)) {
        const allItems = chemRes.chemicals.map(c => ({
          ...c,
          minStock: c.min_stock || c.minStock || 10,
          maxStock: c.max_stock || c.maxStock || 100
        }));
        window.AppData.chemicals = allItems.filter(c => c.category !== 'Plasticware' && c.category !== 'Glassware' && !['Tubes','Tips','Dishes','Vials','Flasks','Beakers','Cylinders','Burettes','Pipettes'].includes(c.category));
        window.AppData.plasticware = allItems.filter(c => c.category === 'Plasticware' || ['Tubes','Tips','Dishes','Vials','Flasks'].includes(c.category));
        window.AppData.glassware = allItems.filter(c => c.category === 'Glassware' || ['Beakers','Cylinders','Burettes','Pipettes'].includes(c.category));
      }

      // Fallback chemicals if empty
      if (!window.AppData.chemicals || window.AppData.chemicals.length === 0) {
        window.AppData.chemicals = [
          { id: 'ch1', name: 'Agarose Powder (Molecular Grade)', casNumber: '9012-36-6', formula: '(C12H18O9)n', lab: labFilter || 'Microbiology Lab', quantity: 450, unit: 'g', minStock: 100, status: 'operational', location: 'Cabinet 2' },
          { id: 'ch2', name: 'Ethanol Absolute 99.9%', casNumber: '64-17-5', formula: 'C2H5OH', lab: labFilter || 'Microbiology Lab', quantity: 2.5, unit: 'L', minStock: 5.0, status: 'low-stock', location: 'Flammables Storage' },
          { id: 'ch3', name: 'Tris-HCl Powder', casNumber: '1185-53-1', formula: 'C4H11NO3·HCl', lab: labFilter || 'Microbiology Lab', quantity: 800, unit: 'g', minStock: 200, status: 'operational', location: 'Cabinet 1' }
        ];
      }

      if (tasksRes && tasksRes.success && Array.isArray(tasksRes.tasks)) {
        window.AppData.tasks = tasksRes.tasks.map(t => ({
          id: t.id,
          title: t.title,
          assignedTo: t.assigned_to || t.assignedTo,
          assignedBy: t.assigned_by || t.assignedBy,
          lab: t.lab,
          dueDate: t.due_date || t.dueDate,
          priority: t.priority,
          status: t.status,
          description: t.description
        }));
      }

      if (notificationsRes && notificationsRes.success && Array.isArray(notificationsRes.notifications)) {
        window.AppData.notifications = notificationsRes.notifications.map(n => ({
          id: n.id,
          type: n.type === 'low-stock' || n.type === 'expiry-alert' ? 'alert' : n.type,
          title: n.title,
          message: n.message,
          time: n.time || n.created_at,
          read: n.is_read ? true : false,
          icon: n.icon || 'notifications'
        }));
        this.updateNotifBadge();
      }

      // Ensure fallback notifications if empty
      if (!window.AppData.notifications || window.AppData.notifications.length === 0) {
        window.AppData.notifications = [
          { id: 'n1', type: 'alert', title: 'Low Stock Warning', message: 'Ethanol 99.9% is below safety threshold (2.5L remaining).', time: new Date().toISOString(), read: false, icon: 'warning' },
          { id: 'n2', type: 'info', title: 'New Student Request', message: 'Kavya Nair requested lab access authorization.', time: new Date(Date.now() - 3600000).toISOString(), read: false, icon: 'person_add' },
          { id: 'n3', type: 'info', title: 'Equipment Inspection Complete', message: 'Biosafety Cabinet Class II passed monthly calibration.', time: new Date(Date.now() - 86400000).toISOString(), read: true, icon: 'verified' }
        ];
        this.updateNotifBadge();
      }

      if (historyRes && historyRes.success && Array.isArray(historyRes.history)) {
        window.AppData.stockHistory = historyRes.history.map(h => ({
          id: h.id,
          item: h.item,
          action: h.action,
          quantity: h.quantity,
          unit: h.unit,
          by: h.by_user || h.by,
          lab: h.lab,
          date: h.date || h.created_at,
          reason: h.reason
        }));
      }

      // Fallback stock history if empty
      if (!window.AppData.stockHistory || window.AppData.stockHistory.length === 0) {
        window.AppData.stockHistory = [
          { id: 'h1', item: 'Ethanol 99.9%', action: 'Stock Used', quantity: '500', unit: 'mL', by: 'Riya Sharma', lab: labFilter || 'Microbiology Lab', date: new Date().toISOString(), reason: 'DNA Extraction Protocol' },
          { id: 'h2', item: 'Agarose Powder', action: 'Stock Restocked', quantity: '500', unit: 'g', by: user.name || 'Dr. Alice Smith', lab: labFilter || 'Microbiology Lab', date: new Date(Date.now() - 86400000).toISOString(), reason: 'Routine Reorder' }
        ];
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

  switchRoleView(role) {
    if (!role) return;
    window.AppState.role = role;
    if (window.AppData && window.AppData.users && window.AppData.users[role]) {
      window.AppState.user = window.AppData.users[role];
    }
    window.AppState.save();
    this.renderSidebar();
    const dashRoute = role === 'auditor' ? 'auditor-dashboard' : role === 'student' ? 'student-dashboard' : 'labhead-dashboard';
    window.Router.navigate(dashRoute);
    window.Components.toast(`Switched view to ${role.toUpperCase()}`, 'info');
  },
  
  // Re-renders the sidebar links as a unified master all-in-one web portal
  renderSidebar() {
    const sidebarMenu = document.getElementById('sidebar-menu');
    const bottomNav = document.getElementById('app-bottom-nav');
    if (!sidebarMenu) return;
    
    const role = window.AppState.role || 'labhead';
    const dashRoute = role === 'auditor' ? 'auditor-dashboard' : role === 'student' ? 'student-dashboard' : 'labhead-dashboard';

    const links = [
      { icon: 'dashboard', label: 'Dashboard', route: dashRoute },
      { icon: 'location_on', label: 'Labs Overview', route: 'labs-overview' },
      { icon: 'inventory_2', label: 'Equipment Inventory', route: 'equipment-inventory' },
      { icon: 'science', label: 'Chemicals Inventory', route: 'chemicals-inventory' },
      { icon: 'school', label: 'Student Monitoring', route: 'student-monitoring' },
      { icon: 'how_to_reg', label: 'Attendance', route: 'labhead-attendance' },
      { icon: 'assignment', label: 'Tasks & Assignments', route: 'task-management' },
      { icon: 'fact_check', label: 'Approval Requests', route: 'approval-requests' },
      { icon: 'history', label: 'Stock History & Logs', route: 'stock-history' },
      { icon: 'analytics', label: 'Analytics & Reports', route: 'analytics-overview' },
      { icon: 'settings', label: 'Settings', route: 'settings' }
    ];
    
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

    const roleSelect = document.getElementById('role-view-select');
    if (roleSelect && window.AppState.role) {
      roleSelect.value = window.AppState.role;
    }
  },

  updateNotifBadge() {
    const badge = document.getElementById('notif-btn')?.querySelector('.notif-badge') || document.querySelector('.notif-badge');
    if (badge) {
      const count = window.AppData.notifications.filter(n => !n.read).length;
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  },

  toggleNotifDrawer(forceState) {
    const drawer = document.getElementById('notif-drawer');
    if (!drawer) return;
    const isShowing = drawer.classList.contains('show');
    const newState = typeof forceState === 'boolean' ? forceState : !isShowing;
    if (newState) {
      this.renderNotifDrawer();
      drawer.classList.add('show');
    } else {
      drawer.classList.remove('show');
    }
  },

  renderNotifDrawer() {
    const list = document.getElementById('notif-drawer-list');
    if (!list) return;
    const notifs = window.AppData.notifications || [];
    if (notifs.length === 0) {
      list.innerHTML = `<div style="font-size:13px;color:var(--text-secondary);text-align:center;padding:24px 0">No recent notifications</div>`;
      return;
    }
    list.innerHTML = notifs.slice(0, 6).map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" onclick="window.Router.navigate('notifications'); window.AppActions.toggleNotifDrawer(false)">
        <span class="material-icons-round" style="color:${n.type==='alert'?'var(--danger)':'var(--cyan)'};font-size:20px">${n.icon || 'notifications'}</span>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:2px">${n.title}</div>
          <div style="font-size:12px;color:var(--text-secondary);line-height:1.4">${n.message}</div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:4px">${window.AppUtils.timeAgo(n.time)}</div>
        </div>
      </div>
    `).join('');
  },

  toggleQuickSearch(forceState) {
    const overlay = document.getElementById('quick-search-overlay');
    const input = document.getElementById('quick-search-input');
    if (!overlay) return;
    const isShowing = overlay.classList.contains('show');
    const newState = typeof forceState === 'boolean' ? forceState : !isShowing;
    if (newState) {
      overlay.classList.add('show');
      if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 100);
      }
    } else {
      overlay.classList.remove('show');
    }
  },

  handleQuickSearchInput(query) {
    const resultsContainer = document.getElementById('quick-search-results');
    if (!resultsContainer) return;
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      resultsContainer.innerHTML = `<div style="font-size:13px;color:var(--text-secondary);text-align:center;padding:24px 0">Start typing to search laboratory stock and students...</div>`;
      return;
    }

    const items = [
      ...(window.AppData.equipment || []).map(e => ({ name: e.name, type: 'Equipment', cat: e.category, route: 'equipment-inventory', icon: 'inventory_2' })),
      ...(window.AppData.chemicals || []).map(c => ({ name: c.name, type: 'Chemical', cat: c.location || 'Storage', route: 'chemicals-inventory', icon: 'science' })),
      ...(window.AppData.students || []).map(s => ({ name: s.name, type: 'Student', cat: s.rollNo || s.year, route: 'student-monitoring', icon: 'school' }))
    ];

    const filtered = items.filter(i => i.name.toLowerCase().includes(q) || (i.cat && i.cat.toLowerCase().includes(q)));
    if (filtered.length === 0) {
      resultsContainer.innerHTML = `<div style="font-size:13px;color:var(--text-secondary);text-align:center;padding:24px 0">No matching stock items or students found.</div>`;
      return;
    }

    resultsContainer.innerHTML = filtered.slice(0, 8).map(i => `
      <div class="notif-item" onclick="window.Router.navigate('${i.route}'); window.AppActions.toggleQuickSearch(false)">
        <span class="material-icons-round" style="color:var(--cyan-bright);font-size:20px">${i.icon}</span>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:600;color:var(--text-primary)">${i.name}</div>
          <div style="font-size:12px;color:var(--text-secondary)">${i.type} · ${i.cat}</div>
        </div>
        <span class="material-icons-round" style="color:var(--text-muted);font-size:16px">chevron_right</span>
      </div>
    `).join('');
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
      window.AppActions.toggleNotifDrawer(false);
    });
  }
  
  const closeBtn = document.getElementById('sidebar-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      sidebar.style.display = 'none';
      if (overlay) overlay.style.display = 'none';
    });
  }

  // Keyboard shortcut Ctrl+K for search, Escape for closing modals/drawers
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      window.AppActions.toggleQuickSearch();
    } else if (e.key === 'Escape') {
      window.AppActions.toggleQuickSearch(false);
      window.AppActions.toggleNotifDrawer(false);
    }
  });
  
  // Intercept nav calls to update sidebar & trigger page transition animations
  const originalNav = window.Router.navigate;
  window.Router.navigate = async function(route, update) {
    await originalNav.call(this, route, update);
    window.AppActions.renderSidebar();
    window.AppActions.toggleNotifDrawer(false);

    // Apply smooth page enter transition
    const mainContent = document.getElementById('content-area');
    if (mainContent) {
      mainContent.classList.remove('page-fade-enter');
      void mainContent.offsetWidth; // trigger reflow
      mainContent.classList.add('page-fade-enter');
    }
  };
  
  // Boot router
  window.Router.init();
});
