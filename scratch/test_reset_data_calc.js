const https = require('https');

const GOOGLE_SPREADSHEET_ID = '1OOrFs6uFBTt2nHW5lxTzqng0vMqWsCt_AyZ3ELare9s';

function fetchSheetCSV(sheetName) {
  return new Promise((resolve, reject) => {
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
    https.get(url, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

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

function computeAccountBalancesWithReset(transactions) {
  const accountMap = {};

  // Check if any ResetData entries exist
  const resetEntries = transactions.filter(t => 
    (t.description || '').toLowerCase() === 'resetdata' ||
    (t.note || '').toLowerCase().includes('reset data to zero condition')
  );

  const hasReset = resetEntries.length > 0;
  const resetDate = hasReset ? resetEntries[0].date : null;

  // 1. If ResetData is present, initialize accounts from ResetData baseline
  if (hasReset) {
    resetEntries.forEach(t => {
      const accName = t.toSource !== '-' ? t.toSource : t.fromSource;
      const amt = parseFloat(t.amount) || 0;
      accountMap[accName] = {
        id: "acc_" + accName.replace(/[^a-zA-Z0-9]/g, '_'),
        name: accName,
        type: accName.startsWith("Bk-") ? "Bank" : accName.startsWith("Crd-") ? "Credit Card" : "Wallet",
        subType: accName.startsWith("Bk-") ? "Checking" : "Cash/Wallet",
        forWho: t.forWho || "US",
        currency: t.currency || "JPY",
        balance: amt,
        liveBalance: amt,
        incomeSum: amt,
        expenseSum: 0,
        transferIn: 0,
        transferOut: 0
      };
    });

    // Process only subsequent transactions after resetDate (excluding the reset entries themselves)
    transactions.forEach(t => {
      const isResetEntry = resetEntries.includes(t);
      if (isResetEntry) return;

      // Only count transactions on or after resetDate (if any new ones are added)
      if (t.date > resetDate) {
        const amt = parseFloat(t.amount) || 0;
        const from = t.fromSource;
        const to = t.toSource;

        if (from && from !== "-") {
          if (!accountMap[from]) {
            accountMap[from] = {
              name: from,
              type: from.startsWith("Bk-") ? "Bank" : from.startsWith("Crd-") ? "Credit Card" : "Wallet",
              currency: t.currency || "JPY",
              liveBalance: 0,
              incomeSum: 0,
              expenseSum: 0,
              transferIn: 0,
              transferOut: 0
            };
          }
          if (t.cashFlow === "Expense") {
            accountMap[from].expenseSum += amt;
            accountMap[from].liveBalance -= amt;
          } else if (t.cashFlow === "Transfer") {
            accountMap[from].transferOut += amt;
            accountMap[from].liveBalance -= amt;
          }
        }

        if (to && to !== "-") {
          if (!accountMap[to]) {
            accountMap[to] = {
              name: to,
              type: to.startsWith("Bk-") ? "Bank" : to.startsWith("Crd-") ? "Credit Card" : "Wallet",
              currency: t.currency || "JPY",
              liveBalance: 0,
              incomeSum: 0,
              expenseSum: 0,
              transferIn: 0,
              transferOut: 0
            };
          }
          if (t.cashFlow === "Income") {
            accountMap[to].incomeSum += amt;
            accountMap[to].liveBalance += amt;
          } else if (t.cashFlow === "Transfer") {
            accountMap[to].transferIn += amt;
            accountMap[to].liveBalance += amt;
          }
        }
      }
    });

    return Object.values(accountMap);
  }

  // Standard flow if no reset
  transactions.forEach(t => {
    const amt = parseFloat(t.amount) || 0;
    const from = t.fromSource;
    const to = t.toSource;

    if (from && from !== "-") {
      if (!accountMap[from]) {
        accountMap[from] = {
          name: from,
          type: from.startsWith("Bk-") ? "Bank" : from.startsWith("Crd-") ? "Credit Card" : "Wallet",
          currency: t.currency || "JPY",
          liveBalance: 0, incomeSum: 0, expenseSum: 0, transferIn: 0, transferOut: 0
        };
      }
      if (t.cashFlow === "Expense") {
        accountMap[from].expenseSum += amt;
        accountMap[from].liveBalance -= amt;
      } else if (t.cashFlow === "Transfer") {
        accountMap[from].transferOut += amt;
        accountMap[from].liveBalance -= amt;
      }
    }

    if (to && to !== "-") {
      if (!accountMap[to]) {
        accountMap[to] = {
          name: to,
          type: to.startsWith("Bk-") ? "Bank" : to.startsWith("Crd-") ? "Credit Card" : "Wallet",
          currency: t.currency || "JPY",
          liveBalance: 0, incomeSum: 0, expenseSum: 0, transferIn: 0, transferOut: 0
        };
      }
      if (t.cashFlow === "Income") {
        accountMap[to].incomeSum += amt;
        accountMap[to].liveBalance += amt;
      } else if (t.cashFlow === "Transfer") {
        accountMap[to].transferIn += amt;
        accountMap[to].liveBalance += amt;
      }
    }
  });

  return Object.values(accountMap);
}

async function runTest() {
  const csv = await fetchSheetCSV('Income-Expense-Tracker');
  const rows = parseCSVText(csv).map(r => ({
    date: r.Date,
    description: r.Description,
    cashFlow: r['Cash Flow'],
    fromSource: r['From Source'],
    toSource: r['To Source'],
    amount: r.Amount,
    currency: r.Currency,
    note: r.Note
  }));

  const accs = computeAccountBalancesWithReset(rows);
  console.log("=== CALCULATED BALANCES FROM REAL GOOGLE SHEET WITH RESETDATA ===");
  accs.forEach(a => {
    console.log(`${a.name.padEnd(16)} [${a.type.padEnd(6)}] : ¥${a.liveBalance.toLocaleString()}`);
  });

  const totalHousehold = accs.filter(a => a.type !== 'Credit Card').reduce((s, a) => s + a.liveBalance, 0);
  console.log("----------------------------------------------------------------");
  console.log("TOTAL HOUSEHOLD BALANCE : ¥" + totalHousehold.toLocaleString());
}

runTest();
