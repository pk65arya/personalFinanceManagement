import { auth, db } from "../JS/firbase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const createGroupForm = document.getElementById("createGroupForm");
const splitExpenseForm = document.getElementById("splitExpenseForm");
const splitExpensesDisplay = document.getElementById("splitExpensesDisplay");
const groupNameInput = document.getElementById("groupName");
const groupMembersInput = document.getElementById("groupMembers");
const expenseNameInput = document.getElementById("expenseName");
const totalAmountInput = document.getElementById("totalAmount");
const splitAmountInput = document.getElementById("splitAmount");

// Variable to store selected groupId
let selectedGroupId = null;

// Handle Group Creation
createGroupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to create a group.");

  const groupName = groupNameInput.value.trim();
  const groupMembers = groupMembersInput.value.trim().split(",");
  
  if (groupMembers.length < 2) {
    return alert("You need at least two members to create a group.");
  }

  const groupData = {
    groupName,
    owner: user.uid,
    members: groupMembers.map(email => email.trim()),
    createdAt: serverTimestamp(),
  };

  try {
    // Add group to Firestore
    const groupRef = await addDoc(collection(db, "sharedGroups"), groupData);

    alert(`Group "${groupName}" created successfully!`);
    groupNameInput.value = '';
    groupMembersInput.value = '';

    // After group creation, display the list of groups for expense management
    fetchAndDisplayGroups();

  } catch (error) {
    console.error("Error creating group:", error);
    alert("Error creating group. Please try again.");
  }
});

// Fetch and display groups the user is part of
async function fetchAndDisplayGroups() {
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to view your groups.");

  const q = query(collection(db, "sharedGroups"), where("members", "array-contains", user.email));
  const snapshot = await getDocs(q);

  let html = "<option value='' disabled selected>Select a group</option>";
  snapshot.forEach((doc) => {
    const group = doc.data();
    html += `<option value="${doc.id}">${group.groupName}</option>`;
  });

  const groupSelect = document.createElement("select");
  groupSelect.innerHTML = html;

  const selectGroupSection = document.getElementById("selectGroupSection");
  selectGroupSection.style.display = "block";
  selectGroupSection.insertBefore(groupSelect, splitExpenseForm);

  groupSelect.addEventListener("change", (e) => {
    selectedGroupId = e.target.value;
    displaySplitExpenses(selectedGroupId);
  });
}

// Display Split Expenses for a selected group
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

// Handle Expense Splitting for a group
splitExpenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to add a split expense.");

  if (!selectedGroupId) {
    return alert("Please select a group to add expenses.");
  }

  const expenseName = expenseNameInput.value.trim();
  const totalAmount = parseFloat(totalAmountInput.value);
  const splitAmount = parseInt(splitAmountInput.value);

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
    expenseNameInput.value = '';
    totalAmountInput.value = '';
    splitAmountInput.value = '';
    
    displaySplitExpenses(selectedGroupId);
  } catch (error) {
    console.error("Error adding split expense:", error);
    alert("Something went wrong. Please try again.");
  }
});

// Initialize the app by fetching groups
window.addEventListener("DOMContentLoaded", fetchAndDisplayGroups);