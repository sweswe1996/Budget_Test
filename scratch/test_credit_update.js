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

function computeAccountBalances(transactions, baselineAccounts = []) {
  const accountMap = {};

  // 1. Check if user added explicit ResetData entries (Rows 221 to 226 in Google Sheet)
  const resetEntries = (transactions || []).filter(t => {
    const desc = (t.description || t.Description || '').toLowerCase();
    const note = (t.note || t.Note || '').toLowerCase();
    const isResetDesc = desc === 'resetdata' || note.includes('reset data to zero condition');
    const isAugust15Salary = (t.date || t.Date) === '2026-08-15' && (t.detail || t['Cash Flow Detail'] || t.cashFlowDetail) === 'Salary1' && desc !== 'test';
    return isResetDesc || isAugust15Salary;
  });

  if (resetEntries.length > 0) {
    // Initialize baseline from ResetData entries
    resetEntries.forEach(t => {
      const to = t.toSource || t['To Source'];
      const from = t.fromSource || t['From Source'];
      const accName = to && to !== '-' ? to : from;
      const amt = Number(t.amount || t.Amount) || 0;
      const cur = t.currency || t.Currency || 'JPY';
      const who = t.forWho || t.ForWho || 'US';

      if (accName && accName !== '-') {
        accountMap[accName] = {
          id: "acc_" + accName.replace(/[^a-zA-Z0-9]/g, '_'),
          name: accName,
          type: accName.startsWith("Bk-") ? "Bank" : accName.startsWith("Crd-") ? "Credit Card" : "Wallet",
          subType: accName.startsWith("Bk-") ? "Checking" : accName.startsWith("Crd-") ? "Credit Card" : "Cash/Wallet",
          forWho: who,
          currency: cur,
          balance: amt,
          liveBalance: amt,
          incomeSum: amt,
          expenseSum: 0,
          transferIn: 0,
          transferOut: 0
        };
      }
    });
  } else {
    (baselineAccounts || []).forEach(acc => {
      accountMap[acc.name] = { ...acc, liveBalance: acc.balance || 0, incomeSum: 0, expenseSum: 0, transferIn: 0, transferOut: 0 };
    });
  }

  // 2. Process ALL non-ResetData transactions (including new expenses, new credit card use, transfers)
  transactions.forEach(t => {
    const isReset = resetEntries.includes(t);
    if (isReset) return;

    const amt = Number(t.amount || t.Amount) || 0;
    const from = t.fromSource || t['From Source'];
    const to = t.toSource || t['To Source'];
    const flow = t.cashFlow || t['Cash Flow'];
    const cur = t.currency || t.Currency || 'JPY';
    const who = t.forWho || t.ForWho || 'US';

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
          transferOut: 0
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
          transferOut: 0
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

async function test() {
  const csv = await fetchSheetCSV('Income-Expense-Tracker');
  const rows = parseCSVText(csv);
  console.log("Total rows from Google Sheet:", rows.length);

  const accs = computeAccountBalances(rows);
  console.log("\n=== COMPUTED ACCOUNTS ===");
  accs.forEach(a => {
    console.log(`${a.name.padEnd(16)} [${a.type.padEnd(12)}] [${a.currency}] : Balance: ${a.liveBalance >= 0 ? '+' : ''}${a.liveBalance} | Inflow: +${a.incomeSum + a.transferIn} | Outflow: -${a.expenseSum + a.transferOut}`);
  });

  const jpyAccs = accs.filter(a => a.currency === 'JPY');
  const totalCreditUsed = jpyAccs.filter(a => a.type === 'Credit Card').reduce((s, a) => s + Math.abs(a.liveBalance || 0), 0);
  const activeCreditCards = jpyAccs.filter(a => a.type === 'Credit Card' && Math.abs(a.liveBalance) > 0);

  console.log("\n=== CREDIT CARDS USED (JPY) ===");
  console.log("Total Credit Used:", "¥" + totalCreditUsed.toLocaleString());
  console.log("Active Credit Cards Count:", activeCreditCards.length);
}

test();
