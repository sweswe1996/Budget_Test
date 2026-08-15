global.window = {};
global.document = { getElementById: () => ({}) };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

require('../js/dashboard-data.js');
require('../js/calculations.js');

async function testEngine() {
  const data = await window.BudgetTrackerData.getDashboardData();
  const calc = window.BudgetTrackerCalc;
  const accounts = calc.computeAccountBalances(data.transactions, data.accounts);

  console.log("=== CALCULATED ACCOUNTS (ENGINE) ===");
  accounts.forEach(a => {
    console.log(`${a.name.padEnd(16)} [${a.type.padEnd(6)}] : ${calc.formatCurrency(a.liveBalance, a.currency)}`);
  });

  const jpyAccs = accounts.filter(a => a.currency === 'JPY');
  const totalHousehold = jpyAccs.filter(a => a.type !== 'Credit Card').reduce((s, a) => s + (a.liveBalance || 0), 0);
  const totalBank = jpyAccs.filter(a => a.type === 'Bank').reduce((s, a) => s + (a.liveBalance || 0), 0);
  const totalCash = jpyAccs.filter(a => a.type === 'Wallet' || a.type === 'Cash').reduce((s, a) => s + (a.liveBalance || 0), 0);
  const totalCredit = jpyAccs.filter(a => a.type === 'Credit Card').reduce((s, a) => s + Math.abs(a.liveBalance || 0), 0);

  console.log("---------------------------------------");
  console.log("HOUSEHOLD BALANCE (JPY) :", calc.formatCurrency(totalHousehold, 'JPY'));
  console.log("BANK ACCOUNTS (JPY)     :", calc.formatCurrency(totalBank, 'JPY'));
  console.log("CASH & WALLETS (JPY)    :", calc.formatCurrency(totalCash, 'JPY'));
  console.log("CREDIT CARDS USED (JPY) :", calc.formatCurrency(totalCredit, 'JPY'));
}

testEngine();
