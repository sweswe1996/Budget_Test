const https = require('https');
const fs = require('fs');

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwEUClijVXfB8_QXDzOdg4O-VYPusE4WoJLZr4SEtE77yReDXR1eMQwOyBuYh6p1JgE/exec';

function postEntry(entry) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      action: 'add',
      date: entry.date,
      description: entry.description,
      cashFlow: entry.cashFlow,
      cashFlowType: entry.cashFlowType,
      fromSource: entry.fromSource || '-',
      toSource: entry.toSource || '-',
      amount: entry.amount,
      currency: entry.currency || 'JPY',
      detail: entry.detail || '-',
      forWho: entry.forWho || 'US',
      status: entry.status || '-',
      note: entry.note || ''
    });

    function send(targetUrl) {
      const urlObj = new URL(targetUrl);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          https.get(res.headers.location, (r2) => {
            let body = '';
            r2.on('data', chunk => body += chunk);
            r2.on('end', () => {
              try { resolve(JSON.parse(body)); } catch (e) { resolve(body); }
            });
          }).on('error', reject);
          return;
        }
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(body)); } catch (e) { resolve(body); }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    }

    send(GAS_URL);
  });
}

async function testSingle() {
  console.log("Testing posting 1 entry to Google Sheets...");
  const sample = {
    date: "2026-01-01",
    description: "Starting Base Salary",
    cashFlow: "Income",
    cashFlowType: "Fixed_Income",
    fromSource: "-",
    toSource: "Bk-YUCHO_MG",
    amount: 350000,
    currency: "JPY",
    detail: "Salary1",
    forWho: "MG",
    status: "-",
    note: "Jan Initial Base Salary"
  };

  const res = await postEntry(sample);
  console.log("Result:", res);
}

testSingle();
