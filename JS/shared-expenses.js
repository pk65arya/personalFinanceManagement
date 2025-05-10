import { auth, db } from '../JS/firbase-config.js';

const form = document.getElementById('createGroupForm');
const groupNameInput = document.getElementById('groupName');
const memberEmailsInput = document.getElementById('memberEmails');
const groupsList = document.getElementById('groupsList');

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const groupName = groupNameInput.value.trim();
    const emails = memberEmailsInput.value.split(',').map(e => e.trim().toLowerCase());
    const members = [user.email, ...emails];

    const userSnaps = await Promise.all(
      members.map(email => db.collection('users').where('email', '==', email).get())
    );

    const memberIds = [];
    userSnaps.forEach(snap => {
      snap.forEach(doc => memberIds.push(doc.id));
    });

    if (memberIds.length < 2) {
      alert("Please add at least one valid member.");
      return;
    }

    await db.collection('sharedGroups').add({
      groupName,
      createdBy: user.uid,
      members: memberIds,
      createdAt: new Date()
    });

    groupNameInput.value = '';
    memberEmailsInput.value = '';
    loadGroups(user.uid);
  });

  loadGroups(user.uid);
});

async function loadGroups(uid) {
  groupsList.innerHTML = '';
  const groups = await db.collection('sharedGroups').where('members', 'array-contains', uid).get();
  groups.forEach(doc => {
    const data = doc.data();
    const div = document.createElement('div');
    div.innerHTML = `
      <h3>${data.groupName}</h3>
      <button onclick="window.location.href='shared-expense-details.html?groupId=${doc.id}'">Manage Expenses</button>
    `;
    groupsList.appendChild(div);
  });
}
