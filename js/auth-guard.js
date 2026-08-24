// Authentication guard — prevents page content flash before auth check
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";

// Inject initial body hide to prevent flash
(function () {
  const style = document.createElement('style');
  style.id = 'auth-guard-style';
  style.textContent = `
    html.auth-checking body { visibility: hidden; pointer-events: none; }
    #auth-guard-overlay {
      position: fixed; inset: 0;
      background: #08080c;
      display: flex; align-items: center; justify-content: center;
      z-index: 99999;
      flex-direction: column; gap: 16px;
    }
    #auth-guard-overlay .loader {
      width: 48px; height: 48px;
      border: 4px solid rgba(255,255,255,0.1);
      border-top-color: #00e5ff;
      border-radius: 50%;
      animation: authSpin 0.8s linear infinite;
    }
    #auth-guard-overlay .guard-text {
      color: rgba(255,255,255,0.4);
      font-family: 'Outfit', sans-serif;
      font-size: 0.85rem;
      letter-spacing: 1px;
    }
    @keyframes authSpin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
  document.documentElement.classList.add('auth-checking');

  const overlay = document.createElement('div');
  overlay.id = 'auth-guard-overlay';
  overlay.innerHTML = '<div class="loader"></div><span class="guard-text">AUTHENTICATING...</span>';
  const attach = () => document.body && document.body.appendChild(overlay);
  document.body ? attach() : document.addEventListener('DOMContentLoaded', attach);
})();

function removeGuard() {
  document.documentElement.classList.remove('auth-checking');
  const overlay = document.getElementById('auth-guard-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s';
    setTimeout(() => overlay.remove(), 320);
  }
}

const AuthGuard = {
  // Guard protected pages — redirect to login if not authenticated
  guardPage(allowedRoles = []) {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "login.html";
        return;
      }

      if (allowedRoles.length > 0) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (!allowedRoles.includes(userData.role)) {
              window.location.href = "dashboard.html";
              return;
            }
          } else {
            window.location.href = "login.html";
            return;
          }
        } catch (err) {
          console.error("Auth guard error:", err);
          window.location.href = "login.html";
          return;
        }
      }

      removeGuard();
    });
  },

  // Guard public-only pages — redirect to dashboard if already logged in
  guardPublicPage() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        window.location.href = "dashboard.html";
        return;
      }
      removeGuard();
    });
  },

  // Get current user role (utility)
  async getUserRole(uid) {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) return userDoc.data().role;
    } catch (_) {}
    return null;
  }
};

window.AuthGuard = AuthGuard;
export default AuthGuard;
