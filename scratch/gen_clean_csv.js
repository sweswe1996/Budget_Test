const fs = require('fs');

const txs = JSON.parse(fs.readFileSync('scratch/generated_clean_ledger.json', 'utf8'));

const headers = ["Date", "Description", "Cash Flow", "Cash Flow Type", "From Source", "To Source", "Amount", "Currency", "Cash Flow Detail", "ForWho", "Status", "Note"];

const csvRows = [headers.map(h => `"${h}"`).join(',')];

txs.forEach(t => {
  const row = [
    t.date,
    t.description,
    t.cashFlow,
    t.cashFlowType,
    t.fromSource || '-',
    t.toSource || '-',
    t.amount,
    t.currency || 'JPY',
    t.detail || '-',
    t.forWho || 'US',
    t.status || '-',
    t.note || ''
  ];
  csvRows.push(row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
});

const csvContent = csvRows.join('\r\n');
fs.writeFileSync('scratch/Income-Expense-Tracker-Clean-2026.csv', csvContent, 'utf8');
console.log(`Generated Income-Expense-Tracker-Clean-2026.csv with ${txs.length} rows.`);
