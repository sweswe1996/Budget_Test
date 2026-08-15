const fs = require('fs');

global.window = {};
global.document = { getElementById: () => ({}) };
global.localStorage = { getItem: () => null, setItem: () => {} };

require('../js/dashboard-data.js');
require('../js/calculations.js');

async function analyze() {
  const data = await window.BudgetTrackerData.getDashboardData();
  const txs = data.transactions;

  console.log("=== TRANSACTIONS PER MONTH ===");
  const months = {};
  txs.forEach(t => {
    if (t.cashFlow === "Expense") {
      const m = (t.date || '').slice(0, 7);
      if (!months[m]) months[m] = { count: 0, total: 0, items: [] };
      months[m].count++;
      months[m].total += Number(t.amount) || 0;
      months[m].items.push({ date: t.date, desc: t.description, cat: t.cashFlowType, amt: t.amount });
    }
  });

  Object.keys(months).sort().forEach(m => {
    console.log(`Month ${m}: ${months[m].count} expense txs, Total Expense: ¥${months[m].total.toLocaleString()}`);
  });

  // Calculate Operational Living Expenses by Month:
  console.log("\n=== OPERATIONAL LIVING EXPENSES (Filtered) ===");
  const livingMonths = {};
  txs.forEach(t => {
    if (t.cashFlow === "Expense" && (!t.currency || t.currency === "JPY")) {
      const type = String(t.cashFlowType || '').toLowerCase();
      const desc = String(t.description || '').toLowerCase();
      const detail = String(t.detail || t.cashFlowDetail || '').toLowerCase();
      if (!type.includes('lend') && !type.includes('exchange') && !type.includes('loan') && !desc.includes('loan past') && !detail.includes('previous used')) {
        const m = (t.date || '').slice(0, 7);
        if (!livingMonths[m]) livingMonths[m] = { total: 0, count: 0 };
        livingMonths[m].count++;
        livingMonths[m].total += Number(t.amount) || 0;
      }
    }
  });

  Object.keys(livingMonths).sort().forEach(m => {
    console.log(`Month ${m}: ${livingMonths[m].count} txs, Operational Spend: ¥${livingMonths[m].total.toLocaleString()}`);
  });
}

analyze();
