import { auth } from '../JS/firbase-config.js';

const userNameEl = document.getElementById("userName");
const userEmailEl = document.getElementById("userEmail");
const userCreatedAtEl = document.getElementById("userCreatedAt");
const logoutBtn = document.getElementById("logoutBtn");

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Set user info
  userNameEl.textContent = user.displayName || "User";
  userEmailEl.textContent = user.email;

  const createdAt = new Date(user.metadata.creationTime);
  userCreatedAtEl.textContent = createdAt.toLocaleDateString();
});

// Logout functionality
logoutBtn.addEventListener("click", async () => {
  try {
    await auth.signOut();
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout error:", error);
    alert("Failed to log out.");
  }
});
