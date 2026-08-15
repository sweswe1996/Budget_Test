const fs = require('fs');

const sixRows = [
  ["2026-08-15", "ResetData", "Income", "Fixed_Income", "-", "Bk-YUCHO_MG", 180985, "JPY", "Salary1", "MG", "-", "This is reset data to zero condition"],
  ["2026-08-15", "ResetData", "Income", "Fixed_Income", "-", "Bk-MUFG_MG", 4536, "JPY", "Salary1", "MG", "-", ""],
  ["2026-08-15", "ResetData", "Income", "Fixed_Income", "-", "Cash_MG", 28000, "JPY", "Salary1", "MG", "-", ""],
  ["2026-08-15", "ResetData", "Income", "Fixed_Income", "-", "Bk-YUCHO_CS", 1148, "JPY", "Salary1", "CS", "-", ""],
  ["2026-08-15", "ResetData", "Income", "Fixed_Income", "-", "Bk-MUFG_CS", 480, "JPY", "Salary1", "CS", "-", ""],
  ["2026-08-15", "ResetData", "Income", "Fixed_Income", "-", "Bk-SMBC_CS", 259296, "JPY", "Salary1", "CS", "-", ""]
];

const headers = ["Date", "Description", "Cash Flow", "Cash Flow Type", "From Source", "To Source", "Amount", "Currency", "Cash Flow Detail", "ForWho", "Status", "Note"];
const csvLines = [headers.map(h => `"${h}"`).join(',')];
sixRows.forEach(r => {
  csvLines.push(r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
});

fs.writeFileSync('scratch/6_income_reset_rows.csv', csvLines.join('\r\n'), 'utf8');
console.log("6_income_reset_rows.csv generated.");
