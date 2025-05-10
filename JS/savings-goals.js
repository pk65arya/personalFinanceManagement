import { auth, db } from "../JS/firbase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const goalForm = document.getElementById("goalForm");
const goalsList = document.getElementById("goalsList");


goalForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const goalName = document.getElementById("goalName").value;
  const targetAmount = parseFloat(document.getElementById("targetAmount").value);
  const savedAmount = parseFloat(document.getElementById("savedAmount").value);

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        await addDoc(collection(db, "savingsGoals"), {
          userId: user.uid,
          goalName,
          targetAmount,
          savedAmount,
          createdAt: Timestamp.now(),
        });
        goalForm.reset();
        displayGoals();
      } catch (error) {
        console.error("Error adding goal:", error);
      }
    } else {
      window.location.href = "login.html";
    }
  });
});


async function displayGoals() {
  goalsList.innerHTML = "<p>Loading goals...</p>";

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    try {
      const q = query(collection(db, "savingsGoals"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        goalsList.innerHTML = "<p>No savings goals found.</p>";
        return;
      }

      let html = "";
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        const progress = ((data.savedAmount / data.targetAmount) * 100).toFixed(1);
        const isAchieved = data.savedAmount >= data.targetAmount;

        html += `
          <div class="goal-card">
            <h4 contenteditable="true" class="editable" id="goalName-${id}">${data.goalName}</h4>
            <p>
              Saved: $<input type="number" id="savedAmount-${id}" value="${data.savedAmount}" />
              / $<input type="number" id="targetAmount-${id}" value="${data.targetAmount}" />
            </p>
            <div class="progress-bar">
              <div class="progress" style="width: ${progress}%;"></div>
            </div>
            ${isAchieved ? `<p class="goal-achieved">🎉 Goal Achieved!</p>` : ""}
            <button onclick="updateGoal('${id}')">Update</button>
            <button onclick="deleteGoal('${id}')">Delete</button>
          </div>
        `;
      });

      goalsList.innerHTML = html;

    } catch (error) {
      console.error("Error fetching goals:", error);
      goalsList.innerHTML = "<p>Error loading goals.</p>";
    }
  });
}

// Update goal
window.updateGoal = async function (id) {
  const name = document.getElementById(`goalName-${id}`).innerText;
  const saved = parseFloat(document.getElementById(`savedAmount-${id}`).value);
  const target = parseFloat(document.getElementById(`targetAmount-${id}`).value);

  try {
    await updateDoc(doc(db, "savingsGoals", id), {
      goalName: name,
      savedAmount: saved,
      targetAmount: target,
    });
    displayGoals();
  } catch (error) {
    console.error("Error updating goal:", error);
  }
};

// Delete goal
window.deleteGoal = async function (id) {
  try {
    await deleteDoc(doc(db, "savingsGoals", id));
    displayGoals();
  } catch (error) {
    console.error("Error deleting goal:", error);
  }
};

// Initial load
displayGoals();
