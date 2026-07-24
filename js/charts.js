// ============================================================
// Smart Stock - Chart Helpers (Chart.js wrappers)
// ============================================================

window.Charts = {

  defaults: {
    plugins: {
      legend: {
        labels: { color: '#90A4AE', font: { family: 'Inter', size: 12 }, boxWidth: 12, padding: 16 }
      },
      tooltip: {
        backgroundColor: 'rgba(10,22,40,0.95)',
        borderColor: 'rgba(33,150,243,0.3)',
        borderWidth: 1,
        titleColor: '#ECEFF1',
        bodyColor: '#90A4AE',
        padding: 12,
        cornerRadius: 10
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(33,150,243,0.06)', drawBorder: false },
        ticks: { color: '#546E7A', font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: 'rgba(33,150,243,0.06)', drawBorder: false },
        ticks: { color: '#546E7A', font: { family: 'Inter', size: 11 } },
        beginAtZero: true
      }
    }
  },

  palette: {
    blue: 'rgba(33,150,243,0.85)',
    blueLight: 'rgba(33,150,243,0.12)',
    cyan: 'rgba(0,229,255,0.85)',
    cyanLight: 'rgba(0,229,255,0.12)',
    success: 'rgba(0,230,118,0.85)',
    successLight: 'rgba(0,230,118,0.12)',
    warning: 'rgba(255,179,0,0.85)',
    warningLight: 'rgba(255,179,0,0.12)',
    danger: 'rgba(255,82,82,0.85)',
    dangerLight: 'rgba(255,82,82,0.12)',
    purple: 'rgba(179,136,255,0.85)',
    purpleLight: 'rgba(179,136,255,0.12)',
    teal: 'rgba(0,188,212,0.85)',
  },

  multiPalette: [
    'rgba(33,150,243,0.85)', 'rgba(0,229,255,0.85)', 'rgba(0,230,118,0.85)',
    'rgba(255,179,0,0.85)', 'rgba(255,82,82,0.85)', 'rgba(179,136,255,0.85)',
    'rgba(0,188,212,0.85)', 'rgba(255,167,38,0.85)', 'rgba(105,240,174,0.85)'
  ],

  setupZoom(canvasId, chart) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    ctx.style.cursor = 'pointer';
    if (chart && chart.options) {
      chart.options.onClick = () => this.zoom(canvasId);
      chart.update();
    }
  },

  zoom(canvasId) {
    const origChart = Chart.getChart(canvasId);
    if (!origChart) return;
    
    let modal = document.getElementById('chart-zoom-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'chart-zoom-modal';
      modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(10,22,40,0.85); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);';
      modal.innerHTML = `
        <div class="modal-content" style="width: 95vw; max-width: 1200px; height: 85vh; max-height: 800px; display: flex; flex-direction: column; background: var(--card-background, #1E293B); border-radius: 16px; box-shadow: 0 24px 48px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
          <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <h2 class="modal-title" id="chart-zoom-title" style="margin: 0; font-size: 20px; color: var(--text-primary, #fff);">Expanded Chart</h2>
            <button class="btn btn-ghost btn-icon" onclick="document.getElementById('chart-zoom-modal').style.display='none'" style="background: transparent; border: none; color: var(--text-secondary, #aaa); cursor: pointer; display: flex; align-items: center; justify-content: center;"><span class="material-icons-round">close</span></button>
          </div>
          <div class="modal-body" style="flex: 1; padding: 20px; display: flex; gap: 24px; overflow: hidden;">
            <div style="flex: 2; position: relative; min-width: 0;">
              <canvas id="zoomed-chart-canvas"></canvas>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; background: var(--card-background); border-radius: 12px; padding: 16px; border: 1px solid rgba(33,150,243,0.1); overflow: hidden;">
              <h3 style="margin-top: 0; margin-bottom: 16px; color: var(--text-primary); font-size: 16px;">Data Breakdown</h3>
              <div style="flex: 1; overflow-y: auto; padding-right: 8px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tbody id="chart-zoom-table-body">
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>`;
      document.body.appendChild(modal);
    }
    
    // Find title from original chart's parent if possible
    const card = document.getElementById(canvasId).closest('.card');
    if (card) {
      const titleEl = card.querySelector('.card-title');
      if (titleEl) document.getElementById('chart-zoom-title').textContent = titleEl.textContent;
    }
    
    modal.style.display = 'flex';
    
    this.destroyIfExists('zoomed-chart-canvas');
    const zoomedCtx = document.getElementById('zoomed-chart-canvas');
    
    // Shallow clone to avoid circular reference errors from Chart.js
    const dataClone = {
      labels: origChart.data.labels,
      datasets: origChart.data.datasets.map(ds => {
        const clonedDs = { ...ds };
        delete clonedDs._meta; // remove internal chartjs bindings
        return clonedDs;
      })
    };
    
    const optionsClone = { ...origChart.options };
    optionsClone.maintainAspectRatio = false;
    optionsClone.responsive = true;
    
    // Safe override of legend font
    if (optionsClone.plugins && optionsClone.plugins.legend) {
      optionsClone.plugins = {
        ...optionsClone.plugins,
        legend: {
          ...optionsClone.plugins.legend,
          labels: {
            ...optionsClone.plugins.legend.labels,
            font: { family: 'Inter', size: 14 },
            boxWidth: 16
          }
        }
      };
    }
    
    new Chart(zoomedCtx, {
      type: origChart.config.type,
      data: dataClone,
      options: optionsClone
    });
    
    // Populate the data table
    const tableBody = document.getElementById('chart-zoom-table-body');
    if (tableBody) {
      let html = '';
      const labels = dataClone.labels || [];
      const datasets = dataClone.datasets || [];
      
      labels.forEach((label, i) => {
        let vals = '';
        datasets.forEach(ds => {
          vals += `<td style="text-align: right; font-weight: 600; padding: 12px 8px; border-bottom: 1px solid rgba(33,150,243,0.06); color: var(--text-primary);">${ds.data[i] !== undefined ? ds.data[i] : '-'}</td>`;
        });
        html += `<tr>
          <td style="padding: 12px 8px; border-bottom: 1px solid rgba(33,150,243,0.06); color: var(--text-secondary);">${label}</td>
          ${vals}
        </tr>`;
      });
      tableBody.innerHTML = html;
    }
  },

  destroyIfExists(canvasId) {
    const existing = Chart.getChart(canvasId);
    if (existing) existing.destroy();
  },

  line(canvasId, labels, datasets, options = {}) {
    this.destroyIfExists(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const processedDatasets = datasets.map((ds, i) => {
      const color = ds.color || this.multiPalette[i % this.multiPalette.length];
      return {
        label: ds.label,
        data: ds.data,
        borderColor: color,
        backgroundColor: color.replace('0.85)', '0.1)'),
        borderWidth: 2.5,
        pointBackgroundColor: color,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: ds.fill !== undefined ? ds.fill : true,
        ...ds
      };
    });

    const chart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: processedDatasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { ...this.defaults.plugins, ...options.plugins },
        scales: options.noScales ? {} : { ...this.defaults.scales, ...options.scales },
        animation: { duration: 800, easing: 'easeInOutQuart' },
        ...options
      }
    });
    this.setupZoom(canvasId, chart);
    return chart;
  },

  bar(canvasId, labels, datasets, options = {}) {
    this.destroyIfExists(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const processedDatasets = datasets.map((ds, i) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ds.color || this.multiPalette[i % this.multiPalette.length],
      borderRadius: 6,
      borderSkipped: false,
      ...ds
    }));

    const chart = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: processedDatasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { ...this.defaults.plugins, ...options.plugins },
        scales: { ...this.defaults.scales, ...options.scales },
        animation: { duration: 800 },
        ...options
      }
    });
    this.setupZoom(canvasId, chart);
    return chart;
  },

  doughnut(canvasId, labels, data, options = {}) {
    this.destroyIfExists(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const colors = options.colors || this.multiPalette.slice(0, data.length);

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: 'rgba(10,22,40,0.5)',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { position: 'bottom', labels: { ...this.defaults.plugins.legend.labels } },
          tooltip: { ...this.defaults.plugins.tooltip }
        },
        animation: { duration: 800 },
        ...options
      }
    });
    this.setupZoom(canvasId, chart);
    return chart;
  },

  radar(canvasId, labels, datasets, options = {}) {
    this.destroyIfExists(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const processedDatasets = datasets.map((ds, i) => {
      const color = ds.color || this.multiPalette[i];
      return {
        label: ds.label,
        data: ds.data,
        borderColor: color,
        backgroundColor: color.replace('0.85)', '0.15)'),
        pointBackgroundColor: color,
        pointRadius: 4,
        borderWidth: 2,
        ...ds
      };
    });

    const chart = new Chart(ctx, {
      type: 'radar',
      data: { labels, datasets: processedDatasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { ...this.defaults.plugins, ...options.plugins },
        scales: {
          r: {
            grid: { color: 'rgba(33,150,243,0.1)' },
            ticks: { color: '#546E7A', backdropColor: 'transparent', font: { size: 10 } },
            pointLabels: { color: '#90A4AE', font: { size: 11 } },
            beginAtZero: true, max: 100,
            ...options.rScale
          }
        },
        animation: { duration: 800 }
      }
    });
    this.setupZoom(canvasId);
    return chart;
  },

  pie(canvasId, labels, data, options = {}) {
    this.destroyIfExists(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const colors = options.colors || this.multiPalette.slice(0, data.length);

    const chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: 'rgba(10,22,40,0.5)',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { ...this.defaults.plugins.legend.labels } },
          tooltip: { ...this.defaults.plugins.tooltip }
        },
        animation: { duration: 800 },
        ...options
      }
    });
    this.setupZoom(canvasId);
    return chart;
  }

};
