/**
 * BudgetTracker - Centralized Data Provider (100% Zero-Balanced Financial Ledger)
 * Income = Expense, all accounts left money = 0
 */

window.BudgetTrackerData = (() => {
  // 1. Zero-Balanced Baseline Transactions (Income = Expense, Balances = 0)
  const workbookRows = [
  [
    "2026-01-01",
    "Monthly Base Salary",
    "Income",
    "Fixed_Income",
    "-",
    "Bk-YUCHO_MG",
    232500,
    "JPY",
    "Salary1",
    "MG",
    "-",
    "Monthly Salary"
  ],
  [
    "2026-01-01",
    "Project Income",
    "Income",
    "Business_Income",
    "-",
    "KBZPay_MG",
    1000000,
    "MMK",
    "Tiktok",
    "MG",
    "-",
    "MMK Income"
  ],
  [
    "2026-01-02",
    "Cash Allowance Transfer",
    "Transfer",
    "Transfer",
    "Bk-YUCHO_MG",
    "Cash_MG",
    55000,
    "JPY",
    "Transfer",
    "MG",
    "-",
    "Cash for daily living"
  ],
  [
    "2026-01-03",
    "Apartment Monthly Rent",
    "Expense",
    "Fixed_Expenses",
    "Bk-YUCHO_MG",
    "-",
    52500,
    "JPY",
    "Rent Housing Fee",
    "US",
    "Need",
    "House Rent"
  ],
  [
    "2026-01-05",
    "Electricity & Utilities",
    "Expense",
    "Bills_Utilities",
    "Bk-YUCHO_MG",
    "-",
    15000,
    "JPY",
    "Electricity Bill",
    "US",
    "Need",
    "Bills"
  ],
  [
    "2026-01-15",
    "National Insurance & Taxes",
    "Expense",
    "Taxes_Insurance",
    "Bk-YUCHO_MG",
    "-",
    70000,
    "JPY",
    "Health Insurance",
    "US",
    "Need",
    "Insurance & Tax"
  ],
  [
    "2026-01-20",
    "Work Equipment & Supplies",
    "Expense",
    "Work_Expenses",
    "Bk-YUCHO_MG",
    "-",
    30000,
    "JPY",
    "Stationery",
    "MG",
    "Need",
    "Work Expenses"
  ],
  [
    "2026-01-22",
    "Education & Courses",
    "Expense",
    "Education",
    "Bk-YUCHO_MG",
    "-",
    5000,
    "JPY",
    "Online Course",
    "MG",
    "Need",
    "Education"
  ],
  [
    "2026-01-24",
    "Entertainment & Hobbies",
    "Expense",
    "Entertainment",
    "Bk-YUCHO_MG",
    "-",
    5000,
    "JPY",
    "Streaming",
    "US",
    "Want",
    "Entertainment"
  ],
  [
    "2026-01-08",
    "Monthly Transportation Fare",
    "Expense",
    "Transportation",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Train",
    "US",
    "Need",
    "Commute Fare"
  ],
  [
    "2026-01-10",
    "Food & Groceries",
    "Expense",
    "Food_Expenses",
    "Cash_MG",
    "-",
    30000,
    "JPY",
    "Cooking Food",
    "US",
    "Need",
    "Groceries"
  ],
  [
    "2026-01-12",
    "Fashion & Clothing",
    "Expense",
    "Fashion_Expenses",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Outfit Cloth",
    "US",
    "Want",
    "Clothes"
  ],
  [
    "2026-01-14",
    "Daily Living Supplies",
    "Expense",
    "Living_Expenses",
    "Cash_MG",
    "-",
    10000,
    "JPY",
    "Daily Supplies",
    "US",
    "Need",
    "Living Supplies"
  ],
  [
    "2026-01-16",
    "Healthcare & Medicine",
    "Expense",
    "Healthcare",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Medicine",
    "US",
    "Need",
    "Healthcare"
  ],
  [
    "2026-01-25",
    "Family Myanmar Living Support",
    "Expense",
    "Family_Support",
    "KBZPay_MG",
    "-",
    1000000,
    "MMK",
    "Living Support",
    "Mother",
    "Need",
    "MMK Family Support"
  ],
  [
    "2026-02-01",
    "Monthly Base Salary",
    "Income",
    "Fixed_Income",
    "-",
    "Bk-YUCHO_MG",
    232500,
    "JPY",
    "Salary1",
    "MG",
    "-",
    "Monthly Salary"
  ],
  [
    "2026-02-01",
    "Project Income",
    "Income",
    "Business_Income",
    "-",
    "KBZPay_MG",
    1000000,
    "MMK",
    "Tiktok",
    "MG",
    "-",
    "MMK Income"
  ],
  [
    "2026-02-02",
    "Cash Allowance Transfer",
    "Transfer",
    "Transfer",
    "Bk-YUCHO_MG",
    "Cash_MG",
    55000,
    "JPY",
    "Transfer",
    "MG",
    "-",
    "Cash for daily living"
  ],
  [
    "2026-02-03",
    "Apartment Monthly Rent",
    "Expense",
    "Fixed_Expenses",
    "Bk-YUCHO_MG",
    "-",
    52500,
    "JPY",
    "Rent Housing Fee",
    "US",
    "Need",
    "House Rent"
  ],
  [
    "2026-02-05",
    "Electricity & Utilities",
    "Expense",
    "Bills_Utilities",
    "Bk-YUCHO_MG",
    "-",
    15000,
    "JPY",
    "Electricity Bill",
    "US",
    "Need",
    "Bills"
  ],
  [
    "2026-02-15",
    "National Insurance & Taxes",
    "Expense",
    "Taxes_Insurance",
    "Bk-YUCHO_MG",
    "-",
    70000,
    "JPY",
    "Health Insurance",
    "US",
    "Need",
    "Insurance & Tax"
  ],
  [
    "2026-02-20",
    "Work Equipment & Supplies",
    "Expense",
    "Work_Expenses",
    "Bk-YUCHO_MG",
    "-",
    30000,
    "JPY",
    "Stationery",
    "MG",
    "Need",
    "Work Expenses"
  ],
  [
    "2026-02-22",
    "Education & Courses",
    "Expense",
    "Education",
    "Bk-YUCHO_MG",
    "-",
    5000,
    "JPY",
    "Online Course",
    "MG",
    "Need",
    "Education"
  ],
  [
    "2026-02-24",
    "Entertainment & Hobbies",
    "Expense",
    "Entertainment",
    "Bk-YUCHO_MG",
    "-",
    5000,
    "JPY",
    "Streaming",
    "US",
    "Want",
    "Entertainment"
  ],
  [
    "2026-02-08",
    "Monthly Transportation Fare",
    "Expense",
    "Transportation",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Train",
    "US",
    "Need",
    "Commute Fare"
  ],
  [
    "2026-02-10",
    "Food & Groceries",
    "Expense",
    "Food_Expenses",
    "Cash_MG",
    "-",
    30000,
    "JPY",
    "Cooking Food",
    "US",
    "Need",
    "Groceries"
  ],
  [
    "2026-02-12",
    "Fashion & Clothing",
    "Expense",
    "Fashion_Expenses",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Outfit Cloth",
    "US",
    "Want",
    "Clothes"
  ],
  [
    "2026-02-14",
    "Daily Living Supplies",
    "Expense",
    "Living_Expenses",
    "Cash_MG",
    "-",
    10000,
    "JPY",
    "Daily Supplies",
    "US",
    "Need",
    "Living Supplies"
  ],
  [
    "2026-02-16",
    "Healthcare & Medicine",
    "Expense",
    "Healthcare",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Medicine",
    "US",
    "Need",
    "Healthcare"
  ],
  [
    "2026-02-25",
    "Family Myanmar Living Support",
    "Expense",
    "Family_Support",
    "KBZPay_MG",
    "-",
    1000000,
    "MMK",
    "Living Support",
    "Mother",
    "Need",
    "MMK Family Support"
  ],
  [
    "2026-03-01",
    "Monthly Base Salary",
    "Income",
    "Fixed_Income",
    "-",
    "Bk-YUCHO_MG",
    232500,
    "JPY",
    "Salary1",
    "MG",
    "-",
    "Monthly Salary"
  ],
  [
    "2026-03-01",
    "Project Income",
    "Income",
    "Business_Income",
    "-",
    "KBZPay_MG",
    1000000,
    "MMK",
    "Tiktok",
    "MG",
    "-",
    "MMK Income"
  ],
  [
    "2026-03-02",
    "Cash Allowance Transfer",
    "Transfer",
    "Transfer",
    "Bk-YUCHO_MG",
    "Cash_MG",
    55000,
    "JPY",
    "Transfer",
    "MG",
    "-",
    "Cash for daily living"
  ],
  [
    "2026-03-03",
    "Apartment Monthly Rent",
    "Expense",
    "Fixed_Expenses",
    "Bk-YUCHO_MG",
    "-",
    52500,
    "JPY",
    "Rent Housing Fee",
    "US",
    "Need",
    "House Rent"
  ],
  [
    "2026-03-05",
    "Electricity & Utilities",
    "Expense",
    "Bills_Utilities",
    "Bk-YUCHO_MG",
    "-",
    15000,
    "JPY",
    "Electricity Bill",
    "US",
    "Need",
    "Bills"
  ],
  [
    "2026-03-15",
    "National Insurance & Taxes",
    "Expense",
    "Taxes_Insurance",
    "Bk-YUCHO_MG",
    "-",
    70000,
    "JPY",
    "Health Insurance",
    "US",
    "Need",
    "Insurance & Tax"
  ],
  [
    "2026-03-20",
    "Work Equipment & Supplies",
    "Expense",
    "Work_Expenses",
    "Bk-YUCHO_MG",
    "-",
    30000,
    "JPY",
    "Stationery",
    "MG",
    "Need",
    "Work Expenses"
  ],
  [
    "2026-03-22",
    "Education & Courses",
    "Expense",
    "Education",
    "Bk-YUCHO_MG",
    "-",
    5000,
    "JPY",
    "Online Course",
    "MG",
    "Need",
    "Education"
  ],
  [
    "2026-03-24",
    "Entertainment & Hobbies",
    "Expense",
    "Entertainment",
    "Bk-YUCHO_MG",
    "-",
    5000,
    "JPY",
    "Streaming",
    "US",
    "Want",
    "Entertainment"
  ],
  [
    "2026-03-08",
    "Monthly Transportation Fare",
    "Expense",
    "Transportation",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Train",
    "US",
    "Need",
    "Commute Fare"
  ],
  [
    "2026-03-10",
    "Food & Groceries",
    "Expense",
    "Food_Expenses",
    "Cash_MG",
    "-",
    30000,
    "JPY",
    "Cooking Food",
    "US",
    "Need",
    "Groceries"
  ],
  [
    "2026-03-12",
    "Fashion & Clothing",
    "Expense",
    "Fashion_Expenses",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Outfit Cloth",
    "US",
    "Want",
    "Clothes"
  ],
  [
    "2026-03-14",
    "Daily Living Supplies",
    "Expense",
    "Living_Expenses",
    "Cash_MG",
    "-",
    10000,
    "JPY",
    "Daily Supplies",
    "US",
    "Need",
    "Living Supplies"
  ],
  [
    "2026-03-16",
    "Healthcare & Medicine",
    "Expense",
    "Healthcare",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Medicine",
    "US",
    "Need",
    "Healthcare"
  ],
  [
    "2026-03-25",
    "Family Myanmar Living Support",
    "Expense",
    "Family_Support",
    "KBZPay_MG",
    "-",
    1000000,
    "MMK",
    "Living Support",
    "Mother",
    "Need",
    "MMK Family Support"
  ],
  [
    "2026-04-01",
    "Monthly Base Salary",
    "Income",
    "Fixed_Income",
    "-",
    "Bk-YUCHO_MG",
    232500,
    "JPY",
    "Salary1",
    "MG",
    "-",
    "Monthly Salary"
  ],
  [
    "2026-04-01",
    "Project Income",
    "Income",
    "Business_Income",
    "-",
    "KBZPay_MG",
    1000000,
    "MMK",
    "Tiktok",
    "MG",
    "-",
    "MMK Income"
  ],
  [
    "2026-04-02",
    "Cash Allowance Transfer",
    "Transfer",
    "Transfer",
    "Bk-YUCHO_MG",
    "Cash_MG",
    55000,
    "JPY",
    "Transfer",
    "MG",
    "-",
    "Cash for daily living"
  ],
  [
    "2026-04-03",
    "Apartment Monthly Rent",
    "Expense",
    "Fixed_Expenses",
    "Bk-YUCHO_MG",
    "-",
    52500,
    "JPY",
    "Rent Housing Fee",
    "US",
    "Need",
    "House Rent"
  ],
  [
    "2026-04-05",
    "Electricity & Utilities",
    "Expense",
    "Bills_Utilities",
    "Bk-YUCHO_MG",
    "-",
    15000,
    "JPY",
    "Electricity Bill",
    "US",
    "Need",
    "Bills"
  ],
  [
    "2026-04-15",
    "National Insurance & Taxes",
    "Expense",
    "Taxes_Insurance",
    "Bk-YUCHO_MG",
    "-",
    70000,
    "JPY",
    "Health Insurance",
    "US",
    "Need",
    "Insurance & Tax"
  ],
  [
    "2026-04-20",
    "Work Equipment & Supplies",
    "Expense",
    "Work_Expenses",
    "Bk-YUCHO_MG",
    "-",
    30000,
    "JPY",
    "Stationery",
    "MG",
    "Need",
    "Work Expenses"
  ],
  [
    "2026-04-22",
    "Education & Courses",
    "Expense",
    "Education",
    "Bk-YUCHO_MG",
    "-",
    5000,
    "JPY",
    "Online Course",
    "MG",
    "Need",
    "Education"
  ],
  [
    "2026-04-24",
    "Entertainment & Hobbies",
    "Expense",
    "Entertainment",
    "Bk-YUCHO_MG",
    "-",
    5000,
    "JPY",
    "Streaming",
    "US",
    "Want",
    "Entertainment"
  ],
  [
    "2026-04-08",
    "Monthly Transportation Fare",
    "Expense",
    "Transportation",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Train",
    "US",
    "Need",
    "Commute Fare"
  ],
  [
    "2026-04-10",
    "Food & Groceries",
    "Expense",
    "Food_Expenses",
    "Cash_MG",
    "-",
    30000,
    "JPY",
    "Cooking Food",
    "US",
    "Need",
    "Groceries"
  ],
  [
    "2026-04-12",
    "Fashion & Clothing",
    "Expense",
    "Fashion_Expenses",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Outfit Cloth",
    "US",
    "Want",
    "Clothes"
  ],
  [
    "2026-04-14",
    "Daily Living Supplies",
    "Expense",
    "Living_Expenses",
    "Cash_MG",
    "-",
    10000,
    "JPY",
    "Daily Supplies",
    "US",
    "Need",
    "Living Supplies"
  ],
  [
    "2026-04-16",
    "Healthcare & Medicine",
    "Expense",
    "Healthcare",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Medicine",
    "US",
    "Need",
    "Healthcare"
  ],
  [
    "2026-04-25",
    "Family Myanmar Living Support",
    "Expense",
    "Family_Support",
    "KBZPay_MG",
    "-",
    1000000,
    "MMK",
    "Living Support",
    "Mother",
    "Need",
    "MMK Family Support"
  ],
  [
    "2026-05-01",
    "Monthly Base Salary",
    "Income",
    "Fixed_Income",
    "-",
    "Bk-YUCHO_MG",
    232500,
    "JPY",
    "Salary1",
    "MG",
    "-",
    "Monthly Salary"
  ],
  [
    "2026-05-01",
    "Project Income",
    "Income",
    "Business_Income",
    "-",
    "KBZPay_MG",
    1000000,
    "MMK",
    "Tiktok",
    "MG",
    "-",
    "MMK Income"
  ],
  [
    "2026-05-02",
    "Cash Allowance Transfer",
    "Transfer",
    "Transfer",
    "Bk-YUCHO_MG",
    "Cash_MG",
    55000,
    "JPY",
    "Transfer",
    "MG",
    "-",
    "Cash for daily living"
  ],
  [
    "2026-05-03",
    "Apartment Monthly Rent",
    "Expense",
    "Fixed_Expenses",
    "Bk-YUCHO_MG",
    "-",
    52500,
    "JPY",
    "Rent Housing Fee",
    "US",
    "Need",
    "House Rent"
  ],
  [
    "2026-05-05",
    "Electricity & Utilities",
    "Expense",
    "Bills_Utilities",
    "Bk-YUCHO_MG",
    "-",
    15000,
    "JPY",
    "Electricity Bill",
    "US",
    "Need",
    "Bills"
  ],
  [
    "2026-05-15",
    "National Insurance & Taxes",
    "Expense",
    "Taxes_Insurance",
    "Bk-YUCHO_MG",
    "-",
    70000,
    "JPY",
    "Health Insurance",
    "US",
    "Need",
    "Insurance & Tax"
  ],
  [
    "2026-05-20",
    "Work Equipment & Supplies",
    "Expense",
    "Work_Expenses",
    "Bk-YUCHO_MG",
    "-",
    30000,
    "JPY",
    "Stationery",
    "MG",
    "Need",
    "Work Expenses"
  ],
  [
    "2026-05-22",
    "Education & Courses",
    "Expense",
    "Education",
    "Bk-YUCHO_MG",
    "-",
    5000,
    "JPY",
    "Online Course",
    "MG",
    "Need",
    "Education"
  ],
  [
    "2026-05-24",
    "Entertainment & Hobbies",
    "Expense",
    "Entertainment",
    "Bk-YUCHO_MG",
    "-",
    5000,
    "JPY",
    "Streaming",
    "US",
    "Want",
    "Entertainment"
  ],
  [
    "2026-05-08",
    "Monthly Transportation Fare",
    "Expense",
    "Transportation",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Train",
    "US",
    "Need",
    "Commute Fare"
  ],
  [
    "2026-05-10",
    "Food & Groceries",
    "Expense",
    "Food_Expenses",
    "Cash_MG",
    "-",
    30000,
    "JPY",
    "Cooking Food",
    "US",
    "Need",
    "Groceries"
  ],
  [
    "2026-05-12",
    "Fashion & Clothing",
    "Expense",
    "Fashion_Expenses",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Outfit Cloth",
    "US",
    "Want",
    "Clothes"
  ],
  [
    "2026-05-14",
    "Daily Living Supplies",
    "Expense",
    "Living_Expenses",
    "Cash_MG",
    "-",
    10000,
    "JPY",
    "Daily Supplies",
    "US",
    "Need",
    "Living Supplies"
  ],
  [
    "2026-05-16",
    "Healthcare & Medicine",
    "Expense",
    "Healthcare",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Medicine",
    "US",
    "Need",
    "Healthcare"
  ],
  [
    "2026-05-25",
    "Family Myanmar Living Support",
    "Expense",
    "Family_Support",
    "KBZPay_MG",
    "-",
    1000000,
    "MMK",
    "Living Support",
    "Mother",
    "Need",
    "MMK Family Support"
  ],
  [
    "2026-06-01",
    "Monthly Base Salary",
    "Income",
    "Fixed_Income",
    "-",
    "Bk-YUCHO_MG",
    232500,
    "JPY",
    "Salary1",
    "MG",
    "-",
    "Monthly Salary"
  ],
  [
    "2026-06-01",
    "Project Income",
    "Income",
    "Business_Income",
    "-",
    "KBZPay_MG",
    1000000,
    "MMK",
    "Tiktok",
    "MG",
    "-",
    "MMK Income"
  ],
  [
    "2026-06-02",
    "Cash Allowance Transfer",
    "Transfer",
    "Transfer",
    "Bk-YUCHO_MG",
    "Cash_MG",
    55000,
    "JPY",
    "Transfer",
    "MG",
    "-",
    "Cash for daily living"
  ],
  [
    "2026-06-03",
    "Apartment Monthly Rent",
    "Expense",
    "Fixed_Expenses",
    "Bk-YUCHO_MG",
    "-",
    52500,
    "JPY",
    "Rent Housing Fee",
    "US",
    "Need",
    "House Rent"
  ],
  [
    "2026-06-05",
    "Electricity & Utilities",
    "Expense",
    "Bills_Utilities",
    "Bk-YUCHO_MG",
    "-",
    15000,
    "JPY",
    "Electricity Bill",
    "US",
    "Need",
    "Bills"
  ],
  [
    "2026-06-15",
    "National Insurance & Taxes",
    "Expense",
    "Taxes_Insurance",
    "Bk-YUCHO_MG",
    "-",
    70000,
    "JPY",
    "Health Insurance",
    "US",
    "Need",
    "Insurance & Tax"
  ],
  [
    "2026-06-20",
    "Work Equipment & Supplies",
    "Expense",
    "Work_Expenses",
    "Bk-YUCHO_MG",
    "-",
    30000,
    "JPY",
    "Stationery",
    "MG",
    "Need",
    "Work Expenses"
  ],
  [
    "2026-06-22",
    "Education & Courses",
    "Expense",
    "Education",
    "Bk-YUCHO_MG",
    "-",
    5000,
    "JPY",
    "Online Course",
    "MG",
    "Need",
    "Education"
  ],
  [
    "2026-06-24",
    "Entertainment & Hobbies",
    "Expense",
    "Entertainment",
    "Bk-YUCHO_MG",
    "-",
    5000,
    "JPY",
    "Streaming",
    "US",
    "Want",
    "Entertainment"
  ],
  [
    "2026-06-08",
    "Monthly Transportation Fare",
    "Expense",
    "Transportation",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Train",
    "US",
    "Need",
    "Commute Fare"
  ],
  [
    "2026-06-10",
    "Food & Groceries",
    "Expense",
    "Food_Expenses",
    "Cash_MG",
    "-",
    30000,
    "JPY",
    "Cooking Food",
    "US",
    "Need",
    "Groceries"
  ],
  [
    "2026-06-12",
    "Fashion & Clothing",
    "Expense",
    "Fashion_Expenses",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Outfit Cloth",
    "US",
    "Want",
    "Clothes"
  ],
  [
    "2026-06-14",
    "Daily Living Supplies",
    "Expense",
    "Living_Expenses",
    "Cash_MG",
    "-",
    10000,
    "JPY",
    "Daily Supplies",
    "US",
    "Need",
    "Living Supplies"
  ],
  [
    "2026-06-16",
    "Healthcare & Medicine",
    "Expense",
    "Healthcare",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Medicine",
    "US",
    "Need",
    "Healthcare"
  ],
  [
    "2026-06-25",
    "Family Myanmar Living Support",
    "Expense",
    "Family_Support",
    "KBZPay_MG",
    "-",
    1000000,
    "MMK",
    "Living Support",
    "Mother",
    "Need",
    "MMK Family Support"
  ],
  [
    "2026-07-01",
    "Monthly Base Salary",
    "Income",
    "Fixed_Income",
    "-",
    "Bk-YUCHO_MG",
    232500,
    "JPY",
    "Salary1",
    "MG",
    "-",
    "Monthly Salary"
  ],
  [
    "2026-07-01",
    "Project Income",
    "Income",
    "Business_Income",
    "-",
    "KBZPay_MG",
    1000000,
    "MMK",
    "Tiktok",
    "MG",
    "-",
    "MMK Income"
  ],
  [
    "2026-07-02",
    "Cash Allowance Transfer",
    "Transfer",
    "Transfer",
    "Bk-YUCHO_MG",
    "Cash_MG",
    55000,
    "JPY",
    "Transfer",
    "MG",
    "-",
    "Cash for daily living"
  ],
  [
    "2026-07-03",
    "Apartment Monthly Rent",
    "Expense",
    "Fixed_Expenses",
    "Bk-YUCHO_MG",
    "-",
    52500,
    "JPY",
    "Rent Housing Fee",
    "US",
    "Need",
    "House Rent"
  ],
  [
    "2026-07-05",
    "Electricity & Utilities",
    "Expense",
    "Bills_Utilities",
    "Bk-YUCHO_MG",
    "-",
    15000,
    "JPY",
    "Electricity Bill",
    "US",
    "Need",
    "Bills"
  ],
  [
    "2026-07-15",
    "National Insurance & Taxes",
    "Expense",
    "Taxes_Insurance",
    "Bk-YUCHO_MG",
    "-",
    70000,
    "JPY",
    "Health Insurance",
    "US",
    "Need",
    "Insurance & Tax"
  ],
  [
    "2026-07-20",
    "Work Equipment & Supplies",
    "Expense",
    "Work_Expenses",
    "Bk-YUCHO_MG",
    "-",
    30000,
    "JPY",
    "Stationery",
    "MG",
    "Need",
    "Work Expenses"
  ],
  [
    "2026-07-22",
    "Education & Courses",
    "Expense",
    "Education",
    "Bk-YUCHO_MG",
    "-",
    5000,
    "JPY",
    "Online Course",
    "MG",
    "Need",
    "Education"
  ],
  [
    "2026-07-24",
    "Entertainment & Hobbies",
    "Expense",
    "Entertainment",
    "Bk-YUCHO_MG",
    "-",
    5000,
    "JPY",
    "Streaming",
    "US",
    "Want",
    "Entertainment"
  ],
  [
    "2026-07-08",
    "Monthly Transportation Fare",
    "Expense",
    "Transportation",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Train",
    "US",
    "Need",
    "Commute Fare"
  ],
  [
    "2026-07-10",
    "Food & Groceries",
    "Expense",
    "Food_Expenses",
    "Cash_MG",
    "-",
    30000,
    "JPY",
    "Cooking Food",
    "US",
    "Need",
    "Groceries"
  ],
  [
    "2026-07-12",
    "Fashion & Clothing",
    "Expense",
    "Fashion_Expenses",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Outfit Cloth",
    "US",
    "Want",
    "Clothes"
  ],
  [
    "2026-07-14",
    "Daily Living Supplies",
    "Expense",
    "Living_Expenses",
    "Cash_MG",
    "-",
    10000,
    "JPY",
    "Daily Supplies",
    "US",
    "Need",
    "Living Supplies"
  ],
  [
    "2026-07-16",
    "Healthcare & Medicine",
    "Expense",
    "Healthcare",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Medicine",
    "US",
    "Need",
    "Healthcare"
  ],
  [
    "2026-07-25",
    "Family Myanmar Living Support",
    "Expense",
    "Family_Support",
    "KBZPay_MG",
    "-",
    1000000,
    "MMK",
    "Living Support",
    "Mother",
    "Need",
    "MMK Family Support"
  ],
  [
    "2026-08-01",
    "Monthly Base Salary",
    "Income",
    "Fixed_Income",
    "-",
    "Bk-YUCHO_MG",
    232500,
    "JPY",
    "Salary1",
    "MG",
    "-",
    "Monthly Salary"
  ],
  [
    "2026-08-01",
    "Project Income",
    "Income",
    "Business_Income",
    "-",
    "KBZPay_MG",
    1000000,
    "MMK",
    "Tiktok",
    "MG",
    "-",
    "MMK Income"
  ],
  [
    "2026-08-02",
    "Cash Allowance Transfer",
    "Transfer",
    "Transfer",
    "Bk-YUCHO_MG",
    "Cash_MG",
    55000,
    "JPY",
    "Transfer",
    "MG",
    "-",
    "Cash for daily living"
  ],
  [
    "2026-08-03",
    "Apartment Monthly Rent",
    "Expense",
    "Fixed_Expenses",
    "Bk-YUCHO_MG",
    "-",
    52500,
    "JPY",
    "Rent Housing Fee",
    "US",
    "Need",
    "House Rent"
  ],
  [
    "2026-08-05",
    "Electricity & Utilities",
    "Expense",
    "Bills_Utilities",
    "Bk-YUCHO_MG",
    "-",
    15000,
    "JPY",
    "Electricity Bill",
    "US",
    "Need",
    "Bills"
  ],
  [
    "2026-08-15",
    "National Insurance & Taxes",
    "Expense",
    "Taxes_Insurance",
    "Bk-YUCHO_MG",
    "-",
    70000,
    "JPY",
    "Health Insurance",
    "US",
    "Need",
    "Insurance & Tax"
  ],
  [
    "2026-08-20",
    "Work Equipment & Supplies",
    "Expense",
    "Work_Expenses",
    "Bk-YUCHO_MG",
    "-",
    30000,
    "JPY",
    "Stationery",
    "MG",
    "Need",
    "Work Expenses"
  ],
  [
    "2026-08-22",
    "Education & Courses",
    "Expense",
    "Education",
    "Bk-YUCHO_MG",
    "-",
    5000,
    "JPY",
    "Online Course",
    "MG",
    "Need",
    "Education"
  ],
  [
    "2026-08-24",
    "Entertainment & Hobbies",
    "Expense",
    "Entertainment",
    "Bk-YUCHO_MG",
    "-",
    5000,
    "JPY",
    "Streaming",
    "US",
    "Want",
    "Entertainment"
  ],
  [
    "2026-08-08",
    "Monthly Transportation Fare",
    "Expense",
    "Transportation",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Train",
    "US",
    "Need",
    "Commute Fare"
  ],
  [
    "2026-08-10",
    "Food & Groceries",
    "Expense",
    "Food_Expenses",
    "Cash_MG",
    "-",
    30000,
    "JPY",
    "Cooking Food",
    "US",
    "Need",
    "Groceries"
  ],
  [
    "2026-08-12",
    "Fashion & Clothing",
    "Expense",
    "Fashion_Expenses",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Outfit Cloth",
    "US",
    "Want",
    "Clothes"
  ],
  [
    "2026-08-14",
    "Daily Living Supplies",
    "Expense",
    "Living_Expenses",
    "Cash_MG",
    "-",
    10000,
    "JPY",
    "Daily Supplies",
    "US",
    "Need",
    "Living Supplies"
  ],
  [
    "2026-08-16",
    "Healthcare & Medicine",
    "Expense",
    "Healthcare",
    "Cash_MG",
    "-",
    5000,
    "JPY",
    "Medicine",
    "US",
    "Need",
    "Healthcare"
  ],
  [
    "2026-08-25",
    "Family Myanmar Living Support",
    "Expense",
    "Family_Support",
    "KBZPay_MG",
    "-",
    1000000,
    "MMK",
    "Living Support",
    "Mother",
    "Need",
    "MMK Family Support"
  ]
];

  // 2. Real Budgets from Google Sheet Budgets tab (11 Categories — Total: ¥232,500)
  const excelBudgets = [
    { month: "2026-08", category: "Fixed Expenses", amount: 52500.0, currency: "JPY" },
    { month: "2026-08", category: "Bills & Utilities", amount: 15000.0, currency: "JPY" },
    { month: "2026-08", category: "Taxes Insurance", amount: 70000.0, currency: "JPY" },
    { month: "2026-08", category: "Transportation", amount: 5000.0, currency: "JPY" },
    { month: "2026-08", category: "Food & Groceries", amount: 30000.0, currency: "JPY" },
    { month: "2026-08", category: "Fashion Expenses", amount: 5000.0, currency: "JPY" },
    { month: "2026-08", category: "Living Expenses", amount: 10000.0, currency: "JPY" },
    { month: "2026-08", category: "Work Expenses", amount: 30000.0, currency: "JPY" },
    { month: "2026-08", category: "Education", amount: 5000.0, currency: "JPY" },
    { month: "2026-08", category: "Healthcare", amount: 5000.0, currency: "JPY" },
    { month: "2026-08", category: "Entertainment", amount: 5000.0, currency: "JPY" }
  ];

  // 3. Real Savings Goals extracted from Savings_Goals sheet
  const excelGoals = [
    { goal: "Family Emergency Fund", target: 1000000.0, current: 0, currency: "JPY", targetDate: "2027-03-31", category: "Emergency Fund" },
    { goal: "Japan Family Vacation", target: 200000.0, current: 0, currency: "JPY", targetDate: "2027-08-15", category: "Travel & Leisure" },
    { goal: "MacBook Pro M3 / Laptop", target: 150000.0, current: 0, currency: "JPY", targetDate: "2026-12-20", category: "Electronics & Hardware" },
    { goal: "Kids Education Fund", target: 300000.0, current: 0, currency: "JPY", targetDate: "2027-04-01", category: "Education Fund" },
    { goal: "Home Repair & Decor", target: 100000.0, current: 0, currency: "JPY", targetDate: "2027-01-31", category: "House & Land" },
    { goal: "Stock & NISA Investment", target: 500000.0, current: 0, currency: "JPY", targetDate: "2027-12-31", category: "Investments" },
    { goal: "Car Maintenance Fund", target: 80000.0, current: 0, currency: "JPY", targetDate: "2026-11-30", category: "Emergency Fund" },
    { goal: "New iPhone / Mobile", target: 120000.0, current: 0, currency: "JPY", targetDate: "2027-05-15", category: "Electronics & Hardware" },
    { goal: "Myanmar Family Gift", target: 150000.0, current: 0, currency: "JPY", targetDate: "2026-10-31", category: "Family Support" }
  ];

  // 4. Real Payment Schedules extracted from Payment_Schedule sheet
  const excelSchedules = [
    { account: "TutionFee", category: "Education", amount: 275000.0, currency: "JPY", dueDay: "2026-11-25" },
    { account: "Crd-JCB_CS", category: "Credit Card Bill", amount: 21300.0, currency: "JPY", dueDay: "2026-09-15" }
  ];

  let liveBudgets = [...excelBudgets];
  let liveGoals = [...excelGoals];
  let liveSchedules = [...excelSchedules];

  const incomeTypes = ['Fixed_Income', 'Extra_Income', 'Business_Income', 'Loan_Income', 'Lend_Income', 'Exchange_Income', 'Other_Income'];
  const expenseTypes = [
    'Fixed_Expenses', 'Bills_Utilities', 'Taxes_Insurance', 'Food_Expenses',
    'Fashion_Expenses', 'Living_Expenses', 'Social_Expenses', 'Education_Expenses',
    'SelfDev_Expenses', 'Transportation_Expenses', 'Work_Expenses', 'PersonalCare_Expenses',
    'Healthcare_Expenses', 'Entertainment', 'Travel_Leisure', 'Exchange_Expenses',
    'Lend_Expenses', 'Loan_Expenses', 'Family_Support', 'Savings_Investments', 'Other_Expenses'
  ];
  const people = ['-', 'CS', 'MG', 'US', 'Grandparents', 'Mother', 'ThawThaw', 'Younger_Brother_1', 'Younger_Brother_2', 'Nephew & Niece', 'Nephew', 'Niece', 'Mg_Relative', 'Cs_Relative', 'Friend', 'Coworker'];
  const currencies = ['JPY', 'MMK', 'USD'];

  // Classify transactions cleanly for cash flow calculations
  const classify = r => {
    if (r[2] === 'Transfer') return 'internal_transfer';
    if (r[3] === 'Exchange_Expenses') return r[8] === 'Exchange Service Fee' ? 'expense' : 'exchange_principal';
    if (r[3] === 'Lend_Expenses') return 'lending';
    if (r[3] === 'Loan_Income') return 'borrowing';
    if (r[3] === 'Lend_Income') return 'repayment_received';
    if (r[3] === 'Exchange_Income') return 'exchange_inflow';
    if (r[3] === 'Loan_Expenses') return 'repayment_paid';
    if (r[3] === 'Savings_Investments') return 'savings_investment';
    return r[2].toLowerCase();
  };

  const normalize = (r, id, source, rowIndex) => ({
    id: id + 1,
    rowIndex: rowIndex || (typeof r.rowIndex !== 'undefined' ? r.rowIndex : (source === 'live_sheet' ? id + 2 : null)),
    date: r[0],
    description: r[1],
    cashFlow: r[2],
    cashFlowType: r[3],
    fromSource: r[4],
    toSource: r[5],
    amount: typeof r[6] === 'number' ? r[6] : parseFloat(r[6]) || 0,
    currency: r[7] || 'JPY',
    detail: r[8] || '-',
    cashFlowDetail: r[8] || '-',
    forWho: r[9] || '-',
    status: r[10] || '-',
    note: r[11] || '',
    classification: classify(r),
    source
  });

  // 100% Real Clean Zero-Balanced Transactions
  const realTransactions = workbookRows.map((r, id) => normalize(r, id, 'workbook', id + 2));
  let allTransactions = [...realTransactions].sort((a, b) => b.date.localeCompare(a.date));

  // Main data fetch function with Google Sheets live sync
  async function getDashboardData() {
    // 1. If running inside Google Apps Script HtmlService
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      try {
        const liveData = await new Promise((resolve, reject) => {
          google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(reject)
            .getAllDashboardData();
        });
        if (liveData && liveData.transactions && liveData.transactions.length > 0) {
          return liveData;
        }
      } catch (err) {
        console.warn('Google Apps Script live read failed, using baseline data', err);
      }
    }

    // 2. Fetch live data directly from Google Sheets in real-time
    if (typeof fetch !== 'undefined') {
      try {
        const liveData = await fetchLiveGoogleSheetsData();
        if (liveData && liveData.transactions && liveData.transactions.length > 0) {
          return liveData;
        }
      } catch (err) {
        console.warn('Live Google Sheets fetch error, using fallback:', err);
      }
    }

    return {
      transactions: allTransactions,
      budgets: liveBudgets,
      goals: liveGoals,
      schedules: liveSchedules,
      meta: {
        source: 'Fallback Database (Jan 2026 - Aug 2026)',
        schema: ['Date', 'Description', 'Cash Flow', 'Cash Flow Type', 'From Source', 'To Source', 'Amount', 'Currency', 'Cash Flow Detail', 'ForWho', 'Status', 'Note'],
        realTransactionCount: allTransactions.length,
        totalTransactionCount: allTransactions.length
      }
    };
  }

  // Update in-memory transaction for local prototype editing
  function updateTransaction(id, updatedFields) {
    const idx = allTransactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      allTransactions[idx] = { ...allTransactions[idx], ...updatedFields };
      return allTransactions[idx];
    }
    return null;
  }

  // Delete transaction locally
  function deleteTransaction(id) {
    const idx = allTransactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      return allTransactions.splice(idx, 1)[0];
    }
    return null;
  }

  // Add transaction locally
  function addTransaction(newTx) {
    const id = allTransactions.length + 1;
    const norm = normalize([
      newTx.date, newTx.description, newTx.cashFlow, newTx.cashFlowType,
      newTx.fromSource || '-', newTx.toSource || '-', newTx.amount,
      newTx.currency || 'JPY', newTx.detail || '-', newTx.forWho || '-',
      newTx.status || '-', newTx.note || ''
    ], id, 'local_added');
    allTransactions.unshift(norm);
    return norm;
  }

  const GOOGLE_SPREADSHEET_ID = '1OOrFs6uFBTt2nHW5lxTzqng0vMqWsCt_AyZ3ELare9s';

  // Robust CSV row parser handling quotes & commas
  function parseCSVText(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length <= 1) return [];
    const parseRow = (line) => {
      const row = [];
      let inQuotes = false;
      let curr = '';
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inQuotes && line[i+1] === '"') {
            curr += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === ',' && !inQuotes) {
          row.push(curr.trim());
          curr = '';
        } else {
          curr += c;
        }
      }
      row.push(curr.trim());
      return row;
    };

    const headers = parseRow(lines[0]);
    return lines.slice(1).map(line => {
      const cols = parseRow(line);
      const obj = {};
      headers.forEach((h, i) => {
        const cleanKey = h.replace(/^"|"$/g, '').trim();
        obj[cleanKey] = (cols[i] || '').replace(/^"|"$/g, '').trim();
      });
      return obj;
    });
  }

  async function fetchSheetCSV(sheetName) {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const text = await res.text();
      return parseCSVText(text);
    } catch (e) {
      console.warn(`Failed to fetch live sheet ${sheetName}:`, e.message);
      return [];
    }
  }

  // 100% Real Live Google Sheets Fetcher (Real-time live synchronization)
  async function fetchLiveGoogleSheetsData() {
    try {
      // 1. Fetch live Budgets from Google Sheets
      const liveBudgetRows = await fetchSheetCSV('Budgets');
      if (liveBudgetRows && liveBudgetRows.length > 0) {
        liveBudgets = liveBudgetRows.map(b => ({
          month: b['Month'] || b['month'] || '2026-08',
          category: b['Category'] || b['category'] || '',
          amount: parseFloat(b['Amount'] || b['amount'] || 0) || 0,
          currency: b['Currency'] || b['currency'] || 'JPY'
        })).filter(b => b.category && b.amount > 0);
      }

      // 2. Fetch live Transactions directly from Google Sheets
      const liveTxRows = await fetchSheetCSV('Income-Expense-Tracker');
      if (liveTxRows && liveTxRows.length > 0) {
        allTransactions = liveTxRows.map((t, idx) => normalize([
          t['Date'] || t['date'],
          t['Description'] || t['description'],
          t['Cash Flow'] || t['cashFlow'],
          t['Cash Flow Type'] || t['cashFlowType'],
          t['From Source'] || t['fromSource'] || '-',
          t['To Source'] || t['toSource'] || '-',
          parseFloat(t['Amount'] || t['amount']) || 0,
          t['Currency'] || t['currency'] || 'JPY',
          t['Cash Flow Detail'] || t['detail'] || '-',
          t['ForWho'] || t['forWho'] || 'US',
          t['Status'] || t['status'] || '-',
          t['Note'] || t['note'] || ''
        ], 1000 + idx, 'live_sheet', idx + 2)).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      }

      // 3. Fetch live Goals from Google Sheets
      const liveGoalRows = await fetchSheetCSV('Savings_Goals');
      if (liveGoalRows && liveGoalRows.length > 0) {
        liveGoals = liveGoalRows.map(g => ({
          goal: g['Goal'] || g['goal'] || '',
          category: g['Category'] || g['category'] || 'General',
          target: parseFloat(g['Target'] || g['target'] || 0) || 0,
          current: parseFloat(g['Current'] || g['current'] || 0) || 0,
          currency: g['Currency'] || g['currency'] || 'JPY',
          targetDate: g['Target Date'] || g['targetDate'] || ''
        })).filter(g => g.goal);
      }

      // 4. Fetch live Schedules from Google Sheets
      const liveScheduleRows = await fetchSheetCSV('Payment_Schedule');
      if (liveScheduleRows && liveScheduleRows.length > 0) {
        liveSchedules = liveScheduleRows.map(s => ({
          account: s['Account'] || s['account'] || s['Payee'] || '',
          category: s['Category'] || s['category'] || 'Bills',
          dueDay: s['Due Day'] || s['Due Date'] || s['dueDay'] || '',
          amount: parseFloat(s['Amount'] || s['amount'] || 0) || 0,
          currency: s['Currency'] || s['currency'] || 'JPY'
        })).filter(s => s.account);
      }

      return {
        transactions: allTransactions,
        budgets: liveBudgets,
        goals: liveGoals,
        schedules: liveSchedules,
        meta: {
          source: 'Google Sheets Live Real-Time Database',
          schema: ['Date', 'Description', 'Cash Flow', 'Cash Flow Type', 'From Source', 'To Source', 'Amount', 'Currency', 'Cash Flow Detail', 'ForWho', 'Status', 'Note'],
          realTransactionCount: allTransactions.length,
          totalTransactionCount: allTransactions.length
        }
      };
    } catch (e) {
      console.warn('Real-time Google Sheet sync error:', e);
      return {
        transactions: allTransactions,
        budgets: liveBudgets,
        goals: liveGoals,
        schedules: liveSchedules
      };
    }
  }

  return {
    getDashboardData,
    fetchLiveGoogleSheetsData,
    updateTransaction,
    deleteTransaction,
    addTransaction,
    catalogs: {
      incomeTypes,
      expenseTypes,
      people,
      currencies
    }
  };
})();
