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
require('../js/views/budget.js');

async function testRender() {
  try {
    const data = await window.BudgetTrackerData.getDashboardData();
    const container = { innerHTML: '' };
    const filters = { dateRange: 'all', currency: 'JPY', forWho: 'all', category: 'all' };
    window.BudgetTrackerViews.budget.render(container, data, filters);
    console.log("Budget render SUCCESS! HTML length:", container.innerHTML.length);
  } catch (err) {
    console.error("Budget render FAILED:", err);
  }
}

testRender();
