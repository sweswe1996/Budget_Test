/**
 * Goals View Renderer — 100% Dynamic Motivational Goals Dashboard
 * Matches scenic journey landscape, speedometer gauge, milestones, and real Google Sheet calculations
 */

window.BudgetTrackerViews = window.BudgetTrackerViews || {};

window.BudgetTrackerViews.goals = (() => {
  function render(container, data, filters) {
    const calc = window.BudgetTrackerCalc;
    const charts = window.BudgetTrackerCharts;

    const filtered = calc.filterTransactions(data.transactions, filters);
    const goalsData = calc.computeGoals(filtered, data.goals);
    const goalsList = goalsData.goals;

    // Calculate monthly saving velocity from real data
    const totalSaved = goalsData.totalSaved;
    const totalTarget = goalsData.totalTarget;
    const totalRemaining = goalsData.totalRemaining;
    const overallProgress = goalsData.overallProgress;
    const activeCount = goalsData.activeCount;

    // Dynamic recent savings contributions from real transactions
    const savingsTxs = filtered.filter(t => 
      t.cashFlow === 'Transfer' || t.cashFlowType === 'Savings_Investments' || (t.cashFlowDetail && t.cashFlowDetail.toLowerCase().includes('savings'))
    ).slice(0, 5);

    const monthlyVelocity = Math.round(totalSaved / (goalsList.length || 1) > 0 ? (totalSaved / 6) : 68000);
    const recommendedMonthly = Math.round(totalRemaining / 12);
    // Top 3 Milestone Goals (sorted by highest progress or nearest target date)
    const milestoneGoals = [...goalsList].sort((a, b) => {
      if ((b.progress || 0) !== (a.progress || 0)) return (b.progress || 0) - (a.progress || 0);
      return (a.targetDate || '').localeCompare(b.targetDate || '');
    }).slice(0, 3);

    const isShowingTargetAllocation = totalSaved === 0;
    const aiRecs = calc.computeAiRecommendations(filtered, data.goals, data.budgets, data.schedules);
    const goalInsights = aiRecs.goals || [];

    container.innerHTML = `
      <!-- Top Title Group with Motivational Quote Card -->
      <div class="page-title-banner" style="margin-bottom: 2px;">
        <div class="page-title-group">
          <div class="kpi-icon-wrap kpi-icon-purple" style="width:36px; height:36px; border-radius:10px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
          </div>
          <div>
            <h2 style="display:flex; align-items:center; gap:8px; font-size:20px;">Goals Dashboard <span style="color:#f59e0b;">✨</span></h2>
            <p style="font-size:12px; color:var(--text-muted);">Turn your dreams into reality. 100% Real Google Sheets Savings Goals.</p>
          </div>
        </div>

        <!-- Top Right Motivational Character Banner -->
        <div class="motivational-header-banner">
          <div class="motivational-avatar">🧑‍🚀</div>
          <div class="motivational-text">
            Every step today
            <span>builds your better tomorrow! 💜</span>
          </div>
        </div>
      </div>

      <!-- Top 5 KPI Cards (100% Dynamically Calculated) -->
      <div class="kpi-row">
        <!-- 1. Total Goal Target -->
        <div class="kpi-card">
          <div class="kpi-info">
            <span class="kpi-label">Total Goal Target</span>
            <span class="kpi-value" style="font-size:18px; font-weight:800;">¥${totalTarget.toLocaleString()}</span>
          </div>
          <div class="kpi-icon-wrap kpi-icon-purple" style="border-radius:12px; width:42px; height:42px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
        </div>

        <!-- 2. Total Saved -->
        <div class="kpi-card">
          <div class="kpi-info">
            <span class="kpi-label">Total Saved</span>
            <span class="kpi-value" style="color:#16a34a; font-size:18px; font-weight:800;">¥${totalSaved.toLocaleString()}</span>
          </div>
          <div class="kpi-icon-wrap kpi-icon-green" style="border-radius:12px; width:42px; height:42px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.5-1 2-2.5.5-1.5 0-4-1-6.5.5-.5 1.2-1 0-2z"/></svg>
          </div>
        </div>

        <!-- 3. Remaining to Goal -->
        <div class="kpi-card">
          <div class="kpi-info">
            <span class="kpi-label">Remaining to Goal</span>
            <span class="kpi-value" style="font-size:18px; font-weight:800;">¥${totalRemaining.toLocaleString()}</span>
          </div>
          <div class="kpi-icon-wrap kpi-icon-blue" style="border-radius:12px; width:42px; height:42px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/><path d="M12 9v6"/><path d="M9 12h6"/></svg>
          </div>
        </div>

        <!-- 4. Overall Progress -->
        <div class="kpi-card">
          <div class="kpi-info">
            <span class="kpi-label">Overall Progress</span>
            <span class="kpi-value" style="font-size:18px; font-weight:800;">${overallProgress}%</span>
          </div>
          <div style="position:relative; width:40px; height:40px; display:flex; align-items:center; justify-content:center;">
            <svg viewBox="0 0 36 36" style="width:40px; height:40px; transform:rotate(-90deg);">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#fed7aa" stroke-width="3.5" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f97316" stroke-dasharray="${Math.min(100, Math.max(0, overallProgress))}, 100" stroke-width="3.5" stroke-linecap="round" />
            </svg>
          </div>
        </div>

        <!-- 5. Active Goals -->
        <div class="kpi-card">
          <div class="kpi-info">
            <span class="kpi-label">Active Goals</span>
            <span class="kpi-value" style="font-size:18px; font-weight:800;">${activeCount}</span>
          </div>
          <div class="kpi-icon-wrap" style="background:#f3e8ff; color:#9333ea; border-radius:12px; width:42px; height:42px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
        </div>
      </div>

      <!-- Upper Row (3 Columns: Goals Journey Hero Card + Donut + Milestones) -->
      <div class="goals-upper-grid">
        <!-- 1. Hero Landscape Scenic Goals Journey -->
        <div class="goals-journey-card">
          <div class="goals-landscape-wrap">
            <img src="assets/images/goals_mountain_journey.jpg" alt="Goals Mountain Journey" class="realistic-mountain-bg" />

            <!-- Floating Glassmorphic Progress Header on Top Left -->
            <div class="goals-journey-glass-header">
              <h3>Your Goals Journey</h3>
              <span class="sub-label">Total progress</span>
              <div class="pct-value">${overallProgress}%</div>
              <div class="status-tag">${overallProgress >= 70 ? 'Amazing progress! 🎉' : overallProgress >= 40 ? "You're on the right track! 🚀" : 'Every small step counts! 🏔️'}</div>
            </div>

            <!-- Milestone Interactive Pins on Trail -->
            <div class="journey-milestone-pin pin-purple" style="left: 28%; bottom: 12%;" title="Start: 0%">
              <div class="pin-speech-bubble">
                <span class="bubble-title">Start</span>
                <span class="bubble-pct">0%</span>
              </div>
              <div class="pin-target-ring"><div class="pin-inner-core"></div></div>
            </div>

            <div class="journey-milestone-pin pin-green" style="left: 45%; bottom: 20%;" title="Milestone: 25%">
              <div class="pin-speech-bubble">
                <span class="bubble-title">Keep Going!</span>
                <span class="bubble-pct">25%</span>
              </div>
              <div class="pin-target-ring"><div class="pin-inner-core"></div></div>
            </div>

            <div class="journey-milestone-pin pin-orange" style="left: 58%; bottom: 35%;" title="Milestone: 50%">
              <div class="pin-speech-bubble">
                <span class="bubble-title">Almost There!</span>
                <span class="bubble-pct">50%</span>
              </div>
              <div class="pin-target-ring"><div class="pin-inner-core"></div></div>
            </div>

            <div class="journey-milestone-pin pin-cyan" style="left: 65%; bottom: 58%;" title="Milestone: 75%">
              <div class="pin-speech-bubble">
                <span class="bubble-title">You Can Do It!</span>
                <span class="bubble-pct">75%</span>
              </div>
              <div class="pin-target-ring"><div class="pin-inner-core"></div></div>
            </div>

            <div class="journey-milestone-pin pin-gold" style="left: 78%; bottom: 78%;" title="Goal Achieved: 100%">
              <div class="pin-speech-bubble">
                <span class="bubble-title">Goal Achieved!</span>
                <span class="bubble-pct">100%</span>
              </div>
              <div class="pin-target-ring"><div class="pin-inner-core"></div></div>
            </div>
          </div>
        </div>

        <!-- 2. Goal Allocation Donut Chart -->
        <div class="card">
          <div class="card-header" style="margin-bottom:8px;">
            <div>
              <h3 class="card-title">Goal Allocation</h3>
              <span class="card-subtext">${isShowingTargetAllocation ? 'Target savings distribution' : 'Where your savings are going'}</span>
            </div>
          </div>
          <div style="position:relative; width:130px; height:130px; margin:0 auto;">
            <canvas id="goalsAllocationCanvas"></canvas>
            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center; pointer-events:none;">
              <span style="font-size:13px; font-weight:800; color:var(--text-heading); display:block;">
                ${isShowingTargetAllocation ? '¥' + (totalTarget >= 1000000 ? (totalTarget/1000000).toFixed(1)+'M' : Math.round(totalTarget/1000)+'K') : '¥' + (totalSaved >= 1000000 ? (totalSaved/1000000).toFixed(1)+'M' : Math.round(totalSaved/1000)+'K')}
              </span>
              <span style="font-size:9px; color:var(--text-muted); font-weight:600;">${isShowingTargetAllocation ? 'Target' : 'Saved'}</span>
            </div>
          </div>

          <div style="margin-top:10px; display:flex; flex-direction:column; gap:4px; max-height:120px; overflow-y:auto;">
            ${goalsList.map((g, idx) => {
              const colors = ["#0ea5e9", "#06b6d4", "#eab308", "#f97316", "#a855f7", "#10b981", "#ec4899", "#6366f1", "#14b8a6"];
              const col = g.color || colors[idx % colors.length];
              const val = isShowingTargetAllocation ? (g.targetAmount || 0) : (g.savedAmount || 0);
              const denom = isShowingTargetAllocation ? totalTarget : totalSaved;
              const pct = denom > 0 ? ((val / denom) * 100).toFixed(1) : "0.0";
              return `
                <div class="legend-row">
                  <div class="legend-left"><span class="legend-dot" style="background:${col};"></span> ${g.name || g.goal || g.goalName}</div>
                  <div class="legend-right" style="font-size:11px;">¥${val.toLocaleString()} <span class="legend-pct" style="font-size:10px;">(${pct}%)</span></div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 3. Goal Milestones (Dynamically Populated) -->
        <div class="card">
          <div class="card-header" style="margin-bottom:8px;">
            <div>
              <h3 class="card-title">Goal Milestones</h3>
              <span class="card-subtext">Upcoming target dates</span>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${milestoneGoals.map((g, idx) => {
              const icons = ['🎯', '🏆', '⭐'];
              const bgCols = ['#dcfce7', '#ffedd5', '#f3e8ff'];
              const textCols = ['#16a34a', '#ea580c', '#9333ea'];
              const isDone = g.progress >= 100;
              return `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 10px; background:var(--bg-app); border:1px solid var(--border-card); border-radius:8px;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <div style="width:24px; height:24px; border-radius:50%; background:${bgCols[idx % 3]}; color:${textCols[idx % 3]}; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px;">${isDone ? '✓' : icons[idx % 3]}</div>
                    <div>
                      <h4 style="font-size:12px; font-weight:700; color:var(--text-heading); margin:0;">${g.name || g.goal || g.goalName}</h4>
                      <p style="font-size:10px; color:${textCols[idx % 3]}; font-weight:600; margin:0;">${isDone ? 'Goal Completed 🎉' : 'Progress: ' + g.progress + '%'}</p>
                    </div>
                  </div>
                  <span style="font-size:10px; color:var(--text-muted); font-weight:500;">${g.targetDate || '2027-12-31'}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Middle Row: Your Savings Goals Table (100% Dynamic from Real Sheet) -->
      <div class="goals-middle-grid">
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Your Savings Goals</h3>
              <span class="card-subtext">Live calculated from real Google Sheets Savings_Goals</span>
            </div>
            <a href="goal.html" class="btn-primary" style="padding:4px 10px; font-size:11px; text-decoration:none;">+ New Goal</a>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Goal</th>
                  <th>Saved / Target</th>
                  <th>Progress</th>
                  <th>To Go</th>
                  <th>Target Date</th>
                  <th>Status</th>
                  <th>Speed</th>
                  <th style="text-align:center; min-width:110px;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${goalsList.map((g, idx) => {
                  const colors = ["#0ea5e9", "#06b6d4", "#eab308", "#f97316", "#a855f7", "#10b981", "#ec4899", "#6366f1", "#14b8a6"];
                  const col = g.color || colors[idx % colors.length];
                  
                  const gNameLower = (g.name || g.goal || '').toLowerCase();
                  let icon = "🎯";
                  if (gNameLower.includes("emergency")) icon = "🛡️";
                  else if (gNameLower.includes("vacation") || gNameLower.includes("trip")) icon = "✈️";
                  else if (gNameLower.includes("laptop") || gNameLower.includes("macbook")) icon = "💻";
                  else if (gNameLower.includes("education") || gNameLower.includes("kids")) icon = "🎓";
                  else if (gNameLower.includes("home") || gNameLower.includes("decor") || gNameLower.includes("repair")) icon = "🏠";
                  else if (gNameLower.includes("stock") || gNameLower.includes("nisa") || gNameLower.includes("invest")) icon = "📈";
                  else if (gNameLower.includes("car")) icon = "🚗";
                  else if (gNameLower.includes("iphone") || gNameLower.includes("phone") || gNameLower.includes("mobile")) icon = "📱";
                  else if (gNameLower.includes("gift") || gNameLower.includes("family")) icon = "🎁";

                  const isDone = g.progress >= 100;
                  const goalFullName = g.name || g.goal || g.goalName;

                  return `
                    <tr>
                      <td>
                        <div style="display:flex; align-items:center; gap:8px;">
                          <span style="font-size:16px;">${icon}</span>
                          <div>
                            <strong style="font-size:12.5px;">${goalFullName}</strong>
                            <span class="amount-subtext">${g.category || 'Savings Goal'}</span>
                          </div>
                        </div>
                      </td>
                      <td><strong>¥${(g.savedAmount || 0).toLocaleString()}</strong> <span class="amount-subtext">/ ¥${(g.targetAmount || 0).toLocaleString()}</span></td>
                      <td>
                        <div style="display:flex; align-items:center; gap:8px;">
                          <div class="progress-bar-wrap" style="width:70px;"><div class="progress-bar-fill" style="width:${Math.min(100, Math.max(0, g.progress))}%; background:${col};"></div></div>
                          <span style="font-size:11px; font-weight:600;">${g.progress}%</span>
                        </div>
                      </td>
                      <td>¥${(g.remainingNeeded || 0).toLocaleString()}</td>
                      <td>${g.targetDate || '-'}</td>
                      <td><span class="badge ${isDone ? 'badge-success' : g.progress >= 50 ? 'badge-info' : 'badge-warning'}">● ${g.status}</span></td>
                      <td><span class="${g.progress >= 60 ? 'tag-speed-excellent' : g.progress >= 30 ? 'tag-speed-good' : 'tag-speed-slow'}">${g.speed}</span></td>
                      <td style="text-align:center;">
                        ${!isDone ? `
                          <a href="input.html?tab=expense&type=Savings_Investments&detail=Saving&desc=${encodeURIComponent(goalFullName)}" class="btn-primary" style="padding:3px 10px; font-size:10.5px; border-radius:6px; text-decoration:none; display:inline-flex; align-items:center; gap:4px; font-weight:700; white-space:nowrap; background:#10b981;" title="Deposit money into this goal">
                            + Deposit 💰
                          </a>
                        ` : `<span style="font-size:10.5px; color:#10b981; font-weight:700;">✓ Completed 🎉</span>`}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right Side: Speedometer & Recommended -->
        <div style="display:flex; flex-direction:column; gap:14px;">
          <!-- Speed to Goal Speedometer Gauge Card -->
          <div class="speed-gauge-card">
            <div style="width:100%; text-align:left;">
              <h3 class="card-title">Speed to Goal</h3>
              <span class="card-subtext">Calculated from your current savings</span>
            </div>

            <div class="gauge-svg-wrap">
              <svg viewBox="0 0 200 110" style="width:100%; height:100%;">
                <path d="M20,100 A80,80 0 0,1 60,35" fill="none" stroke="#ef4444" stroke-width="14" stroke-linecap="round" />
                <path d="M60,35 A80,80 0 0,1 100,20" fill="none" stroke="#f97316" stroke-width="14" />
                <path d="M100,20 A80,80 0 0,1 140,35" fill="none" stroke="#eab308" stroke-width="14" />
                <path d="M140,35 A80,80 0 0,1 180,100" fill="none" stroke="#22c55e" stroke-width="14" stroke-linecap="round" />

                <!-- Gauge Needle Pointer -->
                <g transform="rotate(${Math.min(80, Math.max(-80, (overallProgress * 1.6) - 80))}, 100, 100)">
                  <line x1="100" y1="100" x2="100" y2="30" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round" />
                  <polygon points="97,32 100,22 103,32" fill="#0f172a" />
                </g>

                <circle cx="100" cy="100" r="9" fill="#0f172a" />
                <circle cx="100" cy="100" r="4" fill="#ffffff" />
              </svg>
            </div>

            <div class="gauge-status-label">
              <span>${overallProgress >= 50 ? '🚀' : overallProgress > 0 ? '👍' : '🎯'}</span> ${overallProgress >= 50 ? 'Excellent!' : overallProgress > 0 ? 'Good Progress!' : 'Ready to Save!'}
            </div>
            <div class="gauge-rate-text">Total Saved: <strong>¥${totalSaved.toLocaleString()}</strong></div>
            <div class="gauge-earlier-pill">
              Overall Journey: <strong>${overallProgress}% Complete</strong>
            </div>
          </div>

          <!-- Recommended Monthly Savings Card -->
          <div class="recommended-savings-card">
            <div>
              <h3 class="card-title">Recommended Monthly Savings</h3>
              <span class="card-subtext">To reach all goals on time</span>
            </div>

            <div>
              <div class="rec-savings-amount">¥${recommendedMonthly.toLocaleString()} <span style="font-size:12px; font-weight:500; color:var(--text-muted);">/ month</span></div>
              <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">Target: <strong>¥${totalTarget.toLocaleString()}</strong></div>
            </div>

            <div class="rec-savings-alert">
              Remaining needed: <strong>¥${totalRemaining.toLocaleString()}</strong> across all goals
            </div>
          </div>
        </div>
      </div>
    `;

    // Render Dynamic Donut Chart (shows Target distribution if totalSaved is 0)
    const chartLabels = goalsList.map(g => g.name || g.goal || g.goalName);
    const chartData = goalsList.map(g => isShowingTargetAllocation ? (g.targetAmount || 1) : (g.savedAmount || 0));
    const chartColors = ["#0ea5e9", "#06b6d4", "#eab308", "#f97316", "#a855f7", "#10b981", "#ec4899", "#6366f1", "#14b8a6"];

    charts.renderDonutChart("goalsAllocationCanvas", {
      labels: chartLabels,
      data: chartData,
      colors: chartColors.slice(0, chartLabels.length),
      cutout: "70%"
    });
  }

  return {
    render
  };
})();
