global.window = {};
global.document = {
  getElementById: (id) => ({
    getContext: () => ({}),
    innerHTML: '',
    appendChild: () => {}
  })
};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.Chart = function() {};
Chart.getChart = () => null;
Chart.defaults = { font: {} };

require('../js/dashboard-data.js');
require('../js/calculations.js');
require('../js/charts.js');
require('../js/views/budget.js');
require('../js/views/overview.js');
require('../js/views/spending.js');

async function testDateRangeFilter() {
  const data = await window.BudgetTrackerData.getDashboardData();
  const calc = window.BudgetTrackerCalc;

  console.log("=== TOTAL TRANSACTIONS:", data.transactions.length);

  // 1. Test July 2026 filter
  const julFilter = { startDate: '2026-07-01', endDate: '2026-07-31', currency: 'JPY', forWho: 'all', category: 'all' };
  const julTx = calc.filterTransactions(data.transactions, julFilter);
  const julBudget = calc.computeBudgets(julTx, data.budgets, 'JPY', '2026-07');
  console.log("\n[JULY 2026]");
  console.log("Transactions count:", julTx.length);
  console.log("Total Actual Spend:", julBudget.totalActual);
  console.log("Total Budget Cap:", julBudget.totalBudget);
  console.log("Overall Status:", julBudget.overallProgress + "%");

  // 2. Test August 2026 filter
  const augFilter = { startDate: '2026-08-01', endDate: '2026-08-31', currency: 'JPY', forWho: 'all', category: 'all' };
  const augTx = calc.filterTransactions(data.transactions, augFilter);
  const augBudget = calc.computeBudgets(augTx, data.budgets, 'JPY', '2026-08');
  console.log("\n[AUGUST 2026]");
  console.log("Transactions count:", augTx.length);
  console.log("Total Actual Spend:", augBudget.totalActual);
  console.log("Total Budget Cap:", augBudget.totalBudget);
  console.log("Overall Status:", augBudget.overallProgress + "%");

  // 3. Test Custom 7-Day filter (Aug 1 to Aug 7)
  const customFilter = { startDate: '2026-08-01', endDate: '2026-08-07', currency: 'JPY', forWho: 'all', category: 'all' };
  const customTx = calc.filterTransactions(data.transactions, customFilter);
  const customBudget = calc.computeBudgets(customTx, data.budgets, 'JPY', '2026-08');
  console.log("\n[CUSTOM: AUG 1 - AUG 7]");
  console.log("Transactions count:", customTx.length);
  console.log("Total Actual Spend:", customBudget.totalActual);
}

testDateRangeFilter();
