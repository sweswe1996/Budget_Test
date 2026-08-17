/**
 * BudgetTracker Main Application Controller
 */

window.BudgetTrackerApp = (() => {
  let activeView = "overview";
  let dashboardData = null;

  async function init() {
    // 1. Initialize Chart defaults
    window.BudgetTrackerCharts.applyGlobalDefaults();

    // 2. Instant Load (from cache/local in <10ms)
    dashboardData = await window.BudgetTrackerData.getDashboardData();

    // Check initial URL hash / query view (e.g., #settings or ?view=settings)
    const hash = (window.location?.hash || "").replace("#", "").toLowerCase();
    const urlParams = window.location?.search ? new URLSearchParams(window.location.search) : null;
    const qView = (urlParams?.get("view") || "").toLowerCase();
    const initialView = hash || qView;
    if (initialView && window.BudgetTrackerViews && window.BudgetTrackerViews[initialView]) {
      activeView = initialView;
    }

    // 3. Set up event listeners
    setupNavigation();
    setupFilters();
    setupControls();
    setupModal();

    // 4. Initial render immediately
    switchView(activeView);

    // 5. Silent Background Live Sync with Google Sheets (Refreshes real sheet every time)
    window.BudgetTrackerData.fetchLiveGoogleSheetsData().then(liveData => {
      if (liveData) {
        dashboardData = liveData;
        renderActiveView();
        const lastSyncedEl = document.getElementById("lastSyncedText");
        if (lastSyncedEl) lastSyncedEl.innerText = "Just now (Live Sheet)";
      }
    }).catch(e => console.warn("Background sync info:", e));
  }

  function setupNavigation() {
    // Sidebar Menu Toggle Button & Backdrop
    const sidebar = document.querySelector(".sidebar");
    const sidebarBackdrop = document.getElementById("sidebarBackdrop");
    const menuBtn = document.getElementById("sidebarMenuBtn");
    const closeBtn = document.getElementById("sidebarCloseBtn");

    const openSidebar = () => {
      sidebar?.classList.remove("collapsed");
      sidebar?.classList.add("open");
      sidebarBackdrop?.classList.add("open");
    };

    const closeSidebar = () => {
      sidebar?.classList.add("collapsed");
      sidebar?.classList.remove("open");
      sidebarBackdrop?.classList.remove("open");
    };

    const toggleSidebar = () => {
      if (window.innerWidth <= 1024) {
        if (sidebar?.classList.contains("open")) {
          closeSidebar();
        } else {
          openSidebar();
        }
      } else {
        if (sidebar?.classList.contains("collapsed")) {
          openSidebar();
        } else {
          closeSidebar();
        }
      }
    };

    menuBtn?.addEventListener("click", toggleSidebar);
    closeBtn?.addEventListener("click", closeSidebar);
    sidebarBackdrop?.addEventListener("click", closeSidebar);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSidebar();
    });

    // Top Tabs
    const tabs = document.querySelectorAll(".view-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const view = tab.getAttribute("data-view");
        switchView(view);
      });
    });

    // Sidebar Nav Links
    const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
    navItems.forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const view = item.getAttribute("data-view");
        if (view && window.BudgetTrackerViews[view]) {
          switchView(view);
          if (window.innerWidth <= 1024) {
            closeSidebar();
          }
        }
      });
    });

    // URL Hash Change listener
    window.addEventListener("hashchange", () => {
      const hView = (window.location?.hash || "").replace("#", "").toLowerCase();
      if (hView && window.BudgetTrackerViews && window.BudgetTrackerViews[hView]) {
        switchView(hView);
      }
    });
  }

  const SIDEBAR_MOTIVATIONS = {
    overview: {
      img: "🏆",
      title: "You're doing Amazing!",
      sub: "Keep going, your future self will thank you. 💜"
    },
    accounts: {
      img: "💳",
      title: "Your money, your future.",
      sub: "Manage today, enjoy tomorrow. ✨"
    },
    budget: {
      img: "🚀",
      title: "Smart budgeting, better future.",
      sub: "Control today, enjoy tomorrow. 👛"
    },
    debt: {
      img: "🛡️",
      title: "Stay on top of debt, stay stress free.",
      sub: "Every payment brings you closer to freedom. 🏔️"
    },
    spending: {
      img: "🪴",
      title: "Mindful spending today.",
      sub: "Small choices lead to big family dreams. 💰"
    },
    goals: {
      img: "⭐",
      title: "You're doing amazing!",
      sub: "Keep going, dreams do come true. 💜"
    },
    transactions: {
      img: "📋",
      title: "Keep records tidy!",
      sub: "Clear tracking brings financial clarity. ✨"
    },
    reports: {
      img: "📊",
      title: "Data reveals your power.",
      sub: "Review trends, build long-term wealth. 🚀"
    },
    settings: {
      img: "⚙️",
      title: "Personalize your tools.",
      sub: "Seamless sync and customized workflows. 💜"
    }
  };

  function updateSidebarMotivation(viewName) {
    const config = SIDEBAR_MOTIVATIONS[viewName] || SIDEBAR_MOTIVATIONS.overview;
    const imgEl = document.getElementById("sidebarMotivationImg");
    const titleEl = document.getElementById("sidebarMotivationTitle");
    const subEl = document.getElementById("sidebarMotivationSub");
    if (imgEl) imgEl.textContent = config.img;
    if (titleEl) titleEl.textContent = config.title;
    if (subEl) subEl.textContent = config.sub;
  }

  function switchView(viewName) {
    if (!window.BudgetTrackerViews[viewName]) return;
    activeView = viewName;

    // Hide top filter bar on settings view
    const filterBar = document.querySelector(".filter-bar");
    if (filterBar) {
      filterBar.style.display = (viewName === "settings") ? "none" : "";
    }

    // Update Tab active class
    document.querySelectorAll(".view-tab").forEach(tab => {
      tab.classList.toggle("active", tab.getAttribute("data-view") === viewName);
    });

    // Update Sidebar active class
    document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => {
      item.classList.toggle("active", item.getAttribute("data-view") === viewName);
    });

    // Toggle view containers
    document.querySelectorAll(".dashboard-view").forEach(v => {
      v.classList.toggle("active", v.id === `view-${viewName}`);
    });

    updateSidebarMotivation(viewName);
    renderActiveView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setupFilters() {
    const filters = window.BudgetTrackerFilters;

    const currencySelect = document.getElementById("filterCurrency");
    const forWhoSelect = document.getElementById("filterForWho");
    const categorySelect = document.getElementById("filterCategory");
    const startDateInput = document.getElementById("filterStartDate");
    const endDateInput = document.getElementById("filterEndDate");
    const datePresetSelect = document.getElementById("filterDatePreset");
    const resetBtn = document.getElementById("btnResetFilters");

    currencySelect?.addEventListener("change", (e) => filters.setFilter("currency", e.target.value));
    forWhoSelect?.addEventListener("change", (e) => filters.setFilter("forWho", e.target.value));
    categorySelect?.addEventListener("change", (e) => filters.setFilter("category", e.target.value));

    // From Date input (handles both input and change)
    const onStartChange = (e) => {
      const val = e.target.value;
      if (val) {
        filters.setFilter("startDate", val);
        if (datePresetSelect) datePresetSelect.value = "custom";
      }
    };
    startDateInput?.addEventListener("change", onStartChange);
    startDateInput?.addEventListener("input", onStartChange);

    // To Date input (handles both input and change)
    const onEndChange = (e) => {
      const val = e.target.value;
      if (val) {
        filters.setFilter("endDate", val);
        if (datePresetSelect) datePresetSelect.value = "custom";
      }
    };
    endDateInput?.addEventListener("change", onEndChange);
    endDateInput?.addEventListener("input", onEndChange);

    // Quick Month by Month Preset dropdown
    datePresetSelect?.addEventListener("change", (e) => {
      const val = e.target.value;
      if (!val || val === "custom") return;

      let start = "";
      let end = "";

      if (/^\d{4}-\d{2}$/.test(val)) {
        // Month string e.g. "2026-08"
        const [y, m] = val.split("-").map(Number);
        const lastDay = new Date(y, m, 0).getDate();
        start = `${val}-01`;
        end = `${val}-${String(lastDay).padStart(2, "0")}`;
      } else if (val === "aug_2026") {
        start = "2026-08-01";
        end = "2026-08-31";
      } else if (val === "jul_2026") {
        start = "2026-07-01";
        end = "2026-07-31";
      } else if (val === "all_2026") {
        start = "2026-01-01";
        end = "2026-12-31";
      } else if (val === "year_2025") {
        start = "2025-01-01";
        end = "2025-12-31";
      } else if (val === "all_2_years") {
        start = "2024-01-01";
        end = "2026-12-31";
      }

      if (start && end) {
        if (startDateInput) startDateInput.value = start;
        if (endDateInput) endDateInput.value = end;
        filters.setFilter("startDate", start);
        filters.setFilter("endDate", end);
      }
    });

    resetBtn?.addEventListener("click", () => {
      filters.resetFilters();
      if (currencySelect) currencySelect.value = "JPY";
      if (forWhoSelect) forWhoSelect.value = "all";
      if (categorySelect) categorySelect.value = "all";
      if (startDateInput) startDateInput.value = "2026-08-01";
      if (endDateInput) endDateInput.value = "2026-08-31";
      if (datePresetSelect) datePresetSelect.value = "2026-08";
    });

    // Subscribe to filter changes
    filters.subscribe(() => {
      renderActiveView();
    });
  }

  function setupControls() {
    // Dark mode toggle
    const darkModeToggle = document.getElementById("darkModeToggle");
    darkModeToggle?.addEventListener("change", (e) => {
      if (e.target.checked) {
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
    });

    // Live Sync Button Handling
    const syncBtn = document.getElementById("btnSyncNow");
    syncBtn?.addEventListener("click", async () => {
      const origText = syncBtn.innerHTML;
      syncBtn.innerHTML = `<span>🔄 Syncing...</span>`;
      try {
        const liveData = await window.BudgetTrackerData.fetchLiveGoogleSheetsData();
        if (liveData) {
          dashboardData = liveData;
        } else {
          dashboardData = await window.BudgetTrackerData.getDashboardData();
        }
        renderActiveView();
        const lastSyncedEl = document.getElementById("lastSyncedText");
        if (lastSyncedEl) lastSyncedEl.innerText = "Just now (Live Sheet)";
      } catch (err) {
        console.warn("Sync error:", err);
      } finally {
        setTimeout(() => {
          syncBtn.innerHTML = origText;
        }, 500);
      }
    });
  }

  function renderActiveView() {
    const container = document.getElementById(`view-${activeView}`);
    const renderer = window.BudgetTrackerViews[activeView];
    const currentFilters = window.BudgetTrackerFilters.getFilters();

    if (container && renderer) {
      renderer.render(container, dashboardData, currentFilters);
    }
    if (window.BudgetTrackerAiService && typeof window.BudgetTrackerAiService.updateFloatingWidget === 'function') {
      window.BudgetTrackerAiService.updateFloatingWidget(activeView);
    }
  }

  // ==========================================
  // Modal Handling for Editing / Adding (Data Entry System Integration)
  // ==========================================
  const FOR_WHO_OPTIONS = [
    '-', 'CS', 'MG', 'US', 'Grandparents', 'Mother', 'ThawThaw',
    'Younger_Brother_1', 'Younger_Brother_2', 'Nephew & Niece',
    'Nephew', 'Niece', 'Mg_Relative', 'Cs_Relative', 'Friend', 'Coworker'
  ];

  const SOURCES_BY_CURRENCY = {
    JPY: [
      'Bk-MUFG_MG', 'Bk-PAYPAY_MG', 'Bk-YUCHO_MG', 'Cash_MG',
      'Crd-JCB_MG', 'Crd-MUFG_MG', 'Crd-PAIDY_MG', 'Crd-PAYPAY_MG',
      'Suika_MG',
      'Bk-MIZUHO_CS', 'Bk-MUFG_CS', 'Bk-PAYPAY_CS', 'Bk-SMBC_CS', 'Bk-YUCHO_CS',
      'Cash_CS', 'Crd-EOPS_CS', 'Crd-JCB_CS', 'Crd-MUFG_CS', 'Crd-PAIDY_CS',
      'Crd-PAYPAY_CS', 'Crd-RAKUTEN_CS', 'Crd-SMBC_CS', 'Suika_CS',
      'Bk-YUCHO_ATP', 'Money_Changer', 'Borrower'
    ],
    MMK: [
      'Bk-AYA_MG', 'Bk-KBZ_MG', 'KBZPay_MG', 'WavePay_MG',
      'Bk-AYA_CS', 'Bk-KBZ_CS', 'KBZPay_CS', 'WavePay_CS',
      'KBZPay_Mother', 'KBZPay_Sister', 'Money_Changer', 'Cash_CS', 'Cash_MG'
    ],
    USD: ['PayPal', 'Other', '-']
  };

  const TYPE_DETAILS_CATALOG = {
    Income: {
      Fixed_Income: ['Salary1', 'Salary2', 'Salary3', 'Other'],
      Extra_Income: ['National_Support', 'University_Support', 'Bonus', 'Gift', 'Other'],
      Business_Income: ['Laptop_Sell', 'Software_Subscription_Sell', 'Tiktok', 'Other'],
      Loan_Income: ['-', 'New Loan', 'Existing Loan', 'Additional Loan', 'Refinance', 'Other'],
      Lend_Income: ['Family Paid Back', 'Friend Paid Back', 'Business Paid Back', 'Other Paid Back', 'Other'],
      Exchange_Income: ['-', 'Exchange Received', 'Refund', 'Other'],
      Other_Income: ['Other', 'Refund', 'Cashback', 'Interest', 'Bonus', 'Gift', 'Side Income', 'Miscellaneous']
    },
    Expense: {
      Fixed_Expenses: ['Rent Housing Fee', 'House Maintenance Fee', 'Water Purifier Fee'],
      Bills_Utilities: ['Electricity Bill', 'Gas Bill', 'Water Bill', 'Mobile Phone Bill', 'Internet Bill'],
      Taxes_Insurance: ['Health Insurance', 'Employment Insurance', 'Pension Contribution', 'Resident Tax', 'Income Tax', 'Bicycle Insurance'],
      Food_Expenses: ['Cooking Food', 'Dining Out', 'Snacks & Drinks'],
      Fashion_Expenses: ['Home Cloth', 'Outfit Cloth', 'Underwear Cloth', 'Sport Cloth', 'Shoes', 'Bags', 'Accessories'],
      Living_Expenses: ['Kitchen Items', 'Bathroom Items', 'Cleaning Items', 'Laundry Items', 'Bedroom Items', 'Furniture', 'Home Appliances', 'Home Tools', 'Home Decor', 'Storage Items', 'Daily Supplies', 'Installation Fee'],
      Social_Expenses: ['Birthday', 'Wedding', 'Funeral', 'Donation'],
      Education_Expenses: ['Tuition Fee', 'Online Course', 'Books', 'Exam Fee', 'Printing', 'School Trip', 'School Supplies', 'Research'],
      Healthcare_Expenses: ['Hospital', 'Clinic', 'Medicine', 'Dental', 'Eye Care', 'Health Check', 'Vaccination'],
      Transportation_Expenses: ['Train', 'Bus', 'Taxi', 'Fuel', 'Parking Fee', 'Bicycle'],
      Business_Expenses: ['Human Resources', 'Advertising & Marketing', 'Transportation'],
      Work_Expenses: ['Transportation', 'Stationery', 'Food', 'Snacks & Drinks', 'Work Clothes', 'Business Trip', 'Training'],
      Loan_Expenses: ['-', 'Partial Repayment', 'Full Repayment', 'Interest', 'Service Fee', 'Late Fee', 'Other Fee'],
      Lend_Expenses: ['-', 'Emergency', 'Living Expense', 'Medical', 'Education', 'Shopping', 'Travel', 'Paid for Someone', 'Other'],
      Exchange_Expenses: ['-', 'Service Fee', 'Transfer Fee', 'Agent Fee', 'Other Fee'],
      Digital_Expenses: ['AI Tools', 'Cloud Storage', 'Domain & Hosting', 'Online Services', 'App Services'],
      PersonalCare_Expenses: ['Haircut', 'Hair Care', 'Nail Care', 'Skin Care', 'Cosmetics', 'Body'],
      Travel_Leisure: ['Hotel', 'Travel', 'Tickets', 'Shopping', 'Activities', 'Gifts', 'Photo Print'],
      Entertainment: ['Movies', 'Games', 'Music', 'Streaming', 'Events', 'Hobbies', 'Fun Activities'],
      Family_Support: ['Living Support', 'Medical Support', 'Education Support', 'Gifts', 'Emergency'],
      Savings_Investments: ['Saving', 'Emergency Fund', 'NISA', 'Stocks', 'Gold', 'House & Land', 'Business Fund'],
      Other_Expenses: ['-', 'Document', 'Print', 'Previous Used']
    },
    Transfer: {
      'Bank → Bank': [],
      'Bank → Cash': [],
      'Bank → Credit': [],
      'Credit → Bank': [],
      'Cash → Bank': []
    }
  };

  let editingTxId = null;

  function sourceGroupName(value) {
    const v = String(value || '');
    if (v.startsWith('Bk-')) return '🏦 Bank';
    if (v.startsWith('Crd-')) return '💳 Credit';
    if (/^cash/i.test(v)) return '💵 Cash';
    if (v.startsWith('KBZPay') || v.startsWith('WavePay') || v === 'PayPal') {
      return '📱 Mobile Pay';
    }
    if (v.startsWith('Suika')) return '🚆 Suica';
    return '👤 Other';
  }

  function populateGroupedSources(selectEl, currency, selectedVal) {
    if (!selectEl) return;
    const items = SOURCES_BY_CURRENCY[currency] || SOURCES_BY_CURRENCY.JPY;
    const order = ['🏦 Bank', '💳 Credit', '💵 Cash', '📱 Mobile Pay', '🚆 Suica', '👤 Other'];
    const groups = {};
    order.forEach(g => groups[g] = []);

    items.forEach(v => {
      if (v === '-') return;
      const grp = sourceGroupName(v);
      if (!groups[grp]) groups[grp] = [];
      groups[grp].push(v);
    });

    let html = '<option value="-">-</option>';
    order.forEach(grp => {
      if (groups[grp] && groups[grp].length) {
        html += `<optgroup label="${grp}">`;
        groups[grp].forEach(v => {
          html += `<option value="${v}" ${v === selectedVal ? 'selected' : ''}>${v}</option>`;
        });
        html += `</optgroup>`;
      }
    });
    selectEl.innerHTML = html;
    if (selectedVal) selectEl.value = selectedVal;
  }

  function populateTypes(flow, selectedType) {
    const typeSelect = document.getElementById("txType");
    const typeLabel = document.getElementById("txTypeLabel");
    if (!typeSelect) return;

    if (typeLabel) {
      typeLabel.innerText = flow === 'Income' ? 'Income Type' : flow === 'Expense' ? 'Expense Type' : 'Transfer Type';
    }

    const types = Object.keys(TYPE_DETAILS_CATALOG[flow] || {});
    typeSelect.innerHTML = types.map(t => {
      const displayName = t.split('_').join(' ');
      return `<option value="${t}" ${t === selectedType ? 'selected' : ''}>${displayName}</option>`;
    }).join('');

    if (selectedType && types.includes(selectedType)) {
      typeSelect.value = selectedType;
    } else if (types.length) {
      typeSelect.value = types[0];
    }
    populateDetails(flow, typeSelect.value);
  }

  function populateDetails(flow, typeVal, selectedDetail) {
    const detailSelect = document.getElementById("txDetail");
    const detailGroup = document.getElementById("txDetailGroup");
    const detailLabel = document.getElementById("txDetailLabel");
    if (!detailSelect) return;

    if (flow === 'Transfer') {
      if (detailGroup) detailGroup.style.display = 'none';
      return;
    } else {
      if (detailGroup) detailGroup.style.display = 'block';
      if (detailLabel) detailLabel.innerText = flow === 'Income' ? 'Income Detail' : 'Expense Detail';
    }

    const items = (TYPE_DETAILS_CATALOG[flow] && TYPE_DETAILS_CATALOG[flow][typeVal]) || [];
    detailSelect.innerHTML = '<option value="-">-</option>' + items.map(d => {
      return `<option value="${d}" ${d === selectedDetail ? 'selected' : ''}>${d}</option>`;
    }).join('');

    if (selectedDetail && items.includes(selectedDetail)) {
      detailSelect.value = selectedDetail;
    } else if (items.length) {
      detailSelect.value = items[0];
    }
  }

  function setupModal() {
    const modalBackdrop = document.getElementById("editModal");
    const closeBtn = document.getElementById("modalCloseBtn");
    const cancelBtn = document.getElementById("modalCancelBtn");
    const form = document.getElementById("transactionForm");
    const currencySelect = document.getElementById("txCurrency");
    const cashFlowSelect = document.getElementById("txCashFlow");
    const typeSelect = document.getElementById("txType");
    const forWhoSelect = document.getElementById("txForWho");

    // Populate ForWho
    if (forWhoSelect) {
      forWhoSelect.innerHTML = FOR_WHO_OPTIONS.map(w => `<option value="${w}">${w}</option>`).join('');
    }

    // Currency change triggers Source re-population
    currencySelect?.addEventListener("change", () => {
      const cur = currencySelect.value;
      populateGroupedSources(document.getElementById("txFromSource"), cur);
      populateGroupedSources(document.getElementById("txToSource"), cur);
    });

    // CashFlow change triggers Type re-population
    cashFlowSelect?.addEventListener("change", () => {
      populateTypes(cashFlowSelect.value);
    });

    // Type change triggers Detail re-population
    typeSelect?.addEventListener("change", () => {
      populateDetails(cashFlowSelect?.value || 'Expense', typeSelect.value);
    });

    const closeModal = () => {
      modalBackdrop?.classList.remove("open");
      editingTxId = null;
    };

    closeBtn?.addEventListener("click", closeModal);
    cancelBtn?.addEventListener("click", closeModal);
    modalBackdrop?.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeModal();
    });

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const updated = {
        description: document.getElementById("txDesc").value,
        amount: parseFloat(document.getElementById("txAmount").value) || 0,
        currency: document.getElementById("txCurrency").value,
        cashFlow: document.getElementById("txCashFlow").value,
        cashFlowType: document.getElementById("txType").value,
        fromSource: document.getElementById("txFromSource").value || '-',
        toSource: document.getElementById("txToSource").value || '-',
        cashFlowDetails: document.getElementById("txDetail")?.value || '-',
        detail: document.getElementById("txDetail")?.value || '-',
        forWho: document.getElementById("txForWho").value,
        status: document.getElementById("txStatus")?.value || 'Need',
        note: document.getElementById("txNote").value || '',
        date: document.getElementById("txDate").value || "2026-08-15"
      };

      const gasUrl = typeof APPS_SCRIPT_WEB_APP_URL !== 'undefined'
        ? APPS_SCRIPT_WEB_APP_URL
        : 'https://script.google.com/macros/s/AKfycbwA58LpxUbHaKKA1PjsViLhkO29DwhzxxR8zqmop5VJnx8o5VYKJs7iRRlUKS3mVjoN/exec';

      if (editingTxId) {
        const originalTx = dashboardData.transactions.find(t => t.id === editingTxId);
        window.BudgetTrackerData.updateTransaction(editingTxId, updated);
        closeModal();
        renderActiveView();

        // Send Update directly to Google Sheets
        if (gasUrl) {
          fetch(gasUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'update',
              rowIndex: originalTx ? originalTx.rowIndex : null,
              originalDate: originalTx ? originalTx.date : null,
              originalDescription: originalTx ? originalTx.description : null,
              originalAmount: originalTx ? originalTx.amount : null,
              ...updated
            }),
            redirect: 'follow'
          }).then(r => r.json()).then(res => {
            console.log("✓ Google Sheets update result:", res);
          }).catch(err => {
            console.warn("Google Sheets update fetch warning:", err);
          });
        }
      } else {
        window.BudgetTrackerData.addTransaction(updated);
        closeModal();
        renderActiveView();

        // Send New Row to Google Sheets
        if (gasUrl) {
          fetch(gasUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(updated),
            redirect: 'follow'
          }).then(r => r.json()).then(res => {
            console.log("✓ Google Sheets add result:", res);
          }).catch(err => console.warn(err));
        }
      }
    });
  }

  function openEditModal(txId) {
    const modalBackdrop = document.getElementById("editModal");
    const titleEl = document.getElementById("modalTitle");

    editingTxId = txId;
    const tx = dashboardData.transactions.find(t => t.id === txId);
    if (!tx) return;

    if (titleEl) titleEl.innerText = "Edit Transaction";
    if (document.getElementById("txDate")) document.getElementById("txDate").value = tx.date;
    if (document.getElementById("txDesc")) document.getElementById("txDesc").value = tx.description;
    if (document.getElementById("txAmount")) document.getElementById("txAmount").value = tx.amount;
    if (document.getElementById("txCurrency")) document.getElementById("txCurrency").value = tx.currency || "JPY";
    if (document.getElementById("txCashFlow")) document.getElementById("txCashFlow").value = tx.cashFlow || "Expense";
    
    // Hydrate cascading dropdowns
    const cur = tx.currency || "JPY";
    populateGroupedSources(document.getElementById("txFromSource"), cur, tx.fromSource || '-');
    populateGroupedSources(document.getElementById("txToSource"), cur, tx.toSource || '-');
    populateTypes(tx.cashFlow || 'Expense', tx.cashFlowType);
    populateDetails(tx.cashFlow || 'Expense', tx.cashFlowType, tx.cashFlowDetail || tx.detail);

    if (document.getElementById("txForWho")) document.getElementById("txForWho").value = tx.forWho || "US";
    if (document.getElementById("txStatus")) document.getElementById("txStatus").value = tx.status || "Need";
    if (document.getElementById("txNote")) document.getElementById("txNote").value = tx.note || "";

    modalBackdrop?.classList.add("open");
  }

  function openAddModal() {
    const modalBackdrop = document.getElementById("editModal");
    const titleEl = document.getElementById("modalTitle");
    const form = document.getElementById("transactionForm");

    editingTxId = null;
    if (titleEl) titleEl.innerText = "Add New Transaction";
    form?.reset();

    const cur = "JPY";
    if (document.getElementById("txDate")) document.getElementById("txDate").value = "2026-08-15";
    if (document.getElementById("txCurrency")) document.getElementById("txCurrency").value = cur;
    if (document.getElementById("txCashFlow")) document.getElementById("txCashFlow").value = "Expense";

    populateGroupedSources(document.getElementById("txFromSource"), cur, "Bk-MUFG_CS");
    populateGroupedSources(document.getElementById("txToSource"), cur, "-");
    populateTypes('Expense', 'Food_Expenses');
    populateDetails('Expense', 'Food_Expenses', 'Cooking Food');

    if (document.getElementById("txForWho")) document.getElementById("txForWho").value = "US";
    if (document.getElementById("txStatus")) document.getElementById("txStatus").value = "Need";

    modalBackdrop?.classList.add("open");
  }

  function handleDelete(txId) {
    const tx = dashboardData.transactions.find(t => t.id === txId);
    if (!tx) return;

    if (confirm(`Are you sure you want to delete "${tx.description}"?`)) {
      window.BudgetTrackerData.deleteTransaction(txId);
      renderActiveView();

      const gasUrl = typeof APPS_SCRIPT_WEB_APP_URL !== 'undefined'
        ? APPS_SCRIPT_WEB_APP_URL
        : 'https://script.google.com/macros/s/AKfycbwA58LpxUbHaKKA1PjsViLhkO29DwhzxxR8zqmop5VJnx8o5VYKJs7iRRlUKS3mVjoN/exec';

      if (gasUrl) {
        fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'delete',
            rowIndex: tx.rowIndex || null,
            date: tx.date,
            description: tx.description,
            amount: tx.amount
          }),
          redirect: 'follow'
        }).then(r => r.json()).then(res => {
          console.log("✓ Google Sheets delete result:", res);
        }).catch(err => {
          console.warn("Google Sheets delete fetch warning:", err);
        });
      }
    }
  }

  function setBudgetMonth(monthStr) {
    if (!monthStr) return;
    const [year, month] = monthStr.split("-").map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    const startDate = `${monthStr}-01`;
    const endDate = `${monthStr}-${String(lastDay).padStart(2, "0")}`;

    const startDateInput = document.getElementById("filterStartDate");
    const endDateInput = document.getElementById("filterEndDate");
    const datePresetSelect = document.getElementById("filterDatePreset");

    if (startDateInput) startDateInput.value = startDate;
    if (endDateInput) endDateInput.value = endDate;
    if (datePresetSelect) datePresetSelect.value = monthStr;

    const filters = window.BudgetTrackerFilters;
    if (filters) {
      filters.setFilter("startDate", startDate);
      filters.setFilter("endDate", endDate);
    }
  }

  return {
    init,
    switchView,
    renderActiveView,
    getActiveView: () => activeView,
    openEditModal,
    openAddModal,
    handleDelete,
    setBudgetMonth
  };
})();

// Bootstrap app on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.BudgetTrackerApp.init();
});
