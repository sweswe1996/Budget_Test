const fs = require('fs');

global.window = {};
global.document = { getElementById: () => ({}) };
global.localStorage = { getItem: () => null, setItem: () => {} };

require('../js/dashboard-data.js');
require('../js/calculations.js');

async function testCleanLedger() {
  const calc = window.BudgetTrackerCalc;
  const rawTxs = JSON.parse(fs.readFileSync('scratch/generated_clean_ledger.json', 'utf8'));

  // Normalize txs format
  const txs = rawTxs.map((t, idx) => ({
    id: 1000 + idx,
    date: t.date,
    description: t.description,
    cashFlow: t.cashFlow,
    cashFlowType: t.cashFlowType,
    fromSource: t.fromSource,
    toSource: t.toSource,
    amount: t.amount,
    currency: t.currency,
    detail: t.detail,
    forWho: t.forWho,
    status: t.status,
    note: t.note,
    classification: t.cashFlow === "Income" ? "income" : t.cashFlow === "Expense" ? "expense" : "transfer"
  }));

  console.log("=== TOTAL CLEAN TRANSACTIONS:", txs.length);

  // 1. Account Balances across all time
  const accounts = calc.computeAccountBalances(txs);
  console.log("\n=== ACCOUNT BALANCES (LIFETIME) ===");
  accounts.forEach(a => {
    console.log(`[${a.currency}] ${a.type.padEnd(12)} | ${a.name.padEnd(16)} | Balance: ${a.liveBalance >= 0 ? '+' : ''}${calc.formatCurrency(a.liveBalance, a.currency)}`);
  });

  // 2. Budget vs Actual for July 2026
  const julFilter = { startDate: '2026-07-01', endDate: '2026-07-31', currency: 'JPY' };
  const julTxs = calc.filterTransactions(txs, julFilter);
  const julBudgets = calc.computeBudgets(julTxs, null, 'JPY', '2026-07', 1);
  console.log("\n=== BUDGET VS ACTUAL (JULY 2026) ===");
  console.log("Total Budget Cap:", julBudgets.totalBudget);
  console.log("Total Actual Spend:", julBudgets.totalActual);
  console.log("Remaining:", julBudgets.totalLeft);
  console.log("Usage Progress:", julBudgets.overallProgress + "%");

  // 3. Budget vs Actual for August 2026
  const augFilter = { startDate: '2026-08-01', endDate: '2026-08-15', currency: 'JPY' };
  const augTxs = calc.filterTransactions(txs, augFilter);
  const augBudgets = calc.computeBudgets(augTxs, null, 'JPY', '2026-08', 1);
  console.log("\n=== BUDGET VS ACTUAL (AUGUST 2026 - MTD) ===");
  console.log("Total Budget Cap:", augBudgets.totalBudget);
  console.log("Total Actual Spend:", augBudgets.totalActual);
  console.log("Remaining:", augBudgets.totalLeft);
  console.log("Usage Progress:", augBudgets.overallProgress + "%");

  // 4. Goals
  const goals = calc.computeGoals(txs);
  console.log("\n=== SAVINGS GOALS ===");
  console.log("Total Target:", goals.totalTarget);
  console.log("Total Saved:", goals.totalSaved);
  console.log("Overall Progress:", goals.overallProgress + "%");
}

testCleanLedger();
