import { auth, db } from "../JS/firbase-config.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const budgetDisplay = document.getElementById("budgetDisplay");
const notificationContainer = document.getElementById("notificationContainer");

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  displayBudgetsWithSpending(user.uid);
});

async function displayBudgetsWithSpending(userId) {
  try {
    // Fetch budgets for the user
    const budgetsQuery = query(collection(db, "budgets"), where("userId", "==", userId));
    const budgetsSnapshot = await getDocs(budgetsQuery);

    if (budgetsSnapshot.empty) {
      budgetDisplay.innerHTML = "<p>No budget set.</p>";
      return;
    }

    // Fetch all expenses for the user
    const expensesQuery = query(collection(db, "expenses"), where("userId", "==", userId));
    const expensesSnapshot = await getDocs(expensesQuery);

    const expensesByCategory = {};
    expensesSnapshot.forEach((doc) => {
      const { category, amount } = doc.data();
      expensesByCategory[category] = (expensesByCategory[category] || 0) + parseFloat(amount);
    });

    // Build HTML
    let html = "";
    budgetsSnapshot.forEach((doc) => {
      const budget = doc.data();
      const spent = expensesByCategory[budget.category] || 0;
      const remaining = budget.amount - spent;

      html += `
        <div class="budget-card">
          <h4>${budget.category}</h4>
          <p><strong>Budget:</strong> $${budget.amount.toFixed(2)}</p>
          <p><strong>Spent:</strong> $${spent.toFixed(2)}</p>
          <p><strong>Remaining:</strong> $${remaining.toFixed(2)}</p>
        </div>
      `;

      if (spent > budget.amount) {
        showBudgetExceededNotification(budget.category);
      }
    });

    budgetDisplay.innerHTML = html;

  } catch (error) {
    console.error("Error fetching budget or expenses:", error);
    budgetDisplay.innerHTML = "<p>Error loading budget data.</p>";
  }
}

function showBudgetExceededNotification(category) {
  const alert = document.createElement("div");
  alert.className = "notification exceeded-budget";
  alert.innerHTML = `<p><strong>Alert:</strong> You have exceeded your budget for <em>${category}</em>!</p>`;
  notificationContainer.appendChild(alert);
}
