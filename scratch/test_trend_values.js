global.window = {};
global.document = { getElementById: () => ({}) };
global.localStorage = { getItem: () => null, setItem: () => {} };

require('../js/dashboard-data.js');
require('../js/calculations.js');

async function testTrend() {
  const data = await window.BudgetTrackerData.getDashboardData();
  const filters = { startDate: '2026-06-01', endDate: '2026-08-31', currency: 'JPY' };
  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const endDateStr = filters.endDate || "2026-08-31";
  const endYear = parseInt(endDateStr.slice(0, 4), 10) || 2026;
  const endMonth = (parseInt(endDateStr.slice(5, 7), 10) || 8) - 1;

  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(endYear, endMonth - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${year}-${month}`;
    const label = `${monthNames[d.getMonth()]} '${String(year).slice(-2)}`;
    last6Months.push({ key, label, actual: 0, budget: 232500 });
  }

  data.transactions.forEach(t => {
    if (t.cashFlow === "Expense" && (!t.currency || t.currency === (filters.currency || "JPY")) && t.date) {
      const type = String(t.cashFlowType || '').toLowerCase();
      const desc = String(t.description || '').toLowerCase();
      const detail = String(t.detail || t.cashFlowDetail || '').toLowerCase();
      if (!type.includes('lend') && !type.includes('exchange') && !type.includes('loan') && !desc.includes('loan past') && !detail.includes('previous used')) {
        const monthKey = String(t.date).slice(0, 7);
        const found = last6Months.find(m => m.key === monthKey);
        if (found) {
          found.actual += Number(t.amount) || 0;
        }
      }
    }
  });

  console.log("Trend 6 Months values:");
  console.log(last6Months);
}

testTrend();
