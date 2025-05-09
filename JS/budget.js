import { db } from './firbase-config.js';
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Set Budget
document.getElementById("budget-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  
  const category = document.getElementById("category").value;
  const budgetAmount = parseFloat(document.getElementById("budget-amount").value);
  const month = document.getElementById("budget-month").value;
  const userId = "USER_ID";  // This should be dynamically fetched from Firebase auth

  try {
    await addDoc(collection(db, "budgets"), {
      userId,
      category,
      budgetAmount,
      month,
      createdAt: new Date().toISOString()
    });

    alert("Budget Set Successfully!");
    getBudgetSummary(userId);
  } catch (error) {
    console.error("Error setting budget:", error);
  }
});

// Get Budget Summary
async function getBudgetSummary(userId) {
  const q = query(collection(db, "budgets"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  let totalBudget = 0;
  let totalSpent = 0;

  querySnapshot.forEach(doc => {
    const data = doc.data();
    totalBudget += data.budgetAmount;
    totalSpent += getSpentAmount(data.category);  // Fetch spent amount for the category
  });

  document.getElementById("budget-summary").innerHTML = `
    Total Budget: ₹${totalBudget} | Total Spent: ₹${totalSpent}
  `;

  if (totalSpent > totalBudget) {
    document.getElementById("alert-message").innerText = "You have exceeded your budget!";
  } else {
    document.getElementById("alert-message").innerText = "";
  }
}

// Example function to get spent amount (this should be linked to the expense records)
function getSpentAmount(category) {
  // Here, we would fetch the total spent in the given category
  return 1000;  // Just a placeholder value, replace with actual logic
}

// Fetch the current budget summary after page load
getBudgetSummary("USER_ID"); // Replace "USER_ID" dynamically
