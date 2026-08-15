global.window = {};
global.document = { getElementById: () => ({}) };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

require('../js/dashboard-data.js');

async function checkMonths() {
  const data = await window.BudgetTrackerData.getDashboardData();
  const months = {};
  data.transactions.forEach(t => {
    const d = t.date || t.Date || '';
    const m = d.slice(0, 7);
    if (!months[m]) months[m] = { income: 0, expense: 0, count: 0 };
    months[m].count++;
    if (t.cashFlow === 'Income') months[m].income += Number(t.amount || 0);
    if (t.cashFlow === 'Expense') months[m].expense += Number(t.amount || 0);
  });
  console.log("=== TRANSACTIONS PER MONTH IN SHEET ===");
  console.table(months);
}

checkMonths();
