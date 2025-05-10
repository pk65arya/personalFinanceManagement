import { auth, db } from "../JS/firbase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const recurringPaymentForm = document.getElementById("recurringPaymentForm");
const recurringPaymentsDisplay = document.getElementById(
  "recurringPaymentsDisplay"
);


recurringPaymentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user)
    return alert("You need to be logged in to add a recurring payment");

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

    alert("Recurring Payment added successfully!");
    displayRecurringPayments(); 
  } catch (error) {
    console.error("Error adding recurring payment: ", error);
  }
});


async function displayRecurringPayments() {
  const user = auth.currentUser;
  if (!user) return;

  const recurringPaymentsQuery = query(
    collection(db, "recurringPayments"),
    where("userId", "==", user.uid)
  );
  const recurringPaymentsSnapshot = await getDocs(recurringPaymentsQuery);

  let html = "";
  recurringPaymentsSnapshot.forEach((doc) => {
    const payment = doc.data();
    html += `
      <div class="payment-card">
        <h4>${payment.paymentName}</h4>
        <p><strong>Amount:</strong> $${payment.amount}</p>
        <p><strong>Category:</strong> ${payment.category}</p>
        <p><strong>Frequency:</strong> ${payment.frequency}</p>
        <p><strong>Start Date:</strong> ${payment.startDate}</p>
        <p><strong>End Date:</strong> ${payment.endDate || "Ongoing"}</p>
      </div>
    `;
  });

  recurringPaymentsDisplay.innerHTML =
    html || "<p>No recurring payments added yet.</p>";
}


 displayRecurringPayments();
