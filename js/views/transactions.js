/**
 * Transactions View Renderer — 100% Dynamic Dedicated Full Transactions Ledger
 */

window.BudgetTrackerViews = window.BudgetTrackerViews || {};

window.BudgetTrackerViews.transactions = (() => {
  function render(container, data, filters) {
    const calc = window.BudgetTrackerCalc;
    const filtered = calc.filterTransactions(data.transactions, filters);
    const summary = calc.computeSummary(filtered);

    const totalInflow = summary.totalIncome;
    const totalOutflow = summary.totalExpense;

    container.innerHTML = `
      <!-- Top Title Group with Add Button -->
      <div class="page-title-banner" style="margin-bottom: 2px;">
        <div class="page-title-group">
          <div>
            <h2 style="display:flex; align-items:center; gap:8px; font-size:20px;">Transactions Ledger <span>📋✨</span></h2>
            <p style="font-size:12px; color:var(--text-muted);">Real-time search, filter, and management of all Google Sheets records.</p>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
          <a href="input.html" class="btn-primary" style="display:inline-flex; align-items:center; gap:6px; font-size:12px; padding:6px 14px; text-decoration:none;">
            <span>+ Add Transaction</span>
          </a>
        </div>
      </div>

      <!-- Top 4 KPI Cards (100% Dynamically Calculated) -->
      <div class="kpi-row-4">
        <!-- 1. Total Transactions -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Total Transactions</span>
              <span class="kpi-value">${filtered.length}</span>
              <span class="kpi-sub">Google Sheets records</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-purple" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
          </div>
        </div>

        <!-- 2. Total Inflow -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Total Inflow</span>
              <span class="kpi-value" style="color:#16a34a;">¥${totalInflow.toLocaleString()}</span>
              <span class="kpi-sub">Filtered Incomes</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-green" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
            </div>
          </div>
        </div>

        <!-- 3. Total Outflow -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Total Outflow</span>
              <span class="kpi-value" style="color:#ef4444;">¥${totalOutflow.toLocaleString()}</span>
              <span class="kpi-sub">Filtered Expenses</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-red" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/></svg>
            </div>
          </div>
        </div>

        <!-- 4. Net Balance -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Net Surplus/Deficit</span>
              <span class="kpi-value" style="color:${summary.netCashFlow >= 0 ? '#2563eb' : '#dc2626'};">${summary.netCashFlow >= 0 ? '+' : ''}¥${summary.netCashFlow.toLocaleString()}</span>
              <span class="kpi-sub">Calculated Balance</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-blue" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Ledger Card -->
      <div class="card" style="margin-top:14px;">
        <div class="card-header" style="flex-wrap:wrap; gap:10px;">
          <h3 class="card-title">All Transactions</h3>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="text" id="txSearchInput" placeholder="Search description, note..." class="filter-input" style="padding:4px 10px; width:180px; font-size:11.5px;">
            <select class="filter-select" id="txFilterType" style="padding:4px 8px; font-size:11.5px;">
              <option value="all">All CashFlow</option>
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
              <option value="Transfer">Transfer</option>
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Detail</th>
                <th>Account / Source</th>
                <th>ForWho</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="txTableBody">
              ${filtered.map(tx => `
                <tr>
                  <td>${tx.date}</td>
                  <td><strong>${tx.description}</strong></td>
                  <td><span class="badge cat-general">${tx.cashFlowType || 'General'}</span></td>
                  <td style="font-size:11px; color:var(--text-muted);">${tx.cashFlowDetail || tx.detail || '-'}</td>
                  <td>${tx.fromSource || tx.toSource || '-'}</td>
                  <td>${tx.forWho || 'US'}</td>
                  <td class="${tx.cashFlow === 'Income' ? 'amount-pos' : 'amount-neg'}">
                    ${tx.cashFlow === 'Income' ? '+' : '-'} ¥${(tx.amount || 0).toLocaleString()}
                  </td>
                  <td>${tx.currency || 'JPY'}</td>
                  <td><span class="badge" style="${tx.cashFlow === 'Income' ? 'background:#dcfce7; color:#15803d;' : 'background:#fee2e2; color:#b91c1c;'}">${tx.cashFlow}</span></td>
                  <td><span class="badge badge-success">✓ Cleared</span></td>
                  <td>
                    <div style="display:flex; gap:6px;">
                      <button class="btn-icon" onclick="window.BudgetTrackerApp.openEditModal(${tx.id})">✏️</button>
                      <button class="btn-icon" onclick="window.BudgetTrackerApp.handleDelete(${tx.id})">🗑️</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:12px; border-top:1px solid var(--border-subtle); margin-top:10px; font-size:11.5px; color:var(--text-muted);">
          <span>Showing ${filtered.length} Google Sheets transactions</span>
        </div>
      </div>
    `;

    // Real-time search and filter
    const searchInput = document.getElementById("txSearchInput");
    const filterType = document.getElementById("txFilterType");
    const tbody = document.getElementById("txTableBody");

    function applyFilter() {
      const q = (searchInput?.value || "").toLowerCase();
      const t = filterType?.value || "all";

      const filteredList = filtered.filter(tx => {
        const matchesQ = !q || (tx.description && tx.description.toLowerCase().includes(q)) || (tx.note && tx.note.toLowerCase().includes(q));
        const matchesT = t === "all" || tx.cashFlow === t;
        return matchesQ && matchesT;
      });

      if (tbody) {
        tbody.innerHTML = filteredList.map(tx => `
          <tr>
            <td>${tx.date}</td>
            <td><strong>${tx.description}</strong></td>
            <td><span class="badge cat-general">${tx.cashFlowType || 'General'}</span></td>
            <td style="font-size:11px; color:var(--text-muted);">${tx.cashFlowDetail || tx.detail || '-'}</td>
            <td>${tx.fromSource || tx.toSource || '-'}</td>
            <td>${tx.forWho || 'US'}</td>
            <td class="${tx.cashFlow === 'Income' ? 'amount-pos' : 'amount-neg'}">
              ${tx.cashFlow === 'Income' ? '+' : '-'} ¥${(tx.amount || 0).toLocaleString()}
            </td>
            <td>${tx.currency || 'JPY'}</td>
            <td><span class="badge" style="${tx.cashFlow === 'Income' ? 'background:#dcfce7; color:#15803d;' : 'background:#fee2e2; color:#b91c1c;'}">${tx.cashFlow}</span></td>
            <td><span class="badge badge-success">✓ Cleared</span></td>
            <td>
              <div style="display:flex; gap:6px;">
                <button class="btn-icon" onclick="window.BudgetTrackerApp.openEditModal(${tx.id})">✏️</button>
                <button class="btn-icon" onclick="window.BudgetTrackerApp.handleDelete(${tx.id})">🗑️</button>
              </div>
            </td>
          </tr>
        `).join('');
      }
    }

    if (searchInput && typeof searchInput.addEventListener === 'function') {
      searchInput.addEventListener("input", applyFilter);
    }
    if (filterType && typeof filterType.addEventListener === 'function') {
      filterType.addEventListener("change", applyFilter);
    }
  }

  return {
    render
  };
})();
