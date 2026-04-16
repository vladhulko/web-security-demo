const layout = require('./layout');
const escapeHtml = require('./escape');

function formatAmount(n) {
  return String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function dashboardView({ user, transactions, mode, csrfToken, error }) {
  const rows = transactions.map(t => {
    const isOut = t.from === user.username;
    const note = mode === 'safe' ? escapeHtml(t.note) : (t.note || '');
    const party = isOut ? '@' + escapeHtml(t.to) : '@' + escapeHtml(t.from);
    const sign = isOut ? '−' : '+';
    const cls = isOut ? 'out' : 'in';
    return `<div class="tx-row">
      <div class="tx-info">
        <div class="tx-party">${party}</div>
        <div class="tx-note">${note || 'Переказ'}</div>
      </div>
      <div class="tx-amount ${cls}">${sign}${formatAmount(t.amount)} ₴</div>
    </div>`;
  }).join('');

  const csrfField = csrfToken
    ? `<input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}" />`
    : '';

  const errorBlock = error ? `<div class="error">${escapeHtml(error)}</div>` : '';

  const cardSuffix = user.username === 'vlad' ? '4021' : '4137';

  const body = `
<div class="container">
  ${errorBlock}

  <div class="card">
    <div class="card-label">Баланс</div>
    <div class="balance">${formatAmount(user.balance)} ₴</div>
    <div class="balance-sub">Чорна картка · •••• ${cardSuffix}</div>
  </div>

  <div class="card">
    <h2>Переказ</h2>
    <form method="POST" action="/transfer" autocomplete="off">
      <label>Отримувач</label>
      <input name="to" placeholder="misha" required />
      <label>Сума</label>
      <input name="amount" type="number" min="1" placeholder="100" required />
      <label>Коментар</label>
      <input name="note" placeholder="за каву" />
      ${csrfField}
      <button type="submit">Надіслати ₴</button>
    </form>
  </div>

  <div class="card">
    <h2>Останні операції</h2>
    ${transactions.length === 0
      ? '<div class="empty">Операцій поки немає</div>'
      : `<div class="tx-list">${rows}</div>`}
  </div>
</div>`;

  return layout({ title: 'Рахунок', body, mode, user, active: 'dashboard' });
}

module.exports = dashboardView;
