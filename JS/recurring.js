import { auth, db } from "../JS/firbase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const recurringForm = document.getElementById("recurring-form");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please log in to access this feature.");
    window.location.href = "login.html";
    return;
  }

  recurringForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const paymentName = document.getElementById("payment-name").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const frequency = document.getElementById("frequency").value;
    const startDate = document.getElementById("start-date").value;
    const note = document.getElementById("note").value.trim();

    try {
      await addDoc(collection(db, 'recurringPayments'), {
        userId:user.uid,
        paymentName,
        amount,
        frequency,
        startDate,
        note,
        createdAt: serverTimestamp()
      });

      alert("Recurring payment saved!");
      recurringForm.reset();
    } catch (err) {
      console.error("Recurring Payment Error:", err);
      alert("Error: " + err.message);
    }
  });
});
