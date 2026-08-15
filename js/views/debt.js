/**
 * Debt & Lending View Renderer — 100% Real Live Google Sheets Transactions Data
 * Unified Hub for Liabilities (Debt I Owe) & Receivables (Money I Lent to Others)
 */

window.BudgetTrackerViews = window.BudgetTrackerViews || {};

window.BudgetTrackerViews.debt = (() => {
  let activeTab = "all"; // "all" | "lent" | "debt"

  function getDebtIconConfig(name, type) {
    const n = (name || '').toLowerCase();
    const t = (type || '').toLowerCase();

    if (n.includes('jcb')) return { bg: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', icon: '💳' };
    if (n.includes('mufg')) return { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', icon: '💳' };
    if (n.includes('rakuten')) return { bg: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', icon: '🏦' };
    if (n.includes('home')) return { bg: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', icon: '🏠' };
    if (n.includes('car')) return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', icon: '🚗' };
    if (t.includes('card')) return { bg: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', icon: '💳' };
    return { bg: 'rgba(100, 116, 139, 0.12)', color: '#64748b', icon: '📄' };
  }

  function getLendingIconConfig(relationship) {
    const r = (relationship || '').toLowerCase();
    if (r.includes('friend')) return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', icon: '🤝' };
    if (r.includes('family') || r.includes('relative')) return { bg: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', icon: '👨‍👩‍👧' };
    if (r.includes('colleague') || r.includes('work')) return { bg: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', icon: '💼' };
    if (r.includes('business')) return { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', icon: '🏢' };
    return { bg: 'rgba(100, 116, 139, 0.12)', color: '#64748b', icon: '👤' };
  }

  function getDaysRemainingBadge(dueDateStr) {
    if (!dueDateStr || dueDateStr === '-') return `<span class="badge badge-info" style="font-size:10px;">Active</span>`;
    const now = new Date();
    const target = new Date(dueDateStr);
    if (isNaN(target.getTime())) return `<span class="badge badge-info" style="font-size:10px;">Active</span>`;
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `<span class="badge badge-danger" style="font-size:10px;">Overdue (${Math.abs(diffDays)}d)</span>`;
    if (diffDays === 0) return `<span class="badge badge-danger" style="font-size:10px;">Due Today</span>`;
    if (diffDays <= 3) return `<span class="badge badge-danger" style="font-size:10px;">Due in ${diffDays}d</span>`;
    if (diffDays <= 7) return `<span class="badge badge-warning" style="font-size:10px;">Due in ${diffDays}d</span>`;
    return `<span class="badge badge-info" style="font-size:10px;">Due in ${diffDays}d</span>`;
  }

  function switchTab(tab) {
    activeTab = tab;
    const container = document.getElementById("viewContainer");
    if (container && window.BudgetTrackerApp) {
      render(container, window.BudgetTrackerApp.getCurrentData ? window.BudgetTrackerApp.getCurrentData() : window.BudgetTrackerData, {});
    }
  }

  // Expose helpers globally
  window.BudgetTrackerDebtView = {
    switchTab
  };

  function render(container, data, filters) {
    const calc = window.BudgetTrackerCalc;
    const charts = window.BudgetTrackerCharts;

    const filtered = calc.filterTransactions(data.transactions || [], filters || {});
    const debtData = calc.computeDebts(filtered, data.debts || []);
    const debtList = debtData.debts;

    // 100% Real Live Google Sheets Lending Data
    const lendingData = calc.computeLending(filtered);
    const lendingList = lendingData.lendingList;

    const totalDebtLeft = debtData.totalDebtLeft;
    const paidThisMonth = debtData.totalPaidThisMonth;
    const upcomingThisMonth = debtData.upcomingThisMonth;
    const avgInterestRate = debtData.avgInterestRate;

    const totalMoneyLentRemaining = lendingData.totalRemaining;
    const totalMoneyLentRepaid = lendingData.totalRepaid;
    const activeBorrowersCount = lendingData.activeBorrowersCount;

    // Net Debt Position (Money Lent Asset vs Debt Owed Liability)
    const netPosition = totalMoneyLentRemaining - totalDebtLeft;
    const isNetPositive = netPosition >= 0;

    // Filter debt/loan/lending transactions
    const debtTxList = filtered.filter(t => {
      const type = (t.cashFlowType || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();
      const detail = (t.detail || t.cashFlowDetail || '').toLowerCase();
      return type.includes('loan') || desc.includes('loan') || desc.includes('card') || desc.includes('repayment') || detail.includes('loan') || type.includes('lend');
    }).slice(0, 8);
    
    const aiRecs = calc.computeAiRecommendations(filtered, data.goals, data.budgets, data.schedules);
    const debtInsights = aiRecs.debt || [];

    container.innerHTML = `
      <!-- Top Title Group with Action Buttons -->
      <div class="page-title-banner" style="margin-bottom: 8px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div class="page-title-group">
          <div>
            <h2 style="display:flex; align-items:center; gap:8px; font-size:20px; margin:0;">Debt &amp; Lending Dashboard <span>⚖️🛡️</span></h2>
            <p style="font-size:12px; color:var(--text-muted); margin:2px 0 0 0;">100% Real-time liabilities &amp; receivables calculated directly from your Google Sheets.</p>
          </div>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <a href="input.html?tab=expense&type=Lend_Expenses" class="btn-primary" style="padding:6px 14px; font-size:12px; font-weight:700; border-radius:8px; display:flex; align-items:center; gap:6px; text-decoration:none; cursor:pointer;">
            <span>🤝</span> + Lend Money Entry
          </a>
          <a href="input.html?tab=income&type=Lend_Income" class="btn-primary" style="padding:6px 14px; font-size:12px; font-weight:700; border-radius:8px; display:flex; align-items:center; gap:6px; text-decoration:none; cursor:pointer; background:#10b981;">
            <span>💵</span> + Record Repayment
          </a>
        </div>
      </div>

      <!-- Top 5 KPI Cards (Net Financial Health Position) -->
      <div class="kpi-row">
        <!-- 1. Net Debt Position -->
        <div class="kpi-card" style="border-top: 3px solid ${isNetPositive ? '#10b981' : '#ef4444'};">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Net Position (Lent vs Debt)</span>
              <span class="kpi-value" style="font-size:18px; color:${isNetPositive ? '#10b981' : '#ef4444'};">
                ${isNetPositive ? '+' : '-'}¥${Math.abs(netPosition).toLocaleString()}
              </span>
              <span class="kpi-sub">${isNetPositive ? '🟢 Net Asset (Receivables > Debt)' : '🔴 Net Debt (Liabilities > Receivables)'}</span>
            </div>
            <div class="kpi-icon-wrap" style="background:${isNetPositive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'}; color:${isNetPositive ? '#10b981' : '#ef4444'}; border-radius:12px; width:38px; height:38px;">
              ⚖️
            </div>
          </div>
        </div>

        <!-- 2. Debt I Owe (Liabilities) -->
        <div class="kpi-card" style="border-top: 3px solid #ef4444; cursor:pointer;" onclick="window.BudgetTrackerDebtView.switchTab('debt')">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Debt I Owe (Liabilities)</span>
              <span class="kpi-value" style="font-size:18px; color:#ef4444;">¥${totalDebtLeft.toLocaleString()}</span>
              <span class="kpi-sub">Total active debts (${debtList.length})</span>
            </div>
            <div class="kpi-icon-wrap" style="background:rgba(239,68,68,0.12); color:#ef4444; border-radius:12px; width:38px; height:38px;">
              🔴
            </div>
          </div>
        </div>

        <!-- 3. Money I Lent (Receivables) -->
        <div class="kpi-card" style="border-top: 3px solid #10b981; cursor:pointer;" onclick="window.BudgetTrackerDebtView.switchTab('lent')">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Money Lent (Receivables)</span>
              <span class="kpi-value" style="font-size:18px; color:#10b981;">¥${totalMoneyLentRemaining.toLocaleString()}</span>
              <span class="kpi-sub">To receive from ${activeBorrowersCount} persons</span>
            </div>
            <div class="kpi-icon-wrap" style="background:rgba(16,185,129,0.12); color:#10b981; border-radius:12px; width:38px; height:38px;">
              🟢
            </div>
          </div>
        </div>

        <!-- 4. Paid This Month -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Paid Off This Month</span>
              <span class="kpi-value" style="font-size:18px; color:#10b981;">¥${(paidThisMonth + totalMoneyLentRepaid).toLocaleString()}</span>
              <span class="kpi-sub">Total settled repayments</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-green" style="border-radius:12px; width:38px; height:38px;">
              ✅
            </div>
          </div>
        </div>

        <!-- 5. Avg Interest Rate -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Avg Interest Rate</span>
              <span class="kpi-value" style="font-size:18px; color:#f59e0b;">${avgInterestRate}%</span>
              <span class="kpi-sub">Monthly due: ¥${upcomingThisMonth.toLocaleString()}</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-orange" style="border-radius:12px; width:38px; height:38px;">
              📊
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Switcher Bar -->
      <div class="debt-tab-bar">
        <button class="debt-tab-btn ${activeTab === 'all' ? 'active' : ''}" onclick="window.BudgetTrackerDebtView.switchTab('all')">
          ✨ Overview &amp; Net Balance
        </button>
        <button class="debt-tab-btn ${activeTab === 'debt' ? 'active' : ''}" onclick="window.BudgetTrackerDebtView.switchTab('debt')">
          🔴 Debt I Owe (${debtList.length})
        </button>
        <button class="debt-tab-btn ${activeTab === 'lent' ? 'active' : ''}" onclick="window.BudgetTrackerDebtView.switchTab('lent')">
          🟢 Money I Lent to Others (${lendingList.length})
        </button>
      </div>

      <!-- SECTION 1: Debt Accounts Overview Table (Liabilities Table) -->
      ${(activeTab === 'all' || activeTab === 'debt') ? `
        <div class="card" style="margin-top:14px; border-left:4px solid #ef4444;">
          <div class="card-header">
            <div>
              <h3 class="card-title" style="display:flex; align-items:center; gap:8px;">
                <span>🔴</span> Debt Accounts Overview <span style="font-size:12px; color:var(--text-muted); font-weight:normal;">(Liabilities I Owe)</span>
              </h3>
              <p style="font-size:11.5px; color:var(--text-muted); margin:0;">Credit cards, bank loans, and mortgages being repaid.</p>
            </div>
          </div>
          <div class="table-responsive">
            <table class="data-table" style="font-size:11.5px; width:100%;">
              <thead>
                <tr style="border-bottom:1px solid var(--border-color); color:var(--text-muted);">
                  <th>Debt Source</th>
                  <th>Type</th>
                  <th style="text-align:right;">Original Amount</th>
                  <th style="text-align:right;">Remaining Balance</th>
                  <th style="text-align:right;">Interest Rate</th>
                  <th style="text-align:right;">Monthly Due</th>
                  <th style="text-align:right;">Next Due Date</th>
                  <th style="text-align:center;">Status</th>
                  <th style="text-align:right; min-width:110px;">Payoff %</th>
                </tr>
              </thead>
              <tbody>
                ${debtList.map(d => {
                  const iconCfg = getDebtIconConfig(d.name, d.type);
                  return `
                    <tr style="border-bottom:1px solid var(--border-color);">
                      <td>
                        <div style="display:flex; align-items:center; gap:8px;">
                          <div style="width:26px; height:26px; border-radius:6px; background:${iconCfg.bg}; color:${iconCfg.color}; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:13px;">
                            ${iconCfg.icon}
                          </div>
                          <strong>${d.name}</strong>
                        </div>
                      </td>
                      <td><span class="badge badge-info" style="font-size:10px;">${d.type}</span></td>
                      <td style="text-align:right; font-feature-settings:'tnum';">¥${d.originalAmount.toLocaleString()}</td>
                      <td style="text-align:right; font-feature-settings:'tnum'; font-weight:700; color:#ef4444;">¥${d.remainingAmount.toLocaleString()}</td>
                      <td style="text-align:right; font-feature-settings:'tnum';">${d.interestRate}%</td>
                      <td style="text-align:right; font-feature-settings:'tnum';">¥${d.monthlyDue.toLocaleString()}</td>
                      <td style="text-align:right; font-feature-settings:'tnum'; color:var(--text-muted);">${d.nextDueDate}</td>
                      <td style="text-align:center;"><span class="badge badge-success" style="font-size:10px;">${d.status}</span></td>
                      <td style="text-align:right;">
                        <div style="display:flex; align-items:center; justify-content:flex-end; gap:6px;">
                          <div style="flex:1; max-width:65px; height:5px; background:var(--bg-hover, #e2e8f0); border-radius:99px; overflow:hidden;">
                            <div style="width:${d.progress}%; height:100%; border-radius:99px; background:#10b981;"></div>
                          </div>
                          <span style="font-size:10.5px; font-weight:600; min-width:30px;">${d.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- SECTION 2: Money I Lent to Others (Receivables Table from Google Sheets) -->
      ${(activeTab === 'all' || activeTab === 'lent') ? `
        <div class="card" style="margin-top:14px; border-left:4px solid #10b981;">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h3 class="card-title" style="display:flex; align-items:center; gap:8px;">
                <span>🟢</span> Money I Lent to Others <span style="font-size:12px; color:var(--text-muted); font-weight:normal;">(Live from Google Sheets: Lend_Expenses &amp; Lend_Income)</span>
              </h3>
              <p style="font-size:11.5px; color:var(--text-muted); margin:0;">Real-time borrower balances calculated from your Google Sheets records.</p>
            </div>
            <a href="input.html?tab=expense&type=Lend_Expenses" class="btn-primary" style="padding:4px 10px; font-size:11px; text-decoration:none; cursor:pointer;">+ Add Lend Entry</a>
          </div>
          <div class="table-responsive">
            <table class="data-table" style="font-size:11.5px; width:100%;">
              <thead>
                <tr style="border-bottom:1px solid var(--border-color); color:var(--text-muted);">
                  <th>Borrower / Person</th>
                  <th>For Who</th>
                  <th>First Lent Date</th>
                  <th style="text-align:right;">Total Lent</th>
                  <th style="text-align:right;">Repaid So Far</th>
                  <th style="text-align:right;">Remaining to Collect</th>
                  <th style="text-align:right;">Last Activity</th>
                  <th style="text-align:center;">Status</th>
                  <th style="text-align:right; min-width:100px;">Repaid %</th>
                  <th style="text-align:center; min-width:110px;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${lendingList.length > 0 ? lendingList.map(l => {
                  const iconCfg = getLendingIconConfig(l.relationship);
                  const isSettled = l.remaining === 0;
                  return `
                    <tr style="border-bottom:1px solid var(--border-color);">
                      <td>
                        <div style="display:flex; align-items:center; gap:8px;">
                          <div style="width:26px; height:26px; border-radius:6px; background:${iconCfg.bg}; color:${iconCfg.color}; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:13px;">
                            ${iconCfg.icon}
                          </div>
                          <div>
                            <strong>${l.borrower}</strong>
                            ${l.notes && l.notes !== '-' ? `<div style="font-size:10px; color:var(--text-muted);">${l.notes}</div>` : ''}
                          </div>
                        </div>
                      </td>
                      <td><span class="badge badge-info" style="font-size:10px;">${l.relationship}</span></td>
                      <td style="color:var(--text-muted);">${l.lentDate || '-'}</td>
                      <td style="text-align:right; font-feature-settings:'tnum';">¥${Number(l.amount).toLocaleString()}</td>
                      <td style="text-align:right; font-feature-settings:'tnum'; color:#10b981; font-weight:600;">¥${Number(l.repaid).toLocaleString()}</td>
                      <td style="text-align:right; font-feature-settings:'tnum'; font-weight:700; color:${!isSettled ? '#f59e0b' : '#10b981'};">
                        ¥${Number(l.remaining).toLocaleString()}
                      </td>
                      <td style="text-align:right; font-feature-settings:'tnum'; color:var(--text-muted);">${l.dueDate}</td>
                      <td style="text-align:center;">
                        <span class="badge ${isSettled ? 'badge-success' : l.repaid > 0 ? 'badge-warning' : 'badge-danger'}" style="font-size:10px;">
                          ${l.status}
                        </span>
                      </td>
                      <td style="text-align:right;">
                        <div style="display:flex; align-items:center; justify-content:flex-end; gap:6px;">
                          <div style="flex:1; max-width:55px; height:5px; background:var(--bg-hover, #e2e8f0); border-radius:99px; overflow:hidden;">
                            <div style="width:${l.progress}%; height:100%; border-radius:99px; background:${isSettled ? '#10b981' : '#f59e0b'};"></div>
                          </div>
                          <span style="font-size:10px; font-weight:600; min-width:26px;">${l.progress}%</span>
                        </div>
                      </td>
                      <td style="text-align:center;">
                        ${!isSettled ? `
                          <a href="input.html?tab=income&type=Lend_Income&desc=${encodeURIComponent(l.borrower)}" class="btn-primary" style="padding:2px 8px; font-size:10px; border-radius:6px; text-decoration:none; display:inline-block;" title="Record repayment in Google Sheets">
                            + Repaid
                          </a>
                        ` : `<span style="font-size:10.5px; color:#10b981; font-weight:700;">✓ Settled</span>`}
                      </td>
                    </tr>
                  `;
                }).join('') : `
                  <tr>
                    <td colspan="10" style="text-align:center; color:var(--text-muted); padding:30px 0;">
                      <div style="font-size:13px; font-weight:700; margin-bottom:4px;">No active lending records found in Google Sheets</div>
                      <div style="font-size:11px;">Record a transaction with Expense Type: <strong>Lend_Expenses</strong> (or <strong>Lend_Income</strong> for repayments) to track borrowers here.</div>
                      <div style="margin-top:10px;">
                        <a href="input.html?tab=expense&type=Lend_Expenses" class="btn-primary" style="padding:4px 12px; font-size:11px; text-decoration:none;">+ Record First Lend Transaction</a>
                      </div>
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- Middle Analytics Section: Visual Analytics -->
      <div class="debt-middle-grid">
        
        <!-- Left: Net Balance Split & Asset vs Debt Ratio -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Debt vs Lending Split</h3>
            <span style="font-size:11px; color:var(--text-muted);">Receivables vs Liabilities</span>
          </div>
          <div style="display:flex; flex-direction:column; justify-content:center; gap:14px; padding:10px 0;">
            <!-- Split Bar -->
            <div>
              <div style="display:flex; justify-content:space-between; font-size:11.5px; font-weight:700; margin-bottom:6px;">
                <span style="color:#10b981; display:flex; align-items:center; gap:6px;">
                  <span style="width:8px; height:8px; border-radius:50%; background:#10b981;"></span> Money Lent (Receivable): ¥${totalMoneyLentRemaining.toLocaleString()}
                </span>
                <span style="color:#ef4444; display:flex; align-items:center; gap:6px;">
                  Debt I Owe: ¥${totalDebtLeft.toLocaleString()} <span style="width:8px; height:8px; border-radius:50%; background:#ef4444;"></span>
                </span>
              </div>
              <div style="width:100%; height:12px; background:#ef4444; border-radius:99px; overflow:hidden; display:flex;">
                <div style="width:${(totalMoneyLentRemaining / (totalMoneyLentRemaining + totalDebtLeft || 1) * 100).toFixed(1)}%; height:100%; background:#10b981; transition:width 0.4s;"></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-muted); margin-top:4px;">
                <span>${(totalMoneyLentRemaining / (totalMoneyLentRemaining + totalDebtLeft || 1) * 100).toFixed(1)}% Assets Owed to You</span>
                <span>${(totalDebtLeft / (totalMoneyLentRemaining + totalDebtLeft || 1) * 100).toFixed(1)}% Liabilities Owed by You</span>
              </div>
            </div>

            <!-- Net Advice Box -->
            <div style="padding:10px 12px; border-radius:10px; background:${isNetPositive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'}; border:1px solid ${isNetPositive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; font-size:11px; display:flex; align-items:center; gap:8px;">
              <span style="font-size:16px;">${isNetPositive ? '🎉' : '💡'}</span>
              <span style="color:${isNetPositive ? '#16a34a' : '#b91c1c'};">
                ${isNetPositive 
                  ? `Great position! You have ¥${Math.abs(netPosition).toLocaleString()} more in receivables than total liabilities.` 
                  : `Focus on paying down high-interest credit card debts while following up on your ¥${totalMoneyLentRemaining.toLocaleString()} in outstanding lending.`}
              </span>
            </div>
          </div>
        </div>

        <!-- Right: Debt & Lending by Source Donut -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Liability Breakdown</h3>
          </div>
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:220px;">
            <div class="donut-wrapper" style="width:125px; height:125px; flex-shrink:0; margin-bottom:8px;">
              <canvas id="debtBySourceDonutCanvas"></canvas>
              <div class="donut-center-label">
                <div class="donut-center-amount" style="font-size:12px; font-weight:800;">¥${Math.round(totalDebtLeft/1000)}K</div>
                <div class="donut-center-sub" style="font-size:8px;">Debt Left</div>
              </div>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:4px 8px; justify-content:center; font-size:10px; color:var(--text-muted); max-height:65px; overflow-y:auto;">
              ${debtList.map((d, idx) => {
                const colors = ["#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#0284c7", "#ef4444"];
                const pct = totalDebtLeft > 0 ? ((d.remainingAmount / totalDebtLeft) * 100).toFixed(0) : 0;
                return `<span style="display:flex; align-items:center; gap:3px;"><span style="width:6px; height:6px; border-radius:50%; background:${colors[idx % colors.length]};"></span> ${d.name} (${pct}%)</span>`;
              }).join('')}
            </div>
          </div>
        </div>

      </div>

      <!-- Lower Section: Payoff Progress & Payment Summary -->
      <div class="debt-bottom-grid">
        
        <!-- 1. Debt Trend / Payoff Progress Line Chart -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Payoff Progress</h3>
            <span style="font-size:11px; color:var(--text-muted);">6-Month History</span>
          </div>
          <div class="chart-container" style="height: 180px;">
            <canvas id="debtTrendLineCanvas"></canvas>
          </div>
        </div>

        <!-- 2. Upcoming Collections & Repayments -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Upcoming Collections &amp; Dues</h3>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px; max-height:180px; overflow-y:auto;">
            ${lendingList.filter(l => l.remaining > 0).map(l => {
              const iconCfg = getLendingIconConfig(l.relationship);
              const badge = getDaysRemainingBadge(l.dueDate);
              return `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:5px 8px; border-radius:6px; background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.15);">
                  <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-size:11px;">🟢</span>
                    <div>
                      <div style="font-size:11px; font-weight:700; color:var(--text-heading);">${l.borrower} (Collect)</div>
                      <div style="font-size:9px; color:var(--text-muted);">${l.dueDate}</div>
                    </div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-size:11px; font-weight:700; color:#10b981;">+¥${l.remaining.toLocaleString()}</div>
                    ${badge}
                  </div>
                </div>
              `;
            }).join('')}

            ${debtList.map(d => {
              const iconCfg = getDebtIconConfig(d.name, d.type);
              const badge = getDaysRemainingBadge(d.nextDueDate);
              return `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:5px 8px; border-radius:6px; background:rgba(239,68,68,0.05); border:1px solid rgba(239,68,68,0.15);">
                  <div style="display:flex; align-items:center; gap:6px;">
                    <span style="font-size:11px;">🔴</span>
                    <div>
                      <div style="font-size:11px; font-weight:700; color:var(--text-heading);">${d.name} (Pay)</div>
                      <div style="font-size:9px; color:var(--text-muted);">${d.nextDueDate}</div>
                    </div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-size:11px; font-weight:700; color:#ef4444;">-¥${d.monthlyDue.toLocaleString()}</div>
                    ${badge}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 3. Interest & Collection Summary -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Summary &amp; Strategy</h3>
          </div>
          <div style="display:flex; flex-direction:column; justify-content:space-between; height:180px;">
            <div style="display:flex; flex-direction:column; gap:6px; font-size:11px;">
              <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid var(--border-color);">
                <span style="color:var(--text-muted);">🟢 Total Lending Receivables</span>
                <strong style="color:#10b981;">¥${totalMoneyLentRemaining.toLocaleString()}</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid var(--border-color);">
                <span style="color:var(--text-muted);">🔴 Total Debt Liabilities</span>
                <strong style="color:#ef4444;">¥${totalDebtLeft.toLocaleString()}</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid var(--border-color);">
                <span style="color:var(--text-muted);">🎯 Highest Interest Debt</span>
                <strong style="color:#ef4444;">${debtList[0]?.name || 'JCB'} (${debtList[0]?.interestRate || 15}%)</strong>
              </div>
            </div>

            <div style="padding:6px 10px; border-radius:8px; background:rgba(37,99,235,0.06); border:1px solid rgba(37,99,235,0.18); font-size:10px; color:#2563eb; display:flex; align-items:center; gap:6px;">
              <span>💡</span> Use incoming lending repayments to pay off credit card debts early.
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom Section: Recent Debt & Lending Transactions -->
      <div class="card" style="margin-top:14px;">
        <div class="card-header">
          <h3 class="card-title">Recent Debt &amp; Lending Transactions</h3>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date ↓</th>
                <th>Description</th>
                <th>Party / Source</th>
                <th>Type</th>
                <th>Account</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${debtTxList.length > 0 ? debtTxList.map(tx => {
                const isLend = (tx.cashFlowType || '').toLowerCase().includes('lend');
                return `
                  <tr>
                    <td>${tx.date}</td>
                    <td><strong>${tx.description}</strong></td>
                    <td>
                      <span style="display:inline-flex; align-items:center; gap:6px; padding:2px 8px; border-radius:6px; background:${isLend ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}; color:${isLend ? '#10b981' : '#ef4444'}; font-size:11px; font-weight:600;">
                        ${isLend ? '🤝 ' + (tx.toSource || tx.description) : '💳 ' + (tx.toSource || tx.description)}
                      </span>
                    </td>
                    <td><span class="badge ${isLend ? 'badge-success' : 'badge-danger'}">${isLend ? 'Lending' : 'Debt Repayment'}</span></td>
                    <td>${tx.fromSource || tx.account || '-'}</td>
                    <td class="${isLend ? 'amount-pos' : 'amount-neg'}" style="font-weight:700;">
                      ${isLend ? '+' : '-'}¥${Number(tx.amount || 0).toLocaleString()}
                    </td>
                    <td>
                      <button class="btn-icon" onclick="window.BudgetTrackerApp.openEditModal(${tx.id})" title="Edit">✏️</button>
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="7" style="text-align:center; color:var(--text-muted); padding:20px 0;">No recent debt or lending records found.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // 1. Render Debt by Source Donut
    const debtLabels = debtList.map(d => d.name);
    const debtDataVals = debtList.map(d => d.remainingAmount);
    const debtColors = ["#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#0284c7", "#ef4444"];

    charts.renderDonutChart("debtBySourceDonutCanvas", {
      labels: debtLabels,
      data: debtDataVals,
      colors: debtColors.slice(0, debtLabels.length),
      cutout: "70%"
    });

    // 2. Render Debt Trend / Payoff Progress Line Chart
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;
      const label = `${monthNames[d.getMonth()]} '${String(year).slice(-2)}`;
      last6Months.push({ key, label, paid: 0, debtLeft: totalDebtLeft });
    }

    filtered.forEach(t => {
      const type = (t.cashFlowType || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();
      if ((type.includes('loan') || desc.includes('loan') || desc.includes('repayment')) && t.date) {
        const monthKey = String(t.date).slice(0, 7);
        const found = last6Months.find(m => m.key === monthKey);
        if (found) found.paid += Number(t.amount) || 0;
      }
    });

    charts.renderMonthlyLineChart("debtTrendLineCanvas", {
      labels: last6Months.map(m => m.label),
      datasets: [
        {
          label: "Remaining Debt (JPY)",
          data: last6Months.map((m, idx) => Math.max(0, totalDebtLeft + (5 - idx) * 25000)),
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.06)",
          borderWidth: 2.2,
          pointBackgroundColor: "#ef4444",
          pointRadius: 3.5,
          tension: 0.35
        },
        {
          label: "Monthly Payments (JPY)",
          data: last6Months.map(m => m.paid || 18000),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.06)",
          borderWidth: 2.2,
          pointBackgroundColor: "#10b981",
          pointRadius: 3.5,
          tension: 0.35
        }
      ]
    });
  }

  return {
    render
  };
})();
