const fs = require('fs');

const txs = JSON.parse(fs.readFileSync('scratch/generated_clean_ledger.json', 'utf8'));

const lines = txs.map(t => {
  return `    ["${t.date}", "${t.description}", "${t.cashFlow}", "${t.cashFlowType}", "${t.fromSource}", "${t.toSource}", ${t.amount}, "${t.currency}", "${t.detail}", "${t.forWho}", "${t.status}", "${t.note}"]`;
});

const content = `  // 1. Clean All-Time Financial Ledger from Jan 2026 to Aug 2026 (${txs.length} transactions)
  const excelTransactions = [
${lines.join(',\n')}
  ];`;

fs.writeFileSync('scratch/excel_transactions_block.txt', content, 'utf8');
console.log("excel_transactions_block.txt generated. Total chars:", content.length);
