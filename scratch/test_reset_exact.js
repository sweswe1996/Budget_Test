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

function computeExactBalances(transactions) {
  const accountMap = {};

  // Find all reset rows (Row 221 to 226)
  // They are the 6 income transactions on 2026-08-15 for starting balances
  const resetRows = transactions.filter(t => {
    const desc = (t.Description || t.description || '').toLowerCase();
    const note = (t.Note || t.note || '').toLowerCase();
    const isResetDesc = desc === 'resetdata' || note.includes('reset data to zero condition');
    const isAugust15Salary = (t.Date || t.date) === '2026-08-15' && (t['Cash Flow Detail'] || t.detail) === 'Salary1';
    return isResetDesc || isAugust15Salary;
  });

  resetRows.forEach(t => {
    const to = t['To Source'] || t.toSource;
    const from = t['From Source'] || t.fromSource;
    const accName = to && to !== '-' ? to : from;
    const amt = parseFloat(t.Amount || t.amount) || 0;
    const cur = t.Currency || t.currency || 'JPY';
    const who = t.ForWho || t.forWho || 'US';

    accountMap[accName] = {
      name: accName,
      type: accName.startsWith("Bk-") ? "Bank" : accName.startsWith("Crd-") ? "Credit Card" : "Wallet",
      subType: accName.startsWith("Bk-") ? "Checking" : "Cash/Wallet",
      forWho: who,
      currency: cur,
      liveBalance: amt,
      incomeSum: amt,
      expenseSum: 0,
      transferIn: 0,
      transferOut: 0
    };
  });

  return Object.values(accountMap);
}

async function run() {
  const csv = await fetchSheetCSV('Income-Expense-Tracker');
  const rows = parseCSVText(csv);
  const balances = computeExactBalances(rows);

  console.log("=== EXACT ACCOUNT BALANCES FROM GOOGLE SHEET ===");
  balances.forEach(a => {
    console.log(`${a.name.padEnd(16)} [${a.type.padEnd(6)}] : ¥${a.liveBalance.toLocaleString()}`);
  });

  const totalHousehold = balances.filter(a => a.type !== 'Credit Card').reduce((s, a) => s + a.liveBalance, 0);
  console.log("------------------------------------------------");
  console.log("TOTAL HOUSEHOLD BALANCE : ¥" + totalHousehold.toLocaleString());
}

run();
