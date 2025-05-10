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
const createGroupForm = document.getElementById("createGroupForm");
const splitExpenseForm = document.getElementById("splitExpenseForm");
const splitExpensesDisplay = document.getElementById("splitExpensesDisplay");
const selectGroupSection = document.getElementById("selectGroupSection");
const groupSelectContainer = document.getElementById("groupSelectContainer");
const selectGroupBtn = document.getElementById("selectGroupBtn");

// Selected Group
let selectedGroupId = null;

// Create a Group
createGroupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to create a group.");

  const groupName = document.getElementById("groupName").value.trim();
  if (!groupName) {
    return alert("Please enter a valid group name.");
  }

  try {
    const docRef = await addDoc(collection(db, "sharedGroups"), {
      groupName,
      members: [user.email],
      createdBy: user.email,
      timestamp: serverTimestamp(),
    });

    alert("Group created successfully!");
    fetchAndDisplayGroups(); // Reload groups after creation
    document.getElementById("groupName").value = ''; // Clear input field
  } catch (error) {
    console.error("Error creating group:", error);
    alert("Something went wrong. Please try again.");
  }
});

// Fetch and Display User Groups
async function fetchAndDisplayGroups() {
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to view your groups.");

  const q = query(collection(db, "sharedGroups"), where("members", "array-contains", user.email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return alert("No groups found for you. Please create a group first.");
  }

  let html = "<option value='' disabled selected>Select a group</option>";
  snapshot.forEach((doc) => {
    const group = doc.data();
    html += `<option value="${doc.id}">${group.groupName}</option>`;
  });

  const groupSelect = document.createElement("select");
  groupSelect.innerHTML = html;

  groupSelect.addEventListener("change", (e) => {
    selectedGroupId = e.target.value;
    console.log("Selected group ID:", selectedGroupId);
    displaySplitExpenses(selectedGroupId);
  });

  groupSelectContainer.appendChild(groupSelect);
  selectGroupSection.style.display = "block";
  selectGroupBtn.style.display = "block";
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

    displaySplitExpenses(selectedGroupId);
  } catch (error) {
    console.error("Error adding split expense:", error);
    alert("Something went wrong. Please try again.");
  }
});

// Event listener for the "Select Group" button
selectGroupBtn.addEventListener("click", () => {
  selectGroupSection.style.display = "none";
  document.getElementById("splitExpenseFormSection").style.display = "block";
  displaySplitExpenses(selectedGroupId);
});

window.addEventListener("DOMContentLoaded", fetchAndDisplayGroups);
