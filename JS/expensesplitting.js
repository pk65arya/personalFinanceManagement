import { auth, db } from "../JS/firbase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// DOM Elements
const splitExpenseForm = document.getElementById("splitExpenseForm");
const splitExpensesDisplay = document.getElementById("splitExpensesDisplay");
const createGroupForm = document.getElementById("createGroupForm");
const groupSelectContainer = document.getElementById("groupSelectContainer");
const expenseSection = document.getElementById("expenseSection");

// Selected Group
let selectedGroupId = null;

// Fetch and Display User Groups
async function fetchAndDisplayGroups() {
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to view your groups.");

  const q = query(collection(db, "sharedGroups"), where("members", "array-contains", user.email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    groupSelectContainer.innerHTML = "<p>No groups found. Please create one.</p>";
    return;
  }

  let html = `<select id="groupSelect" onchange="selectGroup(event)">
                <option value="" disabled selected>Select a group</option>`;

  snapshot.forEach((doc) => {
    const group = doc.data();
    html += `<option value="${doc.id}">${group.groupName}</option>`;
  });

  html += "</select>";
  groupSelectContainer.innerHTML = html;
}

// Show the expenses for the selected group
async function displaySplitExpenses(groupId) {
  const q = query(collection(db, "groupExpenses"), where("groupId", "==", groupId));
  const snapshot = await getDocs(q);

  let html = "";
  if (snapshot.empty) {
    html = "<p>No expenses recorded yet for this group.</p>";
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

// Add Expense to Selected Group
splitExpenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to add a split expense.");

  if (!selectedGroupId) {
    return alert("Please select a group to add expenses.");
  }

  const expenseName = document.getElementById("expenseName").value.trim();
  const totalAmount = parseFloat(document.getElementById("totalAmount").value);
  const splitAmount = parseInt(document.getElementById("splitAmount").value);

  if (!expenseName || isNaN(totalAmount) || isNaN(splitAmount) || splitAmount <= 0) {
    return alert("Please fill out all fields correctly.");
  }

  const splitPerPerson = parseFloat((totalAmount / splitAmount).toFixed(2));

  try {
    // Add expense to Firestore under the selected group
    await addDoc(collection(db, "groupExpenses"), {
      groupId: selectedGroupId,
      userId: user.uid,
      expenseName,
      totalAmount,
      splitAmong: splitAmount,
      splitPerPerson,
      timestamp: serverTimestamp(),
    });

    alert("Expense recorded successfully!");
    document.getElementById("expenseName").value = '';
    document.getElementById("totalAmount").value = '';
    document.getElementById("splitAmount").value = '';

    await displaySplitExpenses(selectedGroupId);  // Refresh the displayed expenses
  } catch (error) {
    console.error("Error adding split expense:", error);
    alert("Something went wrong. Please try again.");
  }
});

// Handle group selection
function selectGroup(event) {
  selectedGroupId = event.target.value;
  expenseSection.style.display = "block";  // Show the expense section
  displaySplitExpenses(selectedGroupId); // Display expenses for the selected group
}

// Create New Group
createGroupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to create a group.");

  const groupName = document.getElementById("groupName").value.trim();
  if (!groupName) return alert("Please enter a group name.");

  try {
    // Add new group to Firestore
    await addDoc(collection(db, "sharedGroups"), {
      groupName,
      members: [user.email],
      creator: user.email,
      timestamp: serverTimestamp(),
    });

    alert("Group created successfully!");
    await fetchAndDisplayGroups(); // Refresh group selection
  } catch (error) {
    console.error("Error creating group:", error);
    alert("Something went wrong. Please try again.");
  }
});

// Initial setup
fetchAndDisplayGroups();
