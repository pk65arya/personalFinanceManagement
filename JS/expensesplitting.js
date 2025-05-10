import { auth, db } from "./firbase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const splitExpenseForm = document.getElementById("splitExpenseForm");
const splitExpensesDisplay = document.getElementById("splitExpensesDisplay");

// Handle form submission
splitExpenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to add a split expense.");

  const expenseName = document.getElementById("expenseName").value.trim();
  const totalAmount = parseFloat(document.getElementById("totalAmount").value);
  const splitAmount = parseInt(document.getElementById("splitAmount").value);

  if (!expenseName || isNaN(totalAmount) || isNaN(splitAmount) || splitAmount <= 0) {
    return alert("Please fill out all fields correctly.");
  }

  const splitPerPerson = parseFloat((totalAmount / splitAmount).toFixed(2));

  try {
    await addDoc(collection(db, "splitExpenses"), {
      userId: user.uid,
      expenseName,
      totalAmount,
      splitAmong: splitAmount,
      splitPerPerson,
      timestamp: serverTimestamp(),
    });

    alert("Split expense recorded successfully!");
    splitExpenseForm.reset();
    displaySplitExpenses(); // refresh list
  } catch (error) {
    console.error("Error adding split expense:", error);
    alert("Something went wrong. Please try again.");
  }
});

// Display split expenses
async function displaySplitExpenses() {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(collection(db, "splitExpenses"), where("userId", "==", user.uid));
  const snapshot = await getDocs(q);

  let html = "";
  if (snapshot.empty) {
    html = "<p>No split expenses recorded yet.</p>";
  } else {
    snapshot.forEach((doc) => {
      const expense = doc.data();
      html += `
        <div class="expense-card">
          <h4>${expense.expenseName}</h4>
          <p><strong>Total Amount:</strong> $${expense.totalAmount.toFixed(2)}</p>
          <p><strong>Split Among:</strong> ${expense.splitAmong} people</p>
          <p><strong>Each Pays:</strong> $${expense.splitPerPerson.toFixed(2)}</p>
        </div>
      `;
    });
  }

  splitExpensesDisplay.innerHTML = html;
}

// Auto-load when page is ready
window.addEventListener("DOMContentLoaded", displaySplitExpenses);
