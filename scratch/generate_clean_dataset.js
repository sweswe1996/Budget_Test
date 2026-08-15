const fs = require('fs');

function generateTransactions() {
  const transactions = [];
  const months = [
    { year: 2026, month: 1, name: "2026-01", days: 31 },
    { year: 2026, month: 2, name: "2026-02", days: 28 },
    { year: 2026, month: 3, name: "2026-03", days: 31 },
    { year: 2026, month: 4, name: "2026-04", days: 30 },
    { year: 2026, month: 5, name: "2026-05", days: 31 },
    { year: 2026, month: 6, name: "2026-06", days: 30 },
    { year: 2026, month: 7, name: "2026-07", days: 31 },
    { year: 2026, month: 8, name: "2026-08", days: 15 } // Up to Aug 15
  ];

  months.forEach((mInfo, idx) => {
    const ym = mInfo.name;
    const pad = (d) => `${ym}-${String(d).padStart(2, '0')}`;

    // 1. Initial Salary / Opening Income (on 1st for Jan, on 25th for regular months)
    if (idx === 0) {
      // Jan 1: Initial starting salary deposit
      transactions.push({
        date: pad(1), description: "Starting Base Salary",
        cashFlow: "Income", cashFlowType: "Fixed_Income",
        fromSource: "-", toSource: "Bk-YUCHO_MG",
        amount: 350000, currency: "JPY",
        detail: "Salary1", forWho: "MG", status: "-", note: "Jan Initial Base Salary"
      });
      transactions.push({
        date: pad(1), description: "Starting Project Income",
        cashFlow: "Income", cashFlowType: "Business_Income",
        fromSource: "-", toSource: "KBZPay_MG",
        amount: 1500000, currency: "MMK",
        detail: "Tiktok", forWho: "MG", status: "-", note: "Jan MMK Income"
      });
    }

    // 2. Monthly Internal Transfers (on 2nd of month)
    // Withdraw 50,000 JPY cash to cover 44,000 JPY cash expenses
    transactions.push({
      date: pad(2), description: "ATM Cash Withdrawal",
      cashFlow: "Transfer", cashFlowType: "Transfer",
      fromSource: "Bk-YUCHO_MG", toSource: "Cash_MG",
      amount: 50000, currency: "JPY",
      detail: "Transfer", forWho: "MG", status: "-", note: "Monthly Cash Allowance"
    });

    transactions.push({
      date: pad(2), description: "Monthly Pocket Transfer",
      cashFlow: "Transfer", cashFlowType: "Transfer",
      fromSource: "Bk-YUCHO_MG", toSource: "YUCHO_CS",
      amount: 20000, currency: "JPY",
      detail: "Transfer", forWho: "CS", status: "-", note: "CS Pocket Money"
    });

    // 3. Fixed Expenses - Rent (on 3rd of month)
    transactions.push({
      date: pad(3), description: "Apartment Monthly Rent",
      cashFlow: "Expense", cashFlowType: "Fixed_Expenses",
      fromSource: "Bk-YUCHO_MG", toSource: "-",
      amount: 52500, currency: "JPY",
      detail: "Rent Housing Fee", forWho: "US", status: "Need", note: "Monthly House Rent"
    });

    // 4. Bills & Utilities (on 5th & 6th of month)
    transactions.push({
      date: pad(5), description: "Electricity Bill",
      cashFlow: "Expense", cashFlowType: "Bills_Utilities",
      fromSource: "Bk-YUCHO_MG", toSource: "-",
      amount: 6200, currency: "JPY",
      detail: "Electricity Bill", forWho: "US", status: "Need", note: "Power Bill"
    });
    transactions.push({
      date: pad(5), description: "City Gas Bill",
      cashFlow: "Expense", cashFlowType: "Bills_Utilities",
      fromSource: "Bk-YUCHO_MG", toSource: "-",
      amount: 3800, currency: "JPY",
      detail: "Gas Bill", forWho: "US", status: "Need", note: "Gas Utility"
    });
    transactions.push({
      date: pad(6), description: "High-Speed Internet Bill",
      cashFlow: "Expense", cashFlowType: "Bills_Utilities",
      fromSource: "Bk-YUCHO_MG", toSource: "-",
      amount: 4800, currency: "JPY",
      detail: "Internet Bill", forWho: "US", status: "Need", note: "Home Fiber"
    });

    // 5. Groceries & Cooking Food (throughout the month)
    transactions.push({
      date: pad(7), description: "Supermarket Cooking Groceries",
      cashFlow: "Expense", cashFlowType: "Food_Expenses",
      fromSource: "Cash_MG", toSource: "-",
      amount: 7500, currency: "JPY",
      detail: "Cooking Food", forWho: "US", status: "Need", note: "Week 1 Food"
    });
    transactions.push({
      date: pad(14), description: "Meat & Vegetables Groceries",
      cashFlow: "Expense", cashFlowType: "Food_Expenses",
      fromSource: "Cash_MG", toSource: "-",
      amount: 8200, currency: "JPY",
      detail: "Cooking Food", forWho: "US", status: "Need", note: "Week 2 Food"
    });
    transactions.push({
      date: pad(21), description: "Dining Out & Dinner",
      cashFlow: "Expense", cashFlowType: "Food_Expenses",
      fromSource: "Cash_MG", toSource: "-",
      amount: 7800, currency: "JPY",
      detail: "Dining Out", forWho: "US", status: "Want", note: "Family Dinner"
    });
    if (mInfo.days >= 28) {
      transactions.push({
        date: pad(28), description: "Snacks & Groceries",
        cashFlow: "Expense", cashFlowType: "Food_Expenses",
        fromSource: "Cash_MG", toSource: "-",
        amount: 5500, currency: "JPY",
        detail: "Snacks & Drinks", forWho: "US", status: "Need", note: "Week 4 Food"
      });
    }

    // 6. Transportation (Train & IC Pass)
    transactions.push({
      date: pad(8), description: "Monthly Train Pass / Fare",
      cashFlow: "Expense", cashFlowType: "Transportation",
      fromSource: "Cash_MG", toSource: "-",
      amount: 4200, currency: "JPY",
      detail: "Train", forWho: "US", status: "Need", note: "Commute Pass"
    });

    // 7. Living Supplies & Cleaning Items
    transactions.push({
      date: pad(9), description: "Kitchen & Daily Supplies",
      cashFlow: "Expense", cashFlowType: "Living_Expenses",
      fromSource: "Cash_MG", toSource: "-",
      amount: 4500, currency: "JPY",
      detail: "Daily Supplies", forWho: "US", status: "Need", note: "Home Essentials"
    });
    transactions.push({
      date: pad(18), description: "Laundry & Bathroom Items",
      cashFlow: "Expense", cashFlowType: "Living_Expenses",
      fromSource: "Cash_MG", toSource: "-",
      amount: 3800, currency: "JPY",
      detail: "Laundry Items", forWho: "US", status: "Need", note: "Detergent & Tissue"
    });

    // 8. Fashion & Clothing
    transactions.push({
      date: pad(11), description: "Daily Clothes & Shoes",
      cashFlow: "Expense", cashFlowType: "Fashion_Expenses",
      fromSource: "Crd-MUFG_MG", toSource: "-",
      amount: 4500, currency: "JPY",
      detail: "Outfit Cloth", forWho: "US", status: "Want", note: "Casual Wear"
    });

    // 9. Taxes & Insurance
    transactions.push({
      date: pad(15), description: "National Health Insurance & Pension",
      cashFlow: "Expense", cashFlowType: "Taxes_Insurance",
      fromSource: "Bk-YUCHO_MG", toSource: "-",
      amount: 45000, currency: "JPY",
      detail: "Health Insurance", forWho: "US", status: "Need", note: "Monthly Social Insurance"
    });

    // 10. Education & Books
    transactions.push({
      date: pad(16), description: "Technical Books & Online Course",
      cashFlow: "Expense", cashFlowType: "Education",
      fromSource: "Bk-YUCHO_MG", toSource: "-",
      amount: 4200, currency: "JPY",
      detail: "Online Course", forWho: "MG", status: "Need", note: "Skill Upgrade"
    });

    // 11. Healthcare & Medicine
    transactions.push({
      date: pad(17), description: "Clinic & Pharmacy Medicine",
      cashFlow: "Expense", cashFlowType: "Healthcare",
      fromSource: "Cash_MG", toSource: "-",
      amount: 3200, currency: "JPY",
      detail: "Medicine", forWho: "US", status: "Need", note: "Vitamin & Medicine"
    });

    // 12. Entertainment & Subscriptions
    transactions.push({
      date: pad(19), description: "Streaming & Entertainment",
      cashFlow: "Expense", cashFlowType: "Entertainment",
      fromSource: "Crd-MUFG_MG", toSource: "-",
      amount: 3500, currency: "JPY",
      detail: "Streaming", forWho: "US", status: "Want", note: "Monthly Entertainment"
    });

    // 13. Work Expenses
    transactions.push({
      date: pad(20), description: "Office Stationery & Printing",
      cashFlow: "Expense", cashFlowType: "Work_Expenses",
      fromSource: "Bk-YUCHO_MG", toSource: "-",
      amount: 4800, currency: "JPY",
      detail: "Stationery", forWho: "MG", status: "Need", note: "Work Supplies"
    });

    // 14. Family Support
    transactions.push({
      date: pad(22), description: "Family Living Support",
      cashFlow: "Expense", cashFlowType: "Family_Support",
      fromSource: "Bk-YUCHO_MG", toSource: "-",
      amount: 30000, currency: "JPY",
      detail: "Living Support", forWho: "Mother", status: "Need", note: "Monthly Family Support"
    });

    // 15. Monthly Salary on 25th
    if (mInfo.days >= 25) {
      transactions.push({
        date: pad(25), description: "Monthly Base Salary",
        cashFlow: "Income", cashFlowType: "Fixed_Income",
        fromSource: "-", toSource: "Bk-YUCHO_MG",
        amount: 320000, currency: "JPY",
        detail: "Salary1", forWho: "MG", status: "-", note: "Monthly Salary Deposit"
      });
      transactions.push({
        date: pad(25), description: "Performance Bonus / Extra",
        cashFlow: "Income", cashFlowType: "Extra_Income",
        fromSource: "-", toSource: "Bk-YUCHO_MG",
        amount: 30000, currency: "JPY",
        detail: "Bonus", forWho: "MG", status: "-", note: "Monthly Performance Extra"
      });
      transactions.push({
        date: pad(25), description: "Online Business Income",
        cashFlow: "Income", cashFlowType: "Business_Income",
        fromSource: "-", toSource: "KBZPay_MG",
        amount: 800000, currency: "MMK",
        detail: "Tiktok", forWho: "MG", status: "-", note: "Monthly Online Income"
      });

      // 16. Credit Card Payoff Settlement (Paying off Card from Bank)
      transactions.push({
        date: pad(27), description: "Credit Card Auto Payoff",
        cashFlow: "Transfer", cashFlowType: "Transfer",
        fromSource: "Bk-YUCHO_MG", toSource: "Crd-MUFG_MG",
        amount: 8000, currency: "JPY",
        detail: "Transfer", forWho: "MG", status: "-", note: "Credit Card Settlement"
      });

      // 17. Savings Goal Deposit (Laptop Savings Goal)
      transactions.push({
        date: pad(28), description: "Laptop Goal Savings",
        cashFlow: "Transfer", cashFlowType: "Savings_Investments",
        fromSource: "Bk-YUCHO_MG", toSource: "Bk-YUCHO_MG",
        amount: 25000, currency: "JPY",
        detail: "Laptop", forWho: "MG", status: "-", note: "Laptop Savings Deposit"
      });
    }
  });

  return transactions;
}

const txs = generateTransactions();
fs.writeFileSync('scratch/generated_clean_ledger.json', JSON.stringify(txs, null, 2));
console.log(`Generated ${txs.length} transactions from Jan 2026 to Aug 2026.`);
