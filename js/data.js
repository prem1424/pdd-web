// ============================================================
// Smart Stock - Dummy Data & App State
// ============================================================

// Dynamic date helpers
const _today = new Date();
const _formatDate = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const dateToday = _formatDate(_today);
const dateYesterday = _formatDate(new Date(_today.getTime() - 86400000));
const date2DaysAgo = _formatDate(new Date(_today.getTime() - 2 * 86400000));
const dateTomorrow = _formatDate(new Date(_today.getTime() + 86400000));
const dateIn2Days = _formatDate(new Date(_today.getTime() + 2 * 86400000));
const dateIn3Days = _formatDate(new Date(_today.getTime() + 3 * 86400000));
const dateIn4Days = _formatDate(new Date(_today.getTime() + 4 * 86400000));
const dateIn5Days = _formatDate(new Date(_today.getTime() + 5 * 86400000));

// Local development defaults
// The frontend is served from a static server on port 8080 and the backend PHP API runs from port 8000.
window.API_BASE = window.location.origin + '/api/';

window.fetchAPI = async function(endpoint, options = {}) {
  const url = /^https?:\/\//i.test(endpoint) ? endpoint : `${window.API_BASE}${endpoint}`;
  try {
    if (options.body && typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
    }
    const headers = options.headers || {};
    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(url, { ...options, headers });
    return await response.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
    return { success: false, message: "Network connection failed. Please ensure XAMPP is active." };
  }
};

window.AppState = {
  user: null,
  token: null,
  role: null, // 'auditor' | 'labhead' | 'student'
  selectedLab: null
};

window.AppData = {

  labs: [],

  users: {
    auditor: { id: 1, name: 'Audit Admin', email: 'auditor@smartstock.in', role: 'auditor', avatar: 'AA', department: 'Quality Control' },
    labhead: { id: 2, name: 'Dr. Priya Sharma', email: 'priya@smartstock.in', role: 'labhead', avatar: 'PS', lab: 'Microbiology Lab', department: 'Microbiology' },
    student: { id: 3, name: 'Rahul Verma', email: 'rahul@smartstock.in', role: 'student', avatar: 'RV', lab: 'Microbiology Lab', rollNo: 'MB2024001', year: '3rd Year' }
  },

  equipment: [],
  chemicals: [],
  plasticware: [],
  glassware: [],
  students: [],
  tasks: [],
  attendance: [],
  notifications: [],
  activities: [],
  stockHistory: [],
  approvalRequests: [],
  chartData: {},
  messages: []

};


// Helper functions
window.AppUtils = {
  formatDate: (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  },
  daysUntil: (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },
  getStatusColor: (status) => {
    const map = { 'operational': 'success', 'active': 'success', 'present': 'success', 'completed': 'success',
      'maintenance': 'warning', 'low-stock': 'warning', 'late': 'warning', 'in-progress': 'info', 'pending': 'warning',
      'inactive': 'danger', 'absent': 'danger', 'critical': 'danger', 'expired': 'danger' };
    return map[status] || 'info';
  },
  getPriorityColor: (priority) => {
    return { 'urgent': 'danger', 'high': 'warning', 'medium': 'info', 'low': 'success' }[priority] || 'info';
  },
  downloadFile: (content, fileName, mimeType = 'text/csv') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
