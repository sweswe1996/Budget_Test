global.window = {};
global.document = { getElementById: () => ({}) };
global.localStorage = { getItem: () => null, setItem: () => {} };

require('../js/dashboard-data.js');
require('../js/calculations.js');

async function listAllAccounts() {
  const data = await window.BudgetTrackerData.getDashboardData();
  const calc = window.BudgetTrackerCalc;
  const accounts = calc.computeAccountBalances(data.transactions, data.accounts);

  console.log("=== TOTAL CONNECTED ACCOUNTS:", accounts.length);
  
  const banks = accounts.filter(a => a.type === 'Bank');
  const wallets = accounts.filter(a => a.type === 'Cash' || a.type === 'Wallet');
  const credits = accounts.filter(a => a.type === 'Credit Card');

  console.log("\n--- 🏦 BANK ACCOUNTS (" + banks.length + ") ---");
  banks.forEach(a => {
    console.log(`[${a.currency}] ${a.name.padEnd(20)} | Inflow: +${a.incomeSum + a.transferIn} | Outflow: -${a.expenseSum + a.transferOut} | Live Balance: ${a.liveBalance >= 0 ? '+' : ''}${a.liveBalance}`);
  });

  console.log("\n--- 🟢 CASH & WALLETS (" + wallets.length + ") ---");
  wallets.forEach(a => {
    console.log(`[${a.currency}] ${a.name.padEnd(20)} | Inflow: +${a.incomeSum + a.transferIn} | Outflow: -${a.expenseSum + a.transferOut} | Live Balance: ${a.liveBalance >= 0 ? '+' : ''}${a.liveBalance}`);
  });

  console.log("\n--- 💳 CREDIT CARDS (" + credits.length + ") ---");
  credits.forEach(a => {
    console.log(`[${a.currency}] ${a.name.padEnd(20)} | Charges: +${a.expenseSum + a.transferOut} | Payments: -${a.incomeSum + a.transferIn} | Used Balance: ${a.liveBalance}`);
  });
}

listAllAccounts();
