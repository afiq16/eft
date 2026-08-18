# EF X TOUR 2026

Premium, professional responsive eFootball Tournament & League Management Website built with Vanilla HTML5, CSS3, ES6+ Javascript, and Firebase Web SDK.

---

## Getting Started

### 1. Requirements
Ensure you have the Firebase CLI installed to host or deploy rules:
```bash
npm install -g firebase-tools
```

### 2. Configure Firebase Connections
1. Create a Firebase Project on the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Email/Password** Authentication.
3. Initialize **Cloud Firestore**, **Realtime Database**, and **Cloud Storage**.
4. Edit the file [firebase-config.js](file:///c:/Users/Ishfak%20Ahmed%20Afiq/Desktop/ef/js/firebase-config.js) and replace the configuration template with your project parameters.

### 3. Deploy Rules and Indexes
To configure security permissions on Firebase collections:
```bash
firebase deploy --only firestore:rules,storage:rules,database:rules
```

### 4. Running Locally
Run a local hosting server to check pages flow:
```bash
firebase serve
```
Open [http://localhost:5000](http://localhost:5000) or open the pages directly in a browser.

### 5. Setup & Initialization
Navigate to `/setup.html` on your first load. Input a Super Admin email and password. Click "Initialize & Create Admin" to set up configuration schemas, news collections, and initial rules.
