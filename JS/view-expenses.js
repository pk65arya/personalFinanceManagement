import { auth, db, storage } from "../JS/firbase-config.js";
import { collection, query, where, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";



// const expensesContainer = document.getElementById("expensesContainer");
// const noExpenses = document.getElementById("noExpenses");

// // Check if user is logged in
// auth.onAuthStateChanged(async (user) => {
//   if (!user) {
//     window.location.href = "login.html";
//     return;
//   }

//   const q = query(collection(db, "expenses"), where("userId", "==", user.uid));
//   const snapshot = await getDocs(q);

//   if (snapshot.empty) {
//     noExpenses.style.display = "block";
//     return;
//   }

//   noExpenses.style.display = "none";

//   snapshot.forEach(async (docSnap) => {
//     const expense = docSnap.data();
//     const expenseId = docSnap.id;

//     const card = document.createElement("div");
//     card.className = "expense-card";

//     card.innerHTML = `
//       <h3>${expense.title}</h3>
//       <p><strong>Amount:</strong> $${expense.amount}</p>
//       <p><strong>Category:</strong> ${expense.category}</p>
//       <p><strong>Date:</strong> ${expense.date}</p>
//       <div class="actions">
//         <button class="edit-btn" data-id="${expenseId}">Edit</button>
//         <button class="delete-btn" data-id="${expenseId}">Delete</button>
//       </div>
//     `;

//     // If receipt exists, get the URL and show it
//     if (expense.receiptPath) {
//       try {
//         const url = await getDownloadURL(ref(storage, expense.receiptPath));
//         const img = document.createElement("img");
//         img.src = url;
//         img.alt = "Receipt";
//         img.className = "receipt-image";
//         card.appendChild(img);
//       } catch (error) {
//         console.warn("Failed to load receipt image:", error);
//       }
//     }

//     expensesContainer.appendChild(card);
//   });
// });

// // Delete Handler (Event Delegation)
// expensesContainer.addEventListener("click", async (e) => {
//   if (e.target.classList.contains("delete-btn")) {
//     const expenseId = e.target.getAttribute("data-id");
//     if (confirm("Are you sure you want to delete this expense?")) {
//       try {
//         await deleteDoc(doc(db, "expenses", expenseId));
//         alert("Expense deleted!");
//         location.reload(); // Refresh the list
//       } catch (err) {
//         console.error("Delete failed:", err);
//         alert("Failed to delete expense.");
//       }
//     }
//   }

//   // TODO: Edit handler will go here
// });



// import { auth, firestore } from '../JS/firbase-config.js';

// Get references to DOM elements
const expensesContainer = document.getElementById("expensesContainer");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageNumberEl = document.getElementById("pageNumber");

let currentPage = 1;
const pageSize = 5;

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  // Fetch expenses data from Firestore
  await loadExpenses(user.uid);
});

async function loadExpenses(userId) {
  try {
    const expensesRef = collection(db, "expenses");
const q = query(expensesRef, where("userId", "==", userId)); // Filter by userId
const querySnapshot = await getDocs(q);

if (querySnapshot.empty) {
  expensesContainer.innerHTML = "<p>No expenses found.</p>";
  return;
}

querySnapshot.forEach((doc) => {
  const expense = doc.data();
  const expenseElement = document.createElement("div");
  expenseElement.classList.add("expense-item");
  expenseElement.innerHTML = `
    <div>$${expense.amount.toFixed(2)}</div>
    <div>${expense.category}</div>
    <div>${expense.date}</div>
    <div>${expense.description}</div>
  `;
  expensesContainer.appendChild(expenseElement);
});

    pageNumberEl.textContent = `Page ${currentPage}`;

    // Enable/Disable pagination buttons
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = snapshot.size < pageSize;

  } catch (error) {
    console.error("Error fetching expenses:", error);
   
  }
}

// Pagination button click handlers
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    loadExpenses(auth.currentUser.uid);
  }
});

nextPageBtn.addEventListener("click", () => {
  currentPage++;
  loadExpenses(auth.currentUser.uid);
});

