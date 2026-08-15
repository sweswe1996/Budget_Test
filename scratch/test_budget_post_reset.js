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

function normalizeCategoryKey(rawName) {
  if (!rawName) return "Other_Expenses";
  const s = String(rawName).trim();
  const l = s.toLowerCase().replace(/[\s_&+-]+/g, '');

  if (l.includes("tax") || l.includes("insurance") || l.includes("pension")) return "Taxes_Insurance";
  if (l.includes("fixed") || l.includes("housing") || l.includes("rent")) return "Fixed_Expenses";
  if (l.includes("bill") || l.includes("utilit") || l.includes("electric") || l.includes("water") || l.includes("gas") || l.includes("phone") || l.includes("internet")) return "Bills_Utilities";
  if (l.includes("transport") || l.includes("train") || l.includes("bus") || l.includes("taxi") || l.includes("fuel") || l.includes("pass")) return "Transportation";
  if (l.includes("food") || l.includes("grocer") || l.includes("dining") || l.includes("snack") || l.includes("meal") || l.includes("lunch")) return "Food_Expenses";
  if (l.includes("fashion") || l.includes("cloth") || l.includes("shoe") || l.includes("bag")) return "Fashion_Expenses";
  if (l.includes("living") || l.includes("kitchen") || l.includes("bath") || l.includes("cleaning") || l.includes("appliances") || l.includes("supplies")) return "Living_Expenses";
  if (l.includes("work") || l.includes("stationery") || l.includes("office") || l.includes("business")) return "Work_Expenses";
  if (l.includes("edu") || l.includes("course") || l.includes("book") || l.includes("exam") || l.includes("tuition")) return "Education";
  if (l.includes("health") || l.includes("medical") || l.includes("clinic") || l.includes("hospital") || l.includes("dent") || l.includes("medicine")) return "Healthcare";
  if (l.includes("entertain") || l.includes("game") || l.includes("movie") || l.includes("stream") || l.includes("hobby") || l.includes("fun")) return "Entertainment";
  if (l.includes("family") || l.includes("parent") || l.includes("mother") || l.includes("brother") || l.includes("support")) return "Family_Support";
  return "Other_Expenses";
}

async function test() {
  const csv = await fetchSheetCSV('Income-Expense-Tracker');
  const rows = parseCSVText(csv);
  console.log("Total rows from Google Sheet:", rows.length);

  // Find minimum rowIndex where ResetData starts
  let resetMinRowIndex = Infinity;
  rows.forEach(t => {
    const desc = (t.Description || '').toLowerCase();
    const note = (t.Note || '').toLowerCase();
    if (desc === 'resetdata' || note.includes('reset data to zero condition')) {
      if (t.rowIndex < resetMinRowIndex) {
        resetMinRowIndex = t.rowIndex;
      }
    }
  });

  console.log("ResetMinRowIndex:", resetMinRowIndex);

  // Filter only active post-reset transactions
  const activeTransactions = resetMinRowIndex !== Infinity
    ? rows.filter(t => t.rowIndex >= resetMinRowIndex)
    : rows;

  console.log("Active post-reset transactions count:", activeTransactions.length);

  const categorySpend = {};
  activeTransactions.forEach(t => {
    if (t['Cash Flow'] === 'Expense') {
      const catKey = normalizeCategoryKey(t['Cash Flow Type'] || t['Cash Flow Detail']);
      const amt = Number(t.Amount) || 0;
      categorySpend[catKey] = (categorySpend[catKey] || 0) + amt;
      console.log(`Expense: Row ${t.rowIndex} | ${t.Date} | ${t.Description} | ${t['Cash Flow Type']} -> ${catKey} : ¥${amt}`);
    }
  });

  console.log("\n=== REAL CATEGORY SPEND IN POST-RESET LEDGER ===");
  console.log(categorySpend);
}

test();
