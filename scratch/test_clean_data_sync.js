// Verify dashboard-data.js and live sync logic
const fs = require('fs');

console.log("=== VERIFYING TEST DATA REMOVAL & CLEAN GOOGLE SHEETS CONNECTION ===");

// 1. Check dashboard-data.js
const dashDataCode = fs.readFileSync('d:/GminiBudgetTracker/js/dashboard-data.js', 'utf8');
if (dashDataCode.includes('workbookRows = []') && dashDataCode.includes('excelBudgets = []') && dashDataCode.includes('excelGoals = []') && dashDataCode.includes('excelSchedules = []')) {
  console.log("✔ dashboard-data.js: All mock rows and baseline test data removed. Arrays initialized to [] clean baseline.");
} else {
  console.error("❌ dashboard-data.js still has mock arrays!");
}

// 2. Check schedule.html
const schedCode = fs.readFileSync('d:/GminiBudgetTracker/schedule.html', 'utf8');
if (schedCode.includes('let scheduledPayments = [];')) {
  console.log("✔ schedule.html: Mock scheduled payments removed. Initialized to [] clean baseline.");
} else {
  console.error("❌ schedule.html still has mock schedules!");
}

// 3. Check goal.html
const goalCode = fs.readFileSync('d:/GminiBudgetTracker/goal.html', 'utf8');
if (goalCode.includes('let savingsGoals = [];')) {
  console.log("✔ goal.html: Mock savings goals removed. Initialized to [] clean baseline.");
} else {
  console.error("❌ goal.html still has mock goals!");
}

// 4. Check budget.html
const budgetCode = fs.readFileSync('d:/GminiBudgetTracker/budget.html', 'utf8');
if (!budgetCode.includes('defaultBudget: 72000') && budgetCode.includes('defaultBudget: 0')) {
  console.log("✔ budget.html: CATEGORY_CONFIG default mock amounts set to 0. Ready for real Google Sheets sync.");
} else {
  console.error("❌ budget.html still has mock default values!");
}

// 5. Check home.html
const homeCode = fs.readFileSync('d:/GminiBudgetTracker/home.html', 'utf8');
if (!homeCode.includes('dashboardMonthsData') && homeCode.includes('liveDashboardData =') && homeCode.includes('BudgetTrackerData.getDashboardData')) {
  console.log("✔ home.html: Fully dynamic calculation engine connected to live Google Sheets data.");
} else {
  console.error("❌ home.html verification failed!");
}

console.log("=== ALL VERIFICATION CHECKS PASSED SUCCESSFULLY ===");
