import { db, auth } from "./firebase-init.js";
import {
  collection, addDoc, query, orderBy, limit,
  onSnapshot, serverTimestamp, doc, getDoc, getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const FloatingChat = {
  currentUser: null,
  currentUserData: null,
  activeChatId: null,
  activeChatUser: null,
  unsubscribe: null,
  isOpen: false,
  users: [],

  async init() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUser = user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) this.currentUserData = userDoc.data();
        
        this.injectCSS();
        this.injectUI();
        await this.loadUsers();
      } else {
        const widget = document.getElementById('fc-widget');
        if(widget) widget.remove();
      }
    });
  },

  injectCSS() {
    if(document.getElementById('fc-style')) return;
    const style = document.createElement('style');
    style.id = 'fc-style';
    style.textContent = `
      .fc-widget {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        font-family: var(--font-display);
      }
      .fc-btn {
        width: 60px; height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary), #005f73);
        color: #fff;
        border: none;
        box-shadow: 0 4px 20px rgba(0,229,255,0.4);
        cursor: pointer;
        font-size: 1.8rem;
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.3s;
      }
      .fc-btn:hover { transform: scale(1.1); }
      .fc-panel {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 340px;
        height: 500px;
        background: var(--bg-primary);
        border: 1px solid var(--border-glass);
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.6);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: opacity 0.3s, transform 0.3s;
        opacity: 0;
        transform: translateY(20px);
        pointer-events: none;
      }
      .fc-panel.open {
        opacity: 1;
        transform: translateY(0);
        pointer-events: all;
      }
      .fc-header {
        background: var(--bg-secondary);
        padding: 14px 16px;
        border-bottom: 1px solid var(--border-glass);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .fc-title { font-weight: 700; font-size: 1rem; color: #fff; display:flex; align-items:center; gap:8px;}
      .fc-back { background:none; border:none; color:var(--text-secondary); cursor:pointer; font-size:1.2rem; display:none; }
      
      /* Contacts List */
      .fc-contacts {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
        display: block;
      }
      .fc-contact-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .fc-contact-item:hover { background: rgba(0,229,255,0.05); }
      .fc-contact-avatar { width:40px; height:40px; border-radius:50%; border:1px solid var(--border-glass); }
      .fc-contact-name { font-weight: 600; font-size: 0.9rem; }
      
      /* Chat Area */
      .fc-chat-area { display: none; flex-direction: column; height: 100%; }
      .fc-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .fc-msg { display: flex; max-width: 85%; }
      .fc-msg.mine { align-self: flex-end; }
      .fc-msg.theirs { align-self: flex-start; }
      .fc-bubble {
        padding: 10px 14px;
        border-radius: 16px;
        font-size: 0.85rem;
        line-height: 1.4;
      }
      .fc-msg.mine .fc-bubble { background: var(--primary); color: #000; border-bottom-right-radius: 4px; }
      .fc-msg.theirs .fc-bubble { background: var(--bg-tertiary); color: #fff; border: 1px solid var(--border-glass); border-bottom-left-radius: 4px; }
      .fc-time { font-size: 0.65rem; margin-top: 4px; opacity:0.7; }
      .fc-msg.mine .fc-time { text-align:right; color:rgba(0,0,0,0.6); }
      
      .fc-input-area {
        padding: 12px;
        background: var(--bg-secondary);
        border-top: 1px solid var(--border-glass);
        display: flex;
        gap: 8px;
      }
      .fc-input {
        flex: 1;
        padding: 10px 14px;
        border-radius: 20px;
        border: 1px solid var(--border-glass);
        background: var(--bg-tertiary);
        color: #fff;
        font-size: 0.85rem;
      }
      .fc-input:focus { outline:none; border-color:var(--primary); }
      .fc-send {
        width: 38px; height: 38px;
        border-radius: 50%;
        background: var(--primary);
        color: #000;
        border: none;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
      }
      @media (max-width: 600px) {
        .fc-panel {
          position: fixed; inset: 0; width: 100%; height: 100%;
          bottom: 0; border-radius: 0; z-index:10000;
        }
      }
    `;
    document.head.appendChild(style);
  },

  injectUI() {
    if(document.getElementById('fc-widget')) return;
    const html = `
      <div id="fc-widget" class="fc-widget">
        <button id="fc-btn" class="fc-btn">💬</button>
        <div id="fc-panel" class="fc-panel">
          <div class="fc-header">
            <button id="fc-back" class="fc-back">←</button>
            <div id="fc-title" class="fc-title">Messages</div>
            <button id="fc-close" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1.2rem;">×</button>
          </div>
          
          <div id="fc-contacts" class="fc-contacts">
            <div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.8rem;">Loading players...</div>
          </div>
          
          <div id="fc-chat-area" class="fc-chat-area">
            <div id="fc-messages" class="fc-messages"></div>
            <div class="fc-input-area">
              <input type="text" id="fc-input" class="fc-input" placeholder="Type a message..." autocomplete="off">
              <button id="fc-send" class="fc-send">➤</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    document.getElementById('fc-btn').addEventListener('click', () => this.togglePanel());
    document.getElementById('fc-close').addEventListener('click', () => this.togglePanel());
    document.getElementById('fc-back').addEventListener('click', () => this.showContacts());
    
    document.getElementById('fc-send').addEventListener('click', () => this.sendMessage());
    document.getElementById('fc-input').addEventListener('keydown', (e) => {
      if(e.key === 'Enter') this.sendMessage();
    });
  },

  togglePanel() {
    this.isOpen = !this.isOpen;
    const panel = document.getElementById('fc-panel');
    if(this.isOpen) {
      panel.classList.add('open');
      this.showContacts();
    } else {
      panel.classList.remove('open');
      this.closeChat();
    }
  },

  async loadUsers() {
    const snap = await getDocs(collection(db, "users"));
    this.users = [];
    snap.forEach(d => {
      if (d.id !== this.currentUser.uid) {
        this.users.push({ uid: d.id, ...d.data() });
      }
    });
    this.renderContacts();
  },

  renderContacts() {
    const container = document.getElementById('fc-contacts');
    container.innerHTML = '';
    
    if(this.users.length === 0) {
      container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.8rem;">No players found.</div>';
      return;
    }

    this.users.forEach(u => {
      const name = u.fullName || `@${u.username}`;
      const avatar = u.profilePhoto || `https://api.dicebear.com/7.x/micah/svg?seed=${u.uid}&backgroundColor=b6e3f4`;
      
      const el = document.createElement('div');
      el.className = 'fc-contact-item';
      el.innerHTML = `
        <img src="${avatar}" class="fc-contact-avatar">
        <div class="fc-contact-name">${name}</div>
      `;
      el.addEventListener('click', () => this.openChat(u.uid, name, avatar));
      container.appendChild(el);
    });
  },

  showContacts() {
    document.getElementById('fc-contacts').style.display = 'block';
    document.getElementById('fc-chat-area').style.display = 'none';
    document.getElementById('fc-back').style.display = 'none';
    document.getElementById('fc-title').innerHTML = 'Messages';
    this.closeChat();
  },

  getChatId(uid1, uid2) {
    return [uid1, uid2].sort().join('_');
  },

  async openChat(targetUid, targetName, targetAvatar) {
    if (this.unsubscribe) this.unsubscribe();
    this.activeChatId = this.getChatId(this.currentUser.uid, targetUid);
    
    document.getElementById('fc-contacts').style.display = 'none';
    document.getElementById('fc-chat-area').style.display = 'flex';
    document.getElementById('fc-back').style.display = 'block';
    
    document.getElementById('fc-title').innerHTML = `
      <img src="${targetAvatar}" style="width:24px;height:24px;border-radius:50%;">
      ${targetName}
    `;

    const messagesRef = collection(db, "chats", this.activeChatId, "messages");
    const q = query(messagesRef, limit(50));

    this.unsubscribe = onSnapshot(q, (snap) => {
      const container = document.getElementById('fc-messages');
      container.innerHTML = "";
      if (snap.empty) {
        container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.8rem;">No messages yet. Say hello! 👋</div>';
        return;
      }
      const msgs = snap.docs.map(d => d.data());
      msgs.sort((a,b) => new Date(a.sentAt?.toDate ? a.sentAt.toDate() : a.sentAt || 0) - new Date(b.sentAt?.toDate ? b.sentAt.toDate() : b.sentAt || 0));

      msgs.forEach(msg => {
        const isMine = msg.senderUid === this.currentUser.uid;
        const sentDate = msg.sentAt?.toDate ? msg.sentAt.toDate() : new Date(msg.sentAt || Date.now());
        const el = document.createElement('div');
        el.className = `fc-msg ${isMine ? 'mine' : 'theirs'}`;
        el.innerHTML = `
          <div class="fc-bubble">
            ${this._escapeHtml(msg.text)}
            <div class="fc-time">${sentDate.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
          </div>
        `;
        container.appendChild(el);
      });
      container.scrollTop = container.scrollHeight;
    });
  },

  async sendMessage() {
    const input = document.getElementById('fc-input');
    const text = input.value.trim();
    if (!text || !this.activeChatId) return;
    input.value = '';
    
    const messagesRef = collection(db, "chats", this.activeChatId, "messages");
    await addDoc(messagesRef, {
      senderUid: this.currentUser.uid,
      text: text,
      sentAt: new Date().toISOString()
    });
  },

  closeChat() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.activeChatId = null;
  },

  _escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
};

window.addEventListener('DOMContentLoaded', () => FloatingChat.init());
export default FloatingChat;
