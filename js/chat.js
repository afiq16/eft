// User-to-User Real-Time Chat — EF X TOUR 2026
// Uses Firestore for message persistence

import { db, auth } from "./firebase-init.js";
import {
  collection, addDoc, query, orderBy, limit,
  onSnapshot, serverTimestamp, doc, getDoc, getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const Chat = {
  currentUser: null,
  currentUserData: null,
  activeChatId: null,
  unsubscribe: null,

  async init() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.currentUser = user;
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) this.currentUserData = userDoc.data();
          resolve(user);
        }
      });
    });
  },

  getChatId(uid1, uid2) {
    // Deterministic chat ID based on both UIDs
    return [uid1, uid2].sort().join('_');
  },

  async loadUsers() {
    // Get all users except current
    const snap = await getDocs(collection(db, "users"));
    const users = [];
    snap.forEach(d => {
      if (d.id !== this.currentUser?.uid) {
        users.push({ uid: d.id, ...d.data() });
      }
    });
    return users;
  },

  async openChat(targetUid, targetName, targetAvatar) {
    if (this.unsubscribe) this.unsubscribe();
    this.activeChatId = this.getChatId(this.currentUser.uid, targetUid);

    const messagesRef = collection(db, "chats", this.activeChatId, "messages");
    const q = query(messagesRef, orderBy("sentAt", "asc"), limit(50));

    this.unsubscribe = onSnapshot(q, (snap) => {
      const container = document.getElementById('chat-messages');
      if (!container) return;
      container.innerHTML = "";
      snap.forEach(d => {
        const msg = d.data();
        const isMine = msg.senderUid === this.currentUser.uid;
        const el = document.createElement('div');
        el.className = `chat-msg ${isMine ? 'chat-msg-mine' : 'chat-msg-theirs'}`;
        el.innerHTML = `
          <div class="chat-bubble">
            ${!isMine ? `<span class="chat-sender">${msg.senderName}</span>` : ''}
            <p>${this._escapeHtml(msg.text)}</p>
            <span class="chat-time">${msg.sentAt ? new Date(msg.sentAt.toDate()).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : 'now'}</span>
          </div>
        `;
        container.appendChild(el);
      });
      container.scrollTop = container.scrollHeight;
    });
  },

  async sendMessage(text) {
    if (!text.trim() || !this.activeChatId || !this.currentUser) return;
    const messagesRef = collection(db, "chats", this.activeChatId, "messages");
    await addDoc(messagesRef, {
      senderUid: this.currentUser.uid,
      senderName: this.currentUserData?.username || this.currentUserData?.fullName || 'Player',
      senderAvatar: this.currentUserData?.profilePhoto || '',
      text: text.trim(),
      sentAt: serverTimestamp()
    });
  },

  _escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },

  close() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.activeChatId = null;
  }
};

window.Chat = Chat;
export default Chat;
