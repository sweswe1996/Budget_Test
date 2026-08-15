const https = require('https');

const url = 'https://docs.google.com/spreadsheets/d/1OOrFs6uFBTt2nHW5lxTzqng0vMqWsCt_AyZ3ELare9s/gviz/tq?tqx=out:csv&sheet=Income-Expense-Tracker&t=' + Date.now();

https.get(url, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    const lines = body.trim().split('\n');
    console.log("Total lines in Google Sheet Income-Expense-Tracker:", lines.length);
    console.log("First 3 lines:", lines.slice(0, 3));
    console.log("Last 3 lines:", lines.slice(-3));
  });
});
