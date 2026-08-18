// Shared Utilities & Helpers for EF X TOUR 2026

const Utils = {
  // Show premium notifications using CSS Injection
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'error' ? 'error' : type === 'success' ? 'success' : 'warning'}`;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5)';
    toast.style.minWidth = '300px';
    toast.style.animation = 'revealZoom 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    toast.innerText = message;
    
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 500);
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
  }
};

window.Utils = Utils;
export default Utils;
