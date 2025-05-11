import { auth, db } from "../JS/firbase-config.js";
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
const groupSelectContainer = document.getElementById("groupSelectContainer");

let selectedGroupId = null;

// Fetch and display groups
async function fetchAndDisplayGroups() {
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to view your groups.");

  const q = query(collection(db, "sharedGroups"), where("members", "array-contains", user.email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    groupSelectContainer.innerHTML = "<p>No groups found. Create one to get started.</p>";
    return;
  }

  let html = '<label for="groupSelect">Select Group:</label><select id="groupSelect">';
  html += '<option disabled selected value="">-- Select a group --</option>';

  snapshot.forEach((doc) => {
    const group = doc.data();
    html += `<option value="${doc.id}">${group.groupName}</option>`;
  });

  html += '</select>';
  groupSelectContainer.innerHTML = html;

  document.getElementById("groupSelect").addEventListener("change", (e) => {
    selectedGroupId = e.target.value;
    displaySplitExpenses(selectedGroupId);
  });
}

// Display expenses
async function displaySplitExpenses(groupId) {
  const q = query(collection(db, "groupExpenses"), where("groupId", "==", groupId));
  const snapshot = await getDocs(q);

  let html = "";
  if (snapshot.empty) {
    html = "<p>No expenses recorded for this group.</p>";
  } else {
    snapshot.forEach((doc) => {
      const expense = doc.data();
      html += `
        <div class="expense-card">
          <h4>${expense.expenseName}</h4>
          <p><strong>Total:</strong> $${expense.totalAmount.toFixed(2)}</p>
          <p><strong>Split Among:</strong> ${expense.splitAmong}</p>
          <p><strong>Each Pays:</strong> $${expense.splitPerPerson.toFixed(2)}</p>
        </div>
      `;
    });
  }

  splitExpensesDisplay.innerHTML = html;
}

// Submit expense
splitExpenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to add expenses.");
  if (!selectedGroupId) return alert("Select a group first.");

  const expenseName = document.getElementById("expenseName").value.trim();
  const totalAmount = parseFloat(document.getElementById("totalAmount").value);
  const splitAmount = parseInt(document.getElementById("splitAmount").value);

  if (!expenseName || isNaN(totalAmount) || isNaN(splitAmount) || splitAmount <= 0) {
    return alert("Please fill all fields correctly.");
  }

  const splitPerPerson = parseFloat((totalAmount / splitAmount).toFixed(2));

  try {
    await addDoc(collection(db, "groupExpenses"), {
      groupId: selectedGroupId,
      userId: user.uid,
      expenseName,
      totalAmount,
      splitAmong: splitAmount,
      splitPerPerson,
      timestamp: serverTimestamp(),
    });

    alert("Expense added successfully!");
    splitExpenseForm.reset();
    displaySplitExpenses(selectedGroupId);
  } catch (error) {
    console.error("Error adding expense:", error);
    alert("Error adding expense. Try again.");
  }
});

window.addEventListener("DOMContentLoaded", () => {
  auth.onAuthStateChanged((user) => {
    if (user) fetchAndDisplayGroups();
  });
});
