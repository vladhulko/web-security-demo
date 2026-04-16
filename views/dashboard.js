const layout = require('./layout');
const escapeHtml = require('./escape');

function dashboardView({ user, transactions, mode, csrfToken, error }) {
  const rows = transactions.map(t => {
    const isOut = t.from === user.username;
    const note = mode === 'safe' ? escapeHtml(t.note) : (t.note || '');
    const direction = isOut
      ? `→ @${escapeHtml(t.to)}`
      : `← @${escapeHtml(t.from)}`;
    const amountClass = isOut ? 'amount-out' : 'amount-in';
    const sign = isOut ? '−' : '+';
    const when = new Date(t.timestamp).toLocaleString();
    return `<tr>
      <td class="muted">${escapeHtml(when)}</td>
      <td>${direction}</td>
      <td class="${amountClass}">${sign}$${t.amount.toLocaleString()}</td>
      <td>${note}</td>
    </tr>`;
  }).join('');

  const csrfField = csrfToken
    ? `<input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}" />`
    : '';

  const errorBlock = error ? `<div class="error">${escapeHtml(error)}</div>` : '';

  const body = `
<div class="container">
  ${errorBlock}
  <div class="grid">
    <div class="card" style="grid-column: span 2;">
      <div class="card-label">Available balance</div>
      <div class="balance">$${user.balance.toLocaleString()}</div>
      <div class="balance-sub">Checking · •••• 4${user.username === 'alice' ? '021' : '137'}</div>
    </div>

    <div class="card">
      <h2>Send money</h2>
      <form method="POST" action="/transfer" autocomplete="off">
        <label>Recipient</label>
        <input name="to" placeholder="username" required />
        <label>Amount</label>
        <input name="amount" type="number" min="1" placeholder="100" required />
        <label>Note</label>
        <input name="note" placeholder="coffee, rent, etc." />
        ${csrfField}
        <button type="submit">Transfer funds</button>
      </form>
    </div>

    <div class="card">
      <h2>Recent activity</h2>
      ${transactions.length === 0
        ? '<div class="empty">No transactions yet. Send your first transfer to get started.</div>'
        : `<table>
            <thead><tr><th>When</th><th>Party</th><th>Amount</th><th>Note</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>`}
    </div>
  </div>
</div>`;

  return layout({ title: 'Dashboard', body, mode, user });
}

module.exports = dashboardView;
