import { auth, db } from "./firebase-init.js";
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const Notifications = {
  unreadCount: 0,
  dropdownOpen: false,

  init() {
    this.injectUI();
    
    onAuthStateChanged(auth, (user) => {
      if (user) {
        document.getElementById('nav-notifications-btn').style.display = 'flex';
        this.listen(user.uid);
      } else {
        document.getElementById('nav-notifications-btn').style.display = 'none';
      }
    });

    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('nav-notif-dropdown');
      const btn = document.getElementById('nav-notifications-btn');
      if (this.dropdownOpen && !dropdown.contains(e.target) && !btn.contains(e.target)) {
        this.toggleDropdown();
      }
    });
  },

  injectUI() {
    const authDiv = document.querySelector('.nav-auth');
    if (!authDiv) return;

    // Inject before the avatar/logout if they exist, or append
    const notifHTML = `
      <div style="position:relative;">
        <button id="nav-notifications-btn" class="nav-notif-btn" style="display:none;" aria-label="Notifications">
          🔔 <span id="nav-notif-badge" class="nav-notif-badge" style="display:none;">0</span>
        </button>
        <div id="nav-notif-dropdown" class="nav-notif-dropdown" style="display:none;">
          <div class="notif-header">
            <span>Notifications</span>
            <button id="notif-mark-read" style="background:none; border:none; color:var(--primary); font-size:0.75rem; cursor:pointer;">Mark all read</button>
          </div>
          <div id="notif-list" class="notif-list">
            <div class="notif-empty">No notifications yet.</div>
          </div>
        </div>
      </div>
    `;
    
    // Insert at the beginning of nav-auth
    authDiv.insertAdjacentHTML('afterbegin', notifHTML);

    document.getElementById('nav-notifications-btn').addEventListener('click', () => this.toggleDropdown());
    document.getElementById('notif-mark-read').addEventListener('click', () => this.markAllRead());
  },

  toggleDropdown() {
    const dropdown = document.getElementById('nav-notif-dropdown');
    this.dropdownOpen = !this.dropdownOpen;
    dropdown.style.display = this.dropdownOpen ? 'block' : 'none';
    if (this.dropdownOpen && this.unreadCount > 0) {
      this.markAllRead(); // auto mark read when opened
    }
  },

  listen(uid) {
    this.uid = uid;
    const q = query(collection(db, "users", uid, "notifications"), orderBy("createdAt", "desc"), limit(20));
    
    onSnapshot(q, (snap) => {
      const list = document.getElementById('notif-list');
      const badge = document.getElementById('nav-notif-badge');
      
      if (snap.empty) {
        list.innerHTML = '<div class="notif-empty">No notifications yet.</div>';
        badge.style.display = 'none';
        this.unreadCount = 0;
        return;
      }

      list.innerHTML = '';
      let unread = 0;
      this.notifs = [];

      snap.forEach(d => {
        const n = d.data();
        n.id = d.id;
        this.notifs.push(n);
        if (!n.read) unread++;

        const el = document.createElement('div');
        el.className = `notif-item ${!n.read ? 'unread' : ''}`;
        
        let icon = '🔔';
        if (n.type === 'MATCH') icon = '⚽';
        if (n.type === 'ADMIN') icon = '🛡️';
        if (n.type === 'SOCIAL') icon = '💬';

        el.innerHTML = `
          <div class="notif-icon">${icon}</div>
          <div class="notif-content">
            <div class="notif-title">${n.title}</div>
            <div class="notif-body">${n.body}</div>
            <div class="notif-time">${new Date(n.createdAt).toLocaleString([], {hour:'2-digit', minute:'2-digit', month:'short', day:'numeric'})}</div>
          </div>
        `;
        
        if (n.link) {
          el.style.cursor = 'pointer';
          el.addEventListener('click', () => { window.location.href = n.link; });
        }
        
        list.appendChild(el);
      });

      this.unreadCount = unread;
      if (unread > 0) {
        badge.textContent = unread > 9 ? '9+' : unread;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    });
  },

  async markAllRead() {
    if (!this.uid || !this.notifs) return;
    try {
      const batch = writeBatch(db);
      let count = 0;
      this.notifs.forEach(n => {
        if (!n.read) {
          batch.update(doc(db, "users", this.uid, "notifications", n.id), { read: true });
          count++;
        }
      });
      if (count > 0) {
        await batch.commit();
        document.getElementById('nav-notif-badge').style.display = 'none';
        this.unreadCount = 0;
      }
    } catch (err) {
      console.error("Mark read error:", err);
    }
  }
};

// Auto-init on load
window.addEventListener('DOMContentLoaded', () => Notifications.init());

export default Notifications;
