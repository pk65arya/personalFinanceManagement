import { auth, db } from '../JS/firbase-config.js';
import {
  collection,
  query,
  where,
  getDocs
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

function calculateTotalSpent(expenses) {
  return expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
}

function displayMilestone(total) {
  const section = document.getElementById('milestone-section');
  if (total >= 1000) {
    section.innerHTML = `
      <p>🎉 Congratulations! You’ve tracked over <strong>$${total.toFixed(2)}</strong> in expenses.</p>
      <button id="shareBtn">Share on Twitter</button>
    `;
    document.getElementById('shareBtn').addEventListener('click', () => {
      const text = encodeURIComponent(`I’ve tracked over $${total.toFixed(2)} in expenses with my Personal Finance Manager! #FinanceGoals`);
      const url = "https://your-finance-app.web.app"; 
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
    });
  } else {
    section.innerHTML = `<p>Keep going! You’re on your way to a savings milestone.</p>`;
  }
}

auth.onAuthStateChanged(async (user) => {
  if (!user) return;
  const q = query(collection(db, 'expenses'), where('userId', '==', user.uid));
  const snapshot = await getDocs(q);
  const expenses = snapshot.docs.map(doc => doc.data());
  const total = calculateTotalSpent(expenses);
  displayMilestone(total);
});
