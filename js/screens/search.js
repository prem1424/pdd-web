// ============================================================
// Smart Stock - Global Search Screen
// ============================================================
window.Screens = window.Screens || {};

window.Screens['search'] = function() {
  return `
  <div>
    ${window.Components.pageHeader('Global Search', 'Search labs, equipment, chemicals, glassware, and plasticware', 'back')}
    
    <div style="max-width: 600px; margin: 0 auto 24px;">
      ${window.Components.searchBar('Type name, category, lab, or code to search...', 'global-search-input')}
      
      <div class="filter-bar justify-between" id="global-search-filters" style="margin-top: -8px;">
        <button class="filter-chip active" data-filter="all">All</button>
        <button class="filter-chip" data-filter="labs">Labs</button>
        <button class="filter-chip" data-filter="equipment">Equipment</button>
        <button class="filter-chip" data-filter="chemicals">Chemicals</button>
        <button class="filter-chip" data-filter="glassware">Glassware</button>
        <button class="filter-chip" data-filter="plasticware">Plasticware</button>
      </div>
    </div>

    <div id="search-results-summary" style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; font-weight: 500;"></div>
    
    <div id="global-search-results" style="display: flex; flex-direction: column; gap: 12px; max-width: 800px; margin: 0 auto;">
      <!-- Results injected here -->
    </div>

    <!-- Details Modal Container -->
    ${window.Components.modal('item-details-modal', 'Item Details', `
      <div id="modal-item-content"></div>
    `, `
      <button class="btn btn-ghost" onclick="window.Components.closeModal('item-details-modal')">Close</button>
    `)}
  </div>`;
};

