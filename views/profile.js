const layout = require('./layout');
const escapeHtml = require('./escape');

function profileView({ user, mode }) {
  const scriptSrc = mode === 'safe' ? '/profile-safe.js' : '/profile-vulnerable.js';
  const initial = escapeHtml((user.username || '?').charAt(0).toUpperCase());

  const body = `
<div class="container">
  <div class="card profile-card">
    <div class="profile-avatar">${initial}</div>
    <div id="welcome" class="profile-greeting">Привіт</div>
    <div class="profile-note">Ваш профіль MockBank</div>
  </div>
</div>
<script src="${scriptSrc}"></script>`;

  return layout({ title: 'Профіль', body, mode, user, active: 'profile' });
}

module.exports = profileView;
