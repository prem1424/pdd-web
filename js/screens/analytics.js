// ============================================================
// Smart Stock - Analytics & Reporting Screens
// ============================================================
window.Screens = window.Screens || {};

// ---- GLOBAL REPORTS MANAGER ----
window.Reports = {
  generatePDF(title, textContent, filename) {
    if (!window.jspdf) {
      window.AppUtils.downloadFile(textContent, filename.replace('.pdf', '.txt'), 'text/plain');
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(textContent, 180);
    let y = 10;
    for (let i = 0; i < lines.length; i++) {
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
      doc.text(lines[i], 10, y);
      y += 5;
    }
    doc.save(filename);
  },
  exportTopConsumedChemicals() {
    const headers = ['Chemical', 'Total Consumed (YTD)', 'Primary Lab User', 'Status'];
    const rows = [
      ['Ethanol (96%)', '145 L', 'Microbiology Lab', 'Low Stock'],
      ['Distilled Water', '420 L', 'All Labs', 'Optimal'],
      ['Tris-HCl Buffer', '85 L', 'Molecular Biology Lab', 'Optimal'],
      ['Acetone', '60 L', 'Biotechnology Lab', 'Critical']
    ];
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(val => `"${val.replace(/"/g, '""')}"`).join(',') + '\n';
    });
    window.AppUtils.downloadFile(csvContent, 'top_consumed_chemicals.csv', 'text/csv');
    window.Components.toast('Downloaded Top Consumed Chemicals report!', 'success');
  },

  async exportInventorySummary(format) {
    try {
      const res = await window.fetchAPI('reports.php?action=inventory');
      if (format === 'csv') {
        let csv = 'Category,Item Name,Lab,Location,Stock Level,Min Level,Status\n';
        res.equipment.forEach(e => {
          csv += `Equipment,"${e.name}","${e.lab}","${e.location}",${e.quantity},-,${e.status}\n`;
        });
        res.chemicals.forEach(c => {
          const isLow = parseFloat(c.stock) < parseFloat(c.minStock);
          const status = isLow ? (parseFloat(c.stock) < parseFloat(c.minStock) * 0.5 ? 'Critical' : 'Low Stock') : 'Optimal';
          csv += `Chemical,"${c.name}","${c.lab}","${c.location}",${c.stock} ${c.unit},${c.minStock} ${c.unit},${status}\n`;
        });
        window.AppUtils.downloadFile(csv, 'inventory_summary_report.csv', 'text/csv');
        window.Components.toast('Downloaded Inventory Summary Excel/CSV!', 'success');
      } else {
        let txt = `==================================================\n`;
        txt += `SMART STOCK - INVENTORY SUMMARY REPORT\n`;
        txt += `Generated on: ${new Date().toLocaleString()}\n`;
        txt += `==================================================\n\n`;
        
        txt += `1. EQUIPMENT SUMMARY\n`;
        txt += `--------------------\n`;
        if (res.equipment.length === 0) txt += `No equipment records found.\n`;
        res.equipment.forEach(e => {
          txt += `- ${e.name}: Qty ${e.quantity} | Lab: ${e.lab} | Status: ${e.status}\n`;
        });
        
        txt += `\n2. CHEMICALS SUMMARY\n`;
        txt += `--------------------\n`;
        if (res.chemicals.length === 0) txt += `No chemical records found.\n`;
        res.chemicals.forEach(c => {
          txt += `- ${c.name}: Stock ${c.stock} ${c.unit} | Lab: ${c.lab} | Expiry: ${c.expiry}\n`;
        });
        
        this.generatePDF('Inventory Summary Report', txt, 'inventory_summary_report.pdf');
        window.Components.toast('Downloaded Inventory Summary Report (PDF)!', 'success');
      }
    } catch (err) {
      window.Components.toast('Error generating report from database.', 'error');
    }
  },

  async exportAttendanceActivity(format) {
    try {
      const res = await window.fetchAPI('reports.php?action=attendance');
      if (format === 'csv') {
        let csv = 'Date,Student Name,Roll No,Status,Time In,Time Out\n';
        res.attendance.forEach(a => {
          csv += `"${a.date}","${a.name}","${a.rollNo}","${a.status}","${a.timeIn}","${a.timeOut}"\n`;
        });
        window.AppUtils.downloadFile(csv, 'attendance_activity_report.csv', 'text/csv');
        window.Components.toast('Downloaded Attendance Report Excel/CSV!', 'success');
      } else {
        let txt = `==================================================\n`;
        txt += `SMART STOCK - ATTENDANCE & ACTIVITY REPORT\n`;
        txt += `Generated on: ${new Date().toLocaleString()}\n`;
        txt += `==================================================\n\n`;
        
        txt += `ATTENDANCE LOGS:\n`;
        if (res.attendance.length === 0) txt += `No attendance records found.\n`;
        res.attendance.forEach(a => {
          txt += `Date: ${a.date} | Name: ${a.name} (${a.rollNo}) | Status: ${a.status.toUpperCase()} | In: ${a.timeIn || '-'} Out: ${a.timeOut || '-'}\n`;
        });
        
        txt += `\nASSIGNED TASKS:\n`;
        if (res.tasks.length === 0) txt += `No assigned tasks found.\n`;
        res.tasks.forEach(t => {
          txt += `- ${t.title} -> ${t.assigned_to} (${t.lab}) | Status: ${t.status}\n`;
        });
        
        this.generatePDF('Attendance & Activity Report', txt, 'attendance_activity_report.pdf');
        window.Components.toast('Downloaded Attendance Report (PDF)!', 'success');
      }
    } catch (err) {
      window.Components.toast('Error generating report from database.', 'error');
    }
  },

  async exportMaintenanceLog() {
    try {
      const res = await window.fetchAPI('reports.php?action=maintenance');
      let txt = `==================================================\n`;
      txt += `SMART STOCK - MAINTENANCE & REPAIR LOG\n`;
      txt += `Generated on: ${new Date().toLocaleString()}\n`;
      txt += `==================================================\n\n`;
      
      if (res.maintenance.length === 0) {
        txt += `No equipment currently undergoing maintenance or repairs.\n`;
      } else {
        res.maintenance.forEach(e => {
          txt += `Equipment:   ${e.name}\n`;
          txt += `Lab:         ${e.lab}\n`;
          txt += `Brand/Model: ${e.brand} ${e.model}\n`;
          txt += `Status:      ${e.status.toUpperCase()}\n`;
          txt += `Location:    ${e.location}\n`;
          txt += `Last Maint:  ${e.last_maintenance}\n`;
          txt += `Next Maint:  ${e.next_maintenance}\n`;
          txt += `--------------------------------------------------\n`;
        });
      }
      
      this.generatePDF('Maintenance Log', txt, 'maintenance_repair_log.pdf');
      window.Components.toast('Downloaded Maintenance & Repair Log (PDF)!', 'success');
    } catch (err) {
      window.Components.toast('Error generating report from database.', 'error');
    }
  },

  async exportMasterAudit() {
    try {
      const res = await window.fetchAPI('reports.php?action=master');
      let txt = `==================================================\n`;
      txt += `SMART STOCK - MASTER SYSTEM AUDIT REPORT\n`;
      txt += `Generated on: ${new Date().toLocaleString()}\n`;
      txt += `==================================================\n\n`;
      
      txt += `SUMMARY STATS:\n`;
      txt += `- Total Labs: ${res.summary.total_labs}\n`;
      txt += `- Active Equipment: ${res.summary.active_equipment}\n`;
      txt += `- Maintenance Equipment: ${res.summary.maintenance_equipment}\n`;
      txt += `- Low Stock Chemicals: ${res.summary.low_stock_chemicals}\n`;
      txt += `- Critical Chemicals: ${res.summary.critical_chemicals}\n`;
      txt += `- Expiring Soon (<180 Days): ${res.summary.expiring_chemicals}\n\n`;
      
      txt += `CRITICAL & LOW STOCK ALERTS:\n`;
      if (res.low_stock_list.length === 0) {
         txt += `No critical or low stock items detected.\n`;
      } else {
         res.low_stock_list.forEach(item => {
           const isCrit = parseFloat(item.stock) < parseFloat(item.minStock) * 0.5;
           txt += `- [${isCrit ? 'CRITICAL' : 'LOW STOCK'}] ${item.name}: Current: ${item.stock} ${item.unit} | Min: ${item.minStock} ${item.unit}\n`;
         });
      }
      
      this.generatePDF('Master Audit Report', txt, 'master_audit_report.pdf');
      window.Components.toast('Downloaded Master Audit Report!', 'success');
    } catch (err) {
      window.Components.toast('Error generating report from database.', 'error');
    }
  }
};

