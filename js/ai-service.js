/**
 * ============================================================================
 * ✨ BudgetTracker Gemini AI Financial Advisor Service
 * ============================================================================
 * Connects directly to Google Gemini API (Free Tier) to provide personalized,
 * in-depth financial coaching, debt payoff strategies, and savings velocity forecasts.
 */

window.BudgetTrackerAiService = (() => {
  const STORAGE_KEY = 'gemini_api_key';
  const MODEL_KEY = 'gemini_model_name';
  const DEFAULT_MODEL = 'gemini-3.7-flash';

  function getApiKey() {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch (e) {
      return '';
    }
  }

  function setApiKey(key) {
    try {
      localStorage.setItem(STORAGE_KEY, (key || '').trim());
    } catch (e) {}
  }

  function getModel() {
    try {
      return localStorage.getItem(MODEL_KEY) || DEFAULT_MODEL;
    } catch (e) {
      return DEFAULT_MODEL;
    }
  }

  function setModel(model) {
    try {
      localStorage.setItem(MODEL_KEY, (model || DEFAULT_MODEL).trim());
    } catch (e) {}
  }

  /**
   * Build clean context prompt from real Google Sheet data
   */
  function buildFinancialContext(dashboardType = 'overview') {
    const data = window.BudgetTrackerData ? window.BudgetTrackerData.getDashboardData() : null;
    const calc = window.BudgetTrackerCalc;
    if (!data || !calc) return "Financial data loading...";

    const summary = calc.computeSummary(data.transactions || []);
    const goals = calc.computeGoals(data.transactions || [], data.goals || []);
    const budgets = calc.computeBudgets(data.transactions || [], data.budgets || []);
    const debts = calc.computeDebts(data.transactions || [], data.debts || []);
    const lending = calc.computeLending(data.transactions || []);
    const expensesGroup = calc.groupExpensesByCategory(data.transactions || []);

    const lang = (typeof localStorage !== 'undefined' && localStorage.getItem('ai_advisor_lang')) || 'mm';

    return {
      lang,
      dashboardType,
      currency: 'JPY',
      totalIncome: summary.totalIncome,
      totalExpense: summary.totalExpense,
      netSavings: summary.netCashFlow,
      topCategories: expensesGroup.categories.slice(0, 5).map(c => `${c.name}: ¥${c.amount.toLocaleString()} (${c.percentage.toFixed(1)}%)`),
      goalsList: goals.goals.map(g => `${g.name}: Target ¥${g.targetAmount.toLocaleString()}, Saved ¥${g.savedAmount.toLocaleString()} (${g.progress}%), Due ${g.targetDate}`),
      overspentBudgets: (budgets.budgets || []).filter(b => b.progress > 100).map(b => `${b.category}: Spent ¥${b.actual.toLocaleString()} / Budget ¥${b.budget.toLocaleString()}`),
      totalDebt: debts.totalRemaining || debts.totalDebtLeft || 0,
      totalMoneyLent: lending.totalRemaining || 0,
      activeBorrowers: (lending.lendingList || []).filter(l => l.remaining > 0).map(l => `${l.borrower}: ¥${l.remaining.toLocaleString()}`)
    };
  }

  /**
   * Call Google Gemini API
   */
  async function callGemini(userPrompt, dashboardType = 'overview') {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('MISSING_API_KEY');
    }

    const context = buildFinancialContext(dashboardType);
    const model = getModel();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const systemInstruction = `
You are the elite "Antigravity Financial Coach & Wealth Strategist" for a household budget application.
You give practical, motivating, highly accurate, and mathematically sound personal finance advice.
Always tailor advice specifically to the user's real numbers provided below.

User Financial Context:
- Language Preference: ${context.lang === 'mm' ? 'Myanmar (Burmese) with friendly English terms' : 'English'}
- Currency: JPY (¥)
- Monthly Income: ¥${context.totalIncome.toLocaleString()}
- Total Expenses: ¥${context.totalExpense.toLocaleString()}
- Net Monthly Cash Flow: ¥${context.netSavings.toLocaleString()}
- Top Expenses: ${context.topCategories.join(', ')}
- Savings Goals: ${context.goalsList.join(' | ')}
- Overspent Budgets: ${context.overspentBudgets.join(', ') || 'None (All on track)'}
- Total Debt Outstanding: ¥${context.totalDebt.toLocaleString()}
- Money Lent to Others (Receivables): ¥${context.totalMoneyLent.toLocaleString()} (${context.activeBorrowers.join(', ') || 'None'})

Guidelines:
1. Provide structured, bulleted, actionable insights with emojis.
2. Keep response concise (under 250 words), easy to scan, and direct.
3. If Myanmar language is selected (${context.lang === 'mm'}), explain in natural, clear, polite Myanmar language.
4. Highlight concrete numbers (e.g. "Save ¥20,000/mo", "Cut dining out by 10%").
    `.trim();

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemInstruction}\n\nUser Question/Request: ${userPrompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    };

    const candidateModels = [model, 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    const uniqueModels = [...new Set(candidateModels)];

    let response = null;
    let lastError = null;

    for (const m of uniqueModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
        if (response.ok) break;
        const errJson = await response.json().catch(() => ({}));
        lastError = errJson.error?.message || response.statusText;
      } catch (e) {
        lastError = e.message;
      }
    }

    if (!response || !response.ok) {
      throw new Error(`Gemini API Error: ${lastError || 'Failed to fetch advice from Gemini'}`);
    }

    const resJson = await response.json();
    const candidateText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('No advice received from Gemini.');
    }

    return formatMarkdown(candidateText);
  }

  function formatMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(99,102,241,0.1); padding:2px 4px; border-radius:4px; font-size:12px;">$1</code>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .replace(/• /g, '• ');
  }

  /**
   * UI: Interactive Gemini Advisor Modal
   */
  function openAdvisorModal(dashboardType = 'overview', defaultQuery = '') {
    let modal = document.getElementById('geminiAdvisorModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'geminiAdvisorModal';
      modal.className = 'gemini-modal-backdrop';
      document.body.appendChild(modal);
    }

    const apiKey = getApiKey();
    const lang = (typeof localStorage !== 'undefined' && localStorage.getItem('ai_advisor_lang')) || 'mm';

    const defaultPrompts = {
      goals: [
        lang === 'mm' ? '🎯 ကျွန်ုပ်၏ ပန်းတိုင်များကို အချိန်မီ ပြည့်မီရန် အကောင်းဆုံး ငွေစုနည်းလမ်း' : '🎯 Best monthly savings strategy to achieve goals on time',
        lang === 'mm' ? '🚀 Emergency Fund နှင့် Vacation အတွက် ငွေခွဲဝေစုဆောင်းနည်း' : '🚀 How to balance Emergency Fund and Vacation goals',
        lang === 'mm' ? '💡 လစဉ်ပိုစုနိုင်ရန် မည်သည့်နေရာတွင် အသုံးလျှော့သင့်သလဲ' : '💡 Where to cut spending to increase savings velocity'
      ],
      spending: [
        lang === 'mm' ? '💸 50/30/20 သုံးစွဲမှုအချိုး မှန်ကန်စေရန် ဘယ်လိုထိန်းရမလဲ' : '💸 How to optimize my 50/30/20 Need vs Want ratio',
        lang === 'mm' ? '✂️ အသုံးအများဆုံး ကဏ္ဍများမှ ၁၅% ချွေတာနိုင်မည့် နည်းလမ်း' : '✂️ Practical tips to reduce top expense categories by 15%',
        lang === 'mm' ? '🛍️ စိတ်လိုက်မာန်ပါ သုံးစွဲမှု (Impulse spend) ထိန်းချုပ်နည်း' : '🛍️ Strategies to eliminate impulse purchases'
      ],
      debt: [
        lang === 'mm' ? '📉 အကြွေးများကို အမြန်ဆုံးကျေစေမည့် Snowball Payoff Plan' : '📉 Snowball Debt Payoff Strategy based on my liabilities',
        lang === 'mm' ? '🤝 သူများထံမှ ပြန်ရရန်ရှိသော ငွေများ အဆင်ပြေပြေ တောင်းခံနည်း' : '🤝 Professional strategy to recover receivables from borrowers',
        lang === 'mm' ? '⚖️ Net Asset အပေါင်းဖြစ်စေရန် အကြွေးနှင့် စုငွေ ချိန်ညှိနည်း' : '⚖️ How to become net positive with current debt vs assets'
      ],
      budget: [
        lang === 'mm' ? '🚨 Over Budget ဖြစ်နေသော ကဏ္ဍများကို ထိန်းသိမ်းနည်း' : '🚨 How to recover from overspent budget categories',
        lang === 'mm' ? '📊 လကုန်အထိ ဘတ်ဂျက်မကျော်စေရန် နေ့စဉ်သုံးစွဲမှု တွက်ချက်နည်း' : '📊 Daily spending burn rate to stay under monthly limit',
        lang === 'mm' ? '👛 လာမည့်လအတွက် ပိုမိုလက်တွေ့ကျသော ဘတ်ဂျက်ရေးဆွဲနည်း' : '👛 How to plan a realistic budget for next month'
      ],
      overview: [
        lang === 'mm' ? '🌟 ကျွန်ုပ်၏ လက်ရှိ ဘဏ္ဍာရေး အခြေအနေ အလုံးစုံ သုံးသပ်ပေးပါ' : '🌟 Provide a full financial health audit & wealth strategy',
        lang === 'mm' ? '💰 တစ်နှစ်အတွင်း အသားတင်ချမ်းသာကြွယ်ဝမှု တိုးတက်စေမည့် နည်းလမ်း' : '💰 Top 3 actionable wealth growth steps for this year',
        lang === 'mm' ? '🛡️ ငွေကြေးအန္တရာယ် ကင်းဝေးစေရန် အရေးပေါ် ရန်ပုံငွေ အစီအမံ' : '🛡️ Emergency buffer & cash flow safety analysis'
      ]
    };

    const chips = defaultPrompts[dashboardType] || defaultPrompts.overview;

    modal.innerHTML = `
      <div class="gemini-modal-dialog">
        <!-- Modal Header -->
        <div class="gemini-modal-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="ai-sparkle-icon" style="width:36px; height:36px; font-size:18px;">✨</div>
            <div>
              <h3 style="margin:0; font-size:15px; font-weight:800; color:var(--text-heading); display:flex; align-items:center; gap:6px;">
                Gemini Financial AI Coach 
                <span class="ai-tag-pill">Google Gemini Powered</span>
              </h3>
              <p style="margin:2px 0 0 0; font-size:11px; color:var(--text-muted);">
                ${lang === 'mm' ? 'မိမိ၏ Google Sheets ဒေတာအပေါ် အခြေခံ၍ AI မှ တိုက်ရိုက် အကြံဉာဏ်ပေးခြင်း' : 'Personalized financial strategies based on your real Google Sheets'}
              </p>
            </div>
          </div>
          <button class="gemini-modal-close" onclick="window.BudgetTrackerAiService.closeModal()">✕</button>
        </div>

        <!-- API Key Status / Banner -->
        ${!apiKey ? `
          <div class="gemini-apikey-banner">
            <div style="font-size:12px; font-weight:700; color:#b45309; margin-bottom:4px;">🔑 Google Gemini API Key လိုအပ်ပါသည် (အခမဲ့ Free Tier)</div>
            <p style="font-size:11px; color:#92400e; margin:0 0 8px 0; line-height:1.4;">
              Google AI Studio (<a href="https://aistudio.google.com/" target="_blank" style="color:#6366f1; font-weight:700; text-decoration:underline;">aistudio.google.com</a>) မှ အခမဲ့ API Key ရယူပြီး အောက်တွင် ထည့်သွင်းပေးပါ-
            </p>
            <div style="display:flex; gap:6px;">
              <input type="password" id="geminiApiKeyInput" class="form-input" placeholder="AIzaSy..." style="flex:1; font-size:12px; padding:6px 10px; background:#ffffff;">
              <button class="btn-primary" onclick="window.BudgetTrackerAiService.saveKeyFromModal()" style="font-size:11px; padding:6px 12px; white-space:nowrap;">
                Save Key 💾
              </button>
            </div>
          </div>
        ` : `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; font-size:11px; color:var(--text-muted);">
            <span style="color:#10b981; font-weight:700;">● Gemini API Connected (${getModel()})</span>
            <a href="javascript:void(0)" onclick="window.BudgetTrackerAiService.showKeyPrompt()" style="color:#6366f1; text-decoration:none; font-weight:600;">Change Key 🔑</a>
          </div>
        `}

        <!-- Prompt Suggestions Pills -->
        <div style="margin-bottom:10px;">
          <div style="font-size:11px; font-weight:700; color:var(--text-muted); margin-bottom:6px;">
            ${lang === 'mm' ? '💡 အကြံပြု မေးခွန်းများ (Quick Questions):' : '💡 Quick Strategy Questions:'}
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            ${chips.map(c => `
              <button class="gemini-chip-btn" onclick="window.BudgetTrackerAiService.askQuestion('${c.replace(/'/g, "\\'")}', '${dashboardType}')">
                ${c}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Interactive Question Input -->
        <div style="display:flex; gap:8px; margin-bottom:14px;">
          <input type="text" id="geminiCustomQuery" class="form-input" placeholder="${lang === 'mm' ? 'ငွေကြေးဆိုင်ရာ သိလိုသည်များကို မေးမြန်းပါ (ဥပမာ- လစဉ် ¥50,000 ပိုစုနိုင်မည့်နည်း)...' : 'Ask any financial question (e.g. How to save ¥50,000 more)...'}" style="flex:1; font-size:12px;" value="${defaultQuery || ''}" onkeydown="if(event.key==='Enter') window.BudgetTrackerAiService.submitCustom('${dashboardType}')">
          <button class="btn-primary" id="geminiSubmitBtn" onclick="window.BudgetTrackerAiService.submitCustom('${dashboardType}')" style="font-size:12px; padding:6px 16px; white-space:nowrap; display:flex; align-items:center; gap:6px;">
            <span>Ask AI</span> <span>✨</span>
          </button>
        </div>

        <!-- AI Output Box -->
        <div id="geminiOutputStage" class="gemini-output-stage" style="display:${defaultQuery ? 'block' : 'none'};">
          <div id="geminiOutputContent"></div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    if (defaultQuery && apiKey) {
      askQuestion(defaultQuery, dashboardType);
    }
  }

  function closeModal() {
    const modal = document.getElementById('geminiAdvisorModal');
    if (modal) modal.style.display = 'none';
  }

  function showKeyPrompt() {
    const current = getApiKey();
    const newKey = prompt("Enter your Google Gemini API Key (from aistudio.google.com):", current);
    if (newKey !== null) {
      setApiKey(newKey);
      openAdvisorModal();
    }
  }

  function saveKeyFromModal() {
    const input = document.getElementById('geminiApiKeyInput');
    if (input && input.value.trim()) {
      setApiKey(input.value.trim());
      alert('Gemini API Key saved successfully! 🎉');
      openAdvisorModal();
    } else {
      alert('Please enter a valid API Key.');
    }
  }

  async function askQuestion(question, dashboardType) {
    const outputStage = document.getElementById('geminiOutputStage');
    const outputContent = document.getElementById('geminiOutputContent');
    const submitBtn = document.getElementById('geminiSubmitBtn');
    const queryInput = document.getElementById('geminiCustomQuery');

    if (queryInput) queryInput.value = question;
    if (outputStage) outputStage.style.display = 'block';

    if (outputContent) {
      outputContent.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:center; gap:10px; padding:20px 0; color:#6366f1;">
          <div class="gemini-spinner"></div>
          <span style="font-size:12.5px; font-weight:700;">Gemini AI is analyzing your live Google Sheet transactions... ⚡</span>
        </div>
      `;
    }

    if (submitBtn) submitBtn.disabled = true;

    try {
      const advice = await callGemini(question, dashboardType);
      if (outputContent) {
        outputContent.innerHTML = `
          <div class="gemini-response-card">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid var(--border-card);">
              <span style="font-size:16px;">🤖</span>
              <strong style="font-size:13px; color:var(--text-heading);">Gemini Financial Coach Advice:</strong>
            </div>
            <div style="font-size:12.5px; line-height:1.6; color:var(--text-main);">
              ${advice}
            </div>
          </div>
        `;
      }
    } catch (err) {
      if (outputContent) {
        if (err.message === 'MISSING_API_KEY') {
          outputContent.innerHTML = `
            <div style="padding:14px; background:#fef2f2; border:1px solid #fca5a5; border-radius:8px; color:#991b1b; font-size:12px;">
              ⚠️ Please provide a Google Gemini API Key to enable Deep AI Strategy Analysis.
            </div>
          `;
        } else {
          outputContent.innerHTML = `
            <div style="padding:14px; background:#fef2f2; border:1px solid #fca5a5; border-radius:8px; color:#991b1b; font-size:12px;">
              <strong>Error calling Gemini API:</strong><br>${err.message}
            </div>
          `;
        }
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function submitCustom(dashboardType) {
    const input = document.getElementById('geminiCustomQuery');
    if (!input || !input.value.trim()) return;
    askQuestion(input.value.trim(), dashboardType);
  }

  // ============================================================
  // ✨ Floating Corner AI Advisor Widget & Drawer Controller
  // ============================================================
  let currentActiveTab = 'overview';

  function mountFloatingWidget() {
    if (typeof document === 'undefined') return;
    // Don't mount generic pill button on home hub which has its own robot assistant
    if (document.querySelector('.floating-robot-trigger') || (typeof window !== 'undefined' && window.location && (window.location.pathname.endsWith('home.html') || window.location.pathname === '/' && document.querySelector('.app-screen')))) {
      return;
    }
    if (document.getElementById('aiCornerWidget')) return;

    const widget = document.createElement('div');
    widget.id = 'aiCornerWidget';
    widget.className = 'ai-corner-widget';
    widget.innerHTML = `
      <button class="ai-corner-btn" onclick="window.BudgetTrackerAiService.toggleDrawer()" title="✨ Open AI Financial Advisor">
        <span class="ai-corner-icon">✨</span>
        <span class="ai-corner-label">AI Advisor</span>
        <span class="ai-corner-badge" id="aiCornerBadge"></span>
      </button>
    `;
    document.body.appendChild(widget);

    const drawer = document.createElement('div');
    drawer.id = 'aiCornerDrawer';
    drawer.className = 'ai-corner-drawer';
    drawer.innerHTML = `
      <div class="ai-drawer-header">
        <div class="ai-drawer-title-group">
          <div class="ai-sparkle-icon" style="width:30px; height:30px; font-size:15px;">✨</div>
          <div>
            <h4 class="ai-drawer-title" id="aiDrawerTitle">AI Financial Advisor</h4>
            <span class="ai-drawer-subtitle" id="aiDrawerSub">Real-time smart insights for your finances</span>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="ai-lang-switch">
            <button id="drawerLangMM" class="ai-lang-btn" onclick="window.setAiAdvisorLang('mm')">🇲🇲 မြန်မာ</button>
            <button id="drawerLangEN" class="ai-lang-btn" onclick="window.setAiAdvisorLang('en')">🇬🇧 English</button>
          </div>
          <button class="ai-drawer-close-btn" onclick="window.BudgetTrackerAiService.closeDrawer()">✕</button>
        </div>
      </div>

      <div class="ai-drawer-action-bar">
        <button class="ai-gemini-deep-btn" onclick="window.BudgetTrackerAiService.openAdvisorModal(window.BudgetTrackerAiService.getCurrentTab())">
          <span>✨ Ask Gemini AI Coach (Deep Strategy)</span>
          <span style="font-size:13px;">➔</span>
        </button>
      </div>

      <div class="ai-drawer-body" id="aiDrawerBody"></div>
    `;
    document.body.appendChild(drawer);

    // Auto-close on click outside
    document.addEventListener('click', (e) => {
      const d = document.getElementById('aiCornerDrawer');
      const w = document.getElementById('aiCornerWidget');
      const m = document.getElementById('geminiAdvisorModal');
      if (d && d.classList.contains('open')) {
        if (!d.contains(e.target) && !w.contains(e.target) && (!m || m.style.display !== 'flex')) {
          closeDrawer();
        }
      }
    });
  }

  function toggleDrawer() {
    const drawer = document.getElementById('aiCornerDrawer');
    if (!drawer) {
      mountFloatingWidget();
      updateFloatingWidget(currentActiveTab);
    }
    const d = document.getElementById('aiCornerDrawer');
    if (d) {
      d.classList.toggle('open');
      if (d.classList.contains('open')) {
        updateFloatingWidget(currentActiveTab);
      }
    }
  }

  function openDrawer() {
    mountFloatingWidget();
    const d = document.getElementById('aiCornerDrawer');
    if (d) {
      d.classList.add('open');
      updateFloatingWidget(currentActiveTab);
    }
  }

  function closeDrawer() {
    const d = document.getElementById('aiCornerDrawer');
    if (d) d.classList.remove('open');
  }

  function getCurrentTab() {
    return currentActiveTab || 'overview';
  }

  function updateFloatingWidget(activeTab = 'overview') {
    currentActiveTab = activeTab;
    mountFloatingWidget();

    const data = window.BudgetTrackerData ? window.BudgetTrackerData.getDashboardData() : null;
    const calc = window.BudgetTrackerCalc;
    if (!data || !calc) return;

    const lang = (typeof localStorage !== 'undefined' && localStorage.getItem('ai_advisor_lang')) || 'mm';
    const recs = calc.computeAiRecommendations(data.transactions || [], data.goals || [], data.budgets || [], data.schedules || [], lang);

    // Get insights for current tab
    let items = [];
    let title = '';
    let subtitle = '';

    if (activeTab === 'goals') {
      items = recs.goals || [];
      title = recs.headers?.goals?.title || 'AI Savings Advisor';
      subtitle = recs.headers?.goals?.sub || '';
    } else if (activeTab === 'spending') {
      items = recs.spending || [];
      title = recs.headers?.spending?.title || 'AI Spending Optimization';
      subtitle = recs.headers?.spending?.sub || '';
    } else if (activeTab === 'debt') {
      items = recs.debt || [];
      title = recs.headers?.debt?.title || 'AI Debt & Lending Advisor';
      subtitle = recs.headers?.debt?.sub || '';
    } else if (activeTab === 'budget') {
      items = recs.budget || [];
      title = recs.headers?.budget?.title || 'AI Budget Pace Advisor';
      subtitle = recs.headers?.budget?.sub || '';
    } else {
      // overview or others -> top items from each category
      items = [
        ...(recs.spending || []).slice(0, 1),
        ...(recs.goals || []).slice(0, 1),
        ...(recs.budget || []).slice(0, 1),
        ...(recs.debt || []).slice(0, 1)
      ];
      title = recs.headers?.overview?.title || 'AI Financial Health & Insights';
      subtitle = recs.headers?.overview?.sub || '';
    }

    // Update Badge Count
    const badge = document.getElementById('aiCornerBadge');
    if (badge) {
      badge.textContent = items.length > 0 ? items.length : '';
      badge.style.display = items.length > 0 ? 'inline-block' : 'none';
    }

    // Update Drawer Title
    const titleEl = document.getElementById('aiDrawerTitle');
    const subEl = document.getElementById('aiDrawerSub');
    if (titleEl) titleEl.textContent = title;
    if (subEl) subEl.textContent = subtitle;

    // Update Drawer Language Buttons
    const btnMM = document.getElementById('drawerLangMM');
    const btnEN = document.getElementById('drawerLangEN');
    if (btnMM && btnMM.classList && typeof btnMM.classList.toggle === 'function') btnMM.classList.toggle('active', lang === 'mm');
    if (btnEN && btnEN.classList && typeof btnEN.classList.toggle === 'function') btnEN.classList.toggle('active', lang === 'en');

    // Update Drawer Body
    const body = document.getElementById('aiDrawerBody');
    if (body) {
      if (items.length === 0) {
        body.innerHTML = `
          <div style="text-align:center; padding:24px 10px; color:var(--text-muted); font-size:12px;">
            🎉 All financial metrics look completely healthy in this section!
          </div>
        `;
      } else {
        body.innerHTML = items.map(item => `
          <div class="ai-drawer-item">
            <div class="ai-drawer-item-icon" style="background:rgba(99,102,241,0.12); color:#6366f1;">
              ${item.icon}
            </div>
            <div class="ai-drawer-item-content">
              <h5 class="ai-drawer-item-title">${item.title}</h5>
              <p class="ai-drawer-item-desc">${item.desc}</p>
              ${item.link 
                ? `<a href="${item.link}" class="ai-action-pill pill-green" style="font-size:10.5px; padding:3px 8px;">${item.actionPill}</a>` 
                : `<span class="ai-action-pill ${item.type === 'warning' || item.type === 'danger' ? 'pill-amber' : 'pill-green'}" style="font-size:10.5px; padding:3px 8px;">${item.actionPill}</span>`}
            </div>
          </div>
        `).join('');
      }
    }
  }

  // Auto mount on DOM load
  if (typeof window !== 'undefined') {
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => mountFloatingWidget());
      } else {
        mountFloatingWidget();
      }
    }
  }

  return {
    getApiKey,
    setApiKey,
    getModel,
    setModel,
    callGemini,
    openAdvisorModal,
    closeModal,
    showKeyPrompt,
    saveKeyFromModal,
    askQuestion,
    submitCustom,
    mountFloatingWidget,
    toggleDrawer,
    openDrawer,
    closeDrawer,
    updateFloatingWidget,
    getCurrentTab
  };
})();

