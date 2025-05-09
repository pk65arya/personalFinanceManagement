import { auth } from "../JS/firbase-config.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Redirect if user not logged in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
  }
});

// Logout function
document.getElementById("logout-btn").addEventListener("click", async () => {
  await signOut(auth);
  alert("Logged out successfully.");
  window.location.href = "login.html";
});

