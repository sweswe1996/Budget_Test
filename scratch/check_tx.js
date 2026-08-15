global.window = {};
global.localStorage = { getItem: () => null, setItem: () => {} };
require('../js/dashboard-data.js');
require('../js/calculations.js');

async function test() {
  const data = await window.BudgetTrackerData.getDashboardData();
  console.log("Total txs:", data.transactions.length);
  
  // Group by cashFlow
  const byCashFlow = {};
  data.transactions.forEach(t => {
    byCashFlow[t.cashFlow] = (byCashFlow[t.cashFlow] || 0) + t.amount;
  });
  console.log("By cashflow:", byCashFlow);

  // Group expenses by cashFlowType
  const expByType = {};
  data.transactions.filter(t => t.cashFlow === "Expense").forEach(t => {
    expByType[t.cashFlowType] = (expByType[t.cashFlowType] || 0) + t.amount;
  });
  console.log("Expenses by type:", expByType);

  // Budgets computation for JPY
  const res = window.BudgetTrackerCalc.computeBudgets(data.transactions, data.budgets, "JPY");
  console.log("Computed budgets:", JSON.stringify(res, null, 2));
}

test();
