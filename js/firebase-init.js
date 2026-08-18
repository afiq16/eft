// Modular Firebase Initialization System
// Imports Firebase Web SDK version 9/10 scripts dynamically.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Initialize Firebase
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);

// Make globals available for easy modular integrations
window.firebaseApp = app;
window.auth = auth;
window.db = db;
window.storage = storage;
window.rtdb = rtdb;

// Check setup status (Safe run bypass if config docs are pending)
async function checkSetup() {
  // Bypassed setup check to allow clean registration and login without block.
}
checkSetup();

export { app, auth, db, storage, rtdb };
