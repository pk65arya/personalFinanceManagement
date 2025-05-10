// display-income.js
import { auth, db } from "../JS/firbase-config.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const incomeDisplay = document.getElementById("incomeDisplay");

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const incomeQuery = query(collection(db, "income"), where("userId", "==", user.uid));
    const incomeSnapshot = await getDocs(incomeQuery);

    if (incomeSnapshot.empty) {
      incomeDisplay.innerHTML = "<p>No income recorded yet.</p>";
      return;
    }

    let totalIncome = 0;
    incomeSnapshot.forEach(doc => {
      const { amount } = doc.data();
      totalIncome += parseFloat(amount);
    });

    incomeDisplay.innerHTML = `<p><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>`;

  } catch (error) {
    console.error("Error fetching income:", error);
    incomeDisplay.innerHTML = "<p>Error loading income data.</p>";
  }
});
