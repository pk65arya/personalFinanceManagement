import { auth, db, storage } from "../JS/firbase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";


onAuthStateChanged(auth, (user) => {
  if (user) {
    const expenseForm = document.getElementById("expenseForm");

    expenseForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = document.getElementById("title").value;
      const amount = parseFloat(document.getElementById("amount").value);
      const date = document.getElementById("date").value;
      const category = document.getElementById("category").value;
      const notes = document.getElementById("notes").value;
      const receipt = document.getElementById("receipt").files[0];

      try {
        let imageURL = "";

        
        if (receipt) {
          const storageRef = ref(storage, `receipts/${user.uid}/${Date.now()}_${receipt.name}`);
          await uploadBytes(storageRef, receipt);
          imageURL = await getDownloadURL(storageRef);
        }

        
        await addDoc(collection(db, "users", user.uid, "expenses"), {
          title,
          amount,
          date,
          category,
          notes,
          receiptURL: imageURL,
          createdAt: serverTimestamp(),
        });

        alert("Expense added successfully!");
        expenseForm.reset();
      } catch (err) {
        console.error("Error adding expense:", err);
        alert("Failed to add expense. " + err.message);
      }
    });
  } else {
 
    alert("You must be logged in to add expenses.");
    window.location.href = "../auth/login.html";
  }
});
