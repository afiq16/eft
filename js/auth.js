// Authentication logic utilizing Firebase Modular Auth SDK

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";
import Utils from "./utils.js";

const AVATAR_STYLES = ['adventurer'];

function getRandomCartoonAvatar(seed) {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&hairColor=0e0e0e,2c1b18,4a312c&skinColor=f2d3b1,ecad80&glassesProbability=25`;
}

const AuthService = {
  async registerPlayer(email, password, profileData) {
    Utils.showLoader();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Auto-assign cartoon avatar
      const avatarUrl = getRandomCartoonAvatar(profileData.username || email);

      // Create profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        role: "PLAYER",
        fullName: profileData.fullName,
        username: profileData.username,
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
