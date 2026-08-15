const fs = require('fs');

const originalContent = fs.readFileSync('js/dashboard-data.js', 'utf8');
const newBlock = fs.readFileSync('scratch/excel_transactions_block.txt', 'utf8');

// Replace workbookRows array with newBlock
const startIdx = originalContent.indexOf('  const workbookRows = [');
const endIdx = originalContent.indexOf('  // 2. Real Budgets from Google Sheet Budgets tab');

if (startIdx !== -1 && endIdx !== -1) {
  const updatedContent = originalContent.slice(0, startIdx) +
    newBlock.replace('  const excelTransactions = [', '  const workbookRows = [') + '\n\n' +
    originalContent.slice(endIdx);
  fs.writeFileSync('js/dashboard-data.js', updatedContent, 'utf8');
  console.log("Successfully updated js/dashboard-data.js with clean 196 transactions!");
} else {
  console.error("Could not find delimiters in js/dashboard-data.js", { startIdx, endIdx });
}
