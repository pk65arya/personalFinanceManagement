import { auth, db, storage } from '../JS/firbase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// Get references to DOM elements
const expenseForm = document.getElementById("expenseForm");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");
const receiptInput = document.getElementById("receipt");
const submitBtn = document.getElementById("submitBtn");

// Handle the form submission
expenseForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent the form from submitting the default way
  
  // Get current user
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to add an expense.");
    window.location.href = "login.html";
    return;
  }

  // Get form values
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;
  const date = new Date(dateInput.value).toISOString();
  const description = descriptionInput.value;
  const receiptFile = receiptInput.files[0];

  if (!amount || !category || !date || !description) {
    alert("Please fill out all fields.");
    return;
  }

  // Upload the receipt to Firebase Storage if there is one
  let receiptUrl = null;
  if (receiptFile) {
    const storageRef = ref(storage, `receipts/${user.uid}/${Date.now()}-${receiptFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, receiptFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // You can add a progress bar here if you want to track the upload
      },
      (error) => {
        console.error("Error uploading receipt:", error);
        alert("Failed to upload receipt.");
      },
      async () => {
        // Get the download URL after the upload completes
        receiptUrl = await getDownloadURL(uploadTask.snapshot.ref);
        saveExpenseData();
      }
    );
  } else {
    saveExpenseData();
  }

  // Function to save the expense data to Firestore
  async function saveExpenseData() {
    try {
      const expenseRef = collection(db, "expenses");
      const expenseData = {
        amount,
        category,
        date,
        description,
        userId: user.uid,
        receiptUrl,
      };

      await addDoc(expenseRef, expenseData);
      alert("Expense added successfully!");
      window.location.href = "view-expenses.html"; // Redirect to view expenses page
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Failed to add expense.");
    }
  }
});
