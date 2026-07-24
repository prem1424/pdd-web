// ============================================================
// Smart Stock - Reusable Components
// ============================================================

window.Components = {

  statCard(icon, label, value, change, colorClass = 'blue', iconClass = 'blue') {
    const changeDir = change && change.startsWith('+') ? 'up' : (change && change.startsWith('-') ? 'down' : 'neutral');
    return `
    <div class="stat-card ${colorClass}">
      <div class="stat-card-top">
        <div class="stat-card-icon ${iconClass}">
          <span class="material-icons-round">${icon}</span>
        </div>
        ${change ? `<span class="stat-card-change ${changeDir}">${change}</span>` : ''}
      </div>
      <div class="stat-card-value">${value}</div>
      <div class="stat-card-label">${label}</div>
    </div>`;
  },

  pageHeader(title, subtitle = '', backRoute = null, actions = '') {
    return `
    <div class="page-header">
      ${backRoute ? `<button class="page-header-back" onclick="${backRoute === 'back' ? 'window.Router.back()' : `window.Router.navigate('${backRoute}')`}">
        <span class="material-icons-round">arrow_back</span>
      </button>` : ''}
      <div class="page-header-info">
        <h1 class="page-header-title">${title}</h1>
        ${subtitle ? `<div class="page-header-subtitle">${subtitle}</div>` : ''}
      </div>
      ${actions ? `<div class="page-header-actions">${actions}</div>` : ''}
    </div>`;
  },

  searchBar(placeholder = 'Search...', id = 'search-input') {
    return `
    <div class="search-bar mb-20">
      <span class="material-icons-round">search</span>
      <input type="text" id="${id}" placeholder="${placeholder}">
    </div>`;
  },

  badge(text, type = 'info') {
    return `<span class="badge badge-${type}">${text}</span>`;
  },

  filterChips(chips, activeIndex = 0) {
    return `
    <div class="filter-bar mb-20">
      ${chips.map((chip, i) => `
        <button class="filter-chip ${i === activeIndex ? 'active' : ''}" data-filter="${chip.toLowerCase().replace(/\s+/g, '-')}">
          ${chip}
        </button>`).join('')}
    </div>`;
  },

  avatarColor(text) {
    const colors = ['av-blue', 'av-cyan', 'av-success', 'av-warning', 'av-purple', 'av-red'];
    const idx = (text.charCodeAt(0) + (text.charCodeAt(1) || 0)) % colors.length;
    return colors[idx];
  },

  avatar(initials, size = 'md') {
    const color = this.avatarColor(initials);
    return `<div class="avatar avatar-${size} ${color}">${initials}</div>`;
  },

  emptyState(icon, title, subtitle = '') {
    return `
    <div class="empty-state">
      <span class="material-icons-round">${icon}</span>
      <div class="empty-state-title">${title}</div>
      ${subtitle ? `<div class="empty-state-sub">${subtitle}</div>` : ''}
    </div>`;
  },

  fab(icon, label, onclick) {
    return `<button class="fab" onclick="${onclick}">
      <span class="material-icons-round">${icon}</span>
      ${label}
    </button>`;
  },

  card(content, className = '') {
    return `<div class="card ${className}">${content}</div>`;
  },

  cardWithHeader(title, subtitle, content, actions = '') {
    return `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${title}</div>
          ${subtitle ? `<div class="card-subtitle">${subtitle}</div>` : ''}
        </div>
        ${actions}
      </div>
      <div class="card-body">${content}</div>
    </div>`;
  },

  chartCard(title, subtitle, canvasId, height = 240, actions = '') {
    return `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${title}</div>
          ${subtitle ? `<div class="card-subtitle">${subtitle}</div>` : ''}
        </div>
        ${actions}
      </div>
      <div class="card-body chart-container">
        <div class="chart-canvas-wrap" style="height:${height}px">
          <canvas id="${canvasId}"></canvas>
        </div>
      </div>
    </div>`;
  },

  loadingState() {
    return `<div class="loading-state"><div class="spinner"></div><p>Loading data...</p></div>`;
  },

  modal(id, title, bodyContent, footerContent = '') {
    return `
    <div class="modal-overlay" id="${id}-overlay" style="display: none;" onclick="if(event.target===this)window.Components.closeModal('${id}')">
      <div class="modal" id="${id}">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" onclick="window.Components.closeModal('${id}')">
            <span class="material-icons-round">close</span>
          </button>
        </div>
        <div class="modal-body">${bodyContent}</div>
        ${footerContent ? `<div class="modal-footer">${footerContent}</div>` : ''}
      </div>
    </div>`;
  },

  showModal(id) {
    const el = document.getElementById(`${id}-overlay`);
    if (el) el.style.display = 'flex';
  },

  closeModal(id) {
    const el = document.getElementById(`${id}-overlay`);
    if (el) el.style.display = 'none';
  },

  toast(message, type = 'success', duration = 3000) {
    const existing = document.getElementById('toast-container');
    if (existing) existing.remove();

    const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };
    const colors = { success: 'var(--success)', error: 'var(--danger)', warning: 'var(--warning)', info: 'var(--info)' };

    const toast = document.createElement('div');
    toast.id = 'toast-container';
    toast.style.cssText = `
      position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%);
      background: var(--bg-primary); border: 1px solid var(--border-color);
      border-left: 3px solid ${colors[type]}; border-radius: 12px;
      padding: 12px 20px; display: flex; align-items: center; gap: 10px;
      box-shadow: 0 8px 32px rgba(2,8,24,0.6); z-index: 10001;
      font-size: 14px; font-weight: 500; color: var(--text-primary);
      animation: slideInUp 0.3s ease; min-width: 280px; max-width: 400px;
      font-family: 'Inter', sans-serif;
    `;
    toast.innerHTML = `<span class="material-icons-round" style="color:${colors[type]};font-size:20px">${icons[type]}</span>${message}`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, duration);
  },

  setupFilterChips(containerSelector, onFilter) {
    const chips = document.querySelectorAll(`${containerSelector} .filter-chip`);
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        onFilter(chip.dataset.filter);
      });
    });
  },

  setupSearch(inputId, callback) {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', (e) => callback(e.target.value.toLowerCase()));
    }
  },

  loadingState(message = 'Loading data...') {
    return `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>`;
  }

};
