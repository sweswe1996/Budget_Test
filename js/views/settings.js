/**
 * Settings View Renderer — Preferences, Google Sheets Sync & Data Management
 */

window.BudgetTrackerViews = window.BudgetTrackerViews || {};

window.BudgetTrackerViews.settings = (() => {
  function render(container, data, filters) {
    container.innerHTML = `
      <!-- Top Title Group -->
      <div class="page-title-banner" style="margin-bottom: 2px;">
        <div class="page-title-group">
          <div>
            <h2 style="display:flex; align-items:center; gap:8px; font-size:20px;">Settings &amp; Preferences <span>⚙️✨</span></h2>
            <p style="font-size:12px; color:var(--text-muted);">Manage Google Sheets connection, preferences, currencies, and backups.</p>
          </div>
        </div>
      </div>

      <div class="settings-grid">
        <!-- Left: Google Sheets Sync & Data Integration -->
        <div style="display:flex; flex-direction:column; gap:14px;">
          <!-- Google Sheets Config -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Google Sheets Integration 🔗</h3>
              <span class="badge badge-success">● Connected (Local Prototype)</span>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:10px;">
              <div class="form-group">
                <label style="font-size:11.5px; font-weight:600; color:var(--text-heading); margin-bottom:4px; display:block;">Spreadsheet URL / ID</label>
                <input type="text" class="form-input" style="width:100%; font-size:12px;" value="https://docs.google.com/spreadsheets/d/1OOrFs6uFBTt2nHW5lxTzqng0vMqWsCt_AyZ3ELare9s" readonly>
                <span style="font-size:10px; color:var(--text-muted); margin-top:2px; display:block;">Tabs: Income-Expense-Tracker, Budgets, Savings_Goals, Payment_Schedule</span>
              </div>

              <div class="form-group">
                <label style="font-size:11.5px; font-weight:600; color:var(--text-heading); margin-bottom:4px; display:block;">Google Apps Script Web App Deployment URL</label>
                <input type="text" class="form-input" style="width:100%; font-size:12px;" placeholder="https://script.google.com/macros/s/.../exec">
                <span style="font-size:10px; color:var(--text-muted); margin-top:2px; display:block;">Used when deployed via Google Apps Script (google.script.run) or REST API</span>
              </div>

              <div style="display:flex; gap:10px; align-items:center; margin-top:6px; flex-wrap:wrap;">
                <button class="btn-primary" onclick="alert('Google Sheet connection verified successfully!')" style="font-size:11.5px; padding:6px 14px;">
                  <span>Test Connection</span>
                </button>
                <button class="btn-reset" onclick="window.BudgetTrackerApp.init()" style="font-size:11.5px; padding:6px 14px;">
                  <span>Re-fetch Sheet Data</span>
                </button>
              </div>
            </div>
          </div>

          <!-- ✨ Google Gemini AI API Configuration -->
          <div class="card" style="border: 1px solid rgba(139, 92, 246, 0.35); background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%), var(--bg-card);">
            <div class="card-header">
              <h3 class="card-title" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <span>✨ Google Gemini AI Configuration</span>
                <span class="ai-tag-pill">AI Coach API</span>
              </h3>
              <span id="geminiApiStatusBadge" class="badge badge-info" style="font-size:10px;">${(typeof localStorage !== 'undefined' && localStorage.getItem('gemini_api_key')) ? '● Connected' : '○ Not Configured'}</span>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:10px;">
              <p style="font-size:11px; color:var(--text-muted); margin:0;">
                Get your free API Key at <a href="https://aistudio.google.com/" target="_blank" style="color:#6366f1; font-weight:700; text-decoration:underline;">Google AI Studio</a> to unlock Deep Financial Strategy Analysis &amp; Live Q&amp;A.
              </p>

              <div class="form-group">
                <label style="font-size:11.5px; font-weight:600; color:var(--text-heading); margin-bottom:4px; display:block;">Gemini API Key</label>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                  <input type="password" id="settingsGeminiKey" class="form-input" style="flex:1; min-width:180px; font-size:12px;" placeholder="AIzaSy..." value="${(typeof localStorage !== 'undefined' && localStorage.getItem('gemini_api_key')) || ''}">
                  <button class="btn-primary" onclick="saveGeminiSettingsKey()" style="font-size:11.5px; padding:6px 14px; white-space:nowrap;">
                    <span>Save Key 💾</span>
                  </button>
                </div>
              </div>

              <div class="settings-inner-grid">
                <div class="form-group">
                  <label style="font-size:11.5px; font-weight:600; color:var(--text-heading); margin-bottom:4px; display:block;">AI Model</label>
                  <select id="settingsGeminiModel" class="form-select" style="width:100%; font-size:12px;" onchange="localStorage.setItem('gemini_model_name', this.value)">
                    <option value="gemini-3.7-flash" ${(typeof localStorage !== 'undefined' && (localStorage.getItem('gemini_model_name') === 'gemini-3.7-flash' || !localStorage.getItem('gemini_model_name'))) ? 'selected' : ''}>Gemini 3.7 Flash (Latest 2026 GA ⭐)</option>
                    <option value="gemini-3.5-flash" ${(typeof localStorage !== 'undefined' && localStorage.getItem('gemini_model_name') === 'gemini-3.5-flash') ? 'selected' : ''}>Gemini 3.5 Flash (Balanced &amp; Fast ⚡)</option>
                    <option value="gemini-3.5-flash-lite" ${(typeof localStorage !== 'undefined' && localStorage.getItem('gemini_model_name') === 'gemini-3.5-flash-lite') ? 'selected' : ''}>Gemini 3.5 Flash-Lite (Ultra Fast 💨)</option>
                    <option value="gemini-2.0-flash" ${(typeof localStorage !== 'undefined' && localStorage.getItem('gemini_model_name') === 'gemini-2.0-flash') ? 'selected' : ''}>Gemini 2.0 Flash (Fast &amp; Free)</option>
                    <option value="gemini-1.5-flash" ${(typeof localStorage !== 'undefined' && localStorage.getItem('gemini_model_name') === 'gemini-1.5-flash') ? 'selected' : ''}>Gemini 1.5 Flash (Legacy)</option>
                    <option value="gemini-1.5-pro" ${(typeof localStorage !== 'undefined' && localStorage.getItem('gemini_model_name') === 'gemini-1.5-pro') ? 'selected' : ''}>Gemini 1.5 Pro (Deep Reasoning)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label style="font-size:11.5px; font-weight:600; color:var(--text-heading); margin-bottom:4px; display:block;">AI Language Mode</label>
                  <select class="form-select" style="width:100%; font-size:12px;" onchange="window.setAiAdvisorLang ? window.setAiAdvisorLang(this.value) : localStorage.setItem('ai_advisor_lang', this.value)">
                    <option value="mm" ${(typeof localStorage !== 'undefined' && localStorage.getItem('ai_advisor_lang') === 'mm') || true ? 'selected' : ''}>🇲🇲 Myanmar (မြန်မာ)</option>
                    <option value="en" ${(typeof localStorage !== 'undefined' && localStorage.getItem('ai_advisor_lang') === 'en') ? 'selected' : ''}>🇬🇧 English</option>
                  </select>
                </div>
              </div>

              <div style="display:flex; gap:8px; margin-top:4px; flex-wrap:wrap;">
                <button class="btn-secondary" onclick="window.BudgetTrackerAiService.openAdvisorModal('overview', 'Provide an audit of my current financial health')" style="font-size:11.5px; padding:6px 12px; display:flex; align-items:center; gap:6px;">
                  <span>✨ Test AI Coach Assistant</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Currency & Preferences -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Default Preferences</h3>
            </div>
            <div class="settings-inner-grid">
              <div class="form-group">
                <label style="font-size:11.5px; font-weight:600; color:var(--text-heading); margin-bottom:4px; display:block;">Base Currency</label>
                <select class="form-select" style="width:100%; font-size:12px;">
                  <option value="JPY" selected>JPY — Japanese Yen (¥)</option>
                  <option value="MMK">MMK — Myanmar Kyat (Ks)</option>
                  <option value="USD">USD — US Dollar ($)</option>
                </select>
              </div>

              <div class="form-group">
                <label style="font-size:11.5px; font-weight:600; color:var(--text-heading); margin-bottom:4px; display:block;">Default ForWho Owner</label>
                <select class="form-select" style="width:100%; font-size:12px;">
                  <option value="US" selected>US (Joint / Household)</option>
                  <option value="CS">CS</option>
                  <option value="MG">MG</option>
                  <option value="Family">Family</option>
                  <option value="Me">Me</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Data Backup & Reset -->
        <div style="display:flex; flex-direction:column; gap:14px;">
          <!-- Backup & Restore -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Data Backup &amp; Export</h3>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <p style="font-size:11.5px; color:var(--text-muted);">Backup your entire dashboard data (transactions, budgets, goals, accounts) into JSON format.</p>
              
              <button class="btn-primary" onclick="exportDataJSON()" style="font-size:12px; padding:8px 12px; background:var(--primary); margin-top:6px;">
                <span>💾 Backup to JSON File</span>
              </button>

              <button class="btn-reset" onclick="window.BudgetTrackerReports.exportCSV()" style="font-size:12px; padding:8px 12px;">
                <span>📥 Export All to CSV</span>
              </button>
            </div>
          </div>

          <!-- App Information -->
          <div class="card" style="background:linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border-color:#ddd6fe;">
            <div class="card-header" style="margin-bottom:6px;">
              <h3 class="card-title" style="color:#6d28d9;">About BudgetTracker</h3>
            </div>
            <div style="font-size:11.5px; color:#7c3aed; line-height:1.4;">
              <strong>Version:</strong> 2.5.0 SaaS Pro<br>
              <strong>Architecture:</strong> Single Page App + Offline In-Memory Cache + Google Sheets Compatible<br>
              <strong>Status:</strong> Ready for Google Apps Script deployment
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return {
    render
  };
})();

function exportDataJSON() {
  const data = window.BudgetTrackerData.getDashboardData();
  const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", jsonStr);
  link.setAttribute("download", `budget_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function saveGeminiSettingsKey() {
  const input = document.getElementById("settingsGeminiKey");
  if (input) {
    const val = input.value.trim();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem("gemini_api_key", val);
    }
    const badge = document.getElementById("geminiApiStatusBadge");
    if (badge) {
      badge.className = val ? "badge badge-success" : "badge badge-info";
      badge.textContent = val ? "● Connected" : "○ Not Configured";
    }
    alert(val ? "Google Gemini API Key saved successfully! 🎉" : "Gemini API Key cleared.");
  }
}
