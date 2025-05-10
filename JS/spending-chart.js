import { db } from '../JS/firbase-config.js';
import {
  collection,
  query,
  where,
  getDocs
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

const spendingChartElement = document.getElementById('spending-chart').getContext('2d');

async function getSpendingData() {
  try {
    const q = query(collection(db, 'expenses'));
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

async function createChart() {
  const data = await getSpendingData();
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

createChart();
