global.window = {};
global.document = {
  getElementById: (id) => ({
    getContext: () => ({}),
    innerHTML: '',
    appendChild: () => {}
  })
};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.Chart = function() {};
Chart.getChart = () => null;
Chart.defaults = { font: {} };

require('../js/dashboard-data.js');
require('../js/calculations.js');
require('../js/charts.js');
require('../js/views/overview.js');
require('../js/views/accounts.js');
require('../js/views/budget.js');
require('../js/views/debt.js');
require('../js/views/spending.js');
require('../js/views/goals.js');
require('../js/views/transactions.js');

async function testAllViews() {
  const data = await window.BudgetTrackerData.getDashboardData();
  const filters = { dateRange: 'all', currency: 'JPY', forWho: 'all', category: 'all' };

  const views = ['overview', 'accounts', 'budget', 'debt', 'spending', 'goals', 'transactions'];
  for (const v of views) {
    try {
      const container = { innerHTML: '' };
      window.BudgetTrackerViews[v].render(container, data, filters);
      console.log(`[PASS] View: ${v} (HTML len: ${container.innerHTML.length})`);
    } catch (err) {
      console.error(`[FAIL] View: ${v}`, err);
    }
  }
}

testAllViews();
