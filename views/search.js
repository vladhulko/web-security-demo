const layout = require('./layout');
const escapeHtml = require('./escape');

function searchView({ user, mode, q }) {
  const value = escapeHtml(q || '');
  const rendered = mode === 'safe' ? escapeHtml(q || '') : (q || '');

  const result = q
    ? `<div class="search-result">Результати пошуку для: <span class="term">${rendered}</span></div>`
    : '<div class="empty">Введіть запит, щоб побачити результати</div>';

  const body = `
<div class="container">
  <div class="card">
    <h2>Пошук</h2>
    <form method="GET" action="/search" class="search-box">
      <input name="q" value="${value}" placeholder="Введіть запит..." autofocus />
      <button type="submit">Пошук</button>
    </form>
    ${result}
  </div>
</div>`;

  return layout({ title: 'Пошук', body, mode, user, active: 'search' });
}

module.exports = searchView;
