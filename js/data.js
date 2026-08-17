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
if (window.location.protocol === 'file:' || (typeof navigator !== 'undefined' && navigator.userAgent.includes('SmartStockApp'))) {
  // Use local network IP since Render is offline/hanging
  window.API_BASE = 'http://172.27.77.195:3000/api/';
} else {
  window.API_BASE = window.location.origin + '/api/';
}

window.fetchAPI = async function(endpoint, options = {}) {
  const url = /^https?:\/\//i.test(endpoint) ? endpoint : `${window.API_BASE}${endpoint}`;
  
  // AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    if (options.body && typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
    }
    const headers = options.headers || {};
    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("API Fetch Error:", error);
    if (error.name === 'AbortError') {
      return { success: false, message: "Connection timed out. Server is unreachable." };
    }
    return { success: false, message: "Network connection failed. Please ensure backend is running." };
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
    if (!dateStr) return 'Just now';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  },
  timeAgo: (dateStr) => {
    if (!dateStr) return 'Just now';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    const diffMs = new Date() - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  },
  daysUntil: (dateStr) => {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 0;
    const diff = d - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },
  getStatusColor: (status) => {
    if (!status) return 'info';
    const map = { 'operational': 'success', 'active': 'success', 'present': 'success', 'completed': 'success',
      'maintenance': 'warning', 'low-stock': 'warning', 'late': 'warning', 'in-progress': 'info', 'pending': 'warning',
      'inactive': 'danger', 'absent': 'danger', 'critical': 'danger', 'expired': 'danger' };
    return map[status.toString().toLowerCase()] || 'info';
  },
  getPriorityColor: (priority) => {
    if (!priority) return 'info';
    return { 'urgent': 'danger', 'high': 'warning', 'medium': 'info', 'low': 'success' }[priority.toString().toLowerCase()] || 'info';
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
