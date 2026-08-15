const rows = [
  { name: "Bk-YUCHO_MG", amount: 180985, currency: "JPY", type: "Bank" },
  { name: "Bk-MUFG_MG", amount: 4536, currency: "JPY", type: "Bank" },
  { name: "Cash_MG", amount: 28000, currency: "JPY", type: "Cash" },
  { name: "Bk-YUCHO_CS", amount: 1148, currency: "JPY", type: "Bank" },
  { name: "Bk-MUFG_CS", amount: 480, currency: "JPY", type: "Bank" },
  { name: "Bk-SMBC_CS", amount: 259296, currency: "JPY", type: "Bank" }
];

const total = rows.reduce((sum, r) => sum + r.amount, 0);
console.log("=== 6 RESET DATA ROWS TOTAL ===");
rows.forEach(r => console.log(`${r.name.padEnd(16)} : ¥${r.amount.toLocaleString()}`));
console.log("---------------------------------");
console.log("TOTAL HOUSEHOLD BALANCE : ¥" + total.toLocaleString());
