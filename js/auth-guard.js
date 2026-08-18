// Authentication guard checking roles and session logic

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";

const AuthGuard = {
  // Guard a page for logged-in users and roles
  guardPage(allowedRoles = []) {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "login.html";
        return;
      }
      
      if (allowedRoles.length > 0) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (!allowedRoles.includes(userData.role)) {
            // Unauthorized
            alert("Access Denied: You do not have permissions to access this page.");
            window.location.href = "dashboard.html";
          }
        } else {
          window.location.href = "login.html";
        }
      }
    });
  }
};

window.AuthGuard = AuthGuard;
export default AuthGuard;
