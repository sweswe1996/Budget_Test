global.window = {};
global.localStorage = { getItem: () => null, setItem: () => {} };
require('../js/dashboard-data.js');

async function test() {
  const data = await window.BudgetTrackerData.getDashboardData();
  console.log("=== All Expense Transactions ===");
  data.transactions.filter(t => t.cashFlow === "Expense").forEach(t => {
    console.log(`${t.date} | ${t.description} | ${t.cashFlowType} | ${t.detail} | ¥${t.amount} (${t.currency})`);
  });
}

test();
