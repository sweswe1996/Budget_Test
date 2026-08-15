/**
 * Reports View Renderer — 100% Dynamic Financial Statements & Analysis Reports
 */

window.BudgetTrackerViews = window.BudgetTrackerViews || {};

window.BudgetTrackerViews.reports = (() => {
  function render(container, data, filters) {
    const calc = window.BudgetTrackerCalc;
    const filtered = calc.filterTransactions(data.transactions, filters);
    const summary = calc.computeSummary(filtered);

    const totalIncome = summary.totalIncome;
    const totalExpense = summary.totalExpense;
    const netSavings = summary.netCashFlow;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : "0.0";

    // Monthly breakdown generator from real transactions
    const monthMap = {};
    filtered.forEach(t => {
      const ym = t.date ? t.date.slice(0, 7) : "2026-08";
      if (!monthMap[ym]) {
        monthMap[ym] = { month: ym, income: 0, expense: 0 };
      }
      if (t.cashFlow === "Income") monthMap[ym].income += Number(t.amount) || 0;
      else if (t.cashFlow === "Expense") monthMap[ym].expense += Number(t.amount) || 0;
    });

    const monthlyReportList = Object.values(monthMap).map(m => ({
      ...m,
      net: m.income - m.expense,
      rate: m.income > 0 ? (((m.income - m.expense) / m.income) * 100).toFixed(1) : "0.0"
    })).sort((a, b) => b.month.localeCompare(a.month));

    container.innerHTML = `
      <!-- Top Title Group with Export Buttons -->
      <div class="page-title-banner" style="margin-bottom: 2px;">
        <div class="page-title-group">
          <div>
            <h2 style="display:flex; align-items:center; gap:8px; font-size:20px;">Financial Reports <span>📊✨</span></h2>
            <p style="font-size:12px; color:var(--text-muted);">Real-time statements and cash flow analysis from Google Sheets.</p>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn-primary" id="btnExportCSV" style="font-size:12px; padding:6px 14px; background:var(--primary);">
            <span>📥 Export CSV</span>
          </button>
        </div>
      </div>

      <!-- Top 4 KPI Cards (100% Dynamically Calculated) -->
      <div class="kpi-row-4">
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Filtered Income</span>
              <span class="kpi-value" style="color:#16a34a;">¥${totalIncome.toLocaleString()}</span>
              <span class="kpi-sub">Real Google Sheets</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-green" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
            </div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Filtered Expenses</span>
              <span class="kpi-value" style="color:#ef4444;">¥${totalExpense.toLocaleString()}</span>
              <span class="kpi-sub">${summary.spendingCount} transactions</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-red" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/></svg>
            </div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Net Savings</span>
              <span class="kpi-value" style="color:${netSavings >= 0 ? '#2563eb' : '#dc2626'};">${netSavings >= 0 ? '+' : ''}¥${netSavings.toLocaleString()}</span>
              <span class="kpi-sub">${savingsRate}% savings rate</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-blue" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Total Records</span>
              <span class="kpi-value" style="color:#7c3aed;">${filtered.length}</span>
              <span class="kpi-sub">Across ${monthlyReportList.length} periods</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-purple" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Report Tables -->
      <div class="card" style="margin-top:14px;">
        <div class="card-header">
          <h3 class="card-title">Monthly Cash Flow Breakdown</h3>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Income</th>
                <th>Total Expense</th>
                <th>Net Surplus / Deficit</th>
                <th>Savings Rate</th>
              </tr>
            </thead>
            <tbody>
              ${monthlyReportList.map(m => `
                <tr>
                  <td><strong>${m.month}</strong></td>
                  <td class="amount-pos">+¥${m.income.toLocaleString()}</td>
                  <td class="amount-neg">-¥${m.expense.toLocaleString()}</td>
                  <td><strong style="color:${m.net >= 0 ? '#16a34a' : '#ef4444'};">${m.net >= 0 ? '+' : ''}¥${m.net.toLocaleString()}</strong></td>
                  <td><span class="badge ${m.net >= 0 ? 'badge-success' : 'badge-danger'}">${m.rate}%</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Export CSV handler
    document.getElementById("btnExportCSV")?.addEventListener("click", () => {
      let csv = "Date,Description,CashFlow,Category,Detail,From,To,Amount,Currency,ForWho,Status,Note\n";
      filtered.forEach(t => {
        csv += `"${t.date}","${t.description}","${t.cashFlow}","${t.cashFlowType}","${t.detail || ''}","${t.fromSource || ''}","${t.toSource || ''}",${t.amount},"${t.currency}","${t.forWho || ''}","${t.status || ''}","${t.note || ''}"\n`;
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BudgetTracker_Export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    });
  }

  return {
    render
  };
})();
