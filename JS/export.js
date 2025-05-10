import { auth, db } from '../JS/firbase-config.js';
import {
  collection,
  query,
  where,
  getDocs
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

function convertToCSV(data) {
  const headers = ['Title', 'Amount', 'Category', 'Date', 'Description'];
  const rows = data.map(item => [
    item.title || '',
    item.amount || '',
    item.category || '',
    item.date || '',
    item.description || ''
  ]);
  return [headers, ...rows].map(r => r.join(',')).join('\n');
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPDF(data) {
  const doc = new jspdf.jsPDF();
  doc.text("Expense Report", 14, 16);
  const headers = [['Title', 'Amount', 'Category', 'Date', 'Description']];
  const rows = data.map(item => [
    item.title || '',
    item.amount || '',
    item.category || '',
    item.date || '',
    item.description || ''
  ]);
  doc.autoTable({ head: headers, body: rows, startY: 20 });
  doc.save("expenses.pdf");
}

auth.onAuthStateChanged(async (user) => {
  if (!user) return;
  const q = query(collection(db, 'expenses'), where('userId', '==', user.uid));
  const snapshot = await getDocs(q);
  const expenses = snapshot.docs.map(doc => doc.data());

  document.getElementById('exportCSV').addEventListener('click', () => {
    const csv = convertToCSV(expenses);
    downloadCSV(csv, "expenses.csv");
  });

  document.getElementById('exportPDF').addEventListener('click', () => {
    downloadPDF(expenses);
  });
});