window.Screens['search'].afterRender = function() {
  const searchInput = document.getElementById('global-search-input');
  const resultsContainer = document.getElementById('global-search-results');
  const summaryContainer = document.getElementById('search-results-summary');
  const chips = document.querySelectorAll('#global-search-filters .filter-chip');
  
  let currentFilter = 'all';
  let query = '';

  // Perform search initially to show all items
  performSearch();

  // Input event
  if (searchInput) {
    searchInput.focus();
    searchInput.addEventListener('input', (e) => {
      query = e.target.value.toLowerCase().trim();
      performSearch();
    });
  }

  // Filter Chips event
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      performSearch();
    });
  });

  function performSearch() {
    resultsContainer.innerHTML = '';
    let matches = [];

    // Search Labs
    if (currentFilter === 'all' || currentFilter === 'labs') {
      window.AppData.labs.forEach(l => {
        if (!query || l.name.toLowerCase().includes(query) || l.code.toLowerCase().includes(query) || l.head.toLowerCase().includes(query) || l.location.toLowerCase().includes(query)) {
          matches.push({
            type: 'Lab',
            icon: 'business',
            title: l.name,
            subtitle: `${l.location} · Head: ${l.head}`,
            meta: `Code: ${l.code} · ${l.students} Students`,
            status: l.status,
            color: 'blue',
            onclick: () => window.Router.navigate(l.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z-]/g, ''))
          });
        }
      });
    }

    // Search Equipment
    if (currentFilter === 'all' || currentFilter === 'equipment') {
      window.AppData.equipment.forEach(e => {
        if (!query || e.name.toLowerCase().includes(query) || e.category.toLowerCase().includes(query) || e.brand.toLowerCase().includes(query) || e.model.toLowerCase().includes(query) || e.lab.toLowerCase().includes(query)) {
          matches.push({
            type: 'Equipment',
            icon: 'precision_manufacturing',
            title: e.name,
            subtitle: `${e.brand} ${e.model} · ${e.lab}`,
            meta: `Category: ${e.category} · Location: ${e.location}`,
            qty: `${e.quantity} units`,
            status: e.status,
            color: 'cyan',
            onclick: () => showItemDetails(e, 'Equipment')
          });
        }
      });
    }

    // Search Chemicals
    if (currentFilter === 'all' || currentFilter === 'chemicals') {
      window.AppData.chemicals.forEach(c => {
        if (!query || c.name.toLowerCase().includes(query) || c.category.toLowerCase().includes(query) || c.cas.toLowerCase().includes(query) || c.supplier.toLowerCase().includes(query) || c.grade.toLowerCase().includes(query) || c.lab.toLowerCase().includes(query)) {
          matches.push({
            type: 'Chemical',
            icon: 'science',
            title: c.name,
            subtitle: `CAS: ${c.cas} · Grade: ${c.grade} · ${c.lab}`,
            meta: `Category: ${c.category} · Supplier: ${c.supplier} · Loc: ${c.location}`,
            qty: `${c.stock} ${c.unit}`,
            status: c.stock < c.minStock ? 'low-stock' : 'optimal',
            color: 'success',
            onclick: () => showItemDetails(c, 'Chemical')
          });
        }
      });
    }

    // Search Glassware
    if (currentFilter === 'all' || currentFilter === 'glassware') {
      window.AppData.glassware.forEach(g => {
        if (!query || g.name.toLowerCase().includes(query) || g.category.toLowerCase().includes(query) || g.brand.toLowerCase().includes(query) || g.location.toLowerCase().includes(query)) {
          matches.push({
            type: 'Glassware',
            icon: 'biotech',
            title: g.name,
            subtitle: `${g.brand} · ${g.location}`,
            meta: `Category: ${g.category}`,
            qty: `${g.stock} units`,
            status: g.stock < g.minStock ? 'low-stock' : 'optimal',
            color: 'warning',
            onclick: () => showItemDetails(g, 'Glassware')
          });
        }
      });
    }

    // Search Plasticware
    if (currentFilter === 'all' || currentFilter === 'plasticware') {
      window.AppData.plasticware.forEach(p => {
        if (!query || p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query) || p.location.toLowerCase().includes(query)) {
          matches.push({
            type: 'Plasticware',
            icon: 'inventory_2',
            title: p.name,
            subtitle: `${p.brand} · ${p.location}`,
            meta: `Category: ${p.category}`,
            qty: `${p.stock} units`,
            status: p.stock < p.minStock ? 'low-stock' : 'optimal',
            color: 'purple',
            onclick: () => showItemDetails(p, 'Plasticware')
          });
        }
      });
    }

    // Update Summary
    if (summaryContainer) {
      summaryContainer.textContent = query 
        ? `Found ${matches.length} matches for "${query}"` 
        : `Showing all ${matches.length} items in registry`;
    }

    // Render results
    if (matches.length === 0) {
      resultsContainer.innerHTML = window.Components.emptyState('search_off', 'No items found', 'Try refining your search query or choosing a different filter.');
      return;
    }

    resultsContainer.innerHTML = matches.map(item => {
      const typeBadge = `<span class="badge badge-primary" style="margin-right: 6px; font-size: 10px; padding: 2px 6px;">${item.type}</span>`;
      const statusBadge = item.status ? `<span class="badge badge-${window.AppUtils.getStatusColor(item.status)}">${item.status}</span>` : '';
      const qtyBadge = item.qty ? `<span style="font-weight: 700; color: var(--primary-bright); font-size: 14px; margin-left: auto;">${item.qty}</span>` : '';
      
      return `
      <div class="card animate-in" style="cursor: pointer; padding: 14px 20px;" onclick="this.dataset.clicked = true;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(33,150,243,0.1); color: var(--primary-bright); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <span class="material-icons-round" style="font-size: 20px">${item.icon}</span>
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px; margin-bottom: 2px;">
              ${typeBadge}
              <span class="td-label" style="font-size: 15px; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${item.title}</span>
              ${statusBadge}
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; margin-bottom: 2px;">${item.subtitle}</div>
            <div style="font-size: 11px; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${item.meta}</div>
          </div>
          ${qtyBadge}
          <span class="material-icons-round" style="color: var(--text-muted); font-size: 18px; margin-left: 12px;">chevron_right</span>
        </div>
      </div>`;
    }).join('');

    // Attach click events safely to prevent innerHTML reconstruction issues
    const elements = resultsContainer.querySelectorAll('.card');
    elements.forEach((el, index) => {
      el.addEventListener('click', () => {
        matches[index].onclick();
      });
    });
  }

  function showItemDetails(item, type) {
    const modalContent = document.getElementById('modal-item-content');
    const modalTitle = document.querySelector('#item-details-modal .modal-title');
    
    if (!modalContent || !modalTitle) return;

    modalTitle.textContent = `${type} Details`;

    let detailsHtml = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="width: 60px; height: 60px; border-radius: 18px; background: var(--primary-glow); color: var(--primary-bright); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
          <span class="material-icons-round" style="font-size: 32px">${type === 'Equipment' ? 'precision_manufacturing' : type === 'Chemical' ? 'science' : 'biotech'}</span>
        </div>
        <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary);">${item.name}</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">${item.category || 'General Stock'}</p>
        <div style="margin-top: 8px;">
          <span class="badge badge-${window.AppUtils.getStatusColor(item.status || (item.stock < item.minStock ? 'low-stock' : 'active'))}">
            ${item.status || (item.stock < item.minStock ? 'Low Stock' : 'Optimal')}
          </span>
        </div>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--border-color); padding-top: 16px;">
    `;

    if (type === 'Equipment') {
      detailsHtml += `
        <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-secondary); font-size:13px">Lab</span><span style="font-weight:600; color:var(--text-primary); font-size:13px">${item.lab}</span></div>
        <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-secondary); font-size:13px">Brand / Model</span><span style="font-weight:600; color:var(--text-primary); font-size:13px">${item.brand} ${item.model}</span></div>
        <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-secondary); font-size:13px">Quantity</span><span style="font-weight:700; color:var(--primary-bright); font-size:13px">${item.quantity} units</span></div>
        <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-secondary); font-size:13px">Storage Location</span><span style="font-weight:600; color:var(--text-primary); font-size:13px">${item.location}</span></div>
        <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-secondary); font-size:13px">Last Maintenance</span><span style="font-weight:600; color:var(--text-primary); font-size:13px">${window.AppUtils.formatDate(item.lastMaintenance)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-secondary); font-size:13px">Next Maintenance</span><span style="font-weight:600; color:var(--text-primary); font-size:13px">${window.AppUtils.formatDate(item.nextMaintenance)}</span></div>
      `;
    } else if (type === 'Chemical') {
      const pct = Math.min(Math.round((item.stock / item.minStock) * 100), 100);
      detailsHtml += `
        <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-secondary); font-size:13px">Lab</span><span style="font-weight:600; color:var(--text-primary); font-size:13px">${item.lab}</span></div>
        <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-secondary); font-size:13px">CAS Number</span><span style="font-family:monospace; font-weight:600; color:var(--text-primary); font-size:13px">${item.cas}</span></div>
        <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-secondary); font-size:13px">Grade</span><span style="font-weight:600; color:var(--text-primary); font-size:13px">${item.grade}</span></div>
        <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-secondary); font-size:13px">Supplier</span><span style="font-weight:600; color:var(--text-primary); font-size:13px">${item.supplier}</span></div>
        <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-secondary); font-size:13px">Storage Location</span><span style="font-weight:600; color:var(--text-primary); font-size:13px">${item.location}</span></div>
        <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-secondary); font-size:13px">Expiry Date</span><span style="font-weight:600; color:var(--text-primary); font-size:13px">${window.AppUtils.formatDate(item.expiry)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-secondary); font-size:13px">Hazard Level</span><span class="badge badge-${item.hazard === 'Non-hazardous' ? 'success' : item.hazard === 'Toxic' || item.hazard === 'Corrosive' ? 'danger' : 'warning'}">${item.hazard}</span></div>
        <div style="margin-top: 6px;">
          <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-secondary); margin-bottom: 4px;">
            <span>Current: <strong>${item.stock} ${item.unit}</strong></span>
            <span>Min: ${item.minStock} ${item.unit}</span>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill ${item.stock < item.minStock ? 'warning' : 'success'}" style="width:${pct}%"></div>
          </div>
        </div>
      `;
    } else {
      // Glassware / Plasticware
      detailsHtml += `
        <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-secondary); font-size:13px">Brand</span><span style="font-weight:600; color:var(--text-primary); font-size:13px">${item.brand}</span></div>
        <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-secondary); font-size:13px">Current Stock</span><span style="font-weight:700; color:var(--primary-bright); font-size:13px">${item.stock} ${item.unit || 'pcs'}</span></div>
        <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-secondary); font-size:13px">Minimum Alert Level</span><span style="font-weight:600; color:var(--text-primary); font-size:13px">${item.minStock} ${item.unit || 'pcs'}</span></div>
        <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-secondary); font-size:13px">Storage Location</span><span style="font-weight:600; color:var(--text-primary); font-size:13px">${item.location}</span></div>
      `;
    }

    detailsHtml += `</div>`;
    modalContent.innerHTML = detailsHtml;
    window.Components.showModal('item-details-modal');
  }
};
