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
  return lines.slice(1).map((line, idx) => {
    const cols = parseRow(line);
    const obj = { rowIndex: idx + 2 };
    headers.forEach((h, i) => {
      const cleanKey = h.replace(/^"|"$/g, '').trim();
      obj[cleanKey] = (cols[i] || '').replace(/^"|"$/g, '').trim();
    });
    return obj;
  });
}

function computeAccountBalances(transactions) {
  const accountMap = {};

  // Find the minimum rowIndex where ResetData occurs
  let resetMinRowIndex = Infinity;
  transactions.forEach(t => {
    const desc = (t.Description || t.description || '').toLowerCase();
    const note = (t.Note || t.note || '').toLowerCase();
    if (desc === 'resetdata' || note.includes('reset data to zero condition')) {
      if (t.rowIndex < resetMinRowIndex) {
        resetMinRowIndex = t.rowIndex;
      }
    }
  });

  // Filter transactions: only process transactions from resetMinRowIndex onwards
  const activeTransactions = resetMinRowIndex !== Infinity
    ? transactions.filter(t => t.rowIndex >= resetMinRowIndex)
    : transactions;

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

async function run() {
  const csv = await fetchSheetCSV('Income-Expense-Tracker');
  const rows = parseCSVText(csv);
  console.log("Total rows from Google Sheet:", rows.length);

  const accs = computeAccountBalances(rows);
  console.log("\n=== ACTIVE ACCOUNT BALANCES (FROM RESETDATA ROW 221 FORWARD) ===");
  accs.forEach(a => {
    console.log(`${a.name.padEnd(16)} [${a.type.padEnd(12)}] [${a.currency}] : Balance: ${a.liveBalance >= 0 ? '+' : ''}${a.liveBalance.toLocaleString()}`);
  });

  const jpyAccs = accs.filter(a => a.currency === 'JPY');
  const totalBank = jpyAccs.filter(a => a.type === 'Bank').reduce((s, a) => s + a.liveBalance, 0);
  const totalCash = jpyAccs.filter(a => a.type === 'Wallet' || a.type === 'Cash').reduce((s, a) => s + a.liveBalance, 0);
  const totalCreditUsed = jpyAccs.filter(a => a.type === 'Credit Card').reduce((s, a) => s + Math.abs(a.liveBalance || 0), 0);
  const activeCreditCards = jpyAccs.filter(a => a.type === 'Credit Card' && Math.abs(a.liveBalance) > 0);

  console.log("\n==========================================");
  console.log("HOUSEHOLD BALANCE (JPY) : ¥" + (totalBank + totalCash).toLocaleString());
  console.log("BANK ACCOUNTS (JPY)     : ¥" + totalBank.toLocaleString());
  console.log("CASH & WALLETS (JPY)    : ¥" + totalCash.toLocaleString());
  console.log("CREDIT CARDS USED (JPY) : ¥" + totalCreditUsed.toLocaleString() + ` (${activeCreditCards.length} JPY card${activeCreditCards.length > 1 ? 's' : ''})`);
}

run();
