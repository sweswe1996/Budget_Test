const https = require('https');

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwEUClijVXfB8_QXDzOdg4O-VYPusE4WoJLZr4SEtE77yReDXR1eMQwOyBuYh6p1JgE/exec?action=getData';

function getGASData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return getGASData(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log("Fetching live Google Sheet data from GAS...");
  const data = await getGASData(GAS_URL);
  console.log("Keys in response:", Object.keys(data));
  if (data.budgets) {
    console.log("Live budgets count:", data.budgets.length);
    console.log("Live budgets:", data.budgets);
  } else {
    console.log("No budgets key in response!");
  }
}

run();