// ---- ANALYTICS OVERVIEW ----
window.Screens['analytics-overview'] = function() {
  return `
  <div>
    ${window.Components.pageHeader('System Analytics','Comprehensive data insights across all labs')}
    <div class="stats-grid mb-24">
      ${window.Components.statCard('biotech','Total Utilization','84%','+4%','success','blue')}
      ${window.Components.statCard('science','Stock Consumed','1,240L','+120L','warning','cyan')}
      ${window.Components.statCard('group','Avg Attendance','88%','-2%','danger','success')}
      ${window.Components.statCard('task_alt','Tasks Completed','142','+18','success','warning')}
    </div>
    
    <div class="cards-grid-2 mb-20">
      ${window.Components.chartCard('Monthly Stock Consumption','Litres / Units over 6 months','ana-consumption-chart',260)}
      ${window.Components.chartCard('Lab Utilization Comparison','Overall efficiency per lab','ana-utilization-chart',260)}
    </div>
    
    <div class="cards-grid-2 mb-20">
      ${window.Components.chartCard('Student Attendance Trends','Weekly view','ana-attendance-chart',220)}
      ${window.Components.chartCard('Stock Categories','Current inventory makeup','ana-category-chart',220)}
    </div>
    
    <div class="card mb-20">
      <div class="card-header">
        <div class="card-title">Top Consumed Chemicals</div>
        <button class="btn btn-ghost btn-sm" onclick="window.Reports.exportTopConsumedChemicals()"><span class="material-icons-round" style="font-size:16px;">download</span> Export</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Chemical</th><th>Total Consumed (YTD)</th><th>Primary Lab User</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td class="td-label">Ethanol (96%)</td><td style="font-weight:700">145 L</td><td style="color:var(--text-secondary)">Microbiology Lab</td><td><span class="badge badge-warning">Low Stock</span></td></tr>
            <tr><td class="td-label">Distilled Water</td><td style="font-weight:700">420 L</td><td style="color:var(--text-secondary)">All Labs</td><td><span class="badge badge-success">Optimal</span></td></tr>
            <tr><td class="td-label">Tris-HCl Buffer</td><td style="font-weight:700">85 L</td><td style="color:var(--text-secondary)">Molecular Biology Lab</td><td><span class="badge badge-success">Optimal</span></td></tr>
            <tr><td class="td-label">Acetone</td><td style="font-weight:700">60 L</td><td style="color:var(--text-secondary)">Biotechnology Lab</td><td><span class="badge badge-danger">Critical</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
};
window.Screens['analytics-overview'].afterRender = async function() {
  async function loadChart(action) {
    try { return await window.fetchAPI('analytics.php?action=' + action); } catch(e) { return null; }
  }
  // Monthly usage line chart
  const usage = await loadChart('monthly_usage');
  if (usage && usage.success && usage.values.some(v=>v>0)) {
    window.Charts.line('ana-consumption-chart', usage.labels, [
      { label: 'Stock Used (Units)', data: usage.values, color: 'rgba(0,229,255,0.8)' },
      { label: 'Plasticware (Units)', data: usage.values.map(v=>Math.round(v*3.5)), color: 'rgba(33,150,243,0.8)' }
    ]);
  } else {
    window.Charts.line('ana-consumption-chart', ['Jan','Feb','Mar','Apr','May','Jun'], [
      { label: 'Chemicals (L)', data: [120,140,135,160,190,210], color: 'rgba(0,229,255,0.8)' },
      { label: 'Plasticware (Units)', data: [400,450,420,510,580,620], color: 'rgba(33,150,243,0.8)' }
    ]);
  }
  // Lab utilization bar chart
  const util = await loadChart('lab_utilization');
  if (util && util.success && util.labels.length > 0) {
    window.Charts.bar('ana-utilization-chart', util.labels, [
      { label: 'Utilization %', data: util.values, color: 'rgba(33,150,243,0.8)' }
    ]);
  } else {
    window.Charts.bar('ana-utilization-chart', window.AppData.labs.map(l=>l.name), [
      { label: 'Utilization %', data: window.AppData.labs.map(l=>l.utilization), color: 'rgba(33,150,243,0.8)' }
    ]);
  }
  // Weekly attendance trend
  const att = await loadChart('attendance_trend');
  if (att && att.success) {
    window.Charts.line('ana-attendance-chart', att.labels, [
      { label: 'Avg Attendance %', data: att.values, color: 'rgba(0,230,118,0.8)' }
    ]);
  } else {
    window.Charts.line('ana-attendance-chart', ['Mon','Tue','Wed','Thu','Fri','Sat'], [
      { label: 'Avg Attendance %', data: [95,92,88,90,85,78], color: 'rgba(0,230,118,0.8)' }
    ]);
  }
  // Category breakdown doughnut
  const cat = await loadChart('category_breakdown');
  if (cat && cat.success) {
    window.Charts.doughnut('ana-category-chart', cat.labels, cat.values, {
      colors: ['rgba(33,150,243,0.8)','rgba(0,229,255,0.8)','rgba(0,230,118,0.8)','rgba(156,39,176,0.8)']
    });
  } else {
    window.Charts.doughnut('ana-category-chart', ['Chemicals','Equipment','Glassware','Plasticware'], [45,15,20,20], {
      colors: ['rgba(33,150,243,0.8)','rgba(0,229,255,0.8)','rgba(0,230,118,0.8)','rgba(156,39,176,0.8)']
    });
  }
};


// ---- MONTHLY REPORTS ----
window.Screens['monthly-reports'] = function() {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const d = new Date();
  let dynamicMonths = '';
  for (let i = 0; i < 4; i++) {
    const tempDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
    dynamicMonths += `<option>${monthNames[tempDate.getMonth()]} ${tempDate.getFullYear()}</option>`;
  }

  return `
  <div>
    ${window.Components.pageHeader('Monthly Reports','Generate and export system reports')}
    <div style="display:flex;gap:12px;margin-bottom:24px">
      <select class="form-input form-select" style="max-width:200px">
        ${dynamicMonths}
      </select>
      <select class="form-input form-select" style="max-width:200px" ${window.AppState?.role === 'labhead' ? 'disabled style="background:var(--bg-base);cursor:not-allowed;opacity:0.8"' : ''}>
        ${window.AppState?.role === 'labhead' 
          ? `<option>${window.AppState?.selectedLab || window.AppState?.user?.lab || 'Microbiology Lab'}</option>`
          : `<option>All Labs</option>${(window.AppData.labs || []).map(l=>`<option>${l.name}</option>`).join('')}`}
      </select>
      <button class="btn btn-primary"><span class="material-icons-round">refresh</span> Update</button>
    </div>

    <div class="cards-grid-2 mb-20">
      <div class="card" style="padding:24px">
        <div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:16px">
          <div style="width:48px;height:48px;border-radius:12px;background:rgba(33,150,243,0.1);display:flex;align-items:center;justify-content:center">
            <span class="material-icons-round" style="color:var(--primary-bright)">inventory</span>
          </div>
          <div style="flex:1">
            <h3 style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:4px">Inventory Summary Report</h3>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">Comprehensive view of stock levels, usage, and low stock alerts.</p>
            <div style="display:flex;gap:8px">
              <button class="btn btn-primary btn-sm" onclick="window.Reports.exportInventorySummary('pdf')"><span class="material-icons-round" style="font-size:16px">picture_as_pdf</span> PDF</button>
              <button class="btn btn-outline btn-sm" onclick="window.Reports.exportInventorySummary('csv')"><span class="material-icons-round" style="font-size:16px">table_view</span> Excel</button>
            </div>
          </div>
        </div>
      </div>
      <div class="card" style="padding:24px">
        <div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:16px">
          <div style="width:48px;height:48px;border-radius:12px;background:rgba(0,230,118,0.1);display:flex;align-items:center;justify-content:center">
            <span class="material-icons-round" style="color:var(--success)">how_to_reg</span>
          </div>
          <div style="flex:1">
            <h3 style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:4px">Attendance & Activity Report</h3>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">Student attendance logs, task completion rates, and daily activities.</p>
            <div style="display:flex;gap:8px">
              <button class="btn btn-primary btn-sm" onclick="window.Reports.exportAttendanceActivity('pdf')"><span class="material-icons-round" style="font-size:16px">picture_as_pdf</span> PDF</button>
              <button class="btn btn-outline btn-sm" onclick="window.Reports.exportAttendanceActivity('csv')"><span class="material-icons-round" style="font-size:16px">table_view</span> Excel</button>
            </div>
          </div>
        </div>
      </div>
      <div class="card" style="padding:24px">
        <div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:16px">
          <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,179,0,0.1);display:flex;align-items:center;justify-content:center">
            <span class="material-icons-round" style="color:var(--warning)">warning</span>
          </div>
          <div style="flex:1">
            <h3 style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:4px">Maintenance & Repair Log</h3>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">List of equipment undergoing maintenance or requiring repairs.</p>
            <div style="display:flex;gap:8px">
              <button class="btn btn-primary btn-sm" onclick="window.Reports.exportMaintenanceLog()"><span class="material-icons-round" style="font-size:16px">picture_as_pdf</span> PDF</button>
            </div>
          </div>
        </div>
      </div>
      <div class="card" style="padding:24px">
        <div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:16px">
          <div style="width:48px;height:48px;border-radius:12px;background:rgba(156,39,176,0.1);display:flex;align-items:center;justify-content:center">
            <span class="material-icons-round" style="color:#E040FB">analytics</span>
          </div>
          <div style="flex:1">
            <h3 style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:4px">Full System Audit Report</h3>
            <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">Comprehensive auditor report containing all metrics and logs.</p>
            <div style="display:flex;gap:8px">
              <button class="btn btn-primary btn-sm" style="background:#E040FB" onclick="window.Reports.exportMasterAudit()"><span class="material-icons-round" style="font-size:16px">picture_as_pdf</span> Generate Master PDF</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
};

// Aliases
window.Screens['lab-reports'] = window.Screens['monthly-reports'];

