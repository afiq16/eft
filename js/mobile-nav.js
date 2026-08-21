/**
 * mobile-nav.js — Universal hamburger menu for all pages
 * Works with any page that has:
 *   - #hamburger-btn  OR  .hamburger
 *   - #main-nav       OR  .nav-links
 *   - #nav-overlay    OR  .mobile-nav-overlay
 */
(function () {
  'use strict';

  function initNav() {
    const hamburger = document.getElementById('hamburger-btn') || document.querySelector('.hamburger');
    const navLinks  = document.getElementById('main-nav')     || document.querySelector('.nav-links');
    const overlay   = document.getElementById('nav-overlay')  || document.querySelector('.mobile-nav-overlay');

    if (!hamburger || !navLinks) return;

    // ── Inject drawer header (logo + close btn) once
    if (!navLinks.querySelector('.drawer-header')) {
      const li = document.createElement('li');
      li.className = 'drawer-header';
      li.style.cssText = [
        'list-style:none',
        'width:100%',
        'display:flex',
        'align-items:center',
        'justify-content:space-between',
        'padding:0 0 14px',
        'margin-bottom:10px',
        'border-bottom:1px solid rgba(255,255,255,0.08)',
      ].join(';');
      li.innerHTML =
        '<span style="font-family:var(--font-display);font-weight:900;font-size:1.05rem;' +
        'background:linear-gradient(90deg,var(--primary),var(--secondary));-webkit-background-clip:text;' +
        '-webkit-text-fill-color:transparent;">⚡ EF X TOUR</span>' +
        '<button class="drawer-close-btn" aria-label="Close menu" style="' +
        'background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);' +
        'color:#fff;width:34px;height:34px;border-radius:50%;font-size:1rem;' +
        'cursor:pointer;display:flex;align-items:center;justify-content:center;' +
        'transition:background 0.2s;flex-shrink:0;">✕</button>';
      navLinks.insertBefore(li, navLinks.firstChild);
      li.querySelector('.drawer-close-btn').addEventListener('click', closeNav);
    }

    // ── Inject mobile auth links (Login, Register, Dashboard, Logout) once
    if (!navLinks.querySelector('.mob-auth-injected')) {
      const mobAuth = document.createElement('div');
      mobAuth.className = 'mob-auth-injected';
      mobAuth.style.cssText = 'width:100%; border-top:1px solid rgba(255,255,255,0.08); padding-top:10px; margin-top:auto; display:flex; flex-direction:column; gap:4px;';
      
      mobAuth.innerHTML = `
        <a href="login.html" class="nav-link mob-guest" style="color:var(--primary)!important; text-align:center; justify-content:center;">Login</a>
        <a href="register.html" class="nav-link mob-guest" style="background:var(--primary)!important; color:#000!important; text-align:center; justify-content:center;">Register</a>
        <a href="dashboard.html" class="nav-link mob-logged-in" style="color:var(--primary)!important;">🎮 Dashboard</a>
        <button class="nav-link mob-logged-in" id="mob-logout-btn" style="background:rgba(255,50,50,0.1)!important; color:#ff4444!important; border:none; text-align:left; width:100%; cursor:pointer;">🚪 Logout</button>
      `;
      navLinks.appendChild(mobAuth);
      
      mobAuth.querySelector('#mob-logout-btn').addEventListener('click', () => {
        const mainLogout = document.getElementById('btn-nav-logout') || document.getElementById('btn-logout');
        if (mainLogout) mainLogout.click();
      });
    }

    function openNav() {
      navLinks.classList.add('open');
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      if (overlay) {
        overlay.style.display = 'block';
        // force reflow then add class for transition
        overlay.offsetHeight;
        overlay.classList.add('active');
      }
      document.body.style.overflow = 'hidden';
    }

    function closeNav() {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => { if (!overlay.classList.contains('active')) overlay.style.display = ''; }, 320);
      }
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.contains('open') ? closeNav() : openNav();
    });

    if (overlay) overlay.addEventListener('click', closeNav);

    // Close on link click (navigate)
    navLinks.addEventListener('click', (e) => {
      if (e.target.matches('a') || e.target.closest('a')) closeNav();
    });

    // Keyboard
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });

    // Resize — auto-close if desktop
    window.addEventListener('resize', () => { if (window.innerWidth > 900) closeNav(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();
