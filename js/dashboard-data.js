/**
 * BudgetTracker - Centralized Data Provider (Google Sheets Real-Time Sync)
 * Connects directly to Google Sheets database tabs:
 * - Income-Expense-Tracker (Real Transactions)
 * - Budgets (Planned Monthly Limits)
 * - Savings_Goals (User Goals & Target Savings)
 * - Payment_Schedule (Upcoming Bills & Recurring Payments)
 */

window.BudgetTrackerData = (() => {
  // Empty baseline transactions (No fake mock/test data)
  const workbookRows = [];

  // Empty baseline budgets, goals, and schedules
  const excelBudgets = [];
  const excelGoals = [];
  const excelSchedules = [];

  let liveBudgets = [...excelBudgets];
  let liveGoals = [...excelGoals];
  let liveSchedules = [...excelSchedules];

  const incomeTypes = [
    'Fixed_Income', 'Extra_Income', 'Business_Income',
    'Loan_Income', 'Lend_Income', 'Exchange_Income', 'Other_Income'
  ];
  const expenseTypes = [
    'Fixed_Expenses', 'Bills_Utilities', 'Taxes_Insurance', 'Food_Expenses',
    'Fashion_Expenses', 'Living_Expenses', 'Social_Expenses', 'Education_Expenses',
    'SelfDev_Expenses', 'Transportation_Expenses', 'Work_Expenses', 'PersonalCare_Expenses',
    'Healthcare_Expenses', 'Entertainment', 'Travel_Leisure', 'Exchange_Expenses',
    'Lend_Expenses', 'Loan_Expenses', 'Family_Support', 'Savings_Investments', 'Other_Expenses'
  ];
  const people = [
    '-', 'CS', 'MG', 'US', 'Grandparents', 'Mother', 'ThawThaw',
    'Younger_Brother_1', 'Younger_Brother_2', 'Nephew & Niece', 'Nephew', 'Niece',
    'Mg_Relative', 'Cs_Relative', 'Friend', 'Coworker'
  ];
  const currencies = ['JPY', 'MMK', 'USD'];

  // Classify transactions cleanly for cash flow calculations
  const classify = r => {
    if (r[2] === 'Transfer') return 'internal_transfer';
    if (r[3] === 'Exchange_Expenses') return r[8] === 'Exchange Service Fee' ? 'expense' : 'exchange_principal';
    if (r[3] === 'Lend_Expenses') return 'lending';
    if (r[3] === 'Loan_Income') return 'borrowing';
    if (r[3] === 'Lend_Income') return 'repayment_received';
    if (r[3] === 'Exchange_Income') return 'exchange_inflow';
    if (r[3] === 'Loan_Expenses') return 'repayment_paid';
    if (r[3] === 'Savings_Investments') return 'savings_investment';
    return (r[2] || 'Expense').toLowerCase();
  };

  const normalize = (r, id, source, rowIndex) => ({
    id: id + 1,
    rowIndex: rowIndex || (typeof r.rowIndex !== 'undefined' ? r.rowIndex : (source === 'live_sheet' ? id + 2 : null)),
    date: r[0] || new Date().toISOString().split('T')[0],
    description: r[1] || '',
    cashFlow: r[2] || 'Expense',
    cashFlowType: r[3] || 'Other_Expenses',
    fromSource: r[4] || '-',
    toSource: r[5] || '-',
    amount: typeof r[6] === 'number' ? r[6] : parseFloat(r[6]) || 0,
    currency: r[7] || 'JPY',
    detail: r[8] || '-',
    cashFlowDetail: r[8] || '-',
    forWho: r[9] || 'US',
    status: r[10] || '-',
    note: r[11] || '',
    classification: classify(r),
    source: source || 'live_sheet'
  });

  let allTransactions = [];

  const GOOGLE_SPREADSHEET_ID = '1OOrFs6uFBTt2nHW5lxTzqng0vMqWsCt_AyZ3ELare9s';

  // Robust CSV row parser handling quotes & commas
  function parseCSVText(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length <= 1) return [];
    const parseRow = (line) => {
      const row = [];
      let inQuotes = false;
      let curr = '';
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inQuotes && line[i+1] === '"') {
            curr += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === ',' && !inQuotes) {
          row.push(curr.trim());
          curr = '';
        } else {
          curr += c;
        }
      }
      row.push(curr.trim());
      return row;
    };

    const headers = parseRow(lines[0]);
    return lines.slice(1).map(line => {
      const cols = parseRow(line);
      const obj = {};
      headers.forEach((h, i) => {
        const cleanKey = h.replace(/^"|"$/g, '').trim();
        obj[cleanKey] = (cols[i] || '').replace(/^"|"$/g, '').trim();
      });
      return obj;
    });
  }

  async function fetchSheetCSV(sheetName) {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const text = await res.text();
      return parseCSVText(text);
    } catch (e) {
      console.warn(`Live sheet fetch warning (${sheetName}):`, e.message);
      return [];
    }
  }

  // 100% Real Live Google Sheets Fetcher (Real-time live synchronization)
  async function fetchLiveGoogleSheetsData() {
    try {
      // 1. Fetch live Budgets from Google Sheets
      const liveBudgetRows = await fetchSheetCSV('Budgets');
      if (liveBudgetRows && liveBudgetRows.length > 0) {
        liveBudgets = liveBudgetRows.map(b => ({
          month: b['Month'] || b['month'] || b['budgetMonth'] || '',
          category: b['Category'] || b['category'] || b['budgetCategory'] || '',
          amount: parseFloat(b['Amount'] || b['amount'] || b['budgetAmount'] || 0) || 0,
          currency: b['Currency'] || b['currency'] || b['budgetCurrency'] || 'JPY',
          priority: b['Priority'] || b['priority'] || b['budgetPriority'] || 'Flexible',
          notes: b['Notes'] || b['notes'] || b['budgetNotes'] || ''
        })).filter(b => b.category && b.amount > 0);
      }

      // 2. Fetch live Transactions directly from Google Sheets
      const liveTxRows = await fetchSheetCSV('Income-Expense-Tracker');
      if (liveTxRows && liveTxRows.length > 0) {
        allTransactions = liveTxRows.map((t, idx) => normalize([
          t['Date'] || t['date'],
          t['Description'] || t['description'],
          t['Cash Flow'] || t['cashFlow'],
          t['Cash Flow Type'] || t['cashFlowType'],
          t['From Source'] || t['fromSource'] || '-',
          t['To Source'] || t['toSource'] || '-',
          parseFloat(t['Amount'] || t['amount']) || 0,
          t['Currency'] || t['currency'] || 'JPY',
          t['Cash Flow Detail'] || t['detail'] || '-',
          t['ForWho'] || t['forWho'] || 'US',
          t['Status'] || t['status'] || '-',
          t['Note'] || t['note'] || ''
        ], idx, 'live_sheet', idx + 2)).filter(t => t.date && t.amount > 0).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      }

      // 3. Fetch live Goals from Google Sheets
      const liveGoalRows = await fetchSheetCSV('Savings_Goals');
      if (liveGoalRows && liveGoalRows.length > 0) {
        liveGoals = liveGoalRows.map((g, idx) => ({
          id: 'goal_' + (idx + 1),
          goal: g['Goal'] || g['goal'] || g['Goal Name'] || '',
          name: g['Goal'] || g['goal'] || g['Goal Name'] || '',
          category: g['Category'] || g['category'] || 'Personal / Life',
          target: parseFloat(g['Target'] || g['target'] || g['Target Amount'] || 0) || 0,
          current: parseFloat(g['Current'] || g['current'] || g['Current Saved'] || 0) || 0,
          currency: g['Currency'] || g['currency'] || 'JPY',
          targetDate: g['Target Date'] || g['targetDate'] || g['Deadline'] || '',
          date: g['Target Date'] || g['targetDate'] || g['Deadline'] || '',
          priority: g['Priority'] || g['priority'] || 'Medium',
          notes: g['Notes'] || g['notes'] || ''
        })).filter(g => g.goal || g.name);
      }

      // 4. Fetch live Schedules from Google Sheets
      const liveScheduleRows = await fetchSheetCSV('Payment_Schedule');
      if (liveScheduleRows && liveScheduleRows.length > 0) {
        liveSchedules = liveScheduleRows.map((s, idx) => ({
          id: 'sch_' + (idx + 1),
          account: s['Account'] || s['account'] || s['Payee'] || s['Payee Name'] || '',
          payeeName: s['Account'] || s['account'] || s['Payee'] || s['Payee Name'] || '',
          category: s['Category'] || s['category'] || 'Credit Card Bill',
          dueDay: s['Due Day'] || s['Due Date'] || s['dueDay'] || s['dueDate'] || '',
          dueDate: s['Due Day'] || s['Due Date'] || s['dueDay'] || s['dueDate'] || '',
          amount: parseFloat(s['Amount'] || s['amount'] || 0) || 0,
          currency: s['Currency'] || s['currency'] || 'JPY',
          notes: s['Notes'] || s['notes'] || ''
        })).filter(s => s.account || s.payeeName);
      }

      return {
        transactions: allTransactions,
        budgets: liveBudgets,
        goals: liveGoals,
        schedules: liveSchedules,
        meta: {
          source: 'Google Sheets Live Database',
          schema: ['Date', 'Description', 'Cash Flow', 'Cash Flow Type', 'From Source', 'To Source', 'Amount', 'Currency', 'Cash Flow Detail', 'ForWho', 'Status', 'Note'],
          realTransactionCount: allTransactions.length,
          totalTransactionCount: allTransactions.length
        }
      };
    } catch (e) {
      console.warn('Real-time Google Sheet sync error:', e);
      return {
        transactions: allTransactions,
        budgets: liveBudgets,
        goals: liveGoals,
        schedules: liveSchedules
      };
    }
  }

  // Main data fetch function
  async function getDashboardData() {
    // 1. If running inside Google Apps Script HtmlService
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      try {
        const liveData = await new Promise((resolve, reject) => {
          google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(reject)
            .getAllDashboardData();
        });
        if (liveData) {
          if (Array.isArray(liveData.transactions)) allTransactions = liveData.transactions;
          if (Array.isArray(liveData.budgets)) liveBudgets = liveData.budgets;
          if (Array.isArray(liveData.goals)) liveGoals = liveData.goals;
          if (Array.isArray(liveData.schedules)) liveSchedules = liveData.schedules;
          return liveData;
        }
      } catch (err) {
        console.warn('Google Apps Script read warning:', err);
      }
    }

    // 2. Fetch live data directly from Google Sheets in real-time
    if (typeof fetch !== 'undefined') {
      try {
        const liveData = await fetchLiveGoogleSheetsData();
        if (liveData) {
          return liveData;
        }
      } catch (err) {
        console.warn('Live Google Sheets fetch notice:', err);
      }
    }

    return {
      transactions: allTransactions,
      budgets: liveBudgets,
      goals: liveGoals,
      schedules: liveSchedules,
      meta: {
        source: 'Clean Database',
        schema: ['Date', 'Description', 'Cash Flow', 'Cash Flow Type', 'From Source', 'To Source', 'Amount', 'Currency', 'Cash Flow Detail', 'ForWho', 'Status', 'Note'],
        realTransactionCount: allTransactions.length,
        totalTransactionCount: allTransactions.length
      }
    };
  }

  // Update in-memory transaction for local prototype editing
  function updateTransaction(id, updatedFields) {
    const idx = allTransactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      allTransactions[idx] = { ...allTransactions[idx], ...updatedFields };
      return allTransactions[idx];
    }
    return null;
  }

  // Delete transaction locally
  function deleteTransaction(id) {
    const idx = allTransactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      return allTransactions.splice(idx, 1)[0];
    }
    return null;
  }

  // Add transaction locally
  function addTransaction(newTx) {
    const id = allTransactions.length + 1;
    const norm = normalize([
      newTx.date, newTx.description, newTx.cashFlow, newTx.cashFlowType,
      newTx.fromSource || '-', newTx.toSource || '-', newTx.amount,
      newTx.currency || 'JPY', newTx.detail || '-', newTx.forWho || '-',
      newTx.status || '-', newTx.note || ''
    ], id, 'local_added');
    allTransactions.unshift(norm);
    return norm;
  }

  return {
    getDashboardData,
    fetchLiveGoogleSheetsData,
    updateTransaction,
    deleteTransaction,
    addTransaction,
    catalogs: {
      incomeTypes,
      expenseTypes,
      people,
      currencies
    }
  };
})();
