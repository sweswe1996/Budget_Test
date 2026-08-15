global.window = {};
global.document = { getElementById: () => ({}) };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

require('../js/dashboard-data.js');
require('../js/calculations.js');

async function testRealMonthBudgets() {
  const data = await window.BudgetTrackerData.getDashboardData();
  const calc = window.BudgetTrackerCalc;

  ['2026-08', '2026-07', '2026-06', '2026-05'].forEach(m => {
    console.log(`\n=================== MONTH: ${m} ===================`);
    const budgetRes = calc.computeBudgets(data.transactions, data.budgets, 'JPY', m);
    budgetRes.budgets.forEach(b => {
      console.log(`${b.category.padEnd(20)} | Budget: ¥${b.budget.toLocaleString().padStart(7)} | Actual: ¥${b.actual.toLocaleString().padStart(7)} | Status: ${b.status} (${b.progress}%)`);
    });
    console.log(`TOTAL PLANNED: ¥${budgetRes.totalBudget.toLocaleString()} | TOTAL ACTUAL: ¥${budgetRes.totalActual.toLocaleString()}`);
  });
}

testRealMonthBudgets();
