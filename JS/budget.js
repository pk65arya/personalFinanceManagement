import { auth, db } from "../JS/firbase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const budgetForm = document.getElementById("budgetForm");
const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const message = document.getElementById("message");

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  budgetForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const category = categoryInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (!category || isNaN(amount) || amount <= 0) {
      message.textContent = "Please enter a valid category and amount.";
      message.style.color = "red";
      return;
    }

    try {
      await addDoc(collection(db, "budgets"), {
        userId: user.uid,
        category,
        amount,
        createdAt: serverTimestamp()
      });

      message.textContent = "Budget saved successfully!";
      message.style.color = "green";
      budgetForm.reset();
    } catch (error) {
      console.error("Error saving budget:", error);
      message.textContent = "Failed to save budget.";
      message.style.color = "red";
    }
  });
});
