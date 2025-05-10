import { auth, db } from "../JS/firbase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const incomeForm = document.getElementById("incomeForm");
const sourceInput = document.getElementById("source");
const amountInput = document.getElementById("amount");
const message = document.getElementById("message");

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  incomeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const source = sourceInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (!source || isNaN(amount) || amount <= 0) {
      message.textContent = "Please enter a valid source and amount.";
      message.style.color = "red";
      return;
    }

    try {
      await addDoc(collection(db, "income"), {
        userId: user.uid,
        source,
        amount,
        createdAt: serverTimestamp()
      });

      message.textContent = "Income saved successfully!";
      message.style.color = "green";
      incomeForm.reset();
    } catch (error) {
      console.error("Error saving income:", error);
      message.textContent = "Failed to save income.";
      message.style.color = "red";
    }
  });
});
