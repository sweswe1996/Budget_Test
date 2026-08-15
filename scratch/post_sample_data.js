const https = require('https');

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwEUClijVXfB8_QXDzOdg4O-VYPusE4WoJLZr4SEtE77yReDXR1eMQwOyBuYh6p1JgE/exec';

const sampleBudgets = [
  { formType: "Budgets", budgetMonth: "2026-08", budgetCategory: "Fixed_Expenses", budgetAmount: 300000, budgetCurrency: "JPY", budgetPriority: "Essential", budgetNote: "[SAMPLE_DATA] Monthly Rent & Housing" },
  { formType: "Budgets", budgetMonth: "2026-08", budgetCategory: "Food_Expenses", budgetAmount: 120000, budgetCurrency: "JPY", budgetPriority: "Essential", budgetNote: "[SAMPLE_DATA] Groceries & Cooking" },
  { formType: "Budgets", budgetMonth: "2026-08", budgetCategory: "Transportation_Expenses", budgetAmount: 80000, budgetCurrency: "JPY", budgetPriority: "Essential", budgetNote: "[SAMPLE_DATA] Train, Commute & Gas" },
  { formType: "Budgets", budgetMonth: "2026-08", budgetCategory: "Bills_Utilities", budgetAmount: 40000, budgetCurrency: "JPY", budgetPriority: "Essential", budgetNote: "[SAMPLE_DATA] Electricity, Water & Gas" },
  { formType: "Budgets", budgetMonth: "2026-08", budgetCategory: "Education_Expenses", budgetAmount: 60000, budgetCurrency: "JPY", budgetPriority: "Important", budgetNote: "[SAMPLE_DATA] Tuition & Courses" },
  { formType: "Budgets", budgetMonth: "2026-08", budgetCategory: "Healthcare_Expenses", budgetAmount: 30000, budgetCurrency: "JPY", budgetPriority: "Important", budgetNote: "[SAMPLE_DATA] Medical & Health" },
  { formType: "Budgets", budgetMonth: "2026-08", budgetCategory: "Entertainment", budgetAmount: 35000, budgetCurrency: "JPY", budgetPriority: "Discretionary", budgetNote: "[SAMPLE_DATA] Fun, Games & Leisure" },
  { formType: "Budgets", budgetMonth: "2026-08", budgetCategory: "Living_Expenses", budgetAmount: 50000, budgetCurrency: "JPY", budgetPriority: "Essential", budgetNote: "[SAMPLE_DATA] Home Supplies & Living" },
  { formType: "Budgets", budgetMonth: "2026-08", budgetCategory: "Fashion_Expenses", budgetAmount: 25000, budgetCurrency: "JPY", budgetPriority: "Discretionary", budgetNote: "[SAMPLE_DATA] Clothing & Shoes" },
  { formType: "Budgets", budgetMonth: "2026-08", budgetCategory: "Other_Expenses", budgetAmount: 20000, budgetCurrency: "JPY", budgetPriority: "Discretionary", budgetNote: "[SAMPLE_DATA] Miscellaneous" }
];

const sampleGoals = [
  { formType: "Savings_Goals", goalName: "Family Emergency Fund", goalCategory: "Emergency Fund", goalTarget: 1000000, goalCurrency: "JPY", goalDate: "2027-03-31", initialDeposit: 680000, goalAccount: "Bk-MIZUHO_CS", goalNote: "[SAMPLE_DATA] 6 months safety net" },
  { formType: "Savings_Goals", goalName: "Japan Family Vacation", goalCategory: "Travel & Leisure", goalTarget: 200000, goalCurrency: "JPY", goalDate: "2027-08-15", initialDeposit: 126000, goalAccount: "Bk-PAYPAY_CS", goalNote: "[SAMPLE_DATA] Summer family trip" },
  { formType: "Savings_Goals", goalName: "MacBook Pro M3 / Laptop", goalCategory: "Electronics & Hardware", goalTarget: 150000, goalCurrency: "JPY", goalDate: "2026-12-20", initialDeposit: 53000, goalAccount: "Bk-MUFG_MG", goalNote: "[SAMPLE_DATA] Coding work laptop" },
  { formType: "Savings_Goals", goalName: "Kids Education Fund", goalCategory: "Education Fund", goalTarget: 300000, goalCurrency: "JPY", goalDate: "2027-04-01", initialDeposit: 75000, goalAccount: "Bk-YUCHO_MG", goalNote: "[SAMPLE_DATA] Next semester school fund" },
  { formType: "Savings_Goals", goalName: "Home Repair & Decor", goalCategory: "House & Land", goalTarget: 100000, goalCurrency: "JPY", goalDate: "2027-01-31", initialDeposit: 20000, goalAccount: "Cash_MG", goalNote: "[SAMPLE_DATA] Living room maintenance" },
  { formType: "Savings_Goals", goalName: "Stock & NISA Investment", goalCategory: "Investments", goalTarget: 500000, goalCurrency: "JPY", goalDate: "2027-12-31", initialDeposit: 180000, goalAccount: "Crd-RAKUTEN_CS", goalNote: "[SAMPLE_DATA] Annual NISA growth" },
  { formType: "Savings_Goals", goalName: "Car Maintenance Fund", goalCategory: "Emergency Fund", goalTarget: 80000, goalCurrency: "JPY", goalDate: "2026-11-30", initialDeposit: 35000, goalAccount: "Bk-SMBC_CS", goalNote: "[SAMPLE_DATA] Shaken & car check" },
  { formType: "Savings_Goals", goalName: "New iPhone / Mobile", goalCategory: "Electronics & Hardware", goalTarget: 120000, goalCurrency: "JPY", goalDate: "2027-05-15", initialDeposit: 40000, goalAccount: "Bk-PAYPAY_MG", goalNote: "[SAMPLE_DATA] Phone upgrade fund" },
  { formType: "Savings_Goals", goalName: "Myanmar Family Gift", goalCategory: "Family Support", goalTarget: 150000, goalCurrency: "JPY", goalDate: "2026-10-31", initialDeposit: 90000, goalAccount: "Cash_CS", goalNote: "[SAMPLE_DATA] Thadingyut family gifts" },
  { formType: "Savings_Goals", goalName: "Health & Dental Check", goalCategory: "Healthcare", goalTarget: 50000, goalCurrency: "JPY", goalDate: "2027-02-28", initialDeposit: 15000, goalAccount: "Bk-MUFG_CS", goalNote: "[SAMPLE_DATA] Annual wellness reserve" }
];

