// ============================================================
// BARAKA COMPUTER — Admin Login Logic
// ============================================================

import { auth } from "../../js/firebase-config.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const form = document.getElementById("loginForm");
const errorBox = document.getElementById("loginError");
const btn = document.getElementById("loginBtn");

// If already logged in, skip straight to the dashboard.
onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = "dashboard.html";
});

function friendlyError(code) {
  const map = {
    "auth/invalid-email": "সঠিক ইমেইল দিন।",
    "auth/user-not-found": "এই ইমেইলে কোনো অ্যাকাউন্ট নেই।",
    "auth/wrong-password": "পাসওয়ার্ড সঠিক নয়।",
    "auth/invalid-credential": "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",
    "auth/too-many-requests": "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।"
  };
  return map[code] || "লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.textContent = "";
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  btn.disabled = true;
  btn.textContent = "লগইন হচ্ছে...";
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (err) {
    errorBox.textContent = friendlyError(err.code);
    btn.disabled = false;
    btn.textContent = "লগইন করুন";
  }
});
