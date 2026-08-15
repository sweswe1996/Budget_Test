global.window = {};
global.document = { getElementById: () => ({}) };
global.localStorage = { getItem: () => null, setItem: () => {} };

require('../js/dashboard-data.js');
require('../js/calculations.js');

async function testAccountsCurrency() {
  const data = await window.BudgetTrackerData.getDashboardData();
  const calc = window.BudgetTrackerCalc;

  const liveAccounts = calc.computeAccountBalances(data.transactions, data.accounts);
  console.log("Total accounts:", liveAccounts.length);

  const byCur = {};
  liveAccounts.forEach(a => {
    const c = a.currency || 'JPY';
    if (!byCur[c]) byCur[c] = { total: 0, bank: 0, cashWallet: 0, credit: 0, accounts: [] };
    const bal = a.liveBalance || 0;
    if (a.type === 'Bank') byCur[c].bank += bal, byCur[c].total += bal;
    else if (a.type === 'Cash' || a.type === 'Wallet') byCur[c].cashWallet += bal, byCur[c].total += bal;
    else if (a.type === 'Credit Card') byCur[c].credit += Math.abs(bal);
    byCur[c].accounts.push({ name: a.name, type: a.type, cur: a.currency, bal: a.liveBalance });
  });

  console.log("=== BALANCES BY CURRENCY ===");
  Object.keys(byCur).forEach(c => {
    console.log(`\nCurrency: [${c}]`);
    console.log(`  Household Total: ${c === 'JPY' ? '¥' : c === 'USD' ? '$' : 'Ks '}${byCur[c].total.toLocaleString()}`);
    console.log(`  Bank Accounts:   ${c === 'JPY' ? '¥' : c === 'USD' ? '$' : 'Ks '}${byCur[c].bank.toLocaleString()}`);
    console.log(`  Cash & Wallets:  ${c === 'JPY' ? '¥' : c === 'USD' ? '$' : 'Ks '}${byCur[c].cashWallet.toLocaleString()}`);
    console.log(`  Credit (Used):   ${c === 'JPY' ? '¥' : c === 'USD' ? '$' : 'Ks '}${byCur[c].credit.toLocaleString()}`);
    console.log(`  Accounts count:  ${byCur[c].accounts.length}`);
  });
}

testAccountsCurrency();
