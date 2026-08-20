// Shared Utilities & Helpers for EF X TOUR 2026

const Utils = {
  // Show premium notifications using CSS Injection
  showToast(message, type = 'info') {
    const typeMap = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    const cssType = typeMap[type] || 'warning';

    const toast = document.createElement('div');
    toast.className = `alert alert-${cssType === 'info' ? 'warning' : cssType}`;
    // Info style override — use blue
    if (cssType === 'info') {
      toast.style.background = 'rgba(0, 229, 255, 0.1)';
      toast.style.border = '1px solid #00e5ff';
      toast.style.color = '#00e5ff';
    }
    toast.style.cssText += `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99998;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      min-width: 280px;
      max-width: min(90vw, 400px);
      animation: revealZoom 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    `;
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => toast.remove(), 420);
    }, 4000);
  },

  // Premium loading screen
  showLoader() {
    if (document.getElementById('global-loader')) return;
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.className = 'loader-overlay';
    loader.innerHTML = '<div class="loader"></div>';
    document.body.appendChild(loader);
  },

  hideLoader() {
    const loader = document.getElementById('global-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }
  },

  // Export any array of objects to CSV
  exportToCSV(filename, data) {
    if (!data || !data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Auditing Helper
  async logAdminAction(db, actorEmail, action, target, metadata = {}) {
    const { doc, setDoc, collection } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    const logId = 'log_' + Date.now();
    await setDoc(doc(db, "auditLogs", logId), {
      logId,
      actor: actorEmail,
      action,
      target,
      metadata,
      timestamp: new Date().toISOString()
    });
  },

  // HTML Escape Helper
  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }
};

window.Utils = Utils;
export default Utils;
