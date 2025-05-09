import { auth, db } from "../JS/firbase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const form = document.getElementById("income-form");

let currentUser;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
  } else {
    alert("Please login first.");
    window.location.href = "login.html";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const amount = document.getElementById("amount").value;
  const source = document.getElementById("source").value;
  const date = document.getElementById("date").value;
  const note = document.getElementById("note").value;

  try {
    await addDoc(collection(db, "income"), {
      uid: currentUser.uid,
      amount: Number(amount),
      source,
      date,
      note,
      createdAt: serverTimestamp(),
    });

    alert("Income added successfully!");
    form.reset();
  } catch (err) {
    console.error("Error adding income:", err);
    alert("Failed to add income.");
  }
});
