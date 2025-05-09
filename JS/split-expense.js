import { auth, db } from "../JS/firbase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const form = document.getElementById("split-expense-form");

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
  } else {
    window.location.href = "login.html";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const participants = document.getElementById("participants").value.split(",").map(p => p.trim());
  const date = document.getElementById("date").value;
  const note = document.getElementById("note").value;

  const share = +(amount / participants.length).toFixed(2);

  try {
    await addDoc(collection(db, "splitExpenses"), {
      userId: currentUser.uid,
      title,
      amount,
      participants,
      sharePerPerson: share,
      date,
      note,
      createdAt: serverTimestamp()
    });

    alert("Expense split successfully!");
    form.reset();
  } catch (error) {
    console.error("Error adding split expense:", error);
    alert("Failed to split expense.");
  }
});
