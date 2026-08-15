const https = require('https');

const SHEET_ID = '1OOrFs6uFBTt2nHW5lxTzqng0vMqWsCt_AyZ3ELare9s';

function fetchSheetCSV(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchSheetCSV(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ sheetName, status: res.statusCode, body }));
    }).on('error', reject);
  });
}

function parseCSV(csvText) {
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
      obj[h.replace(/^"|"$/g, '')] = (cols[i] || '').replace(/^"|"$/g, '');
    });
    return obj;
  });
}

async function testAll() {
  const sheets = ['Budgets', 'Income-Expense-Tracker', 'Savings_Goals', 'Payment_Schedule'];
  for (const s of sheets) {
    const res = await fetchSheetCSV(s);
    const parsed = parseCSV(res.body);
    console.log(`=== Sheet: ${s} (${parsed.length} rows) ===`);
    console.log("First 2 rows:", parsed.slice(0, 2));
  }
}

testAll();
