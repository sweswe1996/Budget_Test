const fs = require('fs');

global.window = {};
global.document = { getElementById: () => ({}) };
global.localStorage = { getItem: () => null, setItem: () => {} };

require('../js/dashboard-data.js');
require('../js/calculations.js');

async function testZeroBalances() {
  const calc = window.BudgetTrackerCalc;
  const rawTxs = JSON.parse(fs.readFileSync('scratch/zero_balanced_ledger.json', 'utf8'));

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

  console.log("=== TOTAL TRANSACTIONS:", txs.length);

  // 1. Account Balances
  const accounts = calc.computeAccountBalances(txs);
  console.log("\n=== ACCOUNT BALANCES (LIFETIME) ===");
  accounts.forEach(a => {
    console.log(`[${a.currency}] ${a.type.padEnd(12)} | ${a.name.padEnd(16)} | In: +${a.incomeSum + a.transferIn} | Out: -${a.expenseSum + a.transferOut} | Live Balance: ${calc.formatCurrency(a.liveBalance, a.currency)}`);
  });

  const jpyAccs = accounts.filter(a => a.currency === 'JPY');
  const totalJpyBank = jpyAccs.filter(a => a.type === 'Bank').reduce((s, a) => s + a.liveBalance, 0);
  const totalJpyCash = jpyAccs.filter(a => a.type !== 'Bank' && a.type !== 'Credit Card').reduce((s, a) => s + a.liveBalance, 0);
  const totalJpyCredit = jpyAccs.filter(a => a.type === 'Credit Card').reduce((s, a) => s + Math.abs(a.liveBalance), 0);

  console.log("\n=== JPY TOTALS ===");
  console.log("Household Balance (JPY):", calc.formatCurrency(totalJpyBank + totalJpyCash, 'JPY'));
  console.log("Bank Accounts (JPY):", calc.formatCurrency(totalJpyBank, 'JPY'));
  console.log("Cash & Wallets (JPY):", calc.formatCurrency(totalJpyCash, 'JPY'));
  console.log("Credit Cards Used (JPY):", calc.formatCurrency(totalJpyCredit, 'JPY'));

  const mmkAccs = accounts.filter(a => a.currency === 'MMK');
  const totalMmkCash = mmkAccs.filter(a => a.type !== 'Bank' && a.type !== 'Credit Card').reduce((s, a) => s + a.liveBalance, 0);
  console.log("\n=== MMK TOTALS ===");
  console.log("Household Balance (MMK):", calc.formatCurrency(totalMmkCash, 'MMK'));
}

testZeroBalances();
