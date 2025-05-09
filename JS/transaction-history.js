import { auth, db } from "../JS/firbase-config.js";
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const categoryFilter = document.getElementById("categoryFilter");
const tagFilter = document.getElementById("tagFilter");
const applyFiltersBtn = document.getElementById("applyFilters");
const transactionList = document.getElementById("transaction-list");

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    fetchAndDisplayTransactions();
  } else {
    window.location.href = "login.html";
  }
});

applyFiltersBtn.addEventListener("click", fetchAndDisplayTransactions);

async function fetchAndDisplayTransactions() {
  transactionList.innerHTML = "Loading...";

  const expensesRef = collection(db, "transactions");
  const snapshot = await getDocs(query(expensesRef, where("userId", "==", currentUser.uid)));

  const selectedCategory = categoryFilter.value;
  const tagSearch = tagFilter.value.toLowerCase();

  let html = "";

  snapshot.forEach(doc => {
    const tx = doc.data();

    const matchesCategory = !selectedCategory || tx.category === selectedCategory;
    const matchesTag = !tagSearch || (tx.tags && tx.tags.toLowerCase().includes(tagSearch));

    if (matchesCategory && matchesTag) {
      html += `
        <div class="transaction-card">
          <strong>₹${tx.amount}</strong> - ${tx.category}
          <div>${tx.date}</div>
          <div>Tags: ${tx.tags || "None"}</div>
          <div>Note: ${tx.note || "—"}</div>
        </div>
      `;
    }
  });

  transactionList.innerHTML = html || "<p>No transactions found.</p>";
}
