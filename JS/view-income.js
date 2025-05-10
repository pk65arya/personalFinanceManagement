import { auth, db } from "../JS/firbase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const incomeList = document.getElementById("incomeList");

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const q = query(collection(db, "income"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      incomeList.innerHTML = "<p>No income records found.</p>";
      return;
    }

    let html = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      html += `
        <div class="income-item" data-id="${docSnap.id}">
          <div class="income-info">
            <p><strong>Amount:</strong> $${data.amount}</p>
            <p><strong>Category:</strong> ${data.category || "N/A"}</p>
            <p><strong>Date:</strong> ${data.createdAt?.toDate().toLocaleString() || "Unknown"}</p>
          </div>
          <div>
            <button class="edit-btn" onclick="editIncome('${docSnap.id}', ${data.amount})">Edit</button>
            <button class="delete-btn" onclick="deleteIncome('${docSnap.id}')">Delete</button>
          </div>
        </div>
      `;
    });

    incomeList.innerHTML = html;
  } catch (error) {
    console.error("Error loading income data:", error);
    incomeList.innerHTML = "<p>Failed to load income records.</p>";
  }
});

window.deleteIncome = async function (id) {
  if (confirm("Are you sure you want to delete this income record?")) {
    try {
      await deleteDoc(doc(db, "income", id));
      location.reload();
    } catch (error) {
      alert("Error deleting income: " + error.message);
    }
  }
};

window.editIncome = async function (id, oldAmount) {
  const newAmount = prompt("Enter new income amount:", oldAmount);
  if (newAmount && !isNaN(newAmount)) {
    try {
      await updateDoc(doc(db, "income", id), { amount: parseFloat(newAmount) });
      location.reload();
    } catch (error) {
      alert("Error updating income: " + error.message);
    }
  }
};
