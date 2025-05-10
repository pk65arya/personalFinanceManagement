import { auth, db } from '../JS/firbase-config.js'; // ✅ Path must be correct!
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const form = document.getElementById('registerForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });

    // ✅ Correct Firestore document path
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: name,
      email: email,
      createdAt: serverTimestamp()
    });

    alert("Registration successful!");
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Registration Error:", error);
    alert(error.message);
  }
});
