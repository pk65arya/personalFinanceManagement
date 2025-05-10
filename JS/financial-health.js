import { db, auth } from './firbase-config.js';
import {
  collection, query, where, getDocs
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

const scoreValue = document.getElementById('scoreValue');
const scoreDescription = document.getElementById('scoreDescription');

async function calculateHealthScore(userId) {
  const [expensesSnap, incomesSnap, budgetsSnap] = await Promise.all([
    getDocs(query(collection(db, 'expenses'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'income'), where('userId', '==', userId))),
    getDocs(query(collection(db, 'budgets'), where('userId', '==', userId)))
  ]);

  let totalExpenses = 0;
  let totalIncome = 0;
  let totalBudget = 0;

  expensesSnap.forEach(doc => totalExpenses += Number(doc.data().amount));
  incomesSnap.forEach(doc => totalIncome += Number(doc.data().amount));
  budgetsSnap.forEach(doc => totalBudget += Number(doc.data().amount));


  const savings = totalIncome - totalExpenses;
  const savingsRatio = totalIncome ? savings / totalIncome : 0;
  const budgetEfficiency = totalBudget ? (1 - (totalExpenses / totalBudget)) : 0;


  let score = 50; 
  score += savingsRatio * 30;
  score += budgetEfficiency * 20;

  
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    description: getScoreDescription(score)
  };
}

function getScoreDescription(score) {
  if (score >= 80) return "Excellent! You're managing your finances very well.";
  if (score >= 60) return "Good. Some improvements can be made.";
  if (score >= 40) return "Fair. Try to reduce expenses or save more.";
  return "Needs improvement. Track your spending and create a savings plan.";
}


auth.onAuthStateChanged(async (user) => {
  if (user) {
    const { score, description } = await calculateHealthScore(user.uid);
    scoreValue.textContent = score;
    scoreDescription.textContent = description;
  } else {
    window.location.href = 'login.html';
  }
});
