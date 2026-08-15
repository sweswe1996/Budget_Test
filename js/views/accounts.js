/**
 * Accounts View Renderer — 100% Dynamic SaaS Theme Connected Directly to Google Sheets
 */

window.BudgetTrackerViews = window.BudgetTrackerViews || {};

window.BudgetTrackerViews.accounts = (() => {
  function render(container, data, filters) {
    const calc = window.BudgetTrackerCalc;
    const charts = window.BudgetTrackerCharts;

    // 1. Calculate All-Time Cumulative Balances across all transactions (Never restricted by Date Range)
    const liveAccounts = calc.computeAccountBalances(data.transactions, data.accounts);
    const activeCur = filters?.currency || "JPY";

    // 2. Separate Balances strictly by Currency (JPY, MMK, USD)
    const balancesByCurrency = {
      JPY: { bank: 0, cashWallet: 0, credit: 0, total: 0, count: 0 },
      MMK: { bank: 0, cashWallet: 0, credit: 0, total: 0, count: 0 },
      USD: { bank: 0, cashWallet: 0, credit: 0, total: 0, count: 0 }
    };

    liveAccounts.forEach(acc => {
      const c = acc.currency || "JPY";
      if (!balancesByCurrency[c]) {
        balancesByCurrency[c] = { bank: 0, cashWallet: 0, credit: 0, total: 0, count: 0 };
      }
      balancesByCurrency[c].count++;
      const bal = acc.liveBalance || 0;
      if (acc.type === 'Bank') {
        balancesByCurrency[c].bank += bal;
        balancesByCurrency[c].total += bal;
      } else if (acc.type === 'Cash' || acc.type === 'Wallet') {
        balancesByCurrency[c].cashWallet += bal;
        balancesByCurrency[c].total += bal;
      } else if (acc.type === 'Credit Card') {
        balancesByCurrency[c].credit += Math.abs(bal);
      }
    });

    const activeCurData = balancesByCurrency[activeCur] || balancesByCurrency.JPY;
    const totalHousehold = activeCurData.total;
    const totalBank = activeCurData.bank;
    const totalCashWallet = activeCurData.cashWallet;
    const totalCreditUsed = activeCurData.credit;

    // Filter accounts by active currency
    const filteredAccounts = liveAccounts.filter(a => !filters?.currency || a.currency === activeCur);
    const bankAccounts = filteredAccounts.filter(a => a.type === 'Bank');
    const cashWalletAccounts = filteredAccounts.filter(a => a.type === 'Cash' || a.type === 'Wallet');
    const creditAccounts = filteredAccounts.filter(a => a.type === 'Credit Card');

    container.innerHTML = `
      <!-- Top Title Group with All-Time Lifetime Badge -->
      <div class="page-title-banner" style="margin-bottom: 8px;">
        <div class="page-title-group">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <h2 style="font-size:20px; margin:0;">Accounts &amp; Balances <span>🏛️✨</span></h2>
              <span class="badge badge-success" style="font-size:11px; padding:3px 8px; border-radius:20px;">
                🟢 All-Time Live Ledger
              </span>
            </div>
            <p style="font-size:12px; color:var(--text-muted); margin-top:3px;">
              Exact current balances calculated from full Google Sheet transactions (Income + Transfer In − Expense − Transfer Out).
            </p>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
          <a href="input.html" class="btn-primary" style="display:inline-flex; align-items:center; gap:6px; font-size:12px; padding:6px 14px; text-decoration:none;">
            <span>+ New Transaction</span>
          </a>
        </div>
      </div>

      <!-- Multi-Currency Global Balance Bar -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:12px; margin-bottom:14px;">
        <!-- 1. JPY Balance Card -->
        <div class="card" style="padding:12px 16px; border-left: 4px solid #2563eb; background: linear-gradient(135deg, rgba(37,99,235,0.06), transparent);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:12px; font-weight:700; color:#2563eb;">🇯🇵 JPY Total Liquid Funds</span>
            <span class="badge badge-info" style="font-size:10px;">${balancesByCurrency.JPY.count} Sources</span>
          </div>
          <div style="font-size:20px; font-weight:800; color:var(--text-heading); margin:4px 0;">
            ¥${balancesByCurrency.JPY.total.toLocaleString()}
          </div>
          <div style="font-size:11px; color:var(--text-muted); display:flex; gap:10px;">
            <span>Bank: <strong>¥${balancesByCurrency.JPY.bank.toLocaleString()}</strong></span>
            <span>&bull;</span>
            <span>Cash: <strong>¥${balancesByCurrency.JPY.cashWallet.toLocaleString()}</strong></span>
            <span>&bull;</span>
            <span>Credit Used: <strong style="color:#ef4444;">¥${balancesByCurrency.JPY.credit.toLocaleString()}</strong></span>
          </div>
        </div>

        <!-- 2. MMK Balance Card -->
        <div class="card" style="padding:12px 16px; border-left: 4px solid #16a34a; background: linear-gradient(135deg, rgba(22,163,74,0.06), transparent);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:12px; font-weight:700; color:#16a34a;">🇲🇲 MMK Total Liquid Funds</span>
            <span class="badge badge-success" style="font-size:10px;">${balancesByCurrency.MMK.count} Sources</span>
          </div>
          <div style="font-size:20px; font-weight:800; color:var(--text-heading); margin:4px 0;">
            Ks ${balancesByCurrency.MMK.total.toLocaleString()}
          </div>
          <div style="font-size:11px; color:var(--text-muted); display:flex; gap:10px;">
            <span>Cash/Wallets: <strong>Ks ${balancesByCurrency.MMK.cashWallet.toLocaleString()}</strong></span>
          </div>
        </div>

        <!-- 3. USD Balance Card -->
        <div class="card" style="padding:12px 16px; border-left: 4px solid #8b5cf6; background: linear-gradient(135deg, rgba(139,92,246,0.06), transparent);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:12px; font-weight:700; color:#8b5cf6;">🇺🇸 USD Total Liquid Funds</span>
            <span class="badge" style="font-size:10px;">${balancesByCurrency.USD.count} Sources</span>
          </div>
          <div style="font-size:20px; font-weight:800; color:var(--text-heading); margin:4px 0;">
            $${balancesByCurrency.USD.total.toLocaleString()}
          </div>
          <div style="font-size:11px; color:var(--text-muted);">
            <span>Cash/Wallets: <strong>$0</strong></span>
          </div>
        </div>
      </div>

      <!-- Top 5 Active Currency KPI Cards -->
      <div class="kpi-row">
        <!-- 1. Household Balance -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Household Balance (${activeCur})</span>
              <span class="kpi-value" style="color:var(--text-heading);">${calc.formatCurrency(totalHousehold, activeCur)}</span>
              <span class="kpi-sub">Across ${filteredAccounts.length} ${activeCur} accounts</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-purple" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            </div>
          </div>
        </div>

        <!-- 2. Bank Accounts -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Bank Accounts (${activeCur})</span>
              <span class="kpi-value" style="color:#2563eb;">${calc.formatCurrency(totalBank, activeCur)}</span>
              <span class="kpi-sub">${bankAccounts.length} ${activeCur} accounts</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-blue" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11"/></svg>
            </div>
          </div>
        </div>

        <!-- 3. Cash & Wallets -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Cash &amp; Wallets (${activeCur}) 🟢</span>
              <span class="kpi-value" style="color:#16a34a;">${calc.formatCurrency(totalCashWallet, activeCur)}</span>
              <span class="kpi-sub">${cashWalletAccounts.length} ${activeCur} accounts</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-green" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
          </div>
        </div>

        <!-- 4. Credit Cards (Used) -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Credit Cards Used (${activeCur})</span>
              <span class="kpi-value" style="color:#7c3aed;">${calc.formatCurrency(totalCreditUsed, activeCur)}</span>
              <span class="kpi-sub">${creditAccounts.length} ${activeCur} cards</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-purple" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            </div>
          </div>
        </div>

        <!-- 5. Active Accounts -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Active Sources</span>
              <span class="kpi-value" style="color:#0ea5e9;">${filteredAccounts.length}</span>
              <span class="kpi-sub">${activeCur} Sources (Total ${liveAccounts.length})</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-cyan" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Accounts Detail Grid -->
      <div class="accounts-middle-grid">
        <!-- Left: All Connected Accounts Table with Inflow/Outflow Breakdown -->
        <div class="card">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h3 class="card-title">All Connected Accounts &amp; Sources (${activeCur})</h3>
              <p style="font-size:11px; color:var(--text-muted); margin-top:2px;">
                Formula: Current Balance = Total Inflow (Income + Transfer In) − Total Outflow (Expense + Transfer Out)
              </p>
            </div>
            <span class="badge badge-info" style="font-size:11px;">${filteredAccounts.length} Accounts</span>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Account Name</th>
                  <th>Type</th>
                  <th>Owner / ForWho</th>
                  <th>Currency</th>
                  <th style="text-align:right;">Total Inflow (+)</th>
                  <th style="text-align:right;">Total Outflow (−)</th>
                  <th style="text-align:right;">Live Balance</th>
                </tr>
              </thead>
              <tbody>
                ${filteredAccounts.sort((a, b) => (b.liveBalance || 0) - (a.liveBalance || 0)).map(acc => {
                  const bal = acc.liveBalance || 0;
                  const isPos = bal >= 0;
                  const totalIn = acc.incomeSum + acc.transferIn;
                  const totalOut = acc.expenseSum + acc.transferOut;
                  return `
                    <tr>
                      <td>
                        <div class="account-cell">
                          <span class="bank-logo" style="background:#7c3aed; color:#fff; font-weight:700;">${acc.name.slice(0, 2).toUpperCase()}</span>
                          <div>
                            <strong>${acc.name}</strong>
                            <span class="amount-subtext">${acc.subType || acc.type}</span>
                          </div>
                        </div>
                      </td>
                      <td><span class="badge ${acc.type === 'Bank' ? 'badge-info' : acc.type === 'Credit Card' ? 'badge-warning' : 'badge-success'}">${acc.type}</span></td>
                      <td>${acc.forWho || 'US'}</td>
                      <td><span class="badge" style="font-weight:700; font-size:10px; ${acc.currency === 'MMK' ? 'background:rgba(16,185,129,0.15); color:#10b981;' : acc.currency === 'USD' ? 'background:rgba(168,85,247,0.15); color:#a855f7;' : 'background:rgba(37,99,235,0.15); color:#2563eb;'}">${acc.currency || 'JPY'}</span></td>
                      <td style="text-align:right; color:#16a34a; font-weight:600;">+${calc.formatCurrency(totalIn, acc.currency)}</td>
                      <td style="text-align:right; color:#ef4444; font-weight:600;">-${calc.formatCurrency(totalOut, acc.currency)}</td>
                      <td style="text-align:right;"><strong class="${isPos ? 'amount-pos' : 'amount-neg'}" style="font-size:13px;">${isPos ? '+' : ''}${calc.formatCurrency(bal, acc.currency)}</strong></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right: Liquidity Distribution Donut -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Liquidity Distribution (${activeCur})</h3>
          </div>
          <div style="position:relative; width:140px; height:140px; margin:10px auto;">
            <canvas id="accountsDistributionCanvas"></canvas>
          </div>
          <div style="margin-top:14px; display:flex; flex-direction:column; gap:6px;">
            <div class="legend-row">
              <div class="legend-left"><span class="legend-dot" style="background:#2563eb;"></span> Banks</div>
              <div class="legend-right">${calc.formatCurrency(totalBank, activeCur)}</div>
            </div>
            <div class="legend-row">
              <div class="legend-left"><span class="legend-dot" style="background:#16a34a;"></span> Cash &amp; Wallets</div>
              <div class="legend-right">${calc.formatCurrency(totalCashWallet, activeCur)}</div>
            </div>
            <div class="legend-row">
              <div class="legend-left"><span class="legend-dot" style="background:#7c3aed;"></span> Credit Used</div>
              <div class="legend-right">${calc.formatCurrency(totalCreditUsed, activeCur)}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Render Liquidity Donut
    charts.renderDonutChart("accountsDistributionCanvas", {
      labels: ["Banks", "Cash & Wallets", "Credit Cards"],
      data: [Math.max(0, totalBank), Math.max(0, totalCashWallet), Math.max(0, totalCreditUsed)],
      colors: ["#2563eb", "#16a34a", "#7c3aed"]
    });
  }

  return {
    render
  };
})();