const sampleSchedules = [
  { formType: "Payment_Schedule", payeeName: "JCB Card Payment", scheduleCategory: "Credit Card Bill", paymentAmount: 18000, scheduleCurrency: "JPY", dueDate: "2026-08-20", recurring: "Monthly", scheduleNote: "[SAMPLE_DATA] JCB credit card monthly due" },
  { formType: "Payment_Schedule", payeeName: "MUFG Card Payment", scheduleCategory: "Credit Card Bill", paymentAmount: 10000, scheduleCurrency: "JPY", dueDate: "2026-08-22", recurring: "Monthly", scheduleNote: "[SAMPLE_DATA] MUFG credit card monthly due" },
  { formType: "Payment_Schedule", payeeName: "Tokyo Electricity Bill", scheduleCategory: "Utilities & Bills", paymentAmount: 6800, scheduleCurrency: "JPY", dueDate: "2026-08-25", recurring: "Monthly", scheduleNote: "[SAMPLE_DATA] TEPCO summer electricity bill" },
  { formType: "Payment_Schedule", payeeName: "Rakuten Personal Loan", scheduleCategory: "Debt / Loan Repayment", paymentAmount: 16000, scheduleCurrency: "JPY", dueDate: "2026-08-28", recurring: "Monthly", scheduleNote: "[SAMPLE_DATA] Monthly personal loan repayment" },
  { formType: "Payment_Schedule", payeeName: "Car Loan Installment", scheduleCategory: "Debt / Loan Repayment", paymentAmount: 18000, scheduleCurrency: "JPY", dueDate: "2026-08-30", recurring: "Monthly", scheduleNote: "[SAMPLE_DATA] Car financing monthly installment" },
  { formType: "Payment_Schedule", payeeName: "UR Home Rent Fee", scheduleCategory: "House Rent", paymentAmount: 78000, scheduleCurrency: "JPY", dueDate: "2026-09-01", recurring: "Monthly", scheduleNote: "[SAMPLE_DATA] Monthly apartment housing rent" },
  { formType: "Payment_Schedule", payeeName: "Home WiFi & Internet", scheduleCategory: "Utilities & Bills", paymentAmount: 4950, scheduleCurrency: "JPY", dueDate: "2026-09-05", recurring: "Monthly", scheduleNote: "[SAMPLE_DATA] Fiber optical internet bill" },
  { formType: "Payment_Schedule", payeeName: "Mobile Phone Plan", scheduleCategory: "Utilities & Bills", paymentAmount: 3300, scheduleCurrency: "JPY", dueDate: "2026-09-10", recurring: "Monthly", scheduleNote: "[SAMPLE_DATA] Softbank/Docomo mobile phone bill" },
  { formType: "Payment_Schedule", payeeName: "Bicycle & Health Insurance", scheduleCategory: "Taxes & Insurance", paymentAmount: 5600, scheduleCurrency: "JPY", dueDate: "2026-09-15", recurring: "Monthly", scheduleNote: "[SAMPLE_DATA] Monthly family insurance coverage" },
  { formType: "Payment_Schedule", payeeName: "Tuition Fee Installment", scheduleCategory: "Debt / Loan Repayment", paymentAmount: 35000, scheduleCurrency: "JPY", dueDate: "2026-09-25", recurring: "Monthly", scheduleNote: "[SAMPLE_DATA] Course & tuition semester payment" }
];

function sendPost(payload) {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(payload);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        'Content-Length': Buffer.byteLength(dataString)
      }
    };

    const req = https.request(GAS_URL, options, (res) => {
      // Follow redirects if 302
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, (redirectRes) => {
          let body = '';
          redirectRes.on('data', chunk => body += chunk);
          redirectRes.on('end', () => resolve({ status: redirectRes.statusCode, body }));
        }).on('error', reject);
        return;
      }

      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });

    req.on('error', reject);
    req.write(dataString);
    req.end();
  });
}

async function runAll() {
  console.log("Submitting Budgets...");
  for (const b of sampleBudgets) {
    try {
      const res = await sendPost(b);
      console.log(`[Budget] ${b.budgetCategory}:`, res.status);
    } catch (e) {
      console.error(`[Budget Error] ${b.budgetCategory}:`, e.message);
    }
  }

  console.log("\nSubmitting Savings Goals...");
  for (const g of sampleGoals) {
    try {
      const res = await sendPost(g);
      console.log(`[Goal] ${g.goalName}:`, res.status);
    } catch (e) {
      console.error(`[Goal Error] ${g.goalName}:`, e.message);
    }
  }

  console.log("\nSubmitting Payment Schedules...");
  for (const s of sampleSchedules) {
    try {
      const res = await sendPost(s);
      console.log(`[Schedule] ${s.payeeName}:`, res.status);
    } catch (e) {
      console.error(`[Schedule Error] ${s.payeeName}:`, e.message);
    }
  }

  console.log("\nAll sample submissions completed!");
}

runAll();
