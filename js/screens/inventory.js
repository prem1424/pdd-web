// ============================================================
// Smart Stock - Inventory Screens
// ============================================================
window.Screens = window.Screens || {};

function _stockStatusBadge(item) {
  if (item.stock <= 0) return `<span class="badge badge-danger">Out of Stock</span>`;
  if (item.stock < item.minStock * 0.5) return `<span class="badge badge-danger">Critical</span>`;
  if (item.stock < item.minStock) return `<span class="badge badge-warning">Low Stock</span>`;
  return `<span class="badge badge-success">Optimal</span>`;
}

window.InventoryViewDetails = function(id, category) {
  let item = null;
  if (category === 'Equipment') item = window.AppData.equipment.find(i => i.id == id);
  else if (category === 'Chemical') item = window.AppData.chemicals.find(i => i.id == id);
  else if (category === 'Plasticware') item = window.AppData.plasticware.find(i => i.id == id);
  else if (category === 'Glassware') item = window.AppData.glassware.find(i => i.id == id);
  
  if (!item) return;

  let modal = document.getElementById('item-details-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'item-details-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(10,22,40,0.85); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);';
    document.body.appendChild(modal);
  }

  let detailsHtml = '';
  Object.keys(item).forEach(key => {
    let val = item[key];
    if (key === 'lastMaintenance') val = window.AppUtils.formatDate(val);
    detailsHtml += `
      <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
        <span style="color: var(--text-secondary); font-size: 13px; text-transform: capitalize;">${key.replace(/([A-Z])/g, ' $1').trim()}</span>
        <span style="color: var(--text-primary); font-weight: 600; font-size: 14px; text-align: right; word-break: break-all; max-width: 60%;">${val !== null && val !== undefined ? val : '-'}</span>
      </div>
    `;
  });

  modal.innerHTML = `
    <div class="modal-content animate-in" style="width: 90vw; max-width: 500px; max-height: 85vh; display: flex; flex-direction: column; background: var(--card-background, #1E293B); border-radius: 16px; box-shadow: 0 24px 48px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
      <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02);">
        <h2 class="modal-title" style="margin: 0; font-size: 20px; color: var(--text-primary, #fff); display: flex; align-items: center; gap: 8px;">
          <span class="material-icons-round" style="color: var(--primary);">inventory_2</span>
          ${item.name || item.brand || category + ' Details'}
        </h2>
        <button class="btn btn-ghost btn-icon" onclick="document.getElementById('item-details-modal').style.display='none'" style="background: transparent; border: none; color: var(--text-secondary, #aaa); cursor: pointer; display: flex; align-items: center; justify-content: center;"><span class="material-icons-round">close</span></button>
      </div>
      <div class="modal-body" style="flex: 1; padding: 24px; overflow-y: auto;">
        ${detailsHtml}
      </div>
    </div>`;
  modal.style.display = 'flex';
};

