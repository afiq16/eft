// Cloud Functions implementation index file for EF X TOUR 2026.
// Privileged server-side endpoints matching secure actions.

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Securely draw lottery selection on backend
exports.executeSecureLotteryDraw = functions.https.onCall(async (data, context) => {
  // Ensure the caller is an authenticated administrator
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication Required");
  }

  const callerId = context.auth.uid;
  const userSnap = await admin.firestore().collection("users").doc(callerId).get();
  
  if (!userSnap.exists || userSnap.data().role !== "SUPER_ADMIN") {
    throw new functions.https.HttpsError("permission-denied", "Unauthorized permissions");
  }

  // Draw simulation logic 
  const playersSnap = await admin.firestore().collection("registrations").where("status", "==", "APPROVED").get();
  const players = [];
  playersSnap.forEach(d => players.push(d.data()));

  const clubPool = ["Arsenal", "Barcelona", "Manchester United", "Bayern Munich", "AC Milan", "PSG"];
  
  if (players.length === 0) {
    return { success: false, message: "No approved players" };
  }

  // Write draw details to RTDB
  const dbRef = admin.database().ref("lottery/current");
  await dbRef.set({
    status: "COMPLETED",
    assignments: players.map((p, i) => ({
      playerId: p.playerId,
      playerName: p.playerName || "Player",
      clubName: clubPool[i % clubPool.length],
      timestamp: new Date().toISOString()
    }))
  });

  return { success: true };
});
