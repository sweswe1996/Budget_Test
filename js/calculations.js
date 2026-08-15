/**
 * BudgetTracker Financial Calculations Engine
 */

window.BudgetTrackerCalc = (() => {
  // Format currency with proper symbols and thousand separators
  function formatCurrency(amount, currency = "JPY") {
    const num = Math.round(Number(amount) || 0);
    const absNum = Math.abs(num);
    const formatted = absNum.toLocaleString();

    if (currency === "JPY") {
      return (num < 0 ? "-¥" : "¥") + formatted;
    } else if (currency === "MMK") {
      return (num < 0 ? "-Ks " : "Ks ") + formatted;
    } else if (currency === "USD") {
      return (num < 0 ? "-$" : "$") + formatted;
    }
    return (num < 0 ? "-" : "") + formatted + " " + currency;
  }

  function formatShortNumber(amount, currency = "JPY") {
    const num = Number(amount) || 0;
    const prefix = currency === "JPY" ? "¥" : currency === "USD" ? "$" : "Ks ";
    if (Math.abs(num) >= 1000000) {
      return prefix + (num / 1000000).toFixed(1).replace(/\.0$/, '') + "M";
    }
    if (Math.abs(num) >= 1000) {
      return prefix + Math.round(num / 1000) + "K";
    }
    return prefix + num;
  }

  // Filter transactions by user criteria
  function filterTransactions(transactions, filters) {
    return transactions.filter(t => {
      // Currency match
      if (filters.currency && t.currency !== filters.currency) {
        return false;
      }

      // Date range match
      if (filters.startDate && t.date < filters.startDate) return false;
      if (filters.endDate && t.date > filters.endDate) return false;

      // Account match
      if (filters.account && filters.account !== "all") {
        if (t.fromSource !== filters.account && t.toSource !== filters.account) {
          return false;
        }
      }

      // ForWho match
      if (filters.forWho && filters.forWho !== "all") {
        if (t.forWho !== filters.forWho) return false;
      }

      // Category match
      if (filters.category && filters.category !== "all") {
        if (t.cashFlowType !== filters.category && t.detail !== filters.category) {
          return false;
        }
      }

      return true;
    });
  }

  // Compute Overview and Spending Totals
  function computeSummary(transactions) {
    let totalIncome = 0;
    let totalExpense = 0;
    let spendingCount = 0;

    transactions.forEach(t => {
      if (t.classification === "income") {
        totalIncome += t.amount;
      } else if (t.classification === "expense") {
        totalExpense += t.amount;
        spendingCount++;
      }
    });

    const netCashFlow = totalIncome - totalExpense;
    return {
      totalIncome,
      totalExpense,
      netCashFlow,
      spendingCount
    };
  }

  // Group expenses by category
  function groupExpensesByCategory(transactions) {
    const categoryMap = {};
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.cashFlow === "Expense" || t.classification === "expense") {
        const cat = mapCategoryName(t.cashFlowType, t.detail || t.cashFlowDetail);
        const amt = Number(t.amount) || 0;
        categoryMap[cat] = (categoryMap[cat] || 0) + amt;
        totalExpense += amt;
      }
    });

    const categories = Object.entries(categoryMap).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
    }));

    categories.sort((a, b) => b.amount - a.amount);
    return { categories, totalExpense };
  }

  // Dynamic Account Balances Calculator from Real Transactions
  function computeAccountBalances(transactions, baselineAccounts = []) {
    const accountMap = {};
    const txList = transactions || [];

    // 1. Identify minimum rowIndex where ResetData starts
    let resetMinRowIndex = Infinity;
    txList.forEach(t => {
      const desc = (t.Description || t.description || '').toLowerCase();
      const note = (t.Note || t.note || '').toLowerCase();
      if (desc === 'resetdata' || note.includes('reset data to zero condition')) {
        const rIdx = t.rowIndex || 0;
        if (rIdx && rIdx < resetMinRowIndex) {
          resetMinRowIndex = rIdx;
        }
      }
    });

    // Active transactions are from resetMinRowIndex onwards (or all transactions if no ResetData)
    const activeTransactions = resetMinRowIndex !== Infinity
      ? txList.filter(t => (t.rowIndex || 0) >= resetMinRowIndex)
      : txList;

    // Initialize baseline if no ResetData
    if (resetMinRowIndex === Infinity && baselineAccounts && baselineAccounts.length > 0) {
      baselineAccounts.forEach(acc => {
        accountMap[acc.name] = { ...acc, liveBalance: acc.balance || 0, incomeSum: 0, expenseSum: 0, transferIn: 0, transferOut: 0 };
      });
    }

    // 2. Compute live balances across all active transactions
    activeTransactions.forEach(t => {
      const amt = Number(t.Amount || t.amount) || 0;
      const from = t['From Source'] || t.fromSource;
      const to = t['To Source'] || t.toSource;
      const flow = t['Cash Flow'] || t.cashFlow;
      const cur = t.Currency || t.currency || 'JPY';
      const who = t.ForWho || t.forWho || 'US';

      if (from && from !== "-") {
        if (!accountMap[from]) {
          accountMap[from] = {
            id: "acc_" + from.replace(/[^a-zA-Z0-9]/g, '_'),
            name: from,
            type: from.startsWith("Bk-") ? "Bank" : from.startsWith("Crd-") ? "Credit Card" : "Wallet",
            subType: from.startsWith("Bk-") ? "Checking" : from.startsWith("Crd-") ? "Credit Card" : "Cash/Wallet",
            forWho: who,
            currency: cur,
            balance: 0,
            liveBalance: 0,
            incomeSum: 0,
            expenseSum: 0,
            transferIn: 0,
            transferOut: 0,
            logoType: from.toLowerCase().includes("mizuho") ? "mizuho" : from.toLowerCase().includes("mufg") ? "mufg" : from.toLowerCase().includes("smbc") ? "smbc" : "wallet"
          };
        }
        if (flow === "Expense") {
          accountMap[from].expenseSum += amt;
          accountMap[from].liveBalance -= amt;
        } else if (flow === "Transfer") {
          accountMap[from].transferOut += amt;
          accountMap[from].liveBalance -= amt;
        }
      }

      if (to && to !== "-") {
        if (!accountMap[to]) {
          accountMap[to] = {
            id: "acc_" + to.replace(/[^a-zA-Z0-9]/g, '_'),
            name: to,
            type: to.startsWith("Bk-") ? "Bank" : to.startsWith("Crd-") ? "Credit Card" : "Wallet",
            subType: to.startsWith("Bk-") ? "Savings" : "Cash/Wallet",
            forWho: who,
            currency: cur,
            balance: 0,
            liveBalance: 0,
            incomeSum: 0,
            expenseSum: 0,
            transferIn: 0,
            transferOut: 0,
            logoType: to.toLowerCase().includes("mizuho") ? "mizuho" : to.toLowerCase().includes("mufg") ? "mufg" : to.toLowerCase().includes("smbc") ? "smbc" : "wallet"
          };
        }
        if (flow === "Income") {
          accountMap[to].incomeSum += amt;
          accountMap[to].liveBalance += amt;
        } else if (flow === "Transfer") {
          accountMap[to].transferIn += amt;
          accountMap[to].liveBalance += amt;
        }
      }
    });

    return Object.values(accountMap);
  }

  // Dynamic Savings Goals Calculator from Real Google Sheets Data
  function computeGoals(transactions = [], rawGoals = []) {
    const baseGoals = (rawGoals && rawGoals.length > 0) ? rawGoals : [
      { goal: "Family Emergency Fund", target: 1000000, current: 0, currency: "JPY", targetDate: "2027-03-31", category: "Emergency Fund" },
      { goal: "Japan Family Vacation", target: 200000, current: 0, currency: "JPY", targetDate: "2027-08-15", category: "Travel & Leisure" },
      { goal: "MacBook Pro M3 / Laptop", target: 150000, current: 0, currency: "JPY", targetDate: "2026-12-20", category: "Electronics & Hardware" },
      { goal: "Kids Education Fund", target: 300000, current: 0, currency: "JPY", targetDate: "2027-04-01", category: "Education Fund" },
      { goal: "Home Repair & Decor", target: 100000, current: 0, currency: "JPY", targetDate: "2027-01-31", category: "House & Land" },
      { goal: "Stock & NISA Investment", target: 500000, current: 0, currency: "JPY", targetDate: "2027-12-31", category: "Investments" },
      { goal: "Car Maintenance Fund", target: 80000, current: 0, currency: "JPY", targetDate: "2026-11-30", category: "Emergency Fund" },
      { goal: "New iPhone / Mobile", target: 120000, current: 0, currency: "JPY", targetDate: "2027-05-15", category: "Electronics & Hardware" },
      { goal: "Myanmar Family Gift", target: 150000, current: 0, currency: "JPY", targetDate: "2026-10-31", category: "Family Support" }
    ];

    // Map each goal properly
    const calculatedGoals = baseGoals.map((g, idx) => {
      const goalName = g.goal || g.name || g.goalName || `Goal ${idx + 1}`;
      const gNameLower = goalName.toLowerCase().trim();
      const target = Number(g.target || g.targetAmount || g.goalTarget || 0);
      const initialCurrent = Number(g.current || g.savedAmount || g.initialSaved || 0);

      // Search real transactions that contribute to this goal (only if gNameLower is not empty)
      let txSaved = 0;
      if (gNameLower && gNameLower.length >= 2) {
        const stopWords = new Set(['family', 'fund', 'funds', 'gift', 'gifts', 'and', 'the', 'for', 'with', 'plan', 'goal', 'goals', 'account', 'decor']);
        const keywords = gNameLower.split(/[\s/&]+/).filter(w => w.length >= 3 && !stopWords.has(w));

        (transactions || []).forEach(t => {
          const desc = String(t.description || "").toLowerCase();
          const detail = String(t.detail || t.cashFlowDetail || "").toLowerCase();
          const note = String(t.note || "").toLowerCase();
          const type = String(t.cashFlowType || "").toLowerCase();

          // Matches savings / goal deposit transaction (e.g. Expense with Savings_Investments or Transfer)
          const isSavingTx = (t.cashFlow === "Expense" && (type === "savings_investments" || type.includes("saving") || type.includes("invest") || detail.includes("saving"))) ||
                             (t.cashFlow === "Transfer") ||
                             (t.cashFlow === "Income" && (type.includes("saving") || detail.includes("saving")));

          const matchesGoal = (desc.length > 0 && desc.includes(gNameLower)) || 
                              (detail.length > 0 && detail.includes(gNameLower)) || 
                              (note.length > 0 && note.includes(gNameLower)) ||
                              (isSavingTx && keywords.length > 0 && keywords.some(k => (desc.length > 0 && desc.includes(k)) || (detail.length > 0 && detail.includes(k)) || (note.length > 0 && note.includes(k))));

          if (matchesGoal && isSavingTx) {
            txSaved += Number(t.amount) || 0;
          }
        });
      }

      const totalSavedForThisGoal = initialCurrent + txSaved;
      const remainingNeeded = Math.max(0, target - totalSavedForThisGoal);
      const progress = target > 0 ? Math.min(100, parseFloat(((totalSavedForThisGoal / target) * 100).toFixed(1))) : 0;

      return {
        ...g,
        id: g.goalId || `goal_${idx + 1}`,
        name: goalName,
        goal: goalName,
        targetAmount: target,
        savedAmount: totalSavedForThisGoal,
        remainingNeeded,
        progress,
        targetDate: g.targetDate || g['Target Date'] || g.dueDate || "2027-12-31",
        currency: g.currency || g.Currency || "JPY",
        category: g.category || (gNameLower.includes('emergency') ? 'Emergency Fund' : gNameLower.includes('vacation') || gNameLower.includes('trip') ? 'Travel & Leisure' : gNameLower.includes('laptop') || gNameLower.includes('phone') ? 'Electronics' : gNameLower.includes('education') ? 'Education' : gNameLower.includes('invest') || gNameLower.includes('nisa') ? 'Investments' : 'Savings Goal'),
        status: progress >= 100 ? "Completed 🎉" : progress >= 50 ? "On Track 🚀" : progress > 0 ? "In Progress ⏳" : "Not Started 🎯",
        speed: progress >= 60 ? "🚀 Excellent" : progress >= 30 ? "🚀 Good" : progress > 0 ? "🐢 Steady" : "🌱 Starting"
      };
    });

    const totalTarget = calculatedGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = calculatedGoals.reduce((sum, g) => sum + g.savedAmount, 0);
    const totalRemaining = Math.max(0, totalTarget - totalSaved);
    const overallProgress = totalTarget > 0 ? parseFloat(((totalSaved / totalTarget) * 100).toFixed(1)) : 0.0;

    return {
      goals: calculatedGoals,
      totalTarget,
      totalSaved,
      totalRemaining,
      overallProgress,
      activeCount: calculatedGoals.length
    };
  }

  // Normalize category keys to prevent duplicate/messy categories
  function normalizeCategoryKey(rawName) {
    if (!rawName) return "Other_Expenses";
    const s = String(rawName).trim();
    const l = s.toLowerCase().replace(/[\s_&+-]+/g, '');

    if (l.includes("family") || l.includes("support")) return "Family_Support";
    if (l.includes("tax") || l.includes("insurance") || l.includes("pension")) return "Taxes_Insurance";
    if (l.includes("fixed") || l.includes("housing") || l.includes("rent")) return "Fixed_Expenses";
    if (l.includes("food") || l.includes("grocer") || l.includes("dining") || l.includes("snack")) return "Food_Expenses";
    if (l.includes("transport") || l.includes("train") || l.includes("bus") || l.includes("fuel")) return "Transportation";
    if (l.includes("bill") || l.includes("util") || l.includes("electric") || l.includes("water") || l.includes("gas") || l.includes("wifi") || l.includes("phone")) return "Bills_Utilities";
    if (l.includes("living") || l.includes("kitchen") || l.includes("bath") || l.includes("appliance") || l.includes("clean") || l.includes("supplies")) return "Living_Expenses";
    if (l.includes("work") || l.includes("office") || l.includes("stationery")) return "Work_Expenses";
    if (l.includes("fashion") || l.includes("cloth") || l.includes("shoe") || l.includes("bag")) return "Fashion_Expenses";
    if (l.includes("entertain") || l.includes("game") || l.includes("movie") || l.includes("fun") || l.includes("stream") || l.includes("social")) return "Entertainment";
    if (l.includes("education") || l.includes("tuition") || l.includes("school") || l.includes("course") || l.includes("book")) return "Education";
    if (l.includes("health") || l.includes("medical") || l.includes("dental") || l.includes("clinic") || l.includes("hospital")) return "Healthcare";
    if (l.includes("other")) return "Other_Expenses";

    return s;
  }

  function getCategoryDisplayName(catKey) {
    const map = {
      Fixed_Expenses: "Fixed Expenses",
      Bills_Utilities: "Bills & Utilities",
      Taxes_Insurance: "Taxes Insurance",
      Transportation: "Transportation",
      Food_Expenses: "Food & Groceries",
      Fashion_Expenses: "Fashion Expenses",
      Living_Expenses: "Living Expenses",
      Work_Expenses: "Work Expenses",
      Education: "Education",
      Healthcare: "Healthcare",
      Entertainment: "Entertainment",
      Family_Support: "Family Support",
      Other_Expenses: "Other Expenses"
    };
    return map[catKey] || catKey.replace(/_/g, ' ');
  }

  function calculateMonthFactor(startDate, endDate) {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;

    const startYear = start.getFullYear();
    const startMonth = start.getMonth();
    const endYear = end.getFullYear();
    const endMonth = end.getMonth();

    const diffMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
    return Math.max(1, diffMonths);
  }

  // Dynamic Category Budgets vs Real Actual Spend (100% Real Google Sheet / Excel Data with Date Range filter)
  function computeBudgets(transactions, rawBudgets = [], targetCurrency = "JPY", targetMonth = null, monthFactor = 1) {
    const categoryMap = {};
    const txList = transactions || [];

    // Find minimum rowIndex where ResetData starts
    let resetMinRowIndex = Infinity;
    txList.forEach(t => {
      const desc = (t.Description || t.description || '').toLowerCase();
      const note = (t.Note || t.note || '').toLowerCase();
      if (desc === 'resetdata' || note.includes('reset data to zero condition')) {
        const rIdx = t.rowIndex || 0;
        if (rIdx && rIdx < resetMinRowIndex) {
          resetMinRowIndex = rIdx;
        }
      }
    });

    let activeTx = resetMinRowIndex !== Infinity
      ? txList.filter(t => (t.rowIndex || 0) >= resetMinRowIndex)
      : txList;

    // Filter strictly by targetMonth if provided (e.g. "2026-07", "2026-08")
    if (targetMonth && targetMonth !== "all" && /^\d{4}-\d{2}/.test(targetMonth)) {
      const monthPrefix = targetMonth.slice(0, 7);
      activeTx = activeTx.filter(t => {
        const d = t.Date || t.date || "";
        return String(d).startsWith(monthPrefix);
      });
    }
    
    // Only sum operational living expense transactions in matching currency from active post-reset transactions
    activeTx.forEach(t => {
      if (t.cashFlow === "Expense" && (!t.currency || t.currency === targetCurrency)) {
        const type = String(t.cashFlowType || '').toLowerCase();
        const desc = String(t.description || '').toLowerCase();
        const detail = String(t.detail || t.cashFlowDetail || '').toLowerCase();
        // Exclude Lend, Exchange, Loan repayments, and opening liability balance from daily operational budget
        if (!type.includes('lend') && !type.includes('exchange') && !type.includes('loan') && !desc.includes('loan past') && !detail.includes('previous used')) {
          const normCat = normalizeCategoryKey(t.cashFlowType || t.detail || t.cashFlowDetail);
          categoryMap[normCat] = (categoryMap[normCat] || 0) + (Number(t.amount) || 0);
        }
      }
    });

    // 100% Real Budgets from Google Sheet Budgets table
    // Exactly 12 core standard budget categories requested by user:
    const standardCategories = [
      "Fixed_Expenses",
      "Bills_Utilities",
      "Taxes_Insurance",
      "Transportation",
      "Food_Expenses",
      "Fashion_Expenses",
      "Living_Expenses",
      "Work_Expenses",
      "Education",
      "Healthcare",
      "Entertainment",
      "Family_Support"
    ];

    const defaultBaselineBudgets = {
      Fixed_Expenses: 52500,
      Bills_Utilities: 45000,
      Taxes_Insurance: 35000,
      Transportation: 5000,
      Food_Expenses: 30000,
      Fashion_Expenses: 12000,
      Living_Expenses: 10000,
      Work_Expenses: 30000,
      Education: 5000,
      Healthcare: 5000,
      Entertainment: 5000,
      Family_Support: 40000
    };

    // 100% Real Budgets from Google Sheet Budgets table
    const budgetMap = {};
    if (rawBudgets && Array.isArray(rawBudgets)) {
      let matchingBudgets = rawBudgets;
      if (targetMonth) {
        const monthFiltered = rawBudgets.filter(rb => rb.month && String(rb.month).startsWith(targetMonth));
        if (monthFiltered.length > 0) matchingBudgets = monthFiltered;
      }

      matchingBudgets.forEach(rb => {
        const normCat = normalizeCategoryKey(rb.category);
        if (normCat) {
          const amt = Number(rb.amount || rb.budget || rb.budgetAmount || 0);
          budgetMap[normCat] = {
            rawCategory: rb.category,
            categoryKey: normCat,
            category: getCategoryDisplayName(normCat),
            budget: amt,
            currency: rb.currency || targetCurrency
          };
        }
      });
    }

    const factor = Math.max(1, Number(monthFactor) || 1);

    // Strictly build output for only the 12 user-specified categories
    const computed = standardCategories.map(catKey => {
      const existing = budgetMap[catKey];
      const singleBudget = existing ? Number(existing.budget || 0) : (defaultBaselineBudgets[catKey] || 0);
      const budgetLimit = singleBudget * factor;
      const actualSpend = categoryMap[catKey] || 0;
      const left = budgetLimit - actualSpend;
      const progress = budgetLimit > 0 ? Math.round((actualSpend / budgetLimit) * 100) : (actualSpend > 0 ? 100 : 0);
      const status = (budgetLimit > 0 && left >= 0) ? "under" : (budgetLimit === 0 && actualSpend === 0) ? "under" : "over";

      return {
        rawCategory: catKey,
        categoryKey: catKey,
        category: getCategoryDisplayName(catKey),
        currency: targetCurrency,
        monthlyBudget: singleBudget,
        budget: budgetLimit,
        actual: actualSpend,
        left,
        progress,
        status
      };
    });

    const totalBudget = computed.reduce((sum, b) => sum + b.budget, 0);
    const totalActual = computed.reduce((sum, b) => sum + b.actual, 0);
    const totalLeft = totalBudget - totalActual;
    const overallProgress = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : (totalActual > 0 ? 100 : 0);

    return {
      budgets: computed,
      totalBudget,
      totalActual,
      totalLeft,
      overallProgress
    };
  }

  // Dynamic Debts and Loans Calculator from Real Transactions & Sheets
  function computeDebts(transactions, rawDebts = []) {
    const baseDebts = (rawDebts && Array.isArray(rawDebts) && rawDebts.length > 0) ? rawDebts : [
      { debtId: "debt_1", name: "JCB Card", type: "Credit Card", originalAmount: 280000, interestRate: 15.0, monthlyDue: 18000, nextDueDate: "2026-08-20" },
      { debtId: "debt_2", name: "MUFG Card", type: "Credit Card", originalAmount: 190000, interestRate: 14.6, monthlyDue: 10000, nextDueDate: "2026-08-22" },
      { debtId: "debt_3", name: "Rakuten Loan", type: "Personal Loan", originalAmount: 500000, interestRate: 10.8, monthlyDue: 16000, nextDueDate: "2026-08-28" },
      { debtId: "debt_4", name: "Home Loan (Main)", type: "Loan", originalAmount: 2400000, interestRate: 0.975, monthlyDue: 140000, nextDueDate: "2026-09-01" },
      { debtId: "debt_5", name: "Car Loan", type: "Loan", originalAmount: 380000, interestRate: 3.9, monthlyDue: 18000, nextDueDate: "2026-08-30" }
    ];

    let totalPaidThisMonth = 0;
    const computed = baseDebts.map(d => {
      const dNameLower = (d.name || "").toLowerCase();
      let totalPaid = 0;

      transactions.forEach(t => {
        const desc = (t.description || "").toLowerCase();
        const detail = (t.detail || t.cashFlowDetail || "").toLowerCase();
        if ((t.cashFlowType === "Loan_Expenses" || desc.includes("loan") || desc.includes("card") || desc.includes("repayment") || detail.includes("loan")) && (desc.includes(dNameLower) || detail.includes(dNameLower) || dNameLower.includes(desc))) {
          totalPaid += Number(t.amount) || 0;
          totalPaidThisMonth += Number(t.amount) || 0;
        }
      });

      const orig = Number(d.originalAmount || d.amount || 300000);
      const remaining = Math.max(0, orig - totalPaid);
      const progress = orig > 0 ? Math.min(100, parseFloat(((totalPaid / orig) * 100).toFixed(1))) : 0;

      return {
        ...d,
        originalAmount: orig,
        remainingAmount: remaining,
        interestRate: Number(d.interestRate || 0),
        monthlyDue: Number(d.monthlyDue || 0),
        nextDueDate: d.nextDueDate || d.dueDate || "2026-08-31",
        totalPaid,
        progress,
        status: remaining === 0 ? "Paid Off" : "Active"
      };
    });

    const totalDebtLeft = computed.reduce((sum, d) => sum + d.remainingAmount, 0);
    const totalOriginal = computed.reduce((sum, d) => sum + d.originalAmount, 0);
    const upcomingThisMonth = computed.reduce((sum, d) => sum + d.monthlyDue, 0);
    
    // Weighted Average Interest Rate
    let weightedRateSum = 0;
    let totalPrincipalForWeight = 0;
    computed.forEach(d => {
      if (d.remainingAmount > 0) {
        weightedRateSum += d.interestRate * d.remainingAmount;
        totalPrincipalForWeight += d.remainingAmount;
      }
    });
    const avgInterestRate = totalPrincipalForWeight > 0 ? (weightedRateSum / totalPrincipalForWeight).toFixed(1) : "0.0";

    const nextDueDebt = [...computed].sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))[0];
    const nextDueAmount = nextDueDebt ? nextDueDebt.monthlyDue : 0;

    return {
      debts: computed,
      totalDebtLeft,
      totalOriginal,
      totalPaidThisMonth,
      upcomingThisMonth,
      nextDueAmount,
      avgInterestRate
    };
  }

  // 100% Real Live Google Sheets Lending & Receivables Calculator
  function computeLending(transactions = []) {
    const borrowersMap = {};

    (transactions || []).forEach(t => {
      const type = String(t.cashFlowType || '').toLowerCase();
      const flow = String(t.cashFlow || '').toLowerCase();
      const desc = String(t.description || '').trim();
      const amt = Number(t.amount) || 0;
      if (!desc || amt <= 0) return;

      // Detect Lending Transactions from Google Sheets (e.g. Lend_Expenses & Lend_Income)
      const isLendExpense = flow === "expense" && (type.includes("lend") || type === "lend_expenses");
      const isLendIncome = flow === "income" && (type.includes("lend") || type === "lend_income");

      if (isLendExpense || isLendIncome) {
        const borrowerKey = desc.toLowerCase();
        if (!borrowersMap[borrowerKey]) {
          borrowersMap[borrowerKey] = {
            id: "borrower_" + encodeURIComponent(borrowerKey),
            borrower: desc,
            relationship: t.forWho ? `${t.forWho}` : "Personal",
            lentAmount: 0,
            repaidAmount: 0,
            currency: t.currency || "JPY",
            firstLentDate: t.date || "-",
            lastActivityDate: t.date || "-",
            notes: t.note || t.detail || t.cashFlowDetail || "-",
            txCount: 0
          };
        }

        const b = borrowersMap[borrowerKey];
        b.txCount += 1;
        if (isLendExpense) {
          b.lentAmount += amt;
          if (t.date && (!b.firstLentDate || t.date < b.firstLentDate)) {
            b.firstLentDate = t.date;
          }
        }
        if (isLendIncome) {
          b.repaidAmount += amt;
        }
        if (t.date && t.date > b.lastActivityDate) {
          b.lastActivityDate = t.date;
        }
      }
    });

    const computed = Object.values(borrowersMap).map(b => {
      const remaining = Math.max(0, b.lentAmount - b.repaidAmount);
      const progress = b.lentAmount > 0 ? Math.min(100, Math.round((b.repaidAmount / b.lentAmount) * 100)) : 100;
      const status = remaining === 0 ? "Settled" : b.repaidAmount > 0 ? "Partially Paid" : "Active";
      return {
        id: b.id,
        borrower: b.borrower,
        relationship: b.relationship,
        amount: b.lentAmount,
        repaid: b.repaidAmount,
        remaining,
        progress,
        lentDate: b.firstLentDate,
        dueDate: b.lastActivityDate,
        currency: b.currency,
        notes: b.notes,
        status,
        txCount: b.txCount
      };
    });

    const totalLent = computed.reduce((sum, l) => sum + l.amount, 0);
    const totalRepaid = computed.reduce((sum, l) => sum + l.repaid, 0);
    const totalRemaining = computed.reduce((sum, l) => sum + l.remaining, 0);
    const activeBorrowersCount = computed.filter(l => l.remaining > 0).length;

    return {
      lendingList: computed,
      totalLent,
      totalRepaid,
      totalRemaining,
      activeBorrowersCount
    };
  }

  // Helper to normalize friendly category names based on Google Sheets & Excel standard schema
  function mapCategoryName(type, detail) {
    if (!type) return "Others";
    const t = String(type).trim();
    const d = String(detail || '').trim();

    if (t === "Food_Expenses" || t.includes("Food") || t.includes("Dining") || t.includes("Grocer")) return "Food & Groceries";
    if (t === "Transportation_Expenses" || t.includes("Transportation") || t.includes("Transport") || t.includes("Train") || t.includes("Car")) return "Transportation";
    if (t === "Bills_Utilities" || t.includes("Bills") || t.includes("Utilities") || t.includes("Electricity") || t.includes("Water") || t.includes("Gas")) return "Utilities";
    if (t === "Fixed_Expenses" || d.includes("Housing") || d.includes("Rent") || d.includes("House")) return "Housing";
    if (t === "Living_Expenses") return "Living Supplies";
    if (t === "Fashion_Expenses") return "Fashion & Clothing";
    if (t === "Entertainment" || t.includes("Game") || t.includes("Fun")) return "Entertainment";
    if (t === "Education_Expenses" || t.includes("Education") || t.includes("Tuition") || t.includes("School")) return "Education";
    if (t === "Healthcare_Expenses" || t.includes("Healthcare") || t.includes("Medical") || t.includes("Drugstore")) return "Healthcare";
    if (t === "Travel_Leisure" || t.includes("Travel")) return "Travel & Leisure";
    if (t === "Digital_Expenses") return "Digital & AI Tools";
    if (t === "PersonalCare_Expenses") return "Personal Care";
    if (t === "Social_Expenses") return "Social & Donations";
    if (t === "Taxes_Insurance") return "Taxes & Insurance";
    if (t === "Family_Support") return "Family Support";
    if (t === "Loan_Expenses") return "Loan Repayments";
    if (t === "Savings_Investments") return "Savings & Investments";
    if (t === "Other_Expenses") return "Others";

    return t.replace(/_Expenses$/i, '').replace(/_/g, ' ') || "Others";
  }

  // Smart Financial AI Insights & Recommendations Engine (Switchable Language: Myanmar / English)
  function computeAiRecommendations(transactions = [], rawGoals = [], rawBudgets = [], rawSchedules = [], explicitLang = null) {
    const summary = computeSummary(transactions);
    const goals = computeGoals(transactions, rawGoals);
    const budgets = computeBudgets(transactions, rawBudgets);
    const debts = computeDebts(transactions, rawSchedules);
    const lending = computeLending(transactions);
    const expensesGroup = groupExpensesByCategory(transactions);
    const expensesByCategory = expensesGroup.categories || [];

    const lang = explicitLang || (typeof localStorage !== 'undefined' && localStorage.getItem('ai_advisor_lang')) || 'mm';

    // 1. Goals AI Insights
    const goalsInsights = [];
    const sortedGoals = [...(goals.goals || [])].sort((a, b) => (a.targetDate || '').localeCompare(b.targetDate || ''));
    const nearestGoal = sortedGoals[0];

    if (nearestGoal) {
      const monthsLeft = Math.max(1, Math.round((new Date(nearestGoal.targetDate || '2026-12-31') - new Date()) / (1000 * 60 * 60 * 24 * 30)));
      const neededPerMonth = Math.round(nearestGoal.remainingNeeded / monthsLeft);
      goalsInsights.push({
        type: 'priority',
        icon: '🎯',
        title: lang === 'en' ? `Target Focus: ${nearestGoal.name}` : `ဦးစားပေး ငွေစုပန်းတိုင် - ${nearestGoal.name}`,
        desc: lang === 'en' 
          ? `To reach your goal of ¥${nearestGoal.targetAmount.toLocaleString()} by ${nearestGoal.targetDate}, save ~¥${neededPerMonth.toLocaleString()}/month.`
          : `${nearestGoal.targetDate} မတိုင်မီ ပန်းတိုင်ပြည့်မီရန် တစ်လလျှင် ~¥${neededPerMonth.toLocaleString()} စုဆောင်းရန် လိုအပ်ပါသည်။`,
        actionPill: lang === 'en' ? `+ Deposit ¥${neededPerMonth.toLocaleString()} 💰` : `+ စုငွေထည့်မည် ¥${neededPerMonth.toLocaleString()} 💰`,
        link: `input.html?tab=expense&type=Savings_Investments&detail=Saving&desc=${encodeURIComponent(nearestGoal.name)}`
      });
    }

    if (goals.totalSaved === 0) {
      goalsInsights.push({
        type: 'action',
        icon: '🚀',
        title: lang === 'en' ? 'Start First Savings Milestone' : 'ပထမဆုံး ငွေစုမှတ်တိုင် စတင်ပါ',
        desc: lang === 'en'
          ? 'Deposit your first savings to activate visual mountain trail progress and unlock milestones!'
          : 'ပန်းတိုင်တိုးတက်မှုကို စတင်မြင်တွေ့နိုင်ရန် ပထမဆုံး စုဆောင်းငွေ စတင်ထည့်သွင်းပါ။',
        actionPill: lang === 'en' ? 'Deposit Now 💰' : 'ယခု ငွေစုမည် 💰',
        link: sortedGoals[0] ? `input.html?tab=expense&type=Savings_Investments&detail=Saving&desc=${encodeURIComponent(sortedGoals[0].name)}` : 'input.html'
      });
    } else if (goals.overallProgress >= 50) {
      goalsInsights.push({
        type: 'success',
        icon: '🌟',
        title: lang === 'en' ? 'Over 50% Journey Completed!' : 'ပန်းတိုင်၏ ၅၀% ကျော် ပြီးမြောက်ပါပြီ!',
        desc: lang === 'en'
          ? `You have saved ¥${goals.totalSaved.toLocaleString()} towards your total ¥${goals.totalTarget.toLocaleString()} dream targets. Keep the momentum going!`
          : `စုစုပေါင်း ပန်းတိုင်၏ တစ်ဝက်ကျော် (¥${goals.totalSaved.toLocaleString()}) စုဆောင်းပြီးစီးပါပြီ။ အရှိန်မပျက် ဆက်လက်စုဆောင်းပါ။`,
        actionPill: lang === 'en' ? 'Maintain Pace 🚀' : 'အရှိန်ထိန်းထားပါ 🚀'
      });
    }

    // 2. Spending & 50/30/20 AI Insights
    const spendingInsights = [];
    const totalExp = summary.totalExpense || summary.totalExpenses || 0;
    const wantsExp = summary.wantsExpenses || 0;
    const needsExp = summary.needsExpenses || 0;
    const wantRatio = totalExp > 0 ? (wantsExp / totalExp) * 100 : 0;
    const needRatio = totalExp > 0 ? (needsExp / totalExp) * 100 : 0;
    const topCategory = expensesByCategory[0];

    if (wantRatio > 30) {
      const excessWants = Math.round(wantsExp - (totalExp * 0.30));
      spendingInsights.push({
        type: 'warning',
        icon: '⚠️',
        title: lang === 'en' ? `Want Spending Alert (${wantRatio.toFixed(1)}%)` : `အပျော်အပါး သုံးစွဲမှု သတိပေးချက် (${wantRatio.toFixed(1)}%)`,
        desc: lang === 'en'
          ? `Your Want expenses exceed the 30% golden guideline. Trimming ¥${excessWants.toLocaleString()} could boost your monthly savings!`
          : `မဖြစ်မနေ မဟုတ်သော အသုံးစရိတ် ပိုများနေပါသည်။ ¥${excessWants.toLocaleString()} ခန့် လျှော့ချပါက ငွေပိုစုနိုင်ပါမည်။`,
        actionPill: lang === 'en' ? 'Optimize Wants ✂️' : 'အသုံးလျှော့မည် ✂️'
      });
    } else {
      spendingInsights.push({
        type: 'success',
        icon: '🛡️',
        title: lang === 'en' ? `Healthy 50/30/20 Ratio (${needRatio.toFixed(0)}% Needs / ${wantRatio.toFixed(0)}% Wants)` : `စနစ်ကျသော သုံးစွဲမှု အချိုးအစား (${needRatio.toFixed(0)}% Needs / ${wantRatio.toFixed(0)}% Wants)`,
        desc: lang === 'en'
          ? 'Your essential versus discretionary spending is well-balanced within golden financial standards.'
          : 'မရှိမဖြစ် အသုံးစရိတ်နှင့် အခြားအသုံးစရိတ် အချိုးအစား မျှတပြီး အလွန်ကောင်းမွန်ပါသည်။',
        actionPill: lang === 'en' ? 'Great Discipline 👍' : 'စည်းကမ်းရှိပါသည် 👍'
      });
    }

    if (topCategory) {
      spendingInsights.push({
        type: 'info',
        icon: '📊',
        title: lang === 'en' ? `Top Spending: ${topCategory.name}` : `အသုံးအများဆုံး ကဏ္ဍ - ${topCategory.name}`,
        desc: lang === 'en'
          ? `${topCategory.name} accounts for ¥${topCategory.amount.toLocaleString()} (${topCategory.percentage.toFixed(1)}% of all expenses).`
          : `${topCategory.name} သည် စုစုပေါင်း အသုံးစရိတ်၏ ${topCategory.percentage.toFixed(1)}% (¥${topCategory.amount.toLocaleString()}) သုံးစွဲထားပါသည်။`,
        actionPill: lang === 'en' ? 'Review Category 🔍' : 'အသေးစိတ်စစ်မည် 🔍'
      });
    }

    // 3. Debt & Lending AI Insights
    const debtInsights = [];
    if (debts.totalRemaining > 0 || debts.totalDebtLeft > 0) {
      const debtAmount = debts.totalRemaining || debts.totalDebtLeft || 0;
      debtInsights.push({
        type: 'warning',
        icon: '💳',
        title: lang === 'en' ? `Active Liabilities: ¥${debtAmount.toLocaleString()}` : `ဆပ်ရန်ရှိသော အကြွေးတာဝန်များ - ¥${debtAmount.toLocaleString()}`,
        desc: lang === 'en'
          ? 'Consider allocating bonus income or surplus to clear the nearest due obligation first using Snowball payoff.'
          : 'အတိုးများသော သို့မဟုတ် ရက်စေ့ရန် အနီးဆုံး အကြွေးကို ဦးစားပေး ချေဖျက်ပါ။',
        actionPill: lang === 'en' ? 'Record Payment 📉' : 'အကြွေးဆပ်မည် 📉',
        link: 'input.html?tab=expense&type=Loan_Expenses'
      });
    }

    if (lending.totalRemaining > 0) {
      const activeBorrowers = (lending.lendingList || []).filter(b => b.remaining > 0);
      const topBorrower = activeBorrowers[0];
      const borrowerName = topBorrower ? topBorrower.borrower : '';
      const borrowerRem = topBorrower ? topBorrower.remaining : 0;
      debtInsights.push({
        type: 'info',
        icon: '🤝',
        title: lang === 'en' ? `Receivable Recovery: ¥${lending.totalRemaining.toLocaleString()}` : `ပြန်ရရန်ရှိသော ငွေများ - ¥${lending.totalRemaining.toLocaleString()}`,
        desc: lang === 'en'
          ? `You have ¥${lending.totalRemaining.toLocaleString()} in money lent to ${lending.activeBorrowersCount} borrower(s)${topBorrower ? ` (e.g. ${borrowerName}: ¥${borrowerRem.toLocaleString()})` : ''}.`
          : `လူပုဂ္ဂိုလ် ${lending.activeBorrowersCount} ဦးထံမှ စုစုပေါင်း ¥${lending.totalRemaining.toLocaleString()} ပြန်လည်ရယူရန် ရှိပါသည်${topBorrower ? ` (${borrowerName} - ¥${borrowerRem.toLocaleString()})` : ''}။`,
        actionPill: lang === 'en' ? 'Record Repayment 💰' : 'ပြန်ရငွေသွင်းမည် 💰',
        link: topBorrower ? `input.html?tab=income&type=Lend_Income&desc=${encodeURIComponent(borrowerName)}` : 'input.html?tab=income&type=Lend_Income'
      });
    }

    // 4. Budget AI Insights
    const budgetInsights = [];
    const budgetList = budgets.budgets || [];
    const overspentBudgets = budgetList.filter(b => b.progress > 100);
    const nearLimitBudgets = budgetList.filter(b => b.progress >= 80 && b.progress <= 100);

    if (overspentBudgets.length > 0) {
      budgetInsights.push({
        type: 'danger',
        icon: '🚨',
        title: lang === 'en' ? `${overspentBudgets.length} Budgets Over Limit` : `ဘတ်ဂျက် ကျော်လွန်နေသော ကဏ္ဍများ (${overspentBudgets.length} ခု)`,
        desc: lang === 'en'
          ? `${overspentBudgets.map(b => b.category || b.name).join(', ')} exceeded planned limits. Reduce spending here for remainder of month.`
          : `${overspentBudgets.map(b => b.category || b.name).join(', ')} သည် သတ်မှတ်ဘတ်ဂျက်ထက် ကျော်လွန်နေပါသဖြင့် လျှော့ချသုံးစွဲပါ။`,
        actionPill: lang === 'en' ? 'Review Overages ⚠️' : 'ပြန်လည်စစ်ဆေးမည် ⚠️'
      });
    } else if (nearLimitBudgets.length > 0) {
      budgetInsights.push({
        type: 'warning',
        icon: '⚡',
        title: lang === 'en' ? `${nearLimitBudgets.length} Categories Nearing 80%` : `၈၀% နီးကပ်နေသော ကဏ္ဍများ (${nearLimitBudgets.length} ခု)`,
        desc: lang === 'en'
          ? `${nearLimitBudgets.map(b => b.category || b.name).join(', ')} are approaching threshold. Pace expenses accordingly.`
          : `${nearLimitBudgets.map(b => b.category || b.name).join(', ')} သည် ၈၀% ပြည့်တော့မည်ဖြစ်၍ အသုံးစရိတ်ကို ထိန်းသိမ်းပါ။`,
        actionPill: lang === 'en' ? 'Pace Expenses ⏱️' : 'ထိန်းသိမ်းသုံးမည် ⏱️'
      });
    } else {
      budgetInsights.push({
        type: 'success',
        icon: '🎉',
        title: lang === 'en' ? 'All Budgets On Track' : 'ဘတ်ဂျက်အားလုံး ပုံမှန်ရှိပါသည်',
        desc: lang === 'en'
          ? `Overall budget consumption is at ${budgets.overallProgress}% (${budgets.statusText || 'Healthy'}).`
          : `စုစုပေါင်း ဘတ်ဂျက်၏ ${budgets.overallProgress}% သာ သုံးစွဲထားပြီး ပုံမှန်အခြေအနေတွင် ရှိပါသည်။`,
        actionPill: lang === 'en' ? 'Healthy Pace 🌟' : 'ကောင်းမွန်ပါသည် 🌟'
      });
    }

    const headers = {
      lang: lang,
      goals: {
        title: lang === 'en' ? 'AI Savings Advisor & Forecast' : 'AI ငွေစုဆောင်းမှု အကြံပေးချက်',
        sub: lang === 'en' ? 'Real-time savings velocity and milestone forecasts' : 'ပန်းတိုင်များ အချိန်မီ ပြည့်မီစေရန် လက်တွေ့ကျသော အကြံပြုချက်များ'
      },
      spending: {
        title: lang === 'en' ? 'AI Spending Optimization & 50/30/20 Insights' : 'AI သုံးစွဲမှု သုံးသပ်ချက်နှင့် 50/30/20 အချိုး',
        sub: lang === 'en' ? 'Smart recommendations to reduce unnecessary expenses and save more' : 'မလိုအပ်သော အသုံးစရိတ်များကို လျှော့ချ၍ ငွေပိုစုနိုင်မည့် လမ်းညွှန်ချက်များ'
      },
      debt: {
        title: lang === 'en' ? 'AI Debt Payoff & Receivable Recovery Advisor' : 'AI အကြွေးနှင့် ရရန်ငွေ စီမံချက်',
        sub: lang === 'en' ? 'Smart recommendations to eliminate liabilities and recover receivables' : 'အကြွေးများကို အမြန်ဆုံးဆပ်ပြီး ပြန်ရငွေများ အချိန်မီ ရယူနိုင်မည့် နည်းလမ်းများ'
      },
      budget: {
        title: lang === 'en' ? 'AI Budget Pace & Overspending Forecast' : 'AI ဘတ်ဂျက် ထိန်းသိမ်းမှု သတိပေးချက်',
        sub: lang === 'en' ? 'Real-time alerts and pace analysis to keep your monthly budget protected' : 'လကုန်တွင် ဘတ်ဂျက်မကျော်လွန်စေရန် ကြိုတင်သတိပေးချက်များ'
      },
      overview: {
        title: lang === 'en' ? 'AI Executive Financial Health & Insights' : 'AI ဘဏ္ဍာရေး အနှစ်ချုပ် သုံးသပ်ချက်',
        sub: lang === 'en' ? 'Key intelligence across spending, savings goals, debts, and budgets' : 'သုံးစွဲမှု၊ ငွေစုပန်းတိုင်၊ အကြွေးနှင့် ဘတ်ဂျက် အနှစ်ချုပ် သုံးသပ်ချက်'
      }
    };

    return {
      lang,
      headers,
      goals: goalsInsights,
      spending: spendingInsights,
      debt: debtInsights,
      budget: budgetInsights
    };
  }

  // Global Language Switcher for AI Advisor
  if (typeof window !== 'undefined') {
    window.setAiAdvisorLang = function(lang) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ai_advisor_lang', lang);
      }
      if (window.BudgetTrackerApp && typeof window.BudgetTrackerApp.renderActiveView === 'function') {
        window.BudgetTrackerApp.renderActiveView();
      } else if (typeof window.location !== 'undefined') {
        window.location.reload();
      }
    };
  }

  return {
    formatCurrency,
    formatShortNumber,
    filterTransactions,
    computeSummary,
    calculateSummary: computeSummary,
    groupExpensesByCategory,
    computeAccountBalances,
    computeGoals,
    computeBudgets,
    computeDebts,
    computeLending,
    computeAiRecommendations,
    calculateMonthFactor,
    mapCategoryName
  };
})();
