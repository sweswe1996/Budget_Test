const https = require('https');

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwEUClijVXfB8_QXDzOdg4O-VYPusE4WoJLZr4SEtE77yReDXR1eMQwOyBuYh6p1JgE/exec';

function postGAS(payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    
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
          // Follow redirect with GET or POST as per standard
          const redirectUrl = res.headers.location;
          https.get(redirectUrl, (r2) => {
            let body = '';
            r2.on('data', chunk => body += chunk);
            r2.on('end', () => resolve(body));
          }).on('error', reject);
          return;
        }
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(body));
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    }

    send(GAS_URL);
  });
}

async function test() {
  console.log("Testing POST to GAS endpoint...");
  const res = await postGAS({ action: 'ping' });
  console.log("Response:", res);
}

test();
