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

// Helper delay
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function pushAll() {
  const txs = JSON.parse(fs.readFileSync('scratch/generated_clean_ledger.json', 'utf8'));
  console.log(`Starting push of ${txs.length} clean transactions to Google Sheets...`);

  // We already posted entry #0 in test
  let count = 0;
  for (let i = 1; i < txs.length; i++) {
    const t = txs[i];
    try {
      const res = await postEntry(t);
      count++;
      if (count % 20 === 0 || count === txs.length - 1) {
        console.log(`Pushed [${count}/${txs.length - 1}] — Latest: ${t.date} ${t.description} (${t.currency} ${t.amount})`);
      }
      await sleep(150); // slight throttle
    } catch (e) {
      console.warn(`Failed entry ${i}:`, e.message);
    }
  }

  console.log("✓ ALL TRANSACTIONS PUSHED SUCCESSFULLY!");
}

pushAll();
