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

  // Navigation Go Back helper
  goBack() {
    if (window.history.length > 1 && document.referrer && document.referrer.indexOf(window.location.host) !== -1) {
      window.history.back();
    } else {
      window.location.href = 'index.html';
    }
  },

  // Club Logo helper
  getClubLogoUrl(clubName) {
    if (!clubName) return null;
    const name = clubName.toLowerCase().trim();
    if (name.includes('real madrid') || name.includes('real')) return 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg';
    if (name.includes('barcelona') || name.includes('barca')) return 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona.svg';
    if (name.includes('manchester city') || name.includes('man city')) return 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg';
    if (name.includes('bayern')) return 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg';
    if (name.includes('psg') || name.includes('paris')) return 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg';
    if (name.includes('liverpool')) return 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg';
    if (name.includes('arsenal')) return 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg';
    if (name.includes('chelsea')) return 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg';
    if (name.includes('manchester united') || name.includes('man united') || name.includes('man utd')) return 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg';
    if (name.includes('juventus') || name.includes('juve')) return 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg';
    if (name.includes('inter milan') || name === 'inter') return 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg';
    if (name.includes('ac milan') || name === 'milan') return 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg';
    if (name.includes('atletico')) return 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg';
    if (name.includes('dortmund') || name.includes('bvb')) return 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg';
    if (name.includes('tottenham') || name.includes('spurs')) return 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg';
    if (name.includes('roma')) return 'https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg';
    if (name.includes('napoli')) return 'https://upload.wikimedia.org/wikipedia/commons/2/28/SSC_Napoli_2024.svg';
    return null;
  },

  getClubLogoHtml(clubName, extraClass = '', size = '22px') {
    if (!clubName) return '';
    const url = this.getClubLogoUrl(clubName);
    const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2300e5ff"><path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3zm0 4.5l3.5 2.5-1.3 4.1h3.7l-3 2.2 1.1 3.7L12 16.5l-4 2.5 1.1-3.7-3-2.2h3.7L8.5 9 12 6.5z"/></svg>`;
    const src = url || fallbackSvg;
    return `<img src="${src}" alt="${this.escapeHtml(clubName)}" class="club-logo-img ${extraClass}" style="width:${size}; height:${size}; object-fit:contain; vertical-align:middle; display:inline-block; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));" onerror="this.onerror=null;this.src='${fallbackSvg}';">`;
  },

  getClubWithLogoHtml(clubName, extraClass = '', size = '22px') {
    if (!clubName) return '';
    return `<span class="club-with-logo ${extraClass}" style="display:inline-flex; align-items:center; gap:6px;">${this.getClubLogoHtml(clubName, '', size)} <span class="club-name-text">${this.escapeHtml(clubName)}</span></span>`;
  },

  // Cute Boy Gamer Avatar Presets
  getCuteBoyAvatars() {
    return [
      { id: 'cute_boy_1', name: 'Gamer Kai', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GamerKai&hairColor=2c1b18,4a312c&skinColor=ecad80&glassesProbability=0' },
      { id: 'cute_boy_2', name: 'Pro Leo', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ProLeo&hairColor=0e0e0e&skinColor=f2d3b1&glassesProbability=0' },
      { id: 'cute_boy_3', name: 'Esports Ren', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=EsportsRen&hairColor=4a312c&skinColor=ecad80&glassesProbability=100' },
      { id: 'cute_boy_4', name: 'Champ Alex', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ChampAlex&hairColor=2c1b18&skinColor=f2d3b1&glassesProbability=0' },
      { id: 'cute_boy_5', name: 'Striker Noah', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=StrikerNoah&hairColor=0e0e0e&skinColor=ecad80&glassesProbability=0' },
      { id: 'cute_boy_6', name: 'Legend Jin', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=LegendJin&hairColor=4a312c&skinColor=f2d3b1&glassesProbability=0' },
      { id: 'cute_boy_7', name: 'Cyber Haru', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CyberHaru&hairColor=2c1b18&skinColor=ecad80&glassesProbability=100' },
      { id: 'cute_boy_8', name: 'Ace Toby', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AceToby&hairColor=0e0e0e&skinColor=f2d3b1&glassesProbability=0' },
      { id: 'cute_boy_9', name: 'Star Sora', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=StarSora&hairColor=4a312c&skinColor=ecad80&glassesProbability=0' },
      { id: 'cute_boy_10', name: 'Hero Ryan', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=HeroRyan&hairColor=2c1b18&skinColor=f2d3b1&glassesProbability=0' }
    ];
  },

  getDefaultCuteBoyAvatar(seed = 'player') {
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&hairColor=2c1b18,4a312c,0e0e0e&skinColor=f2d3b1,ecad80`;
  },

  // HTML Escape Helper
  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }
};

window.Utils = Utils;
export default Utils;
