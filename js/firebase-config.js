// Firebase Configuration Template
// Replace these details with your Firebase project credentials.
const firebaseConfig = {
  apiKey: "AIzaSyDTZEY4NQpcRKbU7vZd-2Wy8H0mUbBHiJ0",
  authDomain: "ef-x-tour-2026.firebaseapp.com",
  projectId: "ef-x-tour-2026",
  storageBucket: "ef-x-tour-2026.firebasestorage.app",
  messagingSenderId: "845613993696",
  appId: "1:845613993696:web:6592559a1d8f3983ed8a85",
  databaseURL: "https://ef-x-tour-2026-default-rtdb.firebaseio.com"
};

// Export config so it can be loaded by other scripts
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = firebaseConfig;
} else {
  window.firebaseConfig = firebaseConfig;
}
