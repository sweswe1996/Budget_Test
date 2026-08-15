const fs = require('fs');

const cleanTxs = JSON.parse(fs.readFileSync('scratch/generated_clean_ledger.json', 'utf8'));

const workbookRows = cleanTxs.map(t => [
  t.date, t.description, t.cashFlow, t.cashFlowType,
  t.fromSource || '-', t.toSource || '-', t.amount,
  t.currency || 'JPY', t.detail || '-', t.forWho || 'US',
  t.status || '-', t.note || ''
]);

const jsContent = `/**
 * BudgetTracker - Centralized Data Provider (100% Clean Financial Ledger)
 * Starts from Jan 1, 2026 up to Aug 2026 (No ghost debt, clean 0-start baseline)
 */

window.BudgetTrackerData = (() => {
  // 1. Clean All-Time Baseline Transactions (Jan 2026 - Aug 2026)
  const workbookRows = ${JSON.stringify(workbookRows, null, 2)};

  // 2. Real Budgets from Google Sheet Budgets tab (11 Categories — Total: ¥232,500)
  const excelBudgets = [
    { month: "2026-08", category: "Fixed Expenses", amount: 52500.0, currency: "JPY" },
    { month: "2026-08", category: "Bills & Utilities", amount: 15000.0, currency: "JPY" },
    { month: "2026-08", category: "Taxes Insurance", amount: 70000.0, currency: "JPY" },
    { month: "2026-08", category: "Transportation", amount: 5000.0, currency: "JPY" },
    { month: "2026-08", category: "Food & Groceries", amount: 30000.0, currency: "JPY" },
    { month: "2026-08", category: "Fashion Expenses", amount: 5000.0, currency: "JPY" },
    { month: "2026-08", category: "Living Expenses", amount: 10000.0, currency: "JPY" },
    { month: "2026-08", category: "Work Expenses", amount: 30000.0, currency: "JPY" },
    { month: "2026-08", category: "Education", amount: 5000.0, currency: "JPY" },
    { month: "2026-08", category: "Healthcare", amount: 5000.0, currency: "JPY" },
    { month: "2026-08", category: "Entertainment", amount: 5000.0, currency: "JPY" }
  ];

  // 3. Real Savings Goals extracted from Savings_Goals sheet
  const excelGoals = [
    { goal: "Laptop", category: "Electronics", target: 300000.0, current: 50000.0, currency: "JPY", targetDate: "2026-12-31" }
  ];

  // 4. Real Payment Schedules extracted from Payment_Schedule sheet
  const excelSchedules = [
    { account: "TutionFee", category: "Education", amount: 275000.0, currency: "JPY", dueDay: "2026-11-25" },
    { account: "Crd-JCB_CS", category: "Credit Card Bill", amount: 21300.0, currency: "JPY", dueDay: "2026-09-15" }
  ];

  let liveBudgets = [...excelBudgets];
  let liveGoals = [...excelGoals];
  let liveSchedules = [...excelSchedules];

  const incomeTypes = ['Fixed_Income', 'Extra_Income', 'Business_Income', 'Loan_Income', 'Lend_Income', 'Exchange_Income'];
  const expenseTypes = [
    'Fixed_Expenses', 'Bills_Utilities', 'Taxes_Insurance', 'Food_Expenses',
    'Fashion_Expenses', 'Living_Expenses', 'Social_Expenses', 'Education_Expenses',
    'SelfDev_Expenses', 'Transportation_Expenses', 'Work_Expenses', 'PersonalCare_Expenses',
    'Health_Expenses', 'Entertainment_Expenses', 'Travel_Expenses', 'Exchange_Expenses',
    'Lend_Expenses', 'Loan_Expenses', 'Other_Expenses'
  ];

  const people = ['-', 'CS', 'MG', 'US', 'Grandparents', 'Mother', 'ThawThaw', 'Younger_Brother_1', 'Younger_Brother_2', 'Nephew & Niece', 'Nephew', 'Niece', 'Mg_Relative', 'Cs_Relative', 'Friend', 'Coworker'];
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
    return r[2].toLowerCase();
  };

  const normalize = (r, id, source, rowIndex) => ({
    id: id + 1,
    rowIndex: rowIndex || (typeof r.rowIndex !== 'undefined' ? r.rowIndex : (source === 'live_sheet' ? id + 2 : null)),
    date: r[0],
    description: r[1],
    cashFlow: r[2],
    cashFlowType: r[3],
    fromSource: r[4],
    toSource: r[5],
    amount: typeof r[6] === 'number' ? r[6] : parseFloat(r[6]) || 0,
    currency: r[7] || 'JPY',
    detail: r[8] || '-',
    cashFlowDetail: r[8] || '-',
    forWho: r[9] || '-',
    status: r[10] || '-',
    note: r[11] || '',
    classification: classify(r),
    source
  });

  // 100% Real Clean Transactions
  const realTransactions = workbookRows.map((r, id) => normalize(r, id, 'workbook', id + 2));
  let allTransactions = [...realTransactions].sort((a, b) => b.date.localeCompare(a.date));

  // Main data fetch function with Google Sheets & LocalStorage sync
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
        if (liveData && liveData.transactions && liveData.transactions.length > 0) {
          return liveData;
        }
      } catch (err) {
        console.warn('Google Apps Script live read failed, using baseline data', err);
      }
    }

    // 2. Load from localStorage cache only if it has clean Jan 2026 dataset
    try {
      const cached = localStorage.getItem('cached_google_sheet_data');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          const hasJanData = parsed.some(t => (t.date || t.Date || '').startsWith('2026-01'));
          if (hasJanData) {
            allTransactions = parsed.map((t, idx) => normalize([
              t.date || t.Date, t.description || t.Description, t.cashFlow || t['Cash Flow'], t.cashFlowType || t['Cash Flow Type'],
              t.fromSource || t['From Source'] || '-', t.toSource || t['To Source'] || '-', t.amount || t.Amount,
              t.currency || t.Currency || 'JPY', t.detail || t.CashFlowDetail || t['Cash Flow Detail'] || '-', t.forWho || t.ForWho || '-',
              t.status || t.Status || '-', t.note || t.Note || ''
            ], 1000 + idx, 'cached_sheet', t.rowIndex));
          } else {
            localStorage.removeItem('cached_google_sheet_data');
          }
        }
      }
    } catch (e) {
      console.warn('Cache load error:', e);
    }

    return {
      transactions: allTransactions,
      budgets: liveBudgets,
      goals: liveGoals,
      schedules: liveSchedules,
      meta: {
        source: 'Clean Database (Jan 2026 - Aug 2026)',
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

  const GOOGLE_SPREADSHEET_ID = '1OOrFs6uFBTt2nHW5lxTzqng0vMqWsCt_AyZ3ELare9s';

  // Robust CSV row parser handling quotes & commas
  function parseCSVText(csvText) {
    const lines = csvText.trim().split(/\\r?\\n/);
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
      const url = \`https://docs.google.com/spreadsheets/d/\${GOOGLE_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=\${encodeURIComponent(sheetName)}&t=\${Date.now()}\`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const text = await res.text();
      return parseCSVText(text);
    } catch (e) {
      console.warn(\`Failed to fetch live sheet \${sheetName}:\`, e.message);
      return [];
    }
  }

  // Live Google Sheets Fetcher with January data verification
  async function fetchLiveGoogleSheetsData() {
    try {
      // 1. Fetch live Budgets from Google Sheets
      const liveBudgetRows = await fetchSheetCSV('Budgets');
      if (liveBudgetRows && liveBudgetRows.length > 0) {
        liveBudgets = liveBudgetRows.map(b => ({
          month: b['Month'] || b['month'] || '2026-08',
          category: b['Category'] || b['category'] || '',
          amount: parseFloat(b['Amount'] || b['amount'] || 0) || 0,
          currency: b['Currency'] || b['currency'] || 'JPY'
        })).filter(b => b.category && b.amount > 0);
        localStorage.setItem('cached_google_sheet_budgets', JSON.stringify(liveBudgets));
      }

      // 2. Fetch live Transactions from Google Sheets (Only if clean January dataset is present)
      const liveTxRows = await fetchSheetCSV('Income-Expense-Tracker');
      if (liveTxRows && liveTxRows.length > 0) {
        const hasJanData = liveTxRows.some(t => (t['Date'] || t['date'] || '').startsWith('2026-01'));
        if (hasJanData) {
          const liveRows = liveTxRows.map((t, idx) => normalize([
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
          ], 1000 + idx, 'live_sheet', idx + 2));
          allTransactions = liveRows;
          localStorage.setItem('cached_google_sheet_data', JSON.stringify(liveTxRows));
        }
      }

      // 3. Fetch live Goals from Google Sheets
      const liveGoalRows = await fetchSheetCSV('Savings_Goals');
      if (liveGoalRows && liveGoalRows.length > 0) {
        liveGoals = liveGoalRows.map(g => ({
          goal: g['Goal'] || g['goal'] || '',
          category: g['Category'] || g['category'] || 'General',
          target: parseFloat(g['Target'] || g['target'] || 0) || 0,
          current: parseFloat(g['Current'] || g['current'] || 0) || 0,
          currency: g['Currency'] || g['currency'] || 'JPY',
          targetDate: g['Target Date'] || g['targetDate'] || ''
        })).filter(g => g.goal);
        localStorage.setItem('cached_google_sheet_goals', JSON.stringify(liveGoals));
      }

      // 4. Fetch live Schedules from Google Sheets
      const liveScheduleRows = await fetchSheetCSV('Payment_Schedule');
      if (liveScheduleRows && liveScheduleRows.length > 0) {
        liveSchedules = liveScheduleRows.map(s => ({
          account: s['Account'] || s['account'] || s['Payee'] || '',
          category: s['Category'] || s['category'] || 'Bills',
          dueDay: s['Due Day'] || s['Due Date'] || s['dueDay'] || '',
          amount: parseFloat(s['Amount'] || s['amount'] || 0) || 0,
          currency: s['Currency'] || s['currency'] || 'JPY'
        })).filter(s => s.account);
        localStorage.setItem('cached_google_sheet_schedules', JSON.stringify(liveSchedules));
      }

      return {
        transactions: allTransactions,
        budgets: liveBudgets,
        goals: liveGoals,
        schedules: liveSchedules,
        meta: {
          source: 'Clean Database (Jan 2026 - Aug 2026)',
          schema: ['Date', 'Description', 'Cash Flow', 'Cash Flow Type', 'From Source', 'To Source', 'Amount', 'Currency', 'Cash Flow Detail', 'ForWho', 'Status', 'Note'],
          realTransactionCount: allTransactions.length,
          totalTransactionCount: allTransactions.length
        }
      };
    } catch (e) {
      console.warn('Live Google Sheets fetch failed:', e.message);
    }
    return null;
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
`;

fs.writeFileSync('js/dashboard-data.js', jsContent, 'utf8');
console.log("Successfully rebuilt js/dashboard-data.js!");
