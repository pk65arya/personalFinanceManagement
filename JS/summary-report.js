import { db } from './firbase-config.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Fetch Income and Expenses
document.getElementById("report-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const month = document.getElementById("report-month").value;
  const userId = "USER_ID";  // This should be dynamically fetched from Firebase auth

  try {
    const incomeTotal = await getTotalIncome(userId, month);
    const expenseTotal = await getTotalExpenses(userId, month);

    const balance = incomeTotal - expenseTotal;

    document.getElementById("total-income").innerText = incomeTotal;
    document.getElementById("total-expenses").innerText = expenseTotal;
    document.getElementById("remaining-balance").innerText = balance;
  } catch (error) {
    console.error("Error generating report:", error);
  }
});

// Fetch total income for the given user and month
async function getTotalIncome(userId, month) {
  const incomeRef = collection(db, "income");
  const q = query(incomeRef, where("userId", "==", userId), where("month", "==", month));
  const querySnapshot = await getDocs(q);

  let totalIncome = 0;
  querySnapshot.forEach(doc => {
    const data = doc.data();
    totalIncome += data.amount;
  });

  return totalIncome;
}

// Fetch total expenses for the given user and month
async function getTotalExpenses(userId, month) {
  const expenseRef = collection(db, "expenses");
  const q = query(expenseRef, where("userId", "==", userId), where("month", "==", month));
  const querySnapshot = await getDocs(q);

  let totalExpenses = 0;
  querySnapshot.forEach(doc => {
    const data = doc.data();
    totalExpenses += data.amount;
  });

  return totalExpenses;
}
