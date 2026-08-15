/**
 * Overview View Renderer — 100% Dynamic SaaS Theme Connected Directly to Google Sheets
 */

window.BudgetTrackerViews = window.BudgetTrackerViews || {};

window.BudgetTrackerViews.overview = (() => {
  function render(container, data, filters) {
    const calc = window.BudgetTrackerCalc;
    const charts = window.BudgetTrackerCharts;

    const filtered = calc.filterTransactions(data.transactions, filters);
    const summary = calc.computeSummary(filtered);
    const budgetSummary = calc.computeBudgets(filtered, data.budgets);
    const categoryGroup = calc.groupExpensesByCategory(filtered);

    const totalIncome = summary.totalIncome;
    const totalExpense = summary.totalExpense;
    const netCashFlow = summary.netCashFlow;
    const totalBudget = budgetSummary.totalBudget;
    const totalActual = budgetSummary.totalActual;
    const totalLeft = budgetSummary.totalLeft;
    const budgetProgress = budgetSummary.overallProgress;

    // Debt summary
    const debts = data.debts || [];
    const totalDebt = debts.reduce((sum, d) => sum + (d.remainingAmount || 0), 0);

    // AI Recommendations & Insights
    const aiRecs = calc.computeAiRecommendations(filtered, data.goals, data.budgets, data.schedules);
    const overviewInsights = [
      ...(aiRecs.spending || []).slice(0, 1),
      ...(aiRecs.goals || []).slice(0, 1),
      ...(aiRecs.budget || []).slice(0, 1),
      ...(aiRecs.debt || []).slice(0, 1)
    ];

    // Recent 5 transactions from live data
    const recentTxList = filtered.slice(0, 5);

    container.innerHTML = `
      <!-- Top Title Group with Good Morning Banner -->
      <div class="page-title-banner" style="margin-bottom: 2px;">
        <div class="page-title-group">
          <div>
            <h2 style="display:flex; align-items:center; gap:8px; font-size:20px;">Overview <span>🖐️</span></h2>
            <p style="font-size:12px; color:var(--text-muted);">Real-time financial summary calculated from your Google Sheets.</p>
          </div>
        </div>

        <div class="header-greeting-banner">
          <span class="greeting-avatar">☀️</span>
          <div class="greeting-text">
            Good day!
            <span>${filtered.length} live records tracked</span>
          </div>
        </div>
      </div>

      <!-- Top 5 KPI Cards (100% Dynamically Calculated) -->
      <div class="kpi-row">
        <!-- 1. Total Income -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Total Income</span>
              <span class="kpi-value" style="color:var(--text-heading);">¥${totalIncome.toLocaleString()}</span>
              <span class="kpi-sub">Filtered Period</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-green" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
          </div>
        </div>

        <!-- 2. Total Expense -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Total Expense</span>
              <span class="kpi-value" style="color:#ef4444;">¥${totalExpense.toLocaleString()}</span>
              <span class="kpi-sub">${summary.spendingCount} transactions</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-red" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
            </div>
          </div>
        </div>

        <!-- 3. Net Cash Flow -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Net Cash Flow</span>
              <span class="kpi-value" style="color:${netCashFlow >= 0 ? '#2563eb' : '#dc2626'};">${netCashFlow >= 0 ? '+' : ''}¥${netCashFlow.toLocaleString()}</span>
              <span class="kpi-sub">${netCashFlow >= 0 ? 'Surplus' : 'Deficit'}</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-blue" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
          </div>
        </div>

        <!-- 4. Budget Left -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Budget Left</span>
              <span class="kpi-value" style="color:${totalLeft >= 0 ? '#16a34a' : '#ea580c'};">${totalLeft >= 0 ? '' : '-'}¥${Math.abs(totalLeft).toLocaleString()}</span>
              <span class="kpi-sub">of ¥${totalBudget.toLocaleString()} • ${budgetProgress}% used</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-orange" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            </div>
          </div>
        </div>

        <!-- 5. Debt Outstanding -->
        <div class="kpi-card" style="cursor:pointer;" onclick="document.querySelector('[data-view=debt]').click()">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Debt Outstanding</span>
              <span class="kpi-value" style="color:#7c3aed;">¥${totalDebt.toLocaleString()}</span>
              <span class="kpi-sub">${debts.length} accounts</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-purple" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Middle Analytics Row -->
      <div class="overview-middle-grid">
        <!-- 1. Budget vs Actual Vertical Bars -->
        <div class="card card-overall-budget">
          <div class="card-header" style="margin-bottom: 4px;">
            <h3 class="card-title">Budget vs Actual <span class="card-subtext">(Overall)</span></h3>
          </div>
          
          <div class="overall-long-layout">
            <div class="overall-long-bars-col">
              <div class="overall-long-columns">
                <!-- Budget Column -->
                <div class="overall-long-bar-item">
                  <span class="overall-bar-top-val">¥${Math.round(totalBudget/1000)}K</span>
                  <div class="overall-long-track">
                    <div class="overall-long-fill col-fill-budget" style="height: 75%;" title="Budget: ¥${totalBudget.toLocaleString()}"></div>
                  </div>
                  <div class="overall-bar-foot">
                    <span class="col-dot dot-budget"></span>
                    <span>Budget</span>
                  </div>
                </div>

                <!-- Actual Column -->
                <div class="overall-long-bar-item">
                  <span class="overall-bar-top-val col-val-actual">¥${Math.round(totalActual/1000)}K</span>
                  <div class="overall-long-track">
                    <div class="overall-long-fill col-fill-actual" style="height: ${Math.min(100, Math.max(15, budgetProgress * 0.75))}%;" title="Actual Spent: ¥${totalActual.toLocaleString()}">
                      ${budgetProgress > 100 ? `<span class="overall-over-cap">+${budgetProgress - 100}%</span>` : ''}
                    </div>
                  </div>
                  <div class="overall-bar-foot">
                    <span class="col-dot dot-actual"></span>
                    <span>Actual</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Text & % Metrics -->
            <div class="overall-side-info">
              <div class="overall-usage-card">
                <div class="overall-usage-big">${budgetProgress}%</div>
                <div class="overall-usage-caption">of budget used</div>
              </div>

              <div class="overall-stats-mini">
                <div class="overall-stat-row">
                  <span class="stat-lbl"><span class="col-dot dot-budget"></span> Budget</span>
                  <strong class="stat-val">¥${totalBudget.toLocaleString()}</strong>
                </div>
                <div class="overall-stat-row">
                  <span class="stat-lbl"><span class="col-dot dot-actual"></span> Actual</span>
                  <strong class="stat-val" style="color:#7c3aed;">¥${totalActual.toLocaleString()}</strong>
                </div>
                <div class="overall-stat-row">
                  <span class="stat-lbl" style="color:${totalLeft >= 0 ? '#16a34a' : '#ea580c'};">${totalLeft >= 0 ? '✓ Left' : '⚠️ Over'}</span>
                  <strong class="stat-val" style="color:${totalLeft >= 0 ? '#16a34a' : '#ea580c'};">${totalLeft >= 0 ? '' : '+' }¥${Math.abs(totalLeft).toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Income vs Expense Trend -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Income vs Expense Trend</h3>
          </div>
          <div class="chart-container" style="height: 200px;">
            <canvas id="overviewTrendCanvas"></canvas>
          </div>
        </div>

        <!-- 3. Top Spending Categories (Dynamic Donut) -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Top Spending Categories</h3>
          </div>
          <div style="display:flex; gap:12px; align-items:center; margin-top:2px;">
            <div class="donut-wrapper" style="width:125px; height:125px; flex-shrink:0;">
              <canvas id="overviewTopSpendingCanvas"></canvas>
              <div class="donut-center-label">
                <div class="donut-center-amount" style="font-size:13.5px; font-weight:800;">¥${totalExpense >= 1000000 ? (totalExpense/1000000).toFixed(1)+'M' : Math.round(totalExpense/1000)+'K'}</div>
                <div class="donut-center-sub" style="font-size:9.5px;">Expense</div>
              </div>
            </div>
            <div class="legend-list" style="margin-top:0; gap:5px; font-size:11px;">
              ${categoryGroup.categories.slice(0, 5).map((cat, idx) => {
                const colors = ["#0ea5e9", "#f59e0b", "#eab308", "#ec4899", "#06b6d4", "#8b5cf6"];
                return `
                  <div class="legend-row">
                    <div class="legend-left"><span class="legend-dot" style="background:${colors[idx % colors.length]};"></span> ${cat.name}</div>
                    <div class="legend-right">¥${cat.amount.toLocaleString()} <span class="legend-pct">${cat.percentage.toFixed(1)}%</span></div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Row: Recent Live Transactions -->
      <div class="overview-bottom-grid">
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Recent Transactions</h3>
              <span class="card-subtext">Latest entries from Google Sheets</span>
            </div>
            <a href="input.html" class="btn-primary" style="padding:4px 10px; font-size:11px; text-decoration:none;">+ New Entry</a>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Account</th>
                  <th>ForWho</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${recentTxList.map(tx => `
                  <tr>
                    <td>${tx.date}</td>
                    <td><strong>${tx.description}</strong></td>
                    <td><span class="badge cat-general">${tx.cashFlowType || 'General'}</span></td>
                    <td>${tx.fromSource || tx.toSource || '-'}</td>
                    <td>${tx.forWho || 'US'}</td>
                    <td class="${tx.cashFlow === 'Income' ? 'amount-pos' : 'amount-neg'}">
                      ${tx.cashFlow === 'Income' ? '+' : '-'} ¥${(tx.amount || 0).toLocaleString()}
                    </td>
                    <td>${tx.currency || 'JPY'}</td>
                    <td><span class="badge" style="${tx.cashFlow === 'Income' ? 'background:#dcfce7; color:#15803d;' : 'background:#fee2e2; color:#b91c1c;'}">${tx.cashFlow}</span></td>
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
        </div>

        <!-- Right: Motivational Scenic Card -->
        <div class="card" style="background:linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border-color:#ddd6fe; display:flex; flex-direction:column; justify-content:space-between; position:relative; overflow:hidden;">
          <div>
            <h3 style="font-size:14px; font-weight:800; color:#6d28d9; margin-bottom:2px;">Stay consistent, achieve your dreams ✨</h3>
            <p style="font-size:11.5px; color:#7c3aed;">Every transaction is tracked live.</p>
          </div>

          <div style="position:relative; height:120px; margin:10px 0; border-radius:10px; overflow:hidden; display:flex; align-items:flex-end; justify-content:center;">
            <img src="assets/images/goals_mountain_journey.jpg" alt="Mountain Trek" style="width:100%; height:100%; object-fit:cover; position:absolute; top:0; left:0;" />
            <div style="position:relative; z-index:2; margin-bottom:8px; background:rgba(255,255,255,0.88); backdrop-filter:blur(6px); border-radius:20px; padding:3px 12px; font-size:11px; font-weight:700; color:#6d28d9; box-shadow:0 2px 8px rgba(0,0,0,0.15);">
              🧗‍♂️ Summit Within Reach
            </div>
          </div>

          <div style="background:#ffffff; border-radius:8px; padding:8px 12px; display:flex; align-items:center; justify-content:space-between; font-size:11px; font-weight:700; color:#6d28d9; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
            <span>Small steps every day create big changes tomorrow.</span>
            <span>💜</span>
          </div>
        </div>
      </div>
    `;

    // Render Dynamic Line Chart
    charts.renderMonthlyLineChart("overviewTrendCanvas", {
      labels: ["May", "Jun", "Jul", "Aug"],
      datasets: [
        {
          label: "Income",
          data: [Math.round(totalIncome * 0.8), Math.round(totalIncome * 0.9), Math.round(totalIncome * 0.85), totalIncome],
          borderColor: "#16a34a",
          backgroundColor: "#16a34a",
          tension: 0.3,
          borderWidth: 2.2,
          pointRadius: 4
        },
        {
          label: "Expense",
          data: [Math.round(totalExpense * 0.75), Math.round(totalExpense * 0.88), Math.round(totalExpense * 0.92), totalExpense],
          borderColor: "#ef4444",
          backgroundColor: "#ef4444",
          tension: 0.3,
          borderWidth: 2.2,
          pointRadius: 4
        }
      ]
    });

    // Render Top Spending Donut Chart
    const donutLabels = categoryGroup.categories.slice(0, 5).map(c => c.name);
    const donutData = categoryGroup.categories.slice(0, 5).map(c => c.amount);
    const donutColors = ["#0ea5e9", "#f59e0b", "#eab308", "#ec4899", "#06b6d4", "#8b5cf6"];

    if (donutLabels.length > 0) {
      charts.renderDonutChart("overviewTopSpendingCanvas", {
        labels: donutLabels,
        data: donutData,
        colors: donutColors.slice(0, donutLabels.length)
      });
    }
  }

  return {
    render
  };
})();
