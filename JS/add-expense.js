import { auth, db, storage } from '../JS/firbase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

const expenseForm = document.getElementById("expenseForm");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");
const receiptInput = document.getElementById("receipt");
const submitBtn = document.getElementById("submitBtn");


expenseForm.addEventListener("submit", async (event) => {
  event.preventDefault(); 
  
  
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to add an expense.");
    window.location.href = "login.html";
    return;
  }

  
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;
  const date = new Date(dateInput.value).toISOString();
  const description = descriptionInput.value;
  const receiptFile = receiptInput.files[0];

  if (!amount || !category || !date || !description) {
    alert("Please fill out all fields.");
    return;
  }

  
  let receiptUrl = null;
  if (receiptFile) {
    const storageRef = ref(storage, `receipts/${user.uid}/${Date.now()}-${receiptFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, receiptFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
       
      },
      (error) => {
        console.error("Error uploading receipt:", error);
        alert("Failed to upload receipt.");
      },
      async () => {
        
        receiptUrl = await getDownloadURL(uploadTask.snapshot.ref);
        saveExpenseData();
      }
    );
  } else {
    saveExpenseData();
  }

  
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
      window.location.href = "view-expenses.html"; 
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Failed to add expense.");
    }
  }
});
