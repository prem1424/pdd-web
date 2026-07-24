// ============================================================
// Smart Stock - Router
// ============================================================

window.Router = {
  history: [],
  currentRoute: '',
  
  async navigate(route, updateUrl = true) {
    // 1. Fallback if screen doesn't exist
    if (!window.Screens[route]) {
      console.error(`Route "${route}" not found!`);
      if (window.AppState.user) {
        route = window.AppState.role === 'student' && !window.AppState.selectedLab ? 'student-lab-selection' : window.AppState.role + '-dashboard';
      } else {
        route = 'role-select';
      }
    }
    
    const publicScreens = ['splash', 'intro', 'role-select', 'auditor-login', 'auditor-signup', 'labhead-login', 'labhead-signup', 'student-login', 'student-signup', 'forgot-password'];
    
    // 2. Guard: if NOT logged in, trying to access a protected screen
    const isPublic = publicScreens.includes(route);
    if (!isPublic && !window.AppState.user) {
      route = 'role-select';
    }
    
    // 3. Guard: if logged in, trying to access public screens (except splash screen)
    if (isPublic && window.AppState.user && route !== 'splash') {
      if (window.AppState.role === 'student' && !window.AppState.selectedLab) {
        route = 'student-lab-selection';
      } else {
        route = window.AppState.role + '-dashboard';
      }
    }
    
    // 4. Guard: if student and lab is not selected, restrict to student-lab-selection only
    if (window.AppState.user && window.AppState.role === 'student' && !window.AppState.selectedLab && route !== 'student-lab-selection') {
      route = 'student-lab-selection';
    }
    
    this.currentRoute = route;
    if (updateUrl) {
      this.history.push(route);
      window.location.hash = route;
    }
    
    if (window.AppActions && window.AppActions.syncData) {
      this.isSyncing = true;
      const mainContent = document.getElementById('content-area');
      if (mainContent && (mainContent.innerHTML.trim() === '' || !updateUrl)) {
        this.updateLayout();
        mainContent.innerHTML = window.Components && window.Components.loadingState ? window.Components.loadingState() : '<div style="padding: 40px; text-align: center;"><p style="margin-top: 16px; color: var(--text-secondary);">Loading data...</p></div>';
      }
      await window.AppActions.syncData();
      this.isSyncing = false;
    }
    
    this.render();
  },
  
  back() {
    if (this.history.length > 1) {
      this.history.pop();
      const prevRoute = this.history[this.history.length - 1];
      this.navigate(prevRoute, false);
      window.location.hash = prevRoute;
    } else {
      // Default back behavior
      const role = window.AppState.role;
      if (role) {
        this.navigate(role + '-dashboard');
      } else {
        this.navigate('role-select');
      }
    }
  },
  
  updateLayout() {
    // If window dimensions are extremely small (< 100px), the browser window is minimized or mid-restore animation.
    // Do NOT alter the layout to mobile view during this temporary state!
    if (window.innerWidth < 100 || window.innerHeight < 100) {
      return;
    }

    const appShell = document.getElementById('app-shell');
    const mainContent = document.getElementById('content-area');
    const sidebar = document.getElementById('app-sidebar');
    const topbar = document.getElementById('app-topbar');
    const bottomNav = document.getElementById('app-bottom-nav');
    const mainArea = document.querySelector('.main-area');
    const overlay = document.getElementById('sidebar-overlay');

    if (!mainContent || !appShell) return;

    const isAuth = ['splash', 'intro', 'role-select', 'auditor-login', 'auditor-signup', 'labhead-login', 'labhead-signup', 'student-login', 'student-signup', 'student-lab-selection', 'forgot-password'].includes(this.currentRoute);

    appShell.style.display = isAuth ? 'block' : 'flex';

    if (isAuth) {
      document.body.classList.add('auth-mode');
      if (sidebar) {
        sidebar.style.display = 'none';
        sidebar.classList.remove('mobile-open');
      }
      if (topbar) topbar.style.display = 'none';
      if (bottomNav) bottomNav.style.display = 'none';
      if (overlay) overlay.style.display = 'none';
      if (mainArea) mainArea.style.marginLeft = '0';
      mainContent.style.padding = '0';
      mainContent.style.paddingBottom = '0';
    } else {
      document.body.classList.remove('auth-mode');
      if (window.innerWidth <= 768) {
        if (sidebar && !sidebar.classList.contains('mobile-open')) sidebar.style.display = 'none';
        if (mainArea) mainArea.style.marginLeft = '0';
      } else {
        if (sidebar) sidebar.style.display = 'flex';
        if (mainArea) mainArea.style.marginLeft = 'var(--sidebar-width)';
      }
      if (overlay && !sidebar?.classList.contains('mobile-open')) overlay.style.display = 'none';
      if (bottomNav) bottomNav.style.display = 'none';
      if (topbar) topbar.style.display = 'flex';
      mainContent.style.padding = '100px 24px 40px';
      if (window.AppActions && !this.isSyncing) {
        window.AppActions.renderSidebar();
        window.AppActions.updateNavigationActiveStates();
      }
    }
  },

  render() {
    const appShell = document.getElementById('app-shell');
    const mainContent = document.getElementById('content-area');
    if (!mainContent || !appShell) return;

    this.isSyncing = false;
    this.updateLayout();
    if (window.AppActions) {
      window.AppActions.renderSidebar();
      window.AppActions.updateNavigationActiveStates();
    }
    
    // Inject HTML
    mainContent.innerHTML = window.Screens[this.currentRoute]();
    
    // Scroll to top
    window.scrollTo(0,0);
    
    // Run afterRender hook if it exists
    if (typeof window.Screens[this.currentRoute].afterRender === 'function') {
      setTimeout(() => {
        window.Screens[this.currentRoute].afterRender();
      }, 50); // slight delay to ensure DOM is painted
    }
  },
  
  init() {
    // Staggered layout restorer to ensure layout recovers after OS restore animations finish
    const triggerLayoutUpdate = () => {
      this.updateLayout();
      setTimeout(() => this.updateLayout(), 50);
      setTimeout(() => this.updateLayout(), 200);
      setTimeout(() => this.updateLayout(), 500);
    };

    // Listen for window resize, focus, visibility, and pageshow changes to restore layout dynamically
    window.addEventListener('resize', triggerLayoutUpdate);
    window.addEventListener('visibilitychange', () => {
      if (!document.hidden) triggerLayoutUpdate();
    });
    window.addEventListener('focus', triggerLayoutUpdate);
    window.addEventListener('pageshow', triggerLayoutUpdate);

    // Listen for back button / hash changes from sidebar links
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.substring(1);
      if (hash && hash !== this.currentRoute) {
        this.navigate(hash);
      }
    });
    
    // Override standard history back
    const originalBack = history.back;
    history.back = () => {
      this.back();
    };
    
    // Initial route based on current URL hash and session
    const hash = window.location.hash.substring(1);
    if (hash && window.Screens[hash]) {
      this.navigate(hash, false);
    } else if (window.AppState.user) {
      const route = window.AppState.role === 'student' && !window.AppState.selectedLab ? 'student-lab-selection' : window.AppState.role + '-dashboard';
      this.navigate(route, false);
    } else {
      this.navigate('splash', false);
    }
  }
};
