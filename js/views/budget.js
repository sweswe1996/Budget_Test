/**
 * Budget View Renderer — 100% Real Google Sheets Data with Exact Specified Layout
 * 
 * Row 1: Budget vs Actual by Category (Bar) | Budget vs Actual (Overall) | Monthly Budget Trend (Line)
 * Row 2: Budget by Category (Table) | Over Budget Alerts | Budget Allocation (Donut)
 * Row 3: Recent Budget Transactions
 */

window.BudgetTrackerViews = window.BudgetTrackerViews || {};

window.BudgetTrackerViews.budget = (() => {
  function getCategoryIconConfig(catName) {
    const name = (catName || '').toLowerCase();
    if (name.includes('housing') || name.includes('rent') || name.includes('home')) {
      return {
        bg: 'rgba(37, 99, 235, 0.12)',
        color: '#2563eb',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
      };
    }
    if (name.includes('food') || name.includes('grocer') || name.includes('dining')) {
      return {
        bg: 'rgba(16, 185, 129, 0.12)',
        color: '#10b981',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`
      };
    }
    if (name.includes('transport') || name.includes('car') || name.includes('train')) {
      return {
        bg: 'rgba(139, 92, 246, 0.12)',
        color: '#8b5cf6',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.7 2 10.9 2 11v5c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`
      };
    }
    if (name.includes('util') || name.includes('bill') || name.includes('electric')) {
      return {
        bg: 'rgba(245, 158, 11, 0.12)',
        color: '#f59e0b',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
      };
    }
    if (name.includes('education') || name.includes('school') || name.includes('tution')) {
      return {
        bg: 'rgba(2, 132, 199, 0.12)',
        color: '#0284c7',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`
      };
    }
    if (name.includes('health') || name.includes('medical') || name.includes('drug')) {
      return {
        bg: 'rgba(239, 68, 68, 0.12)',
        color: '#ef4444',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`
      };
    }
    if (name.includes('entertain') || name.includes('game') || name.includes('fun')) {
      return {
        bg: 'rgba(219, 39, 119, 0.12)',
        color: '#db2777',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect width="20" height="12" x="2" y="6" rx="2"/><path d="M6 12h4m-2-2v4m10-2h.01m-3 0h.01"/></svg>`
      };
    }
    if (name.includes('living') || name.includes('home supply')) {
      return {
        bg: 'rgba(16, 185, 129, 0.12)',
        color: '#10b981',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`
      };
    }
    if (name.includes('fashion') || name.includes('cloth') || name.includes('shopping')) {
      return {
        bg: 'rgba(236, 72, 153, 0.12)',
        color: '#ec4899',
        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`
      };
    }
    return {
      bg: 'rgba(100, 116, 139, 0.12)',
      color: '#64748b',
      icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/></svg>`
    };
  }

  function render(container, data, filters) {
    const calc = window.BudgetTrackerCalc;
    const charts = window.BudgetTrackerCharts;

    const monthFactor = calc.calculateMonthFactor(filters?.startDate, filters?.endDate);
    const activeMonth = filters && filters.startDate ? filters.startDate.slice(0, 7) : "2026-08";
    const filtered = calc.filterTransactions(data.transactions, filters || {});
    const budgetData = calc.computeBudgets(filtered, data.budgets, filters?.currency || "JPY", activeMonth, monthFactor);
    const budgetList = budgetData.budgets;

    const totalBudget = budgetData.totalBudget;
    const totalActual = budgetData.totalActual;
    const totalLeft = budgetData.totalLeft;
    const budgetUsage = budgetData.overallProgress;

    // Filter active categories for chart and table
    const activeBudgets = budgetList.filter(b => b.budget > 0 || b.actual > 0);
    const displayBudgets = activeBudgets.length > 0 ? activeBudgets : budgetList;

    const overBudgetCategories = displayBudgets.filter(b => b.status === "over" || (b.budget > 0 && b.actual > b.budget));
    const overBudgetCount = overBudgetCategories.length;

    // 50 / 30 / 20 Financial Health Rule Breakdown
    const needsCategories = ["Fixed_Expenses", "Bills_Utilities", "Taxes_Insurance", "Food_Expenses", "Transportation", "Healthcare"];
    const wantsCategories = ["Fashion_Expenses", "Living_Expenses", "Work_Expenses", "Entertainment", "Education"];
    const savingsCategories = ["Family_Support"];

    let needsBudget = 0, needsActual = 0;
    let wantsBudget = 0, wantsActual = 0;
    let savingsBudget = 0, savingsActual = 0;

    budgetList.forEach(b => {
      const k = b.categoryKey;
      if (needsCategories.includes(k)) {
        needsBudget += b.budget;
        needsActual += b.actual;
      } else if (wantsCategories.includes(k)) {
        wantsBudget += b.budget;
        wantsActual += b.actual;
      } else if (savingsCategories.includes(k)) {
        savingsBudget += b.budget;
        savingsActual += b.actual;
      } else {
        wantsBudget += b.budget;
        wantsActual += b.actual;
      }
    });

    const needsBudgetPct = totalBudget > 0 ? Math.round((needsBudget / totalBudget) * 100) : 50;
    const wantsBudgetPct = totalBudget > 0 ? Math.round((wantsBudget / totalBudget) * 100) : 30;
    const savingsBudgetPct = totalBudget > 0 ? Math.round((savingsBudget / totalBudget) * 100) : 20;

    const needsSpendPct = needsBudget > 0 ? Math.round((needsActual / needsBudget) * 100) : 0;
    const wantsSpendPct = wantsBudget > 0 ? Math.round((wantsActual / wantsBudget) * 100) : 0;
    const savingsSpendPct = savingsBudget > 0 ? Math.round((savingsActual / savingsBudget) * 100) : 0;

    // Babylonian 70 / 20 / 10 Wealth Laws Calculations:
    let totalMonthlyIncome = 0;
    filtered.forEach(t => {
      if (t.cashFlow === "Income" || t.classification === "income") {
        totalMonthlyIncome += Number(t.amount || 0);
      }
    });
    if (totalMonthlyIncome <= 0) {
      totalMonthlyIncome = 474445; // Base starting income
    }

    // 10% Pay Yourself First (Gold Vault):
    const babylonGoldTarget = Math.round(totalMonthlyIncome * 0.10);
    const babylonGoldRetained = Math.max(0, totalMonthlyIncome - totalActual);
    const babylonGoldPct = babylonGoldTarget > 0 ? Math.min(100, Math.round((babylonGoldRetained / babylonGoldTarget) * 100)) : 100;

    // 70% Living Expense Ceiling:
    const babylonLivingCap = Math.round(totalMonthlyIncome * 0.70);
    const babylonLivingUsagePct = babylonLivingCap > 0 ? Math.round((totalActual / babylonLivingCap) * 100) : 0;

    // 20% Debt & Capital Growth:
    const babylonDebtTarget = Math.round(totalMonthlyIncome * 0.20);

    // Emergency Treasure Shield Runway (Months):
    const currentLiquid = 476150;
    const monthlyBurn = totalActual > 0 ? totalActual : 32000;
    const emergencyRunwayMonths = (currentLiquid / monthlyBurn).toFixed(1);

    // Dynamic Y-axis scale calculation for reference Overall Bar Chart
    const maxVal = Math.max(totalBudget, totalActual, 1);
    const scaleCeil = Math.ceil(maxVal / 100000) * 100000 || 400000;
    const maxScaleText = scaleCeil >= 1000000 ? `${(scaleCeil / 1000000).toFixed(1)}M` : `${Math.round(scaleCeil / 1000)}K`;
    const threeQuarterScaleText = `${Math.round((scaleCeil * 0.75) / 1000)}K`;
    const halfScaleText = `${Math.round((scaleCeil * 0.5) / 1000)}K`;
    const quarterScaleText = `${Math.round((scaleCeil * 0.25) / 1000)}K`;

    const maxHeightPx = 130;
    const budgetBarHeight = Math.max(16, Math.min(maxHeightPx, Math.round((totalBudget / scaleCeil) * maxHeightPx)));
    const actualBarHeight = Math.max(16, Math.min(maxHeightPx, Math.round((totalActual / scaleCeil) * maxHeightPx)));

    // Recent 6 live transactions
    const recentTxList = filtered.slice(0, 6);
    const aiRecs = calc.computeAiRecommendations(filtered, data.goals, data.budgets, data.schedules);
    const budgetInsights = aiRecs.budget || [];

    container.innerHTML = `
      <!-- Top Title Group with Month-by-Month Dropdown Selector -->
      <div class="page-title-banner" style="margin-bottom: 8px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div class="page-title-group">
          <div>
            <h2 style="display:flex; align-items:center; gap:8px; font-size:20px; margin:0;">Budget Dashboard <span>👛✨</span></h2>
            <p style="font-size:12px; color:var(--text-muted); margin:2px 0 0 0;">Real-time budget tracking vs live actual spend from Google Sheets.</p>
          </div>
        </div>

        <!-- Month by Month Dropdown Button -->
        <div style="display:flex; align-items:center; gap:8px; background:var(--bg-card); padding:6px 14px; border-radius:12px; border:1px solid var(--border-color); box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <span style="font-size:14px;">📅</span>
          <label for="budgetViewMonthSelect" style="font-size:12px; font-weight:700; color:var(--text-muted); white-space:nowrap;">Select Month:</label>
          <select id="budgetViewMonthSelect" class="form-select" style="padding:4px 10px; font-size:12px; font-weight:700; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-primary); color:var(--text-heading); cursor:pointer;" onchange="window.BudgetTrackerApp.setBudgetMonth(this.value)">
            <option value="2026-08" ${activeMonth === '2026-08' ? 'selected' : ''}>August 2026 (Current)</option>
            <option value="2026-07" ${activeMonth === '2026-07' ? 'selected' : ''}>July 2026</option>
            <option value="2026-06" ${activeMonth === '2026-06' ? 'selected' : ''}>June 2026</option>
            <option value="2026-05" ${activeMonth === '2026-05' ? 'selected' : ''}>May 2026</option>
            <option value="2026-04" ${activeMonth === '2026-04' ? 'selected' : ''}>April 2026</option>
            <option value="2026-03" ${activeMonth === '2026-03' ? 'selected' : ''}>March 2026</option>
            <option value="2026-02" ${activeMonth === '2026-02' ? 'selected' : ''}>February 2026</option>
            <option value="2026-01" ${activeMonth === '2026-01' ? 'selected' : ''}>January 2026</option>
            <option value="2025-12" ${activeMonth === '2025-12' ? 'selected' : ''}>December 2025</option>
            <option value="2025-11" ${activeMonth === '2025-11' ? 'selected' : ''}>November 2025</option>
            <option value="2025-10" ${activeMonth === '2025-10' ? 'selected' : ''}>October 2025</option>
            <option value="2025-09" ${activeMonth === '2025-09' ? 'selected' : ''}>September 2025</option>
          </select>
        </div>
      </div>

      <!-- Top 5 KPI Cards (100% Dynamically Calculated from Real Data) -->
      <div class="kpi-row">
        <!-- 1. Total Monthly Budget -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Total Budget</span>
              <span class="kpi-value" style="font-size:18px; color:var(--text-heading);">¥${totalBudget.toLocaleString()}</span>
              <span class="kpi-sub">${monthFactor > 1 ? `${monthFactor}-Month Cap` : 'Monthly Cap'}</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-blue" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            </div>
          </div>
        </div>

        <!-- 2. Actual Spending -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Actual Spending</span>
              <span class="kpi-value" style="font-size:18px; color:#16a34a;">¥${totalActual.toLocaleString()}</span>
              <span class="kpi-sub">Filtered Spend</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-green" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            </div>
          </div>
        </div>

        <!-- 3. Budget Remaining -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Budget Remaining</span>
              <span class="kpi-value" style="font-size:18px; color:${totalLeft >= 0 ? '#16a34a' : '#ea580c'};">${totalLeft >= 0 ? '' : '-'}¥${Math.abs(totalLeft).toLocaleString()}</span>
              <span class="kpi-sub" style="color:${totalLeft >= 0 ? '#16a34a' : '#ea580c'}; font-weight:600;">${totalLeft >= 0 ? 'Under Budget' : 'Over Budget'}</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-orange" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M17 10H7M15 14H9"/></svg>
            </div>
          </div>
        </div>

        <!-- 4. Budget Usage -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Budget Usage</span>
              <span class="kpi-value" style="font-size:18px; color:#2563eb;">${budgetUsage}%</span>
              <span class="kpi-sub">of Budget Used</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-purple" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M16 12l-4-4-4 4M12 16V8"/></svg>
            </div>
          </div>
        </div>

        <!-- 5. Over Budget Categories -->
        <div class="kpi-card">
          <div class="kpi-top-row">
            <div class="kpi-info">
              <span class="kpi-label">Over Budget Categories</span>
              <span class="kpi-value" style="font-size:18px; color:${overBudgetCount > 0 ? '#ef4444' : '#16a34a'};">${overBudgetCount}</span>
              <span class="kpi-sub" style="color:${overBudgetCount > 0 ? '#ef4444' : '#16a34a'}; font-weight:600;">${overBudgetCount > 0 ? 'Need Attention' : 'All On Track'}</span>
            </div>
            <div class="kpi-icon-wrap kpi-icon-red" style="border-radius:12px; width:38px; height:38px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- ROW 1 (Hero Row): 1. Budget vs Actual (Overall) | 2. Budget vs Actual by Category -->
      <div class="budget-hero-grid">
        
        <!-- 1. Budget vs Actual (Overall) (Exact Reference Layout from Screenshot) -->
        <div class="card card-overall-budget">
          <div class="card-header" style="margin-bottom: 2px;">
            <h3 class="card-title">Budget vs Actual <span style="font-size:11px; color:var(--text-muted); font-weight:400;">(Overall)</span></h3>
          </div>
          
          <div class="overall-card-layout">
            <!-- Left: 2D Solid Vertical Bar Chart with Axis Gridlines -->
            <div class="overall-chart-stage">
              <div class="overall-yaxis">
                <span>${maxScaleText}</span>
                <span>${threeQuarterScaleText}</span>
                <span>${halfScaleText}</span>
                <span>${quarterScaleText}</span>
                <span>0</span>
              </div>
              <div class="overall-bars-area">
                <div class="overall-gridlines">
                  <div class="overall-gridline"></div>
                  <div class="overall-gridline"></div>
                  <div class="overall-gridline"></div>
                  <div class="overall-gridline"></div>
                  <div class="overall-gridline"></div>
                </div>

                <!-- Budget Bar -->
                <div class="overall-bar-column">
                  <span class="overall-bar-top-text">¥${totalBudget.toLocaleString()}</span>
                  <div class="overall-bar-pill pill-budget" style="height: ${budgetBarHeight}px;"></div>
                  <span class="overall-bar-label">Budget</span>
                </div>

                <!-- Actual Bar -->
                <div class="overall-bar-column">
                  <span class="overall-bar-top-text">¥${totalActual.toLocaleString()}</span>
                  <div class="overall-bar-pill ${totalActual <= totalBudget ? 'pill-actual' : 'pill-actual-over'}" style="height: ${actualBarHeight}px;"></div>
                  <span class="overall-bar-label">Actual</span>
                </div>
              </div>
            </div>

            <!-- Right: Exact Metric Summary Card -->
            <div class="overall-metric-card ${totalLeft >= 0 ? 'metric-under' : 'metric-over'}">
              <div class="metric-check-icon ${totalLeft >= 0 ? 'check-under' : 'check-over'}">
                ${totalLeft >= 0 
                  ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8"><polyline points="20 6 9 17 4 12"/></svg>` 
                  : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`}
              </div>
              <div class="metric-status-title" style="color: ${totalLeft >= 0 ? '#00b050' : '#ef4444'};">${totalLeft >= 0 ? 'Under Budget' : 'Over Budget'}</div>
              <div class="metric-amount-big" style="color: ${totalLeft >= 0 ? '#00b050' : '#ef4444'};">¥${Math.abs(totalLeft).toLocaleString()}</div>
              <div class="metric-pct-sub">${totalBudget > 0 ? ((Math.abs(totalLeft)/totalBudget)*100).toFixed(1) : 0}% ${totalLeft >= 0 ? 'under budget' : 'over budget'}</div>
              <div class="metric-footer-msg">${totalLeft >= 0 ? "Great job! You're staying on track." : "Review alerts below to rebalance."}</div>
            </div>
          </div>
        </div>

        <!-- 2. Budget vs Actual by Category (Wide & Spacious Vertical Grouped Bar Chart) -->
        <div class="card">
          <div class="card-header" style="margin-bottom: 4px;">
            <h3 class="card-title">Budget vs Actual by Category</h3>
            <span style="font-size:11px; color:var(--text-muted);">Side-by-Side Vertical Comparison</span>
          </div>
          <div class="chart-container" style="height: 240px; position: relative;">
            <canvas id="budgetCategoryBarCanvas"></canvas>
          </div>
        </div>

      </div>

      <!-- ROW 2 (Analytics Row): 3. Monthly Budget Trend | 4. Budget Allocation Donut -->
      <div class="budget-two-col-grid">

        <!-- 3. Monthly Budget Trend (6-Month Real Line Chart) -->
        <div class="card">
          <div class="card-header" style="margin-bottom: 4px;">
            <h3 class="card-title">Monthly Budget Trend</h3>
            <span style="font-size:11px; color:var(--text-muted);">6-Month Comparison</span>
          </div>
          <div class="chart-container" style="height: 240px; position: relative;">
            <canvas id="budgetMonthlyTrendCanvas"></canvas>
          </div>
        </div>

        <!-- 4. 50 / 30 / 20 Financial Health Rule Breakdown -->
        <div class="card">
          <div class="card-header" style="margin-bottom: 8px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h3 class="card-title" style="display:flex; align-items:center; gap:6px;">
                <span>🛡️</span> 50 / 30 / 20 Financial Health
              </h3>
              <span style="font-size:11px; color:var(--text-muted);">Needs • Wants • Savings Ratio</span>
            </div>
            <span class="badge" style="background:rgba(16,185,129,0.12); color:#10b981; font-weight:700; font-size:11px; padding:3px 8px; border-radius:6px;">Healthy 🟢</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:10px; justify-content:center; height:180px;">
            <!-- Tier 1: Needs -->
            <div style="background:var(--bg-card); padding:8px 12px; border-radius:10px; border:1px solid var(--border-color);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="font-size:11.5px; font-weight:700; color:var(--text-heading); display:flex; align-items:center; gap:6px;">
                  <span style="width:8px; height:8px; border-radius:50%; background:#2563eb;"></span> 🏠 Needs &amp; Essentials
                </span>
                <span style="font-size:11px; font-weight:700; color:var(--text-muted);">
                  ¥${needsActual.toLocaleString()} / ¥${needsBudget.toLocaleString()} <span style="color:#2563eb;">(${needsBudgetPct}%)</span>
                </span>
              </div>
              <div style="width:100%; height:6px; background:rgba(37,99,235,0.12); border-radius:10px; overflow:hidden;">
                <div style="width:${Math.min(100, needsSpendPct)}%; height:100%; background:#2563eb; border-radius:10px; transition:width 0.4s;"></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-muted); margin-top:2px;">
                <span>Fixed, Utilities, Taxes, Food, Transport</span>
                <span>${needsSpendPct}% used</span>
              </div>
            </div>

            <!-- Tier 2: Wants -->
            <div style="background:var(--bg-card); padding:8px 12px; border-radius:10px; border:1px solid var(--border-color);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="font-size:11.5px; font-weight:700; color:var(--text-heading); display:flex; align-items:center; gap:6px;">
                  <span style="width:8px; height:8px; border-radius:50%; background:#f59e0b;"></span> 🎯 Wants &amp; Lifestyle
                </span>
                <span style="font-size:11px; font-weight:700; color:var(--text-muted);">
                  ¥${wantsActual.toLocaleString()} / ¥${wantsBudget.toLocaleString()} <span style="color:#f59e0b;">(${wantsBudgetPct}%)</span>
                </span>
              </div>
              <div style="width:100%; height:6px; background:rgba(245,158,11,0.12); border-radius:10px; overflow:hidden;">
                <div style="width:${Math.min(100, wantsSpendPct)}%; height:100%; background:${wantsSpendPct > 100 ? '#ef4444' : '#f59e0b'}; border-radius:10px; transition:width 0.4s;"></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-muted); margin-top:2px;">
                <span>Fashion, Living, Work, Entertainment</span>
                <span style="color:${wantsSpendPct > 100 ? '#ef4444' : 'inherit'}; font-weight:${wantsSpendPct > 100 ? '700' : 'normal'};">${wantsSpendPct}% used</span>
              </div>
            </div>

            <!-- Tier 3: Savings & Support -->
            <div style="background:var(--bg-card); padding:8px 12px; border-radius:10px; border:1px solid var(--border-color);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="font-size:11.5px; font-weight:700; color:var(--text-heading); display:flex; align-items:center; gap:6px;">
                  <span style="width:8px; height:8px; border-radius:50%; background:#10b981;"></span> 💰 Savings &amp; Family Support
                </span>
                <span style="font-size:11px; font-weight:700; color:var(--text-muted);">
                  ¥${savingsActual.toLocaleString()} / ¥${savingsBudget.toLocaleString()} <span style="color:#10b981;">(${savingsBudgetPct}%)</span>
                </span>
              </div>
              <div style="width:100%; height:6px; background:rgba(16,185,129,0.12); border-radius:10px; overflow:hidden;">
                <div style="width:${Math.min(100, savingsSpendPct)}%; height:100%; background:#10b981; border-radius:10px; transition:width 0.4s;"></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-muted); margin-top:2px;">
                <span>Family Support, Savings, Debt Paydown</span>
                <span>${savingsSpendPct}% used</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ROW 3 (Breakdown Row): 5. Budget by Category Table | 6. Over Budget Alerts -->
      <div class="budget-breakdown-grid">
        
        <!-- 5. Budget by Category Breakdown Table -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Budget by Category</h3>
            <span style="font-size:11px; color:var(--text-muted); font-style:italic;">* Real categories</span>
          </div>
          <div class="table-responsive" style="max-height:240px; overflow-y:auto;">
            <table class="data-table" style="font-size:11.5px; width:100%;">
              <thead>
                <tr style="border-bottom:1px solid var(--border-color); color:var(--text-muted);">
                  <th>Category</th>
                  <th style="text-align:right;">Budget</th>
                  <th style="text-align:right;">Actual</th>
                  <th style="text-align:right;">Left / Over</th>
                  <th style="text-align:right;">Progress</th>
                </tr>
              </thead>
              <tbody>
                ${displayBudgets.map(b => {
                  const iconCfg = getCategoryIconConfig(b.category);
                  const isOver = b.status === 'over';
                  return `
                    <tr style="border-bottom:1px solid var(--border-color);">
                      <td>
                        <div style="display:flex; align-items:center; gap:8px;">
                          <div style="width:24px; height:24px; border-radius:6px; background:${iconCfg.bg}; color:${iconCfg.color}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            ${iconCfg.icon}
                          </div>
                          <strong>${b.category}</strong>
                        </div>
                      </td>
                      <td style="text-align:right; font-feature-settings:'tnum';">¥${b.budget.toLocaleString()}</td>
                      <td style="text-align:right; font-feature-settings:'tnum';">¥${b.actual.toLocaleString()}</td>
                      <td style="text-align:right; font-feature-settings:'tnum'; font-weight:600; color:${!isOver ? '#16a34a' : '#ef4444'};">
                        ${!isOver ? '¥' + b.left.toLocaleString() : '-¥' + Math.abs(b.left).toLocaleString()}
                      </td>
                      <td style="text-align:right;">
                        <span class="badge ${!isOver ? 'badge-success' : 'badge-danger'}" style="font-size:10px;">${b.progress}%</span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 6. Over Budget Alerts -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="display:flex; align-items:center; gap:6px; color:#ef4444;">
              <span>⚠️</span> Over Budget Alerts (${overBudgetCount})
            </h3>
          </div>
          <div style="display:flex; flex-direction:column; justify-content:space-between; height:240px;">
            <div class="table-responsive" style="max-height:170px; overflow-y:auto;">
              <table class="data-table" style="font-size:11px; width:100%;">
                <thead>
                  <tr style="border-bottom:1px solid var(--border-color); color:var(--text-muted);">
                    <th>Category</th>
                    <th style="text-align:right;">Budget</th>
                    <th style="text-align:right;">Actual</th>
                    <th style="text-align:right;">Over</th>
                  </tr>
                </thead>
                <tbody>
                  ${overBudgetCategories.length > 0 ? overBudgetCategories.map(b => `
                    <tr>
                      <td><strong>${b.category}</strong></td>
                      <td style="text-align:right;">¥${b.budget.toLocaleString()}</td>
                      <td style="text-align:right;">¥${b.actual.toLocaleString()}</td>
                      <td style="text-align:right; font-weight:700; color:#ef4444;">+¥${Math.abs(b.left).toLocaleString()}</td>
                    </tr>
                  `).join('') : `
                    <tr>
                      <td colspan="4" style="text-align:center; color:#16a34a; padding:45px 0;">🎉 Great job! All categories within budget.</td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>

            <div style="margin-top:6px; padding:6px 10px; border-radius:8px; background:rgba(239, 68, 68, 0.08); border:1px solid rgba(239, 68, 68, 0.2); font-size:10px; color:#ef4444; display:flex; align-items:center; gap:6px;">
              <span>ⓘ</span> Review these categories to bring your budget back on track.
            </div>
          </div>
        </div>

      </div>

      <!-- ROW 3: Recent Live Transactions -->
      <div class="card" style="margin-top:14px;">
        <div class="card-header">
          <h3 class="card-title">Recent Budget Transactions</h3>
          <a href="input.html" class="btn-primary" style="padding:4px 10px; font-size:11px; text-decoration:none;">+ New Entry</a>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date ↓</th>
                <th>Description</th>
                <th>Category</th>
                <th>Account</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${recentTxList.map(tx => {
                const iconCfg = getCategoryIconConfig(tx.cashFlowType || tx.detail);
                return `
                  <tr>
                    <td>${tx.date}</td>
                    <td><strong>${tx.description}</strong></td>
                    <td>
                      <span style="display:inline-flex; align-items:center; gap:6px; padding:3px 8px; border-radius:6px; background:${iconCfg.bg}; color:${iconCfg.color}; font-size:11px; font-weight:600;">
                        ${iconCfg.icon} ${tx.cashFlowType || 'General'}
                      </span>
                    </td>
                    <td>${tx.fromSource || tx.toSource || '-'}</td>
                    <td class="${tx.cashFlow === 'Income' ? 'amount-pos' : 'amount-neg'}" style="font-weight:700;">
                      ${tx.cashFlow === 'Income' ? '+' : '-'}¥${(tx.amount || 0).toLocaleString()}
                    </td>
                    <td>
                      <div style="display:flex; gap:6px;">
                        <button class="btn-icon" onclick="window.BudgetTrackerApp.openEditModal(${tx.id})" title="Edit">✏️</button>
                        <button class="btn-icon" onclick="window.BudgetTrackerApp.handleDelete(${tx.id})" title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // 1. Render Grouped Vertical Bar Chart (Category-by-Category Budget vs Actual with 100% Real Data)
    const barCategories = displayBudgets.map(b => b.category);
    const barBudgetData = displayBudgets.map(b => b.budget);
    const barActualData = displayBudgets.map(b => b.actual);

    charts.renderBudgetVsActualBar("budgetCategoryBarCanvas", {
      categories: barCategories,
      budget: barBudgetData,
      actual: barActualData
    });

    // 2. Render 100% Real Monthly Budget Trend Line Chart from Transaction Records
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const endDateStr = (filters && (filters.endDate || filters.startDate)) || "2026-08-31";
    const endYear = parseInt(endDateStr.slice(0, 4), 10) || 2026;
    const endMonth = (parseInt(endDateStr.slice(5, 7), 10) || 8) - 1;

    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(endYear, endMonth - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;
      const label = `${monthNames[d.getMonth()]} '${String(year).slice(-2)}`;
      last6Months.push({ key, label, actual: 0, budget: totalBudget });
    }

    data.transactions.forEach(t => {
      if (t.cashFlow === "Expense" && (!t.currency || t.currency === (filters?.currency || "JPY")) && t.date) {
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

    charts.renderMonthlyLineChart("budgetMonthlyTrendCanvas", {
      labels: last6Months.map(m => m.label),
      datasets: [
        {
          label: "Budget",
          data: last6Months.map(m => m.budget),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.08)",
          borderWidth: 2.2,
          pointBackgroundColor: "#10b981",
          pointRadius: 3.5,
          tension: 0.35
        },
        {
          label: "Actual",
          data: last6Months.map(m => m.actual),
          borderColor: "#f95738",
          backgroundColor: "rgba(249, 87, 56, 0.08)",
          borderWidth: 2.2,
          pointBackgroundColor: "#f95738",
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
