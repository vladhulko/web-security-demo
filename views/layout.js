const escapeHtml = require('./escape');

function layout({ title, body, mode, user }) {
  const modeLabel = mode === 'safe' ? 'SAFE' : 'VULNERABLE';
  const userBlock = user
    ? `<span class="handle">@${escapeHtml(user.username)}</span><a class="nav-link" href="/logout">Log out</a>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)} · MockBank</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
<style>
:root {
  --bg: #08090d;
  --bg-2: #0f1117;
  --card: #13151d;
  --border: #22252f;
  --text: #eceef3;
  --muted: #7a7d8a;
  --accent: #8b7bff;
  --accent-2: #c3b8ff;
  --danger: #ff4d6d;
  --safe: #2dd4bf;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: var(--bg); color: var(--text); }
body {
  font-family: 'DM Sans', system-ui, sans-serif;
  min-height: 100vh;
  font-feature-settings: "ss01", "cv11";
  -webkit-font-smoothing: antialiased;
  background:
    radial-gradient(ellipse 70% 50% at 20% -10%, rgba(139, 123, 255, 0.18), transparent 60%),
    radial-gradient(ellipse 50% 40% at 90% 0%, rgba(45, 212, 191, 0.08), transparent 60%),
    var(--bg);
}
h1, h2, h3, .brand, .display {
  font-family: 'Syne', 'DM Sans', sans-serif;
  letter-spacing: -0.025em;
}
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 36px;
  border-bottom: 1px solid var(--border);
  background: rgba(15, 17, 23, 0.6);
  backdrop-filter: blur(10px);
  position: sticky; top: 0; z-index: 10;
}
.brand {
  font-weight: 800;
  font-size: 22px;
  letter-spacing: -0.03em;
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand-logo {
  width: 26px; height: 26px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  display: inline-block;
  transform: rotate(-8deg);
}
.brand-slash { color: var(--accent); }
.nav-right { display: flex; gap: 18px; align-items: center; }
.handle { color: var(--muted); font-size: 14px; }
.nav-link {
  color: var(--muted); text-decoration: none; font-size: 14px;
  padding: 6px 12px; border-radius: 8px; transition: all 0.15s;
}
.nav-link:hover { color: var(--text); background: var(--bg-2); }
.pill {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-family: 'DM Sans', sans-serif;
}
.pill.vulnerable {
  background: rgba(255, 77, 109, 0.12);
  color: var(--danger);
  border: 1px solid rgba(255, 77, 109, 0.35);
  box-shadow: 0 0 24px rgba(255, 77, 109, 0.15);
}
.pill.safe {
  background: rgba(45, 212, 191, 0.12);
  color: var(--safe);
  border: 1px solid rgba(45, 212, 191, 0.35);
  box-shadow: 0 0 24px rgba(45, 212, 191, 0.12);
}
.container { max-width: 920px; margin: 0 auto; padding: 40px 36px 80px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 720px) { .grid { grid-template-columns: 1fr; } }
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 26px 28px;
  margin-bottom: 20px;
}
.card h2 { font-size: 18px; margin-bottom: 18px; font-weight: 700; }
.card-label { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 10px; }
.balance {
  font-family: 'Syne', sans-serif;
  font-size: 56px;
  font-weight: 700;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, var(--text), var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  line-height: 1;
  margin-top: 6px;
}
.balance-sub { color: var(--muted); font-size: 13px; margin-top: 8px; }
.muted { color: var(--muted); font-size: 13px; }
form { display: flex; flex-direction: column; gap: 10px; }
label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 8px; }
input, button {
  font-family: inherit;
  font-size: 15px;
}
input {
  background: var(--bg-2);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  outline: none;
  transition: border 0.15s, background 0.15s;
}
input:focus { border-color: var(--accent); background: var(--bg); }
input::placeholder { color: #4d5060; }
button {
  background: linear-gradient(135deg, var(--accent), #a999ff);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 13px 24px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 10px;
  transition: transform 0.1s, box-shadow 0.2s;
  box-shadow: 0 4px 20px rgba(139, 123, 255, 0.25);
}
button:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(139, 123, 255, 0.35); }
button:active { transform: translateY(0); }
table { width: 100%; border-collapse: collapse; }
th, td {
  text-align: left;
  padding: 12px 8px;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}
tr:last-child td { border-bottom: none; }
th {
  color: var(--muted); font-weight: 500;
  text-transform: uppercase; font-size: 10px;
  letter-spacing: 0.14em;
}
.amount-in { color: var(--safe); font-weight: 600; }
.amount-out { color: var(--danger); font-weight: 600; }
.error {
  background: rgba(255, 77, 109, 0.08);
  color: var(--danger);
  border: 1px solid rgba(255, 77, 109, 0.3);
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 14px;
}
.notice {
  background: rgba(45, 212, 191, 0.06);
  color: var(--safe);
  border: 1px solid rgba(45, 212, 191, 0.25);
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 13px;
}
.empty { color: var(--muted); padding: 20px 0; font-size: 14px; text-align: center; }
code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: var(--bg-2); padding: 2px 6px; border-radius: 4px; font-size: 13px; }
</style>
</head>
<body>
<nav>
  <div class="brand">
    <span class="brand-logo"></span>
    mock<span class="brand-slash">/</span>bank
  </div>
  <div class="nav-right">
    <span class="pill ${mode}">${modeLabel}</span>
    ${userBlock}
  </div>
</nav>
${body}
</body>
</html>`;
}

module.exports = layout;
