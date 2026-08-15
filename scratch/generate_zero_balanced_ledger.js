const fs = require('fs');

function generateZeroBalancedLedger() {
  const transactions = [];
  const months = [
    { ym: "2026-01", days: 31 },
    { ym: "2026-02", days: 28 },
    { ym: "2026-03", days: 31 },
    { ym: "2026-04", days: 30 },
    { ym: "2026-05", days: 31 },
    { ym: "2026-06", days: 30 },
    { ym: "2026-07", days: 31 },
    { ym: "2026-08", days: 15 }
  ];

  months.forEach(m => {
    const ym = m.ym;
    const pad = (d) => `${ym}-${String(d).padStart(2, '0')}`;

    // Total monthly living expense = 232,500 JPY
    // Monthly Income = 232,500 JPY (Exact 100% balance: Income = Expense)

    // 1. Monthly Income deposited to Bk-YUCHO_MG (232,500 JPY)
    transactions.push({
      date: pad(1), description: "Monthly Base Salary",
      cashFlow: "Income", cashFlowType: "Fixed_Income",
      fromSource: "-", toSource: "Bk-YUCHO_MG",
      amount: 232500, currency: "JPY",
      detail: "Salary1", forWho: "MG", status: "-", note: "Monthly Salary"
    });

    // MMK Income (1,000,000 MMK)
    transactions.push({
      date: pad(1), description: "Project Income",
      cashFlow: "Income", cashFlowType: "Business_Income",
      fromSource: "-", toSource: "KBZPay_MG",
      amount: 1000000, currency: "MMK",
      detail: "Tiktok", forWho: "MG", status: "-", note: "MMK Income"
    });

    // 2. Transfer from Bk-YUCHO_MG to Cash_MG (55,000 JPY)
    transactions.push({
      date: pad(2), description: "Cash Allowance Transfer",
      cashFlow: "Transfer", cashFlowType: "Transfer",
      fromSource: "Bk-YUCHO_MG", toSource: "Cash_MG",
      amount: 55000, currency: "JPY",
      detail: "Transfer", forWho: "MG", status: "-", note: "Cash for daily living"
    });

    // 3. Bank Expenses (Direct Debits: 52500 + 15000 + 70000 + 30000 + 5000 + 5000 = 177,500 JPY)
    // 232,500 - 55,000 transfer = 177,500 JPY (Bk-YUCHO_MG balance becomes EXACTLY 0!)
    transactions.push({
      date: pad(3), description: "Apartment Monthly Rent",
      cashFlow: "Expense", cashFlowType: "Fixed_Expenses",
      fromSource: "Bk-YUCHO_MG", toSource: "-",
      amount: 52500, currency: "JPY",
      detail: "Rent Housing Fee", forWho: "US", status: "Need", note: "House Rent"
    });

    transactions.push({
      date: pad(5), description: "Electricity & Utilities",
      cashFlow: "Expense", cashFlowType: "Bills_Utilities",
      fromSource: "Bk-YUCHO_MG", toSource: "-",
      amount: 15000, currency: "JPY",
      detail: "Electricity Bill", forWho: "US", status: "Need", note: "Bills"
    });

    transactions.push({
      date: pad(15), description: "National Insurance & Taxes",
      cashFlow: "Expense", cashFlowType: "Taxes_Insurance",
      fromSource: "Bk-YUCHO_MG", toSource: "-",
      amount: 70000, currency: "JPY",
      detail: "Health Insurance", forWho: "US", status: "Need", note: "Insurance & Tax"
    });

    transactions.push({
      date: pad(20), description: "Work Equipment & Supplies",
      cashFlow: "Expense", cashFlowType: "Work_Expenses",
      fromSource: "Bk-YUCHO_MG", toSource: "-",
      amount: 30000, currency: "JPY",
      detail: "Stationery", forWho: "MG", status: "Need", note: "Work Expenses"
    });

    transactions.push({
      date: pad(22), description: "Education & Courses",
      cashFlow: "Expense", cashFlowType: "Education",
      fromSource: "Bk-YUCHO_MG", toSource: "-",
      amount: 5000, currency: "JPY",
      detail: "Online Course", forWho: "MG", status: "Need", note: "Education"
    });

    transactions.push({
      date: pad(24), description: "Entertainment & Hobbies",
      cashFlow: "Expense", cashFlowType: "Entertainment",
      fromSource: "Bk-YUCHO_MG", toSource: "-",
      amount: 5000, currency: "JPY",
      detail: "Streaming", forWho: "US", status: "Want", note: "Entertainment"
    });

    // 4. Cash Expenses (from Cash_MG: 5000 + 30000 + 5000 + 10000 + 5000 = 55,000 JPY)
    // 55,000 Inflow - 55,000 Outflow = EXACTLY 0 JPY (Cash_MG balance becomes EXACTLY 0!)
    transactions.push({
      date: pad(8), description: "Monthly Transportation Fare",
      cashFlow: "Expense", cashFlowType: "Transportation",
      fromSource: "Cash_MG", toSource: "-",
      amount: 5000, currency: "JPY",
      detail: "Train", forWho: "US", status: "Need", note: "Commute Fare"
    });

    transactions.push({
      date: pad(10), description: "Food & Groceries",
      cashFlow: "Expense", cashFlowType: "Food_Expenses",
      fromSource: "Cash_MG", toSource: "-",
      amount: 30000, currency: "JPY",
      detail: "Cooking Food", forWho: "US", status: "Need", note: "Groceries"
    });

    transactions.push({
      date: pad(12), description: "Fashion & Clothing",
      cashFlow: "Expense", cashFlowType: "Fashion_Expenses",
      fromSource: "Cash_MG", toSource: "-",
      amount: 5000, currency: "JPY",
      detail: "Outfit Cloth", forWho: "US", status: "Want", note: "Clothes"
    });

    transactions.push({
      date: pad(14), description: "Daily Living Supplies",
      cashFlow: "Expense", cashFlowType: "Living_Expenses",
      fromSource: "Cash_MG", toSource: "-",
      amount: 10000, currency: "JPY",
      detail: "Daily Supplies", forWho: "US", status: "Need", note: "Living Supplies"
    });

    transactions.push({
      date: pad(16), description: "Healthcare & Medicine",
      cashFlow: "Expense", cashFlowType: "Healthcare",
      fromSource: "Cash_MG", toSource: "-",
      amount: 5000, currency: "JPY",
      detail: "Medicine", forWho: "US", status: "Need", note: "Healthcare"
    });

    // 5. MMK Expense (1,000,000 MMK from KBZPay_MG)
    // 1,000,000 Inflow - 1,000,000 Outflow = EXACTLY 0 MMK!
    transactions.push({
      date: pad(25), description: "Family Myanmar Living Support",
      cashFlow: "Expense", cashFlowType: "Family_Support",
      fromSource: "KBZPay_MG", toSource: "-",
      amount: 1000000, currency: "MMK",
      detail: "Living Support", forWho: "Mother", status: "Need", note: "MMK Family Support"
    });
  });

  return transactions;
}

const txs = generateZeroBalancedLedger();
fs.writeFileSync('scratch/zero_balanced_ledger.json', JSON.stringify(txs, null, 2));
console.log(`Generated ${txs.length} zero-balanced transactions (Income = Expense, all account balances = 0).`);
