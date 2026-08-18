// Authentication logic utilizing Firebase Modular Auth SDK

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";
import Utils from "./utils.js";

const AuthService = {
  async registerPlayer(email, password, profileData) {
    Utils.showLoader();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Send email verification
      await sendEmailVerification(user);

      // Create profile details in firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        role: "PLAYER",
        fullName: profileData.fullName,
        username: profileData.username,
        phone: profileData.phone,
        efootballId: profileData.efootballId,
        efootballUid: profileData.efootballUid,
        country: profileData.country,
        bio: profileData.bio || "",
        profilePhoto: profileData.profilePhoto || "",
        createdAt: new Date().toISOString()
      });

      Utils.hideLoader();
      Utils.showToast("Registration successful! Check verification email.", "success");
      return user;
    } catch (error) {
      Utils.hideLoader();
      Utils.showToast(error.message, "error");
      throw error;
    }
  },

  async loginUser(email, password) {
    Utils.showLoader();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      Utils.hideLoader();
      Utils.showToast("Welcome back!", "success");
      return userCredential.user;
    } catch (error) {
      Utils.hideLoader();
      Utils.showToast(error.message, "error");
      throw error;
    }
  },

  async logoutUser() {
    Utils.showLoader();
    try {
      await signOut(auth);
      Utils.hideLoader();
      Utils.showToast("Logged out successfully.", "success");
      window.location.href = "login.html";
    } catch (error) {
      Utils.hideLoader();
      Utils.showToast(error.message, "error");
    }
  }
};

window.AuthService = AuthService;
export default AuthService;
