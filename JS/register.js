
 import{auth,db} from "../JS/firbase-config.js";
 import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.getElementById("register-btn").addEventListener("click", async function (e) {
  e.preventDefault();
  console.log("kya yar")
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      createdAt: new Date().toISOString()
    });

    alert("Registration successful and data stored!");
    window.location.href='dashboard.html'
  
  } catch (error) {
    console.error("Registration Error:", error);
    alert("Error: " + error.message);
  }
});
