global.window = {};
global.document = { getElementById: () => ({}) };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

require('../js/dashboard-data.js');
require('../js/calculations.js');

async function testBudgetEngine() {
  const data = await window.BudgetTrackerData.getDashboardData();
  const calc = window.BudgetTrackerCalc;
  const budgetRes = calc.computeBudgets(data.transactions, data.budgets, 'JPY', '2026-08');

  console.log("=== COMPUTED BUDGETS FROM REAL ENGINE ===");
  budgetRes.budgets.forEach(b => {
    console.log(`${b.category.padEnd(20)} | Limit: ¥${b.budget.toLocaleString().padStart(7)} | Actual: ¥${b.actual.toLocaleString().padStart(7)} | Left: ¥${b.left.toLocaleString().padStart(7)} | Status: ${b.status} (${b.progress}%)`);
  });

  console.log("-----------------------------------------");
  console.log("TOTAL BUDGET : ¥" + budgetRes.totalBudget.toLocaleString());
  console.log("TOTAL ACTUAL : ¥" + budgetRes.totalActual.toLocaleString());
  console.log("TOTAL LEFT   : ¥" + budgetRes.totalLeft.toLocaleString());
}

testBudgetEngine();
