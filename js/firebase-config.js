// ============================================================
// BARAKA COMPUTER — Shared Firebase Initialization
// This is the ONLY place Firebase is initialized in the whole
// project. Every other file imports { app, auth, db } from here.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// TODO: These are the values you already generated in the Firebase console.
// If you ever create a new Firebase project, replace this whole object.
const firebaseConfig = {
  apiKey: "AIzaSyCBbPNZsE66Xc3RHAGdzudONWUdOyRxug4",
  authDomain: "baraka-computer-c2524.firebaseapp.com",
  projectId: "baraka-computer-c2524",
  storageBucket: "baraka-computer-c2524.firebasestorage.app",
  messagingSenderId: "613482533457",
  appId: "1:613482533457:web:90b87496c69a87ff399e70",
  measurementId: "G-979BVHWM8B"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
