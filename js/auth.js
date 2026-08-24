// Authentication logic utilizing Firebase Modular Auth SDK

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";
import Utils from "./utils.js";

function getRandomCartoonAvatar(seed) {
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" rx="50" fill="%231877f2"/%3E%3Ccircle cx="50" cy="35" r="20" fill="white"/%3E%3Cpath d="M15 92c2-25 17-38 35-38s33 13 35 38" fill="white"/%3E%3C/svg%3E';
}

const AuthService = {
  async registerPlayer(email, password, profileData) {
    Utils.showLoader();
    try {
      const fullName = String(profileData.fullName || '').trim().replace(/\s+/g, ' ');
      const username = String(profileData.username || '').trim().toLowerCase();
      if (!/^[a-z0-9][a-z0-9_.-]{2,19}$/.test(username)) {
        throw new Error('Username must be 3-20 characters using letters, numbers, dot, dash or underscore.');
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Auto-assign cute boy gamer player avatar
      const avatarUrl = profileData.profilePhoto || getRandomCartoonAvatar(username || email);

      // Create profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        role: "PLAYER",
        fullName,
        username,
        phone: profileData.phone,
        country: profileData.country,
        bio: profileData.bio || "",
        profilePhoto: avatarUrl,
        createdAt: new Date().toISOString()
      });

      Utils.hideLoader();
      Utils.showToast("✅ Registration successful! Welcome to EF X TOUR!", "success");
      return user;
    } catch (error) {
      Utils.hideLoader();
      // Friendly error messages
      let msg = error.message;
      if (error.code === 'auth/email-already-in-use') msg = "This email is already registered. Please login.";
      if (error.code === 'auth/weak-password') msg = "Password must be at least 6 characters.";
      if (error.code === 'auth/invalid-email') msg = "Please enter a valid email address.";
      Utils.showToast(msg, "error");
      throw error;
    }
  },

  async loginUser(email, password) {
    Utils.showLoader();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      Utils.hideLoader();
      Utils.showToast("🎮 Welcome back! Loading dashboard...", "success");
      return userCredential.user;
    } catch (error) {
      Utils.hideLoader();
      let msg = error.message;
      if (error.code === 'auth/user-not-found') msg = "No account found with this email. Please register first.";
      if (error.code === 'auth/wrong-password') msg = "Incorrect password. Please try again.";
      if (error.code === 'auth/invalid-credential') msg = "Invalid email or password. Please check and try again.";
      if (error.code === 'auth/too-many-requests') msg = "Too many failed attempts. Please try again later.";
      Utils.showToast(msg, "error");
      throw error;
    }
  },

  async logoutUser() {
    Utils.showLoader();
    try {
      await signOut(auth);
      Utils.hideLoader();
      Utils.showToast("Logged out successfully.", "success");
      window.location.href = "index.html";
    } catch (error) {
      Utils.hideLoader();
      Utils.showToast(error.message, "error");
    }
  }
};

window.AuthService = AuthService;
export default AuthService;
