// Mobile Navigation — Fixed hamburger toggle and overlay behavior

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger-btn') || document.querySelector('.hamburger');
    const navLinks = document.getElementById('main-nav') || document.querySelector('.nav-links');
    const overlay = document.getElementById('nav-overlay') || document.querySelector('.mobile-nav-overlay');

    if (!hamburger || !navLinks) return;

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

    // Close when overlay clicked
    if (overlay) {
      overlay.addEventListener('click', closeNav);
    }

    // Close when nav link clicked
    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        closeNav();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });

    // Close on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) closeNav();
    });
  });
})();
