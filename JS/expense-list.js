import { auth, db } from '../JS/firbase-config.js';


const expensesContainer = document.getElementById('expensesContainer');

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  await displayExpenses(user.uid);
});

async function displayExpenses(userId) {
  const expensesRef = db.collection('expenses').where('userId', '==', userId);
  const snapshot = await expensesRef.get();

  if (snapshot.empty) {
    expensesContainer.innerHTML = "<p>No expenses recorded yet.</p>";
    return;
  }

  snapshot.docs.forEach(doc => {
    const expense = doc.data();
    const expenseElement = document.createElement('div');
    expenseElement.classList.add('expense-item');
    expenseElement.innerHTML = `
      <div>
        <strong>${expense.category}</strong><br>
        ₹${expense.amount}<br>
        ${new Date(expense.date).toLocaleDateString()}<br>
        <small>Tag: ${expense.tag || 'None'}</small><br>
        <p><strong>Note:</strong> ${expense.note || 'No note'}</p>
      </div>
    `;
    expensesContainer.appendChild(expenseElement);
  });
}
