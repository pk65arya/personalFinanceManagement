import { auth, db } from '../JS/firbase-config.js';
import {
  collection,
  query,
  where,
  getDocs
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

const spendingChartElement = document.getElementById('spending-chart').getContext('2d');

// Wait for user to be authenticated
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html"; // redirect if not logged in
    return;
  }
  await createChart(user.uid);
});

async function getSpendingData(userId) {
  try {
    const q = query(collection(db, 'expenses'), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const categoryData = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.category || isNaN(data.amount)) return;

      const category = data.category;
      const amount = parseFloat(data.amount);

      if (categoryData[category]) {
        categoryData[category] += amount;
      } else {
        categoryData[category] = amount;
      }
    });

    return categoryData;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return {};
  }
}

async function createChart(userId) {
  const data = await getSpendingData(userId);
  const categories = Object.keys(data);
  const amounts = Object.values(data);

  if (categories.length === 0) {
    document.querySelector('.chart-container').innerHTML += "<p>No expense data available.</p>";
    return;
  }

  new Chart(spendingChartElement, {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [{
        label: 'Spending by Category',
        data: amounts,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56',
          '#4BC0C0', '#9966FF', '#FF9F40'
        ],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}
