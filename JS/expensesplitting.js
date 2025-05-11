import { auth, db } from "../JS/firbase-config.js";


import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const createGroupForm = document.getElementById("createGroupForm");
const groupNameInput = document.getElementById("groupName");
const memberEmailsInput = document.getElementById("memberEmails");

const groupSelect = document.getElementById("groupSelect");
const expenseForm = document.getElementById("splitExpenseForm");
const expenseDisplay = document.getElementById("splitExpensesDisplay");


let selectedGroupId = null;

async function loadGroups() {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(collection(db, "sharedGroups"), where("members", "array-contains", user.email));
  const snapshot = await getDocs(q);
  groupSelect.innerHTML = `<option value="">-- Select Group --</option>`;

  snapshot.forEach(doc => {
    const group = doc.data();
    groupSelect.innerHTML += `<option value="${doc.id}">${group.groupName}</option>`;
  });
}

// Create group
createGroupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in.");

  const groupName = groupNameInput.value.trim();
  const emails = memberEmailsInput.value.split(",").map(e => e.trim());
  if (!groupName || emails.length === 0) return alert("Fill all fields.");

  if (!emails.includes(user.email)) emails.push(user.email);

  try {
    await addDoc(collection(db, "sharedGroups"), {
      groupName,
      members: emails,
      createdBy: user.uid,
      createdAt: serverTimestamp()
    });
    alert("Group created!");
    groupNameInput.value = "";
    memberEmailsInput.value = "";
    loadGroups();
  } catch (err) {
    console.error("Error creating group:", err);
    alert("Could not create group.");
  }
});

// Select group
groupSelect.addEventListener("change", () => {
  selectedGroupId = groupSelect.value;
  if (selectedGroupId) loadExpenses(selectedGroupId);
});

// Add expense
expenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in.");
  if (!selectedGroupId) return alert("Please select a group.");

  const name = document.getElementById("expenseName").value.trim();
  const total = parseFloat(document.getElementById("totalAmount").value);
  const people = parseInt(document.getElementById("splitAmount").value);

  if (!name || isNaN(total) || isNaN(people) || people <= 0) {
    return alert("Please enter valid data.");
  }

  const each = parseFloat((total / people).toFixed(2));

  try {
    await addDoc(collection(db, "groupExpenses"), {
      groupId: selectedGroupId,
      userId: user.uid,
      expenseName: name,
      totalAmount: total,
      splitAmong: people,
      splitPerPerson: each,
      timestamp: serverTimestamp()
    });
    expenseForm.reset();
    loadExpenses(selectedGroupId);
  } catch (err) {
    console.error("Add expense failed:", err);
    alert("Failed to add expense.");
  }
});

// Load expenses
async function loadExpenses(groupId) {
  const q = query(collection(db, "groupExpenses"), where("groupId", "==", groupId));
  const snapshot = await getDocs(q);
  expenseDisplay.innerHTML = "";

  if (snapshot.empty) {
    expenseDisplay.innerHTML = "<p>No expenses found.</p>";
    return;
  }

  snapshot.forEach(doc => {
    const e = doc.data();
    expenseDisplay.innerHTML += `
      <div class="expense-card">
        <h4>${e.expenseName}</h4>
        <p><strong>Total:</strong> $${e.totalAmount.toFixed(2)}</p>
        <p><strong>Split Among:</strong> ${e.splitAmong}</p>
        <p><strong>Each Pays:</strong> $${e.splitPerPerson.toFixed(2)}</p>
      </div>
    `;
  });
}

// Init
auth.onAuthStateChanged(user => {
  if (user) loadGroups();
});