// ---- EQUIPMENT INVENTORY ----
window.Screens['equipment-inventory'] = function() {
  return `
  <div>
    ${window.Components.pageHeader('Equipment Inventory','213 Items across all labs','',
      `<button class="btn btn-primary btn-sm" onclick="window.AppState.addStockCategory='Equipment';window.AppState.addStockReturn='equipment-inventory';window.Router.navigate('add-stock')"><span class="material-icons-round">add</span> Add</button>`)}
    ${window.Components.searchBar('Search equipment...','eq-search')}
    <div class="stats-grid mb-20">
      ${window.Components.statCard('check_circle','Operational','180','+3','success','success')}
      ${window.Components.statCard('build','Maintenance','24','+2','warning','warning')}
      ${window.Components.statCard('report','Repair','8','-1','danger','danger')}
      ${window.Components.statCard('archive','Retired','3','0','','')}
    </div>
    <div class="filter-bar mb-16" id="eq-filters">
      <button class="filter-chip active" data-filter="all">All</button>
      <button class="filter-chip" data-filter="operational">Operational</button>
      <button class="filter-chip" data-filter="maintenance">Maintenance</button>
      <button class="filter-chip" data-filter="low-stock">Low Stock</button>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table id="eq-table">
          <thead>
            <tr>
              <th>Equipment</th><th>Lab</th><th>Category</th><th>Status</th><th>Qty</th><th>Last Maintenance</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${window.AppData.equipment.map(e=>`
              <tr data-status="${e.status}">
                <td><div class="td-label">${e.name}</div><div class="td-sub">${e.brand} · ${e.model}</div></td>
                <td style="font-size:13px;color:var(--text-secondary);max-width:140px">${e.lab}</td>
                <td style="font-size:13px;color:var(--text-secondary)">${e.category}</td>
                <td><span class="badge badge-${window.AppUtils.getStatusColor(e.status)}">${e.status}</span></td>
                <td style="font-weight:700;color:var(--primary-bright);font-size:16px">${e.quantity}</td>
                <td style="font-size:12px;color:var(--text-secondary)">${window.AppUtils.formatDate(e.lastMaintenance)}</td>
                <td><div style="display:flex;gap:6px">                    <button class="btn btn-ghost btn-sm" onclick="window.AppState.editStockItem = window.AppData.equipment.find(item=>item.id==${e.id}); window.AppState.editStockCategory='Equipment'; window.Router.navigate('edit-stock')"><span class="material-icons-round" style="font-size:16px">edit</span></button>
                    <button class="btn btn-outline btn-sm" onclick="window.InventoryViewDetails(${e.id}, 'Equipment')"><span class="material-icons-round" style="font-size:16px">visibility</span></button>
                </div></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
    ${window.Components.fab('add','Add Equipment','window.AppState.addStockCategory=\'Equipment\';window.AppState.addStockReturn=\'equipment-inventory\';window.Router.navigate(\'add-stock\')')}
  </div>`;
};
window.Screens['equipment-inventory'].afterRender = function() {
  window.Components.setupSearch('eq-search', q => {
    document.querySelectorAll('#eq-table tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
  window.Components.setupFilterChips('#eq-filters', f => {
    document.querySelectorAll('#eq-table tbody tr').forEach(row => {
      row.style.display = (f === 'all' || row.dataset.status === f) ? '' : 'none';
    });
  });
};

// ---- CHEMICALS INVENTORY ----
window.Screens['chemicals-inventory'] = function() {
  return `
  <div>
    ${window.Components.pageHeader('Chemicals Inventory','187 Items tracked','',
      `<button class="btn btn-primary btn-sm" onclick="window.AppState.addStockCategory='Chemical';window.AppState.addStockReturn='chemicals-inventory';window.Router.navigate('add-stock')"><span class="material-icons-round">add</span> Add</button>`)}
    ${window.Components.searchBar('Search chemicals...','chem-search')}
    <div class="stats-grid mb-20">
      ${window.Components.statCard('science','Total Chemicals','187','','','blue')}
      ${window.Components.statCard('warning','Low Stock','28','+3','warning','warning')}
      ${window.Components.statCard('report_problem','Critical','12','+1','danger','danger')}
      ${window.Components.statCard('event_busy','Expired','5','0','','')}
    </div>
    <div class="filter-bar mb-16" id="chem-filters">
      <button class="filter-chip active" data-filter="all">All</button>
      <button class="filter-chip" data-filter="ar-grade">AR Grade</button>
      <button class="filter-chip" data-filter="molecular-biology-grade">Mol. Bio Grade</button>
      <button class="filter-chip" data-filter="hplc-grade">HPLC Grade</button>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table id="chem-table">
          <thead>
            <tr><th>Chemical</th><th>CAS No.</th><th>Grade</th><th>Supplier</th><th>Stock</th><th>Expiry</th><th>Hazard</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${window.AppData.chemicals.map(c => {
              const isLow = c.stock < c.minStock;
              const daysLeft = window.AppUtils.daysUntil(c.expiry);
              return `
              <tr data-grade="${c.grade.toLowerCase().replace(/\s+/g,'-')}" style="${isLow?'background:rgba(255,179,0,0.03)':''}">
                <td><div class="td-label ${isLow?'text-warning':''}">${c.name}</div><div class="td-sub">${c.category}</div></td>
                <td style="font-size:12px;color:var(--text-muted);font-family:monospace">${c.cas}</td>
                <td style="font-size:12px;color:var(--text-secondary)">${c.grade}</td>
                <td style="font-size:13px;color:var(--text-secondary)">${c.supplier}</td>
                <td>
                  <span style="font-weight:700;color:${isLow?'var(--warning)':'var(--text-primary)'}">${c.stock} ${c.unit}</span>
                  <div style="font-size:11px;color:var(--text-muted)">min: ${c.minStock}</div>
                </td>
                <td style="font-size:12px;color:${daysLeft<30?'var(--danger)':daysLeft<60?'var(--warning)':'var(--text-secondary)'}">${window.AppUtils.formatDate(c.expiry)}</td>
                <td>
                  <span class="badge badge-${c.hazard==='Non-hazardous'?'success':c.hazard==='Toxic'||c.hazard==='Corrosive'?'danger':'warning'}">${c.hazard}</span>
                </td>
                <td>${_stockStatusBadge(c)}</td>
                  <td><button class="btn btn-ghost btn-sm" onclick="window.AppState.editStockItem = window.AppData.chemicals.find(item=>item.id==${c.id}); window.AppState.editStockCategory='Chemical'; window.Router.navigate('edit-stock')"><span class="material-icons-round" style="font-size:16px">edit</span></button>
                  <button class="btn btn-outline btn-sm" onclick="window.InventoryViewDetails(${c.id}, 'Chemical')"><span class="material-icons-round" style="font-size:16px">visibility</span></button></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
    ${window.Components.fab('add','Add Chemical','window.AppState.addStockCategory=\'Chemical\';window.AppState.addStockReturn=\'chemicals-inventory\';window.Router.navigate(\'add-stock\')')}
  </div>`;
};
window.Screens['chemicals-inventory'].afterRender = function() {
  window.Components.setupSearch('chem-search', q => {
    document.querySelectorAll('#chem-table tbody tr').forEach(r => { r.style.display = r.textContent.toLowerCase().includes(q)?'':'none'; });
  });
  window.Components.setupFilterChips('#chem-filters', f => {
    document.querySelectorAll('#chem-table tbody tr').forEach(r => { r.style.display = (f==='all' || r.dataset.grade===f)?'':'none'; });
  });
};

// ---- PLASTICWARE ----
window.Screens['plasticware-inventory'] = function() {
  return `
  <div>
    ${window.Components.pageHeader('Plasticware Inventory','8 Categories','',
      `<button class="btn btn-primary btn-sm" onclick="window.AppState.addStockCategory='Plasticware';window.AppState.addStockReturn='plasticware-inventory';window.Router.navigate('add-stock')"><span class="material-icons-round">add</span> Add</button>`)}
    ${window.Components.searchBar('Search plasticware...','pw-search')}
    <div class="stats-grid mb-20" style="grid-template-columns:repeat(3,1fr)">
      ${window.Components.statCard('inventory_2','Total SKUs','8','','','blue')}
      ${window.Components.statCard('warning','Low Stock','1','','warning','warning')}
      ${window.Components.statCard('check','Optimal','7','','success','success')}
    </div>
    <div class="card">
      <div class="table-wrap">
        <table id="pw-table">
          <thead><tr><th>Item</th><th>Category</th><th>Brand</th><th>Stock</th><th>Unit</th><th>Min Stock</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${window.AppData.plasticware.map(p=>`
              <tr>
                <td><div class="td-label">${p.name}</div><div class="td-sub">${p.location}</div></td>
                <td style="font-size:13px;color:var(--text-secondary)">${p.category}</td>
                <td style="font-size:13px;color:var(--text-secondary)">${p.brand}</td>
                <td style="font-weight:700;color:${p.stock<p.minStock?'var(--warning)':'var(--primary-bright)'}">${p.stock.toLocaleString()}</td>
                <td style="font-size:13px;color:var(--text-secondary)">${p.unit}</td>
                <td style="font-size:13px;color:var(--text-secondary)">${p.minStock.toLocaleString()}</td>
                <td>${_stockStatusBadge(p)}</td>
                  <td><button class="btn btn-ghost btn-sm" onclick="window.AppState.editStockItem = window.AppData.plasticware.find(item=>item.id==${p.id}); window.AppState.editStockCategory='Plasticware'; window.Router.navigate('edit-stock')"><span class="material-icons-round" style="font-size:16px">edit</span></button>
                  <button class="btn btn-outline btn-sm" onclick="window.InventoryViewDetails(${p.id}, 'Plasticware')"><span class="material-icons-round" style="font-size:16px">visibility</span></button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
};

// ---- GLASSWARE ----
window.Screens['glassware-inventory'] = function() {
  return `
  <div>
    ${window.Components.pageHeader('Glassware Inventory','8 Types','',
      `<button class="btn btn-primary btn-sm" onclick="window.AppState.addStockCategory='Glassware';window.AppState.addStockReturn='glassware-inventory';window.Router.navigate('add-stock')"><span class="material-icons-round">add</span> Add</button>`)}
    ${window.Components.searchBar('Search glassware...','gw-search')}
    <div class="stats-grid mb-20" style="grid-template-columns:repeat(3,1fr)">
      ${window.Components.statCard('inventory','Total SKUs','8','','','cyan')}
      ${window.Components.statCard('warning','Low Stock','1','','warning','warning')}
      ${window.Components.statCard('check','Optimal','7','','success','success')}
    </div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Item</th><th>Category</th><th>Brand</th><th>Stock</th><th>Unit</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${window.AppData.glassware.map(g=>`
              <tr>
                <td><div class="td-label">${g.name}</div><div class="td-sub">${g.location}</div></td>
                <td style="font-size:13px;color:var(--text-secondary)">${g.category}</td>
                <td style="font-size:13px;color:var(--text-secondary)">${g.brand}</td>
                <td style="font-weight:700;color:${g.stock<g.minStock?'var(--warning)':'var(--primary-bright)'}">${g.stock}</td>
                <td style="font-size:13px;color:var(--text-secondary)">${g.unit}</td>
                <td>${_stockStatusBadge(g)}</td>
                  <td><button class="btn btn-ghost btn-sm" onclick="window.AppState.editStockItem = window.AppData.glassware.find(item=>item.id==${g.id}); window.AppState.editStockCategory='Glassware'; window.Router.navigate('edit-stock')"><span class="material-icons-round" style="font-size:16px">edit</span></button>
                  <button class="btn btn-outline btn-sm" onclick="window.InventoryViewDetails(${g.id}, 'Glassware')"><span class="material-icons-round" style="font-size:16px">visibility</span></button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
};

// ---- ADD STOCK ----
window.Screens['add-stock'] = function() {
  return `
  <div>
    ${window.Components.pageHeader('Add Stock Item','Add new item to inventory','')}
    <div class="card">
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Item Name</label><input class="form-input" id="as-name" placeholder="e.g. Ethanol (96%)"></div>
          <div class="form-group"><label class="form-label">Category</label>
            <select class="form-input form-select" id="as-cat">
              <option>Equipment</option><option>Chemical</option><option>Plasticware</option><option>Glassware</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Lab</label>
            <select class="form-input form-select" id="as-lab">${window.AppData.labs.map(l=>`<option>${l.name}</option>`).join('')}<option>All Labs</option></select>
          </div>
          <div class="form-group"><label class="form-label">Brand / Supplier</label><input class="form-input" id="as-brand" placeholder="Merck, Sigma-Aldrich..."></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Quantity</label><input class="form-input" type="number" id="as-qty" placeholder="0"></div>
          <div class="form-group"><label class="form-label">Unit</label><input class="form-input" id="as-unit" placeholder="L, g, pcs, ml..."></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Minimum Stock Level</label><input class="form-input" type="number" id="as-min" placeholder="Reorder point"></div>
          <div class="form-group"><label class="form-label">Maximum Stock Level</label><input class="form-input" type="number" id="as-max" placeholder="Max capacity"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Storage Location</label><input class="form-input" id="as-location" placeholder="Chemical Store A, Room 201..."></div>
          <div class="form-group"><label class="form-label">Expiry Date <span style="color:var(--text-muted)">(optional)</span></label><input class="form-input" type="date" id="as-expiry"></div>
        </div>
        <div class="form-group"><label class="form-label">Hazard Level <span style="color:var(--text-muted)">(for chemicals)</span></label>
          <select class="form-input form-select" id="as-hazard">
            <option value="">None / Not Applicable</option>
            <option>Non-hazardous</option><option>Flammable</option><option>Corrosive</option><option>Toxic</option><option>Oxidizer</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Notes</label><textarea class="form-input form-textarea" id="as-notes" placeholder="Additional information..."></textarea></div>
        <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:8px">
          <button class="btn btn-ghost" onclick="history.back()">Cancel</button>
          <button class="btn btn-primary" id="add-stock-btn">
            <span class="material-icons-round">add_circle</span> Add to Inventory
          </button>
        </div>
      </div>
    </div>
  </div>`;
};
window.Screens['add-stock'].afterRender = function() {
  // Capture the return route BEFORE it could be cleared
  const returnRoute = window.AppState.addStockReturn || (window.AppState.role ? window.AppState.role + '-dashboard' : 'role-select');

  // Pre-select category based on which inventory page the user came from
  const catSelect = document.getElementById('as-cat');
  if (catSelect && window.AppState.addStockCategory) {
    const opts = catSelect.options;
    for (let i = 0; i < opts.length; i++) {
      if (opts[i].value === window.AppState.addStockCategory || opts[i].textContent === window.AppState.addStockCategory) {
        catSelect.selectedIndex = i;
        break;
      }
    }
    delete window.AppState.addStockCategory;
  }
  // Clear return route from state
  delete window.AppState.addStockReturn;

  // Cancel button
  const cancelBtn = document.querySelector('#add-stock-btn')?.closest('.card-body')?.querySelector('.btn-ghost');
  if (cancelBtn) {
    cancelBtn.onclick = () => window.Router.navigate(returnRoute);
  }

  // Save button — navigate explicitly to stock-history page
  const btn = document.getElementById('add-stock-btn');
  if (btn) {
    btn.onclick = async () => {
      const name = document.getElementById('as-name').value.trim();
      const category = document.getElementById('as-cat').value;
      const lab = document.getElementById('as-lab').value;
      const brand = document.getElementById('as-brand').value.trim();
      const quantity = parseFloat(document.getElementById('as-qty').value) || 0;
      const unit = document.getElementById('as-unit').value.trim();
      const min_stock = parseFloat(document.getElementById('as-min').value) || 0;
      const max_stock = parseFloat(document.getElementById('as-max').value) || 0;
      const location = document.getElementById('as-location').value.trim();
      const expiry = document.getElementById('as-expiry').value || null;
      const hazard = document.getElementById('as-hazard').value || 'Non-hazardous';

      if (!name) {
        window.Components.toast('Item Name is required', 'error');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = `<span class="material-icons-round animate-spin">sync</span> Adding...`;

      const res = await window.fetchAPI('inventory.php?action=add_item', {
        method: 'POST',
        body: {
          category,
          name,
          lab,
          brand,
          quantity,
          unit,
          min_stock,
          max_stock,
          location,
          expiry,
          hazard
        }
      });

      btn.disabled = false;
      btn.innerHTML = `<span class="material-icons-round">add_circle</span> Add to Inventory`;

      if (res.success) {
        window.Components.toast('Item added to inventory successfully!', 'success');
        if (window.AppActions && window.AppActions.syncData) {
          await window.AppActions.syncData();
        }
        const targetRoute = (category === 'Equipment') ? 'equipment-inventory' : 'chemicals-inventory';
        setTimeout(() => window.Router.navigate(targetRoute), 1000);
      } else {
        window.Components.toast(res.message || 'Failed to add item', 'danger');
      }
    };
  }
};

// ---- EDIT STOCK ----
window.Screens['edit-stock'] = function() {
  const e = window.AppState.editStockItem || window.AppData.equipment[0] || {};
  const cat = window.AppState.editStockCategory || e.category || 'Equipment';
  const name = e.name || '';
  const brand = e.brand || e.supplier || '';
  const model = e.model || '';
  const quantity = e.quantity !== undefined ? e.quantity : (e.stock !== undefined ? e.stock : 0);
  const location = e.location || '';
  const status = e.status || '';
  const nextMaintenance = e.nextMaintenance || e.expiry || '';

  return `
  <div>
    ${window.Components.pageHeader('Edit Stock Item', name || 'Edit Stock Item','')}
    <div class="card">
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Item Name</label><input class="form-input" id="es-name" value="${name}"></div>
          <div class="form-group"><label class="form-label">Category</label>
            <select class="form-input form-select" id="es-cat" disabled>
              <option ${cat==='Equipment'?'selected':''}>Equipment</option>
              <option ${cat==='Chemical'?'selected':''}>Chemical</option>
              <option ${cat==='Plasticware'?'selected':''}>Plasticware</option>
              <option ${cat==='Glassware'?'selected':''}>Glassware</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Lab</label>
            <select class="form-input form-select" id="es-lab">
              ${(window.AppData.labs || []).map(l=>`<option ${l.name===e.lab?'selected':''}>${l.name}</option>`).join('')}
              <option ${e.lab==='All Labs'?'selected':''}>All Labs</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">${cat==='Chemical'?'Supplier':'Brand'}</label><input class="form-input" id="es-brand" value="${brand}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">${cat==='Chemical'?'Unit':'Model'}</label><input class="form-input" id="es-model" value="${cat==='Chemical'?(e.unit || ''):model}"></div>
          <div class="form-group"><label class="form-label">${cat==='Chemical'?'Stock':'Quantity'}</label><input class="form-input" type="number" id="es-qty" value="${quantity}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Location</label><input class="form-input" id="es-location" value="${location}"></div>
          <div class="form-group"><label class="form-label">Status</label>
            <select class="form-input form-select" id="es-status">
              <option ${status==='operational'?'selected':''}>operational</option>
              <option ${status==='maintenance'?'selected':''}>maintenance</option>
              <option ${status==='repair'?'selected':''}>repair</option>
              <option ${status==='Optimal'?'selected':''}>Optimal</option>
              <option ${status==='Low Stock'?'selected':''}>Low Stock</option>
              <option ${status==='Critical'?'selected':''}>Critical</option>
            </select>
          </div>
        </div>
        <div class="form-group"><label class="form-label">${cat==='Chemical'?'Expiry Date':'Next Maintenance Date'}</label><input class="form-input" type="date" id="es-date" value="${nextMaintenance}"></div>
        <div style="display:flex;gap:12px;justify-content:space-between;margin-top:8px">
          <button class="btn btn-danger" id="edit-stock-delete-btn">
            <span class="material-icons-round">delete</span> Delete
          </button>
          <div style="display:flex;gap:12px">
            <button class="btn btn-ghost" id="edit-stock-cancel-btn">Cancel</button>
            <button class="btn btn-primary" id="edit-stock-save-btn">
              <span class="material-icons-round">save</span> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
};
window.Screens['edit-stock'].afterRender = function() {
  const cancelBtn = document.getElementById('edit-stock-cancel-btn');
  if (cancelBtn) {
    cancelBtn.onclick = () => history.back();
  }

  const e = window.AppState.editStockItem;
  if (!e) return;

  const deleteBtn = document.getElementById('edit-stock-delete-btn');
  if (deleteBtn) {
    deleteBtn.onclick = async () => {
      if (!confirm("Are you sure you want to delete this item?")) return;

      const category = window.AppState.editStockCategory || 'Equipment';
      if (category === 'Plasticware' || category === 'Glassware') {
        if (category === 'Plasticware') {
          window.AppData.plasticware = window.AppData.plasticware.filter(item => item.id != e.id);
        } else {
          window.AppData.glassware = window.AppData.glassware.filter(item => item.id != e.id);
        }
        window.Components.toast('Item deleted successfully!', 'success');
        delete window.AppState.editStockItem;
        delete window.AppState.editStockCategory;
        history.back();
        return;
      }

      deleteBtn.disabled = true;
      deleteBtn.innerHTML = `<span class="material-icons-round animate-spin">sync</span> Deleting...`;

      const res = await window.fetchAPI('inventory.php?action=delete_item', {
        method: 'POST',
        body: {
          id: e.id,
          category: category
        }
      });

      deleteBtn.disabled = false;
      deleteBtn.innerHTML = `<span class="material-icons-round">delete</span> Delete`;

      if (res.success) {
        window.Components.toast('Item deleted successfully!', 'success');
        if (window.AppActions && window.AppActions.syncData) {
          await window.AppActions.syncData();
        }
        delete window.AppState.editStockItem;
        delete window.AppState.editStockCategory;
        history.back();
      } else {
        window.Components.toast(res.message || 'Failed to delete item', 'danger');
      }
    };
  }

  const saveBtn = document.getElementById('edit-stock-save-btn');
  if (saveBtn) {
    saveBtn.onclick = async () => {
      const name = document.getElementById('es-name').value.trim();
      const category = window.AppState.editStockCategory || e.category || 'Equipment';
      const lab = document.getElementById('es-lab').value;
      const brand = document.getElementById('es-brand').value.trim();
      const modelOrUnit = document.getElementById('es-model').value.trim();
      const quantity = parseFloat(document.getElementById('es-qty').value) || 0;
      const location = document.getElementById('es-location').value.trim();
      const status = document.getElementById('es-status').value;
      const dateVal = document.getElementById('es-date').value || null;

      if (!name) {
        window.Components.toast('Item Name is required', 'error');
        return;
      }

      saveBtn.disabled = true;
      saveBtn.innerHTML = `<span class="material-icons-round animate-spin">sync</span> Saving...`;

      const body = {
        id: e.id,
        category,
        name,
        lab,
        location
      };

      if (category === 'Equipment') {
        body.brand = brand;
        body.model = modelOrUnit;
        body.quantity = quantity;
        body.status = status;
        body.next_maintenance = dateVal;
      } else {
        body.supplier = brand;
        body.unit = modelOrUnit;
        body.stock = quantity;
        body.expiry = dateVal;
        body.hazard = e.hazard || 'Non-hazardous';
        body.cas = e.cas || '';
        body.grade = e.grade || '';
        body.min_stock = e.minStock !== undefined ? e.minStock : 0;
        body.max_stock = e.maxStock !== undefined ? e.maxStock : 100;
      }

      const res = await window.fetchAPI('inventory.php?action=edit_item', {
        method: 'POST',
        body: body
      });

      saveBtn.disabled = false;
      saveBtn.innerHTML = `<span class="material-icons-round">save</span> Save Changes`;

      if (res.success) {
        window.Components.toast('Item updated successfully!', 'success');
        if (window.AppActions && window.AppActions.syncData) {
          await window.AppActions.syncData();
        }
        delete window.AppState.editStockItem;
        delete window.AppState.editStockCategory;
        history.back();
      } else {
        window.Components.toast(res.message || 'Failed to update item', 'danger');
      }
    };
  }
};

// ---- LOW STOCK ALERTS ----
window.Screens['low-stock-alerts'] = function() {
  const lowChemicals = window.AppData.chemicals.filter(c => c.stock < c.minStock);
  const lowPlastic = window.AppData.plasticware.filter(p => p.stock < p.minStock);
  const allLow = [...lowChemicals.map(c=>({...c,catType:'Chemical'})), ...lowPlastic.map(p=>({...p,catType:'Plasticware'}))];
  return `
  <div>
    ${window.Components.pageHeader('Low Stock Alerts',`${allLow.length} Items Need Attention`,'',
      `<button class="btn btn-primary btn-sm" onclick="window.Screens['low-stock-alerts'].requestAll()"><span class="material-icons-round">shopping_cart</span> Request All</button>`)}
    <div class="filter-bar mb-16" id="low-stock-filter-bar">
      <button class="filter-chip active" data-filter="all">All (${allLow.length})</button>
      <button class="filter-chip" data-filter="critical">Critical</button>
      <button class="filter-chip" data-filter="chemical">Chemicals</button>
      <button class="filter-chip" data-filter="plasticware">Plasticware</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px" id="low-stock-alerts-list">
      ${allLow.map(item => {
        const pct = Math.round((item.stock / item.minStock) * 100);
        const isCrit = item.stock < item.minStock * 0.5;
        return `
        <div class="card" data-cat="${item.catType.toLowerCase()}" data-crit="${isCrit}" style="border-left:3px solid ${isCrit?'var(--danger)':'var(--warning)'}">
          <div class="card-body" style="padding:16px 20px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
              <div>
                <div style="font-weight:700;font-size:15px;color:var(--text-primary)">${item.name}</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">${item.catType} · ${item.supplier||item.brand} · ${item.location}</div>
              </div>
              <span class="badge badge-${isCrit?'danger':'warning'}">${isCrit?'Critical':'Low Stock'}</span>
            </div>
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
              <div style="flex:1">
                <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-secondary);margin-bottom:5px">
                  <span>Current: <strong style="color:${isCrit?'var(--danger)':'var(--warning)'}">${item.stock} ${item.unit}</strong></span>
                  <span>Min: ${item.minStock} ${item.unit}</span>
                </div>
                <div class="progress-bar-wrap">
                  <div class="progress-bar-fill ${isCrit?'danger':'warning'}" style="width:${Math.min(pct,100)}%"></div>
                </div>
              </div>
            </div>
            <button class="btn btn-outline btn-sm" onclick="window.Inventory.requestReorder('${item.name}', '${item.lab}', '${item.minStock || 1}')">
              <span class="material-icons-round">shopping_cart</span> Request Reorder
            </button>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
};
window.Screens['low-stock-alerts'].afterRender = function() {
  const chips = document.querySelectorAll('#low-stock-filter-bar .filter-chip');
  const cards = document.querySelectorAll('#low-stock-alerts-list .card');
  
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      
      const filter = chip.dataset.filter;
      cards.forEach(card => {
        const cat = card.dataset.cat;
        const isCrit = card.dataset.crit === 'true';
        
        let show = false;
        if (filter === 'all') {
          show = true;
        } else if (filter === 'critical') {
          show = isCrit;
        } else if (filter === 'chemical') {
          show = cat === 'chemical';
        } else if (filter === 'plasticware') {
          show = cat === 'plasticware';
        }
        
        card.style.display = show ? '' : 'none';
      });
    });
  });
};

window.Screens['low-stock-alerts'].requestAll = async function() {
  const lowChemicals = window.AppData.chemicals.filter(c => c.stock < c.minStock);
  const lowPlastic = window.AppData.plasticware.filter(p => p.stock < p.minStock);
  const allLow = [...lowChemicals, ...lowPlastic];
  
  if (allLow.length === 0) {
    window.Components.toast('No items to request', 'info');
    return;
  }
  
  let successCount = 0;
  for (const item of allLow) {
    const auditorName = window.AppState.user ? window.AppState.user.name : 'Auditor';
    const payload = {
      type: 'stock-request',
      title: item.name,
      requested_by: auditorName,
      lab: item.lab || window.AppState.selectedLab || 'Microbiology Lab',
      quantity: (item.minStock || 1) + ' units',
      urgency: 'high'
    };
    const res = await window.fetchAPI('approvals.php?action=submit', { method: 'POST', body: payload });
    if (res.success) successCount++;
  }
  
  window.Components.toast(`Successfully sent ${successCount} reorder requests!`, 'success');
  if (window.AppActions && window.AppActions.syncData) {
    await window.AppActions.syncData();
  }
  window.Router.render();
};

// ---- EXPIRY ALERTS ----
window.Screens['expiry-alerts'] = function() {
  const expiring = window.AppData.chemicals.map(c => ({...c, daysLeft: window.AppUtils.daysUntil(c.expiry)}))
    .filter(c => c.daysLeft < 180).sort((a,b) => a.daysLeft - b.daysLeft);
  return `
  <div>
    ${window.Components.pageHeader('Expiry Alerts','Items expiring within 6 months')}
    <div class="filter-bar mb-16" id="expiry-filter-bar">
      <button class="filter-chip active" data-filter="all">All</button>
      <button class="filter-chip" data-filter="30">&lt;30 Days</button>
      <button class="filter-chip" data-filter="60">30-60 Days</button>
      <button class="filter-chip" data-filter="90">60-90 Days</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px" id="expiry-alerts-list">
      ${expiring.map(c => {
        const urgColor = c.daysLeft<30?'var(--danger)':c.daysLeft<60?'var(--warning)':'#FFB300';
        const urgLabel = c.daysLeft<0?'EXPIRED':c.daysLeft<30?'< 30 Days':c.daysLeft<60?'< 60 Days':'< 90 Days';
        return `
        <div class="card" data-days="${c.daysLeft}" style="border-left:3px solid ${urgColor}">
          <div class="card-body" style="padding:16px 20px">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div>
                <div style="font-weight:700;font-size:15px;color:var(--text-primary)">${c.name}</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:3px">${c.supplier} · ${c.location} · Stock: ${c.stock} ${c.unit}</div>
              </div>
              <div style="text-align:right">
                <div style="font-weight:800;font-size:18px;color:${urgColor}">${c.daysLeft < 0 ? 'EXPIRED' : c.daysLeft + 'd'}</div>
                <span class="badge" style="background:${urgColor}22;color:${urgColor}">${urgLabel}</span>
              </div>
            </div>
            <div style="margin-top:10px;display:flex;align-items:center;justify-content:space-between">
              <div style="font-size:13px;color:var(--text-secondary)">
                <span class="material-icons-round" style="font-size:15px;vertical-align:middle;margin-right:4px">event</span>
                Expires: <strong>${window.AppUtils.formatDate(c.expiry)}</strong>
              </div>
              <button class="btn btn-danger btn-sm" onclick="window.Components.toast('Disposal request sent','info')">
                <span class="material-icons-round">delete_sweep</span> Dispose
              </button>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
};
window.Screens['expiry-alerts'].afterRender = function() {
  const chips = document.querySelectorAll('#expiry-filter-bar .filter-chip');
  const cards = document.querySelectorAll('#expiry-alerts-list .card');
  
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      
      const filter = chip.dataset.filter;
      cards.forEach(card => {
        const days = parseInt(card.dataset.days, 10);
        let show = false;
        if (filter === 'all') {
          show = true;
        } else if (filter === '30') {
          show = days < 30;
        } else if (filter === '60') {
          show = days >= 30 && days < 60;
        } else if (filter === '90') {
          show = days >= 60 && days < 90;
        }
        
        card.style.display = show ? '' : 'none';
      });
    });
  });
};

// ---- STOCK HISTORY ----
window.Screens['stock-history'] = function() {
  return `
  <div>
    ${window.Components.pageHeader('Stock History','Complete usage & addition log')}
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">
      <button class="btn btn-primary" onclick="window.Router.navigate('log-usage')" style="margin-right:auto; margin-bottom:12px;">+ Log Usage</button>
      <input type="date" id="sh-date" class="form-input" style="max-width:160px">
      <select id="sh-type" class="form-input form-select" style="max-width:160px">
        <option>All Types</option><option value="usage">Usage</option><option value="addition">Addition</option><option value="adjustment">Adjustment</option>
      </select>
      <select id="sh-lab" class="form-input form-select" style="max-width:180px" ${window.AppState?.role === 'labhead' ? 'disabled style="background:var(--bg-base);cursor:not-allowed;opacity:0.8"' : ''}>
        ${window.AppState?.role === 'labhead'
          ? `<option>${window.AppState?.selectedLab || window.AppState?.user?.lab || 'Microbiology Lab'}</option>`
          : `<option>All Labs</option>${(window.AppData.labs || []).map(l=>`<option>${l.name}</option>`).join('')}`}
      </select>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table id="sh-table">
          <thead>
            <tr><th>Date</th><th>Item</th><th>Action</th><th>Quantity</th><th>By</th><th>Lab</th><th>Reason</th></tr>
          </thead>
          <tbody>
            <tr><td colspan="7" style="text-align:center;padding:20px;">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
};

// ---- INVENTORY ANALYTICS ----
window.Screens['inventory-analytics'] = function() {
  return `
  <div>
    ${window.Components.pageHeader('Inventory Analytics','Stock trends and insights')}
    <div class="stats-grid mb-24">
      ${window.Components.statCard('inventory_2','Total Items','547','+23','','blue')}
      ${window.Components.statCard('warning','Low Stock','28','+5','warning','warning')}
      ${window.Components.statCard('currency_rupee','Monthly Usage','₹42,500','+12%','','cyan')}
      ${window.Components.statCard('account_balance','Stock Value','₹12.4L','+8%','success','success')}
    </div>
    <div class="cards-grid-2 mb-20">
      ${window.Components.chartCard('Monthly Usage Trend','Last 6 months','inv-usage-chart',220)}
      ${window.Components.chartCard('Stock Status Distribution','Current health','inv-status-chart',220)}
    </div>
    <div class="mb-20">
      ${window.Components.chartCard('Lab-wise Inventory Count','Items per laboratory','inv-lab-chart',220)}
    </div>
    <h2 class="section-title">Recent Activity</h2>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Item</th><th>Action</th><th>Qty</th><th>By</th></tr></thead>
          <tbody>
            ${(window.AppData.stockHistory || []).slice(0, 10).map(h=>`
              <tr>
                <td style="font-size:12px;color:var(--text-secondary)">${window.AppUtils.formatDate(h.date)}</td>
                <td class="td-label">${h.item}</td>
                <td><span class="badge badge-${h.action==='addition'?'success':'warning'}">${h.action}</span></td>
                <td style="font-weight:700;color:${h.quantity>0?'var(--success)':'var(--danger)'}">${h.quantity>0?'+':''}${h.quantity} ${h.unit}</td>
                <td style="font-size:13px;color:var(--text-secondary)">${h.by}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
};
window.Screens['inventory-analytics'].afterRender = function() {
  const d = window.AppData.chartData;
  window.Charts.line('inv-usage-chart', d.monthlyUsage.labels, [
    { label: 'Chemicals (units)', data: d.monthlyUsage.chemicals, color: 'rgba(33,150,243,0.85)' },
    { label: 'Equipment (uses)', data: d.monthlyUsage.equipment, color: 'rgba(0,229,255,0.85)' }
  ]);
  window.Charts.doughnut('inv-status-chart', d.stockStatus.labels, d.stockStatus.values, {
    colors: ['rgba(0,230,118,0.85)','rgba(255,179,0,0.85)','rgba(255,82,82,0.85)','rgba(144,164,174,0.5)']
  });
  window.Charts.bar('inv-lab-chart',
    window.AppData.labs.map(l=>l.name.split(' ')[0]),
    [
      { label: 'Equipment', data: window.AppData.labs.map(l=>l.equipment), color: 'rgba(33,150,243,0.8)' },
      { label: 'Chemicals', data: window.AppData.labs.map(l=>l.chemicals), color: 'rgba(0,229,255,0.8)' }
    ]
  );
};

window.Inventory = window.Inventory || {};
window.Inventory.requestReorder = async function(name, lab, minStock) {
  const auditorName = window.AppState.user ? window.AppState.user.name : 'Auditor';
  const payload = {
    type: 'stock-request',
    title: name,
    requested_by: auditorName,
    lab: lab,
    quantity: minStock + ' units',
    urgency: 'high'
  };
  const res = await window.fetchAPI('approvals.php?action=submit', { method: 'POST', body: payload });
  if (res.success) {
    window.Components.toast('Reorder request sent for ' + name, 'success');
  } else {
    window.Components.toast('Failed to send request: ' + res.message, 'error');
  }
};

window.Screens['stock-history'].afterRender = function() {
  const dateInput = document.getElementById('sh-date');
  const typeInput = document.getElementById('sh-type');
  const labInput = document.getElementById('sh-lab');

  const fetchAndRender = async () => {
    const d = dateInput ? dateInput.value : '';
    const t = typeInput ? typeInput.value : '';
    const l = labInput ? labInput.value : '';

    const query = new URLSearchParams();
    if (d) query.append('date', d);
    if (t && t !== 'All Types') query.append('action_type', t);
    if (l && l !== 'All Labs') query.append('lab', l);

    try {
      const tbody = document.querySelector('#sh-table tbody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;">Loading...</td></tr>';

      const res = await window.fetchAPI('inventory.php?action=get_history&' + query.toString());
      if (res.success && tbody) {
        if (res.history.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-secondary)">No history logs found for these filters.</td></tr>';
          return;
        }
        tbody.innerHTML = res.history.map((h, i) => `
          <tr>
            <td style="font-size:12px;color:var(--text-secondary)">${window.AppUtils.formatDate(h.date)}</td>
            <td><div class="td-label">${h.item}</div></td>
            <td><span class="badge badge-${h.action==='addition'?'success':h.action==='usage'?'warning':'info'}">${h.action}</span></td>
            <td style="font-weight:700;color:${h.quantity>0?'var(--success)':'var(--danger)'}">${h.quantity>0?'+':''}${h.quantity} ${h.unit}</td>
            <td style="font-size:13px;color:var(--text-secondary)">${h.by_user || h.by || 'System'}</td>
            <td style="font-size:12px;color:var(--text-muted)">${h.lab}</td>
            <td style="font-size:12px;color:var(--text-secondary);max-width:200px">${h.reason}</td>
          </tr>`).join('');
      } else if (tbody) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--danger)">API Error: ' + (res.message || 'Unknown error') + '</td></tr>';
      }
    } catch (e) {
      console.error(e);
      const tbody = document.querySelector('#sh-table tbody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--danger)">JS Error: ' + e.message + '</td></tr>';
    }
  };

  if (dateInput) dateInput.addEventListener('change', fetchAndRender);
  if (typeInput) typeInput.addEventListener('change', fetchAndRender);
  if (labInput) labInput.addEventListener('change', fetchAndRender);

  fetchAndRender();
};

// ---- LOG USAGE ----
window.Screens['log-usage'] = function() {
  window.Screens['log-usage'].selectedItems = window.Screens['log-usage'].selectedItems || [];
  const u = window.AppState.user || {};
  const assignedLab = window.AppState.selectedLab || u.lab;
  const isLocked = window.AppState.role === 'student' || window.AppState.role === 'labhead' || Boolean(window.AppState.selectedLab);
  
  const labsList = isLocked 
    ? [{ name: assignedLab || 'Microbiology Lab' }]
    : (window.AppData.labs && window.AppData.labs.length > 0 ? window.AppData.labs : [{ name: 'Microbiology Lab' }, { name: 'Molecular Biology Lab' }, { name: 'Biotechnology Lab' }]);

  return `
  <div>
    ${window.Components.pageHeader('Log Usage','Record item consumption or usage across lab experiments')}
    <div class="card" style="max-width: 680px; margin: 0 auto;">
      <div class="card-body">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Lab</label>
            <select class="form-input form-select" id="lu-lab" onchange="window.Screens['log-usage'].populateItems()" ${isLocked ? 'disabled style="background:var(--bg-base);cursor:not-allowed;opacity:0.8"' : ''}>
              ${labsList.map(l => `<option value="${l.name}">${l.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label class="form-label">Used By</label><input class="form-input" id="lu-user" value="${u.name || 'System User'}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Filter Category</label>
            <select class="form-input form-select" id="lu-type" onchange="window.Screens['log-usage'].populateItems()">
              <option value="all">All Categories</option>
              <option value="chemicals">Chemicals</option>
              <option value="equipment">Equipment</option>
              <option value="plasticware">Plasticware</option>
              <option value="glassware">Glassware</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Select Equipment or Chemical (Multi-select)</label>
            <select class="form-input form-select" id="lu-item-select" onchange="window.Screens['log-usage'].addItem(this.value)">
              <option value="">-- Select an item to add --</option>
            </select>
          </div>
        </div>

        <div id="lu-selected-container" style="margin: 16px 0;"></div>

        <div class="form-row">
          <div class="form-group"><label class="form-label">Date</label><input class="form-input" type="date" id="lu-date" value="${new Date().toISOString().split('T')[0]}"></div>
          <div class="form-group"><label class="form-label">Reason / Experiment Notes</label><input class="form-input" id="lu-reason" placeholder="e.g. Media preparation, PCR assay"></div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:20px;">
          <button class="btn btn-ghost" onclick="history.back()">Cancel</button>
          <button class="btn btn-primary" id="log-usage-submit-btn">Submit Usage</button>
        </div>
      </div>
    </div>
  </div>`;
};

window.Screens['log-usage'].populateItems = function() {
  const labSelect = document.getElementById('lu-lab');
  const typeSelect = document.getElementById('lu-type');
  const itemSelect = document.getElementById('lu-item-select');
  if (!itemSelect) return;

  const currentLab = labSelect ? labSelect.value : (window.AppState.selectedLab || 'Microbiology Lab');
  const category = typeSelect ? typeSelect.value : 'all';

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

window.Screens['log-usage'].addItem = function(val) {
  if (!val) return;
  const [id, type, encName, unit, maxStock, catLabel] = val.split('|');
  const name = decodeURIComponent(encName);
  const exists = window.Screens['log-usage'].selectedItems.some(i => i.id == id && i.name === name);
  if (!exists) {
    window.Screens['log-usage'].selectedItems.push({ id, name, type, unit, maxStock: parseFloat(maxStock) || 9999, catLabel, qty: 1 });
  } else {
    window.Components.toast(`${name} is already in the list`, 'info');
  }
  const sel = document.getElementById('lu-item-select');
  if (sel) sel.value = '';
  window.Screens['log-usage'].renderSelectedItems();
};

window.Screens['log-usage'].removeItem = function(idx) {
  window.Screens['log-usage'].selectedItems.splice(idx, 1);
  window.Screens['log-usage'].renderSelectedItems();
};

window.Screens['log-usage'].updateQty = function(idx, val) {
  const item = window.Screens['log-usage'].selectedItems[idx];
  if (!item) return;
  const num = parseFloat(val) || 0;
  item.qty = num;
};

window.Screens['log-usage'].renderSelectedItems = function() {
  const container = document.getElementById('lu-selected-container');
  if (!container) return;
  const items = window.Screens['log-usage'].selectedItems || [];
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
              <span>Available: ${item.maxStock} ${item.unit}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="number" value="${item.qty}" min="0.1" max="${item.maxStock}" step="any" onchange="window.Screens['log-usage'].updateQty(${idx}, this.value)" style="width: 85px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-primary); font-size: 13px; text-align: center;">
            <span style="font-size: 13px; color: var(--text-secondary); min-width: 28px;">${item.unit}</span>
            <button class="btn btn-ghost btn-icon" onclick="window.Screens['log-usage'].removeItem(${idx})" title="Remove item" style="color: var(--danger); padding: 4px; border: none; background: transparent; cursor: pointer;"><span class="material-icons-round">delete</span></button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

window.Screens['log-usage'].afterRender = function() {
  window.Screens['log-usage'].selectedItems = [];
  window.Screens['log-usage'].populateItems();
  window.Screens['log-usage'].renderSelectedItems();

  const btn = document.getElementById('log-usage-submit-btn');
  if (!btn) return;

  btn.onclick = async () => {
    const items = window.Screens['log-usage'].selectedItems || [];
    const by_user = document.getElementById('lu-user').value.trim() || 'User';
    const lab = document.getElementById('lu-lab').value;
    const date = document.getElementById('lu-date').value;
    const reason = document.getElementById('lu-reason').value.trim() || 'Laboratory Experiment';

    if (items.length === 0) {
      window.Components.toast('Please select at least one item from the dropdown', 'error');
      return;
    }

    const invalidItem = items.find(i => !i.qty || i.qty <= 0);
    if (invalidItem) {
      window.Components.toast(`Invalid quantity for ${invalidItem.name}`, 'error');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block"></span> Submitting...`;

    const promises = items.map(item => window.fetchAPI('inventory.php?action=log_usage', {
      method: 'POST',
      body: { item: item.name, type: item.type, quantity: item.qty, unit: item.unit, by_user, lab, date, reason }
    }));

    const results = await Promise.all(promises);
    const allSuccess = results.every(r => r && r.success);

    btn.disabled = false;
    btn.innerHTML = `Submit Usage`;

    if (allSuccess) {
      window.Components.toast(`Logged usage for ${items.length} item(s) successfully!`, 'success');
      if (window.AppActions && window.AppActions.syncData) {
        await window.AppActions.syncData();
      }
      setTimeout(() => window.Router.navigate('stock-history'), 800);
    } else {
      window.Components.toast('Some items failed to log usage. Please check network connection.', 'error');
    }
  };
};
