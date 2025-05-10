
import { auth, db } from "../JS/firbase-config.js";
import { createUserWithEmailAndPassword, updateProfile ,signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


const registerForm = document.getElementById("register-form");

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (name && email && password) {
    try {
     
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

     
      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        createdAt: new Date().toISOString(),
      });

      
      window.location.href = "dashboard.html";
    } catch (error) {
      console.error("Error registering user: ", error.message);
      alert("Registration failed! Please try again.");
    }
  } else {
    alert("Please fill out all fields!");
  }
});



const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in: ", userCredential.user);
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Error logging in: ", error.message);
    alert("Login failed! Please try again.");
  }
});
