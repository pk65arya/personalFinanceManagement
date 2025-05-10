import { auth, db } from '../JS/firbase-config.js';
import {
  collection,
  query,
  where,
  getDocs
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

const ctx = document.getElementById('monthly-chart').getContext('2d');

function formatMonthYear(dateStr) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// Wait for user to be authenticated
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  renderMonthlyChart(user.uid);
});

async function getMonthlySpendingData(userId) {
  try {
    const q = query(collection(db, 'expenses'), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const monthMap = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.date || isNaN(data.amount)) return;

      const monthKey = formatMonthYear(data.date);
      const amount = parseFloat(data.amount);

      if (monthMap[monthKey]) {
        monthMap[monthKey] += amount;
      } else {
        monthMap[monthKey] = amount;
      }
    });

    // Sort months
    const sortedMonths = Object.keys(monthMap).sort();
    const values = sortedMonths.map(m => monthMap[m]);

    return { months: sortedMonths, totals: values };
  } catch (error) {
    console.error('Error loading monthly data:', error);
    return { months: [], totals: [] };
  }
}

async function renderMonthlyChart(userId) {
  const { months, totals } = await getMonthlySpendingData(userId);

  if (months.length === 0) {
    document.querySelector('.chart-container').innerHTML += "<p>No data available.</p>";
    return;
  }

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Total Spending',
        data: totals,
        backgroundColor: '#36A2EB',
        borderColor: '#1E88E5',
        borderWidth: 1,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => `$${value}`
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}
