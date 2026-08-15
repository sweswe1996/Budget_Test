global.window = {};
global.document = { getElementById: () => ({}) };
global.localStorage = { getItem: () => null, setItem: () => {} };

require('../js/dashboard-data.js');
require('../js/calculations.js');

async function testRange() {
  const data = await window.BudgetTrackerData.getDashboardData();
  const calc = window.BudgetTrackerCalc;

  // 1. Test 3-month range (June to August)
  const rangeFilter = { startDate: '2026-06-01', endDate: '2026-08-31', currency: 'JPY', forWho: 'all', category: 'all' };
  const factor = calc.calculateMonthFactor(rangeFilter.startDate, rangeFilter.endDate);
  const txs = calc.filterTransactions(data.transactions, rangeFilter);
  const result = calc.computeBudgets(txs, data.budgets, 'JPY', '2026-08', factor);

  console.log("=== 3-MONTH RANGE (2026-06-01 to 2026-08-31) ===");
  console.log("Month Factor:", factor);
  console.log("Total Budget:", result.totalBudget);
  console.log("Total Actual:", result.totalActual);
  console.log("Total Left (Remaining):", result.totalLeft);
  console.log("Overall Progress:", result.overallProgress + "%");

  // 2. Test 1-month range (July 2026)
  const julFilter = { startDate: '2026-07-01', endDate: '2026-07-31', currency: 'JPY' };
  const julFactor = calc.calculateMonthFactor(julFilter.startDate, julFilter.endDate);
  const julTxs = calc.filterTransactions(data.transactions, julFilter);
  const julResult = calc.computeBudgets(julTxs, data.budgets, 'JPY', '2026-07', julFactor);
  console.log("\n=== 1-MONTH RANGE (JULY 2026) ===");
  console.log("Month Factor:", julFactor);
  console.log("Total Budget:", julResult.totalBudget);
  console.log("Total Actual:", julResult.totalActual);
  console.log("Total Left:", julResult.totalLeft);
  console.log("Overall Progress:", julResult.overallProgress + "%");
}

testRange();
