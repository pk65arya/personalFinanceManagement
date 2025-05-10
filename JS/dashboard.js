import { auth } from "../JS/firbase-config.js";

const userNameEl = document.getElementById("userName");
const userEmailEl = document.getElementById("userEmail");
const userCreatedAtEl = document.getElementById("userCreatedAt");
const logoutBtn = document.getElementById("logoutBtn");

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

 
  userNameEl.textContent = user.displayName || "User";
  userEmailEl.textContent = user.email;

  const createdAt = new Date(user.metadata.creationTime);
  userCreatedAtEl.textContent = createdAt.toLocaleDateString();
});


logoutBtn.addEventListener("click", async () => {
  try {
    await auth.signOut();
    window.location.href = "landing.html";
  } catch (error) {
    console.error("Logout error:", error);
    alert("Failed to log out.");
  }
});
