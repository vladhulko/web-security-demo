const escapeHtml = require('./escape');

function layout({ title, body, mode, user, active }) {
  const modeLabel = mode === 'safe' ? 'SAFE' : 'VULNERABLE';
  const link = (href, label, key) =>
    `<a href="${href}" class="${active === key ? 'active' : ''}">${label}</a>`;

  const navLinks = user
    ? `<div class="nav-links">
        ${link('/dashboard', 'Рахунок', 'dashboard')}
        ${link('/search', 'Пошук', 'search')}
        ${link('/profile#vlad', 'Профіль', 'profile')}
      </div>`
    : '';

  const userBlock = user
    ? `<span class="handle">@${escapeHtml(user.username)}</span><a class="logout" href="/logout">Вийти</a>`
    : '';

  return `<!doctype html>
<html lang="uk">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)} · MockBank</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/app.css">
</head>
<body>
<nav>
  <div class="nav-left">
    <div class="brand">
      <span class="brand-dot"></span>
      mock<span class="brand-slash">/</span>bank
    </div>
    ${navLinks}
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
