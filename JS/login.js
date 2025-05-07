import {auth,db} from "../JS/firbase-config.js";
import {signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {doc,getDoc} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"


document.getElementById('login-btn').addEventListener("click",async (e)=>{
  e.preventDefault();

  const email=document.getElementById('email').value;
  const password=document.getElementById('password').value;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    alert(`Welcome back, ${user.email}!`);
    // Redirect to dashboard or store session info if needed
    window.location.href = "./dashboard.html";
  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed: " + error.message);
  }

})