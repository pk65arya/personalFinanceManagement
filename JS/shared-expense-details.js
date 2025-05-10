import { auth, db } from '../JS/firbase-config.js';

const groupId = new URLSearchParams(window.location.search).get('groupId');
const groupTitle = document.getElementById('groupTitle');
const expenseForm = document.getElementById('expenseForm');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const expenseList = document.getElementById('expenseList');

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const groupRef = db.collection('sharedGroups').doc(groupId);
  const groupDoc = await groupRef.get();

  if (!groupDoc.exists) {
    alert('Group not found.');
    window.location.href = 'shared-expenses.html';
    return;
  }

  const group = groupDoc.data();
  groupTitle.textContent = `Group: ${group.groupName}`;

  expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (!description || isNaN(amount) || amount <= 0) return;

    await groupRef.collection('sharedExpenses').add({
      description,
      amount,
      paidBy: user.uid,
      splitBetween: group.members,
      timestamp: new Date()
    });

    descriptionInput.value = '';
    amountInput.value = '';
    loadExpenses();
  });

  loadExpenses();

  async function loadExpenses() {
    expenseList.innerHTML = '';
    const expenses = await groupRef.collection('sharedExpenses').orderBy('timestamp', 'desc').get();
    expenses.forEach(doc => {
      const data = doc.data();
      const perPerson = (data.amount / data.splitBetween.length).toFixed(2);
      const li = document.createElement('li');
      li.textContent = `${data.description} - ₹${data.amount} split among ${data.splitBetween.length} members (₹${perPerson}/person)`;
      expenseList.appendChild(li);
    });
  }
});
