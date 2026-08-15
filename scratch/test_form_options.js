const fs = require('fs');

const code = fs.readFileSync('js/common-forms.js', 'utf8')
  .replace(/const ALL_SOURCES/g, 'global.ALL_SOURCES')
  .replace(/const TYPE_DETAILS/g, 'global.TYPE_DETAILS');

eval(code);

console.log("=== CHECKING ALL_SOURCES.JPY ===");
console.log("Has E-Wallet_MG:", global.ALL_SOURCES.JPY.includes('E-Wallet_MG'));
console.log("Has E-Wallet_CS:", global.ALL_SOURCES.JPY.includes('E-Wallet_CS'));
console.log("All JPY Sources:", global.ALL_SOURCES.JPY);

console.log("\n=== CHECKING TYPE_DETAILS.Income ===");
console.log(JSON.stringify(global.TYPE_DETAILS.Income, null, 2));
