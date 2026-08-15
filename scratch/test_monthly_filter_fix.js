global.window = {};
global.document = { getElementById: () => ({}) };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

require('../js/dashboard-data.js');

function normalizeCategoryKey(rawName) {
  if (!rawName) return "Other_Expenses";
  const s = String(rawName).trim();
  const l = s.toLowerCase().replace(/[\s_&+-]+/g, '');

  if (l.includes("family") || l.includes("support")) return "Family_Support";
  if (l.includes("tax") || l.includes("insurance") || l.includes("pension")) return "Taxes_Insurance";
  if (l.includes("fixed") || l.includes("housing") || l.includes("rent")) return "Fixed_Expenses";
  if (l.includes("food") || l.includes("grocer") || l.includes("dining") || l.includes("snack")) return "Food_Expenses";
  if (l.includes("transport") || l.includes("train") || l.includes("bus") || l.includes("fuel")) return "Transportation";
  if (l.includes("bill") || l.includes("util") || l.includes("electric") || l.includes("water") || l.includes("gas") || l.includes("wifi") || l.includes("phone")) return "Bills_Utilities";
  if (l.includes("living") || l.includes("kitchen") || l.includes("bath") || l.includes("appliance") || l.includes("clean") || l.includes("supplies")) return "Living_Expenses";
  if (l.includes("work") || l.includes("office") || l.includes("stationery")) return "Work_Expenses";
  if (l.includes("fashion") || l.includes("cloth") || l.includes("shoe") || l.includes("bag")) return "Fashion_Expenses";
  if (l.includes("entertain") || l.includes("game") || l.includes("movie") || l.includes("fun") || l.includes("stream") || l.includes("social")) return "Entertainment";
  if (l.includes("education") || l.includes("tuition") || l.includes("school") || l.includes("course") || l.includes("book")) return "Education";
  if (l.includes("health") || l.includes("medical") || l.includes("dental") || l.includes("clinic") || l.includes("hospital")) return "Healthcare";
  if (l.includes("other")) return "Other_Expenses";

  return s;
}

function computeBudgetsTest(transactions, rawBudgets = [], targetCurrency = "JPY", targetMonth = null, monthFactor = 1) {
  const categoryMap = {};
  const txList = transactions || [];

  // Find minimum rowIndex where ResetData starts
  let resetMinRowIndex = Infinity;
  txList.forEach(t => {
    const desc = (t.Description || t.description || '').toLowerCase();
    const note = (t.Note || t.note || '').toLowerCase();
    if (desc === 'resetdata' || note.includes('reset data to zero condition')) {
      const rIdx = t.rowIndex || 0;
      if (rIdx && rIdx < resetMinRowIndex) {
        resetMinRowIndex = rIdx;
      }
    }
  });

  let activeTx = resetMinRowIndex !== Infinity
    ? txList.filter(t => (t.rowIndex || 0) >= resetMinRowIndex)
    : txList;

  // Filter strictly by targetMonth if provided (e.g. "2026-07", "2026-08")
  if (targetMonth && targetMonth !== "all" && /^\d{4}-\d{2}/.test(targetMonth)) {
    const monthPrefix = targetMonth.slice(0, 7);
    activeTx = activeTx.filter(t => {
      const d = t.Date || t.date || "";
      return String(d).startsWith(monthPrefix);
    });
  }

  // Sum operational expenses in targetCurrency
  activeTx.forEach(t => {
    if (t.cashFlow === "Expense" && (!t.currency || t.currency === targetCurrency)) {
      const type = String(t.cashFlowType || '').toLowerCase();
      const desc = String(t.description || '').toLowerCase();
      const detail = String(t.detail || t.cashFlowDetail || '').toLowerCase();
      if (!type.includes('lend') && !type.includes('exchange') && !type.includes('loan') && !desc.includes('loan past') && !detail.includes('previous used')) {
        const normCat = normalizeCategoryKey(t.cashFlowType || t.detail || t.cashFlowDetail);
        categoryMap[normCat] = (categoryMap[normCat] || 0) + (Number(t.amount) || 0);
      }
    }
  });

  return categoryMap;
}

async function test() {
  const data = await window.BudgetTrackerData.getDashboardData();
  
  console.log("=== AUGUST 2026 SPEND ===");
  console.log(computeBudgetsTest(data.transactions, data.budgets, 'JPY', '2026-08'));

  console.log("\n=== JULY 2026 SPEND ===");
  console.log(computeBudgetsTest(data.transactions, data.budgets, 'JPY', '2026-07'));

  console.log("\n=== JUNE 2026 SPEND ===");
  console.log(computeBudgetsTest(data.transactions, data.budgets, 'JPY', '2026-06'));
}

test();
