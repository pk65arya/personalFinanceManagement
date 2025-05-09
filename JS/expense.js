import { auth, db, storage } from "../JS/firbase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const form = document.getElementById("expense-form");

let currentUser;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
  } else {
    alert("Please login first.");
    window.location.href = "login.html";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;
  const tags = document.getElementById("tags").value.split(",").map(tag => tag.trim());
  const note = document.getElementById("note").value;
  const receiptFile = document.getElementById("receipt").files[0];

  try {
    let receiptURL = "";
    if (receiptFile) {
      const storageRef = ref(storage, `receipts/${currentUser.uid}/${Date.now()}_${receiptFile.name}`);
      await uploadBytes(storageRef, receiptFile);
      receiptURL = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, "expenses"), {
      uid: currentUser.uid,
      amount: Number(amount),
      category,
      date,
      tags,
      note,
      receiptURL,
      createdAt: serverTimestamp()
    });

    alert("Expense added successfully!");
    form.reset();
  } catch (err) {
    console.error("Error adding expense:", err);
    alert("Failed to add expense.");
  }
});
