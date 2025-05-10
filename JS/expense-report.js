import { auth, db } from "../JS/firbase-config.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const reportContent = document.getElementById("reportContent");

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const q = query(collection(db, "expenses"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      reportContent.innerHTML = "<p>No expenses recorded.</p>";
      return;
    }

    const expensesByCategory = {};
    let totalSpent = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const { category, amount } = data;

      // Safely get formatted date
      let formattedDate = "N/A";
      if (data.createdAt && typeof data.createdAt.toDate === "function") {
        formattedDate = data.createdAt.toDate().toLocaleDateString();
      }

      if (!expensesByCategory[category]) {
        expensesByCategory[category] = [];
      }

      expensesByCategory[category].push({
        amount: parseFloat(amount),
        date: formattedDate,
      });

      totalSpent += parseFloat(amount);
    });

    let html = "";
    for (const category in expensesByCategory) {
      html += `<div class="category-group">
        <h3>${category}</h3>
        <ul>`;
      expensesByCategory[category].forEach((exp) => {
        html += `<li>${exp.date} - $${exp.amount.toFixed(2)}</li>`;
      });
      html += `</ul></div>`;
    }

    html += `<div class="total">Total Spent: $${totalSpent.toFixed(2)}</div>`;
    reportContent.innerHTML = html;
  } catch (error) {
    console.error("Error loading expense report:", error);
    reportContent.innerHTML = "<p>Error loading report. Try again later.</p>";
  }
});
