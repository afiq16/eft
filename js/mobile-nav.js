// Mobile Navigation — Fixed hamburger toggle, close button, and overlay behavior

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger-btn') || document.querySelector('.hamburger');
    const navLinks = document.getElementById('main-nav') || document.querySelector('.nav-links');
    const overlay = document.getElementById('nav-overlay') || document.querySelector('.mobile-nav-overlay');

    if (!hamburger || !navLinks) return;

    // Inject drawer top header if not present
    if (!navLinks.querySelector('.drawer-header')) {
      const headerDiv = document.createElement('li');
      headerDiv.className = 'drawer-header';
      headerDiv.style.cssText = 'width:100%; display:flex; align-items:center; justify-content:space-between; padding-bottom:16px; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1);';
      headerDiv.innerHTML = `
        <span style="font-family:var(--font-display); font-weight:800; font-size:1.1rem; color:var(--primary);">⚡ EF X MENU</span>
        <button type="button" class="drawer-close-btn" style="background:rgba(255,255,255,0.1); border:none; color:#fff; width:32px; height:32px; border-radius:50%; font-size:1.1rem; cursor:pointer; display:flex; align-items:center; justify-content:center;">✕</button>
      `;
      navLinks.insertBefore(headerDiv, navLinks.firstChild);
      
      const closeBtn = headerDiv.querySelector('.drawer-close-btn');
      if (closeBtn) closeBtn.addEventListener('click', closeNav);
    }

    function openNav() {
      navLinks.classList.add('open');
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      if (overlay) overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeNav() {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navLinks.classList.contains('open')) {
        closeNav();
      } else {
        openNav();
      }
    });

    if (overlay) {
      overlay.addEventListener('click', closeNav);
    }

    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' || e.target.closest('a')) {
        closeNav();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeNav();
    });
  });
})();
