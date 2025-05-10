import { auth, db } from "../JS/firbase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const recurringPaymentForm = document.getElementById("recurringPaymentForm");
const recurringPaymentsDisplay = document.getElementById("recurringPaymentsDisplay");

recurringPaymentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to add a payment.");
    return;
  }

  const paymentName = document.getElementById("paymentName").value;
  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const frequency = document.getElementById("frequency").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  try {
    await addDoc(collection(db, "recurringPayments"), {
      paymentName,
      amount,
      category,
      frequency,
      startDate,
      endDate: endDate || null,
      userId: user.uid,
    });

    alert("Recurring payment added!");
    recurringPaymentForm.reset();
    displayRecurringPayments();
  } catch (error) {
    console.error("Error adding payment: ", error);
    alert("Failed to add recurring payment.");
  }
});

async function displayRecurringPayments() {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(
    collection(db, "recurringPayments"),
    where("userId", "==", user.uid)
  );
  const querySnapshot = await getDocs(q);

  let html = "";
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    html += `
      <div class="payment-card">
        <h4>${data.paymentName}</h4>
        <p><strong>Amount:</strong> $${data.amount}</p>
        <p><strong>Category:</strong> ${data.category}</p>
        <p><strong>Frequency:</strong> ${data.frequency}</p>
        <p><strong>Start:</strong> ${data.startDate}</p>
        <p><strong>End:</strong> ${data.endDate || "Ongoing"}</p>
      </div>
    `;
  });

  recurringPaymentsDisplay.innerHTML =
    html || "<p>No recurring payments found.</p>";
}

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    displayRecurringPayments();
  } else {
    alert("Please log in to view your recurring payments.");
  }
});

