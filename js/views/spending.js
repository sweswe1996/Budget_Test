/**
 * Spending View Renderer — 100% Real Data matching Reference Architecture
 */

window.BudgetTrackerViews = window.BudgetTrackerViews || {};

window.BudgetTrackerViews.spending = (() => {
  function render(container, data, filters) {
    const calc = window.BudgetTrackerCalc;
    const charts = window.BudgetTrackerCharts;

    const filtered = calc.filterTransactions(data.transactions, filters);
    const summary = calc.computeSummary(filtered);
    const categoryGroup = calc.groupExpensesByCategory(filtered);

    const totalSpending = summary.totalExpense;
    const dailyAvg = Math.round(totalSpending / 30);
    const spendingCount = summary.spendingCount;
    const pctOfIncome = summary.totalIncome > 0 ? ((totalSpending / summary.totalIncome) * 100).toFixed(1) : "0.0";
    const topCat = categoryGroup.categories[0] || { name: "Food & Groceries", amount: 0, percentage: 0 };

    // Need vs Want analysis from real transactions (Only explicit Need vs Want)
    let needSum = 0;
    let wantSum = 0;

    // ForWho analysis from real transactions
    const forWhoMap = {};

    // Recurring expenses list from real transactions
    const recurringList = [];

    filtered.forEach(t => {
      if (t.cashFlow === "Expense") {
        const amt = Number(t.amount) || 0;
        const st = (t.status || "").toLowerCase();
        if (st.includes("need")) needSum += amt;
        else if (st.includes("want")) wantSum += amt;

        const who = t.forWho || "Me";
        forWhoMap[who] = (forWhoMap[who] || 0) + amt;

        const type = t.cashFlowType || "";
        if (type.includes("Fixed") || type.includes("Bills") || type.includes("Utilities")) {
          if (!recurringList.some(r => r.name === t.description)) {
            recurringList.push({ name: t.description, amount: amt, type: t.cashFlowType });
          }
        }
      }
    });

    const totalNeedWant = needSum + wantSum;
    const needPct = totalNeedWant > 0 ? ((needSum / totalNeedWant) * 100).toFixed(0) : 0;
    const wantPct = totalNeedWant > 0 ? ((wantSum / totalNeedWant) * 100).toFixed(0) : 0;

    const forWhoEntries = Object.entries(forWhoMap).map(([name, amt]) => ({
      name,
      amount: amt,
      percentage: totalSpending > 0 ? (amt / totalSpending) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);

    const expenseList = filtered.filter(t => t.cashFlow === "Expense").slice(0, 8);
    const aiRecs = calc.computeAiRecommendations(filtered, data.goals, data.budgets, data.schedules);
    const spendingInsights = aiRecs.spending || [];

    container.innerHTML = `
      <!-- Top Title Group -->
      <div class="page-title-banner" style="margin-bottom: 2px;">
        <div class="page-title-group">
          <div>
            <h2 style="display:flex; align-items:center; gap:8px; font-size:20px;">Spending Dashboard</h2>
            <p style="font-size:12px; color:var(--text-muted);">Analyze your spending patterns and make smarter money decisions.</p>
          </div>
        </div>
      </div>

      <!-- Top 5 KPI Cards (100% Dynamically Calculated) -->
      <div class="kpi-row">
        <!-- 1. Total Spending -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Total Spending</span>
              <span class="kpi-value" style="font-size:18px; color:var(--text-heading);">¥${totalSpending.toLocaleString()}</span>
              <span class="kpi-sub">Filtered Spend</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-blue" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
          </div>
        </div>

        <!-- 2. Daily Average -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Daily Average</span>
              <span class="kpi-value" style="font-size:18px; color:#16a34a;">¥${dailyAvg.toLocaleString()}</span>
              <span class="kpi-sub">Estimated per day</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-green" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
          </div>
        </div>

        <!-- 3. Transactions -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Transactions</span>
              <span class="kpi-value" style="font-size:18px; color:#7c3aed;">${spendingCount}</span>
              <span class="kpi-sub">Total purchases</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-purple" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
          </div>
        </div>

        <!-- 4. % of Income -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">% of Income</span>
              <span class="kpi-value" style="font-size:18px; color:#ea580c;">${pctOfIncome}%</span>
              <span class="kpi-sub">Spending Ratio</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-orange" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
            </div>
          </div>
        </div>

        <!-- 5. Top Category -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Top Category</span>
              <span class="kpi-value" style="font-size:18px; color:#0284c7; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${topCat.name}</span>
              <span class="kpi-sub">¥${topCat.amount.toLocaleString()} (${topCat.percentage.toFixed(1)}%)</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-cyan" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 12"/><line x1="12" x2="12" y1="8" y2="16"/></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Middle Section: 1. Spending by Category | 2. Spending Trend | 3. Spending by ForWho -->
      <div class="spending-middle-grid">
        
        <!-- 1. Spending by Category Donut -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Spending by Category</h3>
          </div>
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:240px;">
            <div class="donut-wrapper" style="width:125px; height:125px; flex-shrink:0; margin-bottom:8px;">
              <canvas id="spendingCategoryDonutCanvas"></canvas>
              <div class="donut-center-label">
                <div class="donut-center-amount" style="font-size:12.5px; font-weight:800;">¥${Math.round(totalSpending/1000)}K</div>
                <div class="donut-center-sub" style="font-size:8.5px;">Total</div>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:3px; width:100%; max-height:100px; overflow-y:auto; font-size:10.5px;">
              ${categoryGroup.categories.map((c, idx) => {
                const colors = ["#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#0284c7", "#ef4444", "#db2777", "#64748b"];
                return `
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="display:flex; align-items:center; gap:5px;"><span style="width:7px; height:7px; border-radius:50%; background:${colors[idx % colors.length]};"></span> ${c.name}</span>
                    <span style="font-weight:600;">¥${c.amount.toLocaleString()} (${c.percentage.toFixed(1)}%)</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- 2. Spending Trend Line Chart -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Spending Trend</h3>
          </div>
          <div class="chart-container" style="height: 240px;">
            <canvas id="spendingTrendLineCanvas"></canvas>
          </div>
        </div>

        <!-- 3. Spending by ForWho Donut -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Spending by ForWho</h3>
          </div>
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:240px;">
            <div class="donut-wrapper" style="width:125px; height:125px; flex-shrink:0; margin-bottom:8px;">
              <canvas id="spendingForWhoDonutCanvas"></canvas>
              <div class="donut-center-label">
                <div class="donut-center-amount" style="font-size:12.5px; font-weight:800;">¥${Math.round(totalSpending/1000)}K</div>
                <div class="donut-center-sub" style="font-size:8.5px;">Total</div>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:3px; width:100%; max-height:100px; overflow-y:auto; font-size:10.5px;">
              ${forWhoEntries.map((w, idx) => {
                const colors = ["#2563eb", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];
                return `
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="display:flex; align-items:center; gap:5px;"><span style="width:7px; height:7px; border-radius:50%; background:${colors[idx % colors.length]};"></span> ${w.name}</span>
                    <span style="font-weight:600;">¥${w.amount.toLocaleString()} (${w.percentage.toFixed(1)}%)</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

      </div>

      <!-- Lower Section: 1. Need vs Want | 2. Top Spending Change | 3. Recurring Expenses | 4. Spending Alerts -->
      <div class="spending-lower-grid">
        
        <!-- 1. Need vs Want Vertical Bar Comparison -->
        <div class="card">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
            <h3 class="card-title">Need vs Want</h3>
            <span style="font-size:10.5px; color:var(--text-muted); font-weight:600;">¥${totalNeedWant.toLocaleString()} Total</span>
          </div>
          <div style="display:flex; flex-direction:column; justify-content:space-between; height:200px; padding:2px 0;">
            <div style="height:150px; width:100%; position:relative;">
              <canvas id="spendingNeedWantCanvas"></canvas>
            </div>
            <div style="display:flex; justify-content:space-between; width:100%; font-size:10.5px; padding:4px 8px; background:var(--bg-hover, rgba(0,0,0,0.03)); border-radius:6px; border:1px solid var(--border-color);">
              <span style="display:flex; align-items:center; gap:5px;">
                <span style="width:7px; height:7px; border-radius:50%; background:#10b981;"></span>
                <strong>Need:</strong> ¥${needSum.toLocaleString()} (${needPct}%)
              </span>
              <span style="display:flex; align-items:center; gap:5px;">
                <span style="width:7px; height:7px; border-radius:50%; background:#f59e0b;"></span>
                <strong>Want:</strong> ¥${wantSum.toLocaleString()} (${wantPct}%)
              </span>
            </div>
          </div>
        </div>

        <!-- 2. Top Spending Breakdown -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Top Categories</h3>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px; height:200px; overflow-y:auto; font-size:11px;">
            ${categoryGroup.categories.slice(0, 5).map(c => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid var(--border-color);">
                <strong>${c.name}</strong>
                <span style="font-weight:700; color:var(--text-heading);">¥${c.amount.toLocaleString()}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 3. Recurring Expenses -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Recurring Expenses</h3>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px; height:200px; overflow-y:auto; font-size:11px;">
            ${recurringList.length > 0 ? recurringList.slice(0, 5).map(r => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid var(--border-color);">
                <div>
                  <strong>${r.name}</strong>
                  <div style="font-size:9.5px; color:var(--text-muted);">${r.type}</div>
                </div>
                <span style="font-weight:700;">¥${r.amount.toLocaleString()}</span>
              </div>
            `).join('') : `
              <div style="text-align:center; color:var(--text-muted); padding:30px 0;">No recurring bills tracked.</div>
            `}
          </div>
        </div>

        <!-- 4. Spending Insights / Advice -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Spending Advice</h3>
          </div>
          <div style="display:flex; flex-direction:column; justify-content:space-between; height:200px;">
            <div style="font-size:11px; line-height:1.4; color:var(--text-muted);">
              Track your essential purchases under <strong>Need</strong> to ensure high savings rates.
            </div>
            <div style="padding:8px 10px; border-radius:8px; background:rgba(37, 99, 235, 0.08); border:1px solid rgba(37, 99, 235, 0.2); font-size:10.5px; color:#2563eb; line-height:1.35;">
              💡 <strong>${topCat.name}</strong> is your highest expense area this period representing ${topCat.percentage.toFixed(1)}% of all spending.
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom: Recent Spending Transactions -->
      <div class="card" style="margin-top:14px;">
        <div class="card-header">
          <h3 class="card-title">Recent Transactions (Spending Only)</h3>
          <a href="input.html" class="btn-primary" style="padding:4px 10px; font-size:11px; text-decoration:none;">+ New Expense</a>
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
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${expenseList.map(tx => `
                <tr>
                  <td>${tx.date}</td>
                  <td><strong>${tx.description}</strong></td>
                  <td><span class="badge cat-general">${tx.cashFlowType || 'General'}</span></td>
                  <td>${tx.fromSource || '-'}</td>
                  <td>${tx.forWho || 'US'}</td>
                  <td class="amount-neg" style="font-weight:700;">-¥${Number(tx.amount || 0).toLocaleString()}</td>
                  <td><span class="badge ${tx.status === 'Need' ? 'badge-success' : 'badge-warning'}">${tx.status || 'Need'}</span></td>
                  <td>
                    <div style="display:flex; gap:6px;">
                      <button class="btn-icon" onclick="window.BudgetTrackerApp.openEditModal(${tx.id})" title="Edit">✏️</button>
                      <button class="btn-icon" onclick="window.BudgetTrackerApp.handleDelete(${tx.id})" title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // 1. Render Category Donut
    const catLabels = categoryGroup.categories.map(c => c.name);
    const catData = categoryGroup.categories.map(c => c.amount);
    const catColors = ["#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#0284c7", "#ef4444", "#db2777", "#64748b"];

    if (catLabels.length > 0) {
      charts.renderDonutChart("spendingCategoryDonutCanvas", {
        labels: catLabels,
        data: catData,
        colors: catColors.slice(0, catLabels.length),
        cutout: "70%"
      });
    }

    // 2. Render 100% Real Spending Trend
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;
      const label = `${monthNames[d.getMonth()]} '${String(year).slice(-2)}`;
      last6Months.push({ key, label, amount: 0 });
    }

    filtered.forEach(t => {
      if (t.cashFlow === "Expense" && t.date) {
        const monthKey = String(t.date).slice(0, 7);
        const found = last6Months.find(m => m.key === monthKey);
        if (found) {
          found.amount += Number(t.amount) || 0;
        }
      }
    });

    charts.renderMonthlyLineChart("spendingTrendLineCanvas", {
      labels: last6Months.map(m => m.label),
      datasets: [
        {
          label: "Spending (¥)",
          data: last6Months.map(m => m.amount),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.06)",
          borderWidth: 2.2,
          pointBackgroundColor: "#2563eb",
          pointRadius: 3.5,
          tension: 0.35
        }
      ]
    });

    // 3. Render ForWho Donut
    if (forWhoEntries.length > 0) {
      charts.renderDonutChart("spendingForWhoDonutCanvas", {
        labels: forWhoEntries.map(w => w.name),
        data: forWhoEntries.map(w => w.amount),
        colors: ["#2563eb", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"],
        cutout: "70%"
      });
    }

    // 4. Render Need vs Want Vertical Bar Chart (Excluding Unspecified)
    charts.destroyChart("spendingNeedWantCanvas");
    const needWantCanvasEl = document.getElementById("spendingNeedWantCanvas");
    if (needWantCanvasEl) {
      const nwCtx = needWantCanvasEl.getContext("2d");
      if (nwCtx && typeof Chart !== "undefined") {
        new Chart(nwCtx, {
          type: "bar",
          data: {
            labels: ["Need", "Want"],
            datasets: [{
              label: "Expenses",
              data: [needSum, wantSum],
              backgroundColor: [
                "rgba(16, 185, 129, 0.85)",
                "rgba(245, 158, 11, 0.85)"
              ],
              borderColor: ["#10b981", "#f59e0b"],
              borderWidth: 1.5,
              borderRadius: 6,
              barThickness: 32,
              maxBarThickness: 38
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const val = ctx.parsed.y;
                    const pct = totalNeedWant > 0 ? ((val / totalNeedWant) * 100).toFixed(1) : 0;
                    return ` ¥${val.toLocaleString()} (${pct}%)`;
                  }
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                border: { display: false },
                ticks: {
                  font: { size: 11, weight: "600" }
                }
              },
              y: {
                beginAtZero: true,
                grid: { color: "rgba(100, 116, 139, 0.08)" },
                border: { display: false },
                ticks: {
                  callback: (val) => val === 0 ? "¥0" : `¥${Math.round(val / 1000)}K`,
                  font: { size: 9.5 }
                }
              }
            }
          }
        });
      }
    }
  }

  return {
    render
  };
})();
