const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const dashboardView = require('../views/dashboard');

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

function ensureCsrfToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return req.session.csrfToken;
}

router.get('/dashboard', requireAuth, (req, res) => {
  const mode = req.app.locals.mode;
  const users = req.app.locals.users;
  const transactions = req.app.locals.transactions;
  const user = users[req.session.user.username];

  const userTx = transactions
    .filter(t => t.from === user.username || t.to === user.username)
    .slice(-5)
    .reverse();

  const csrfToken = mode === 'safe' ? ensureCsrfToken(req) : null;
  const error = req.query.error ? String(req.query.error).slice(0, 200) : null;

  res.send(dashboardView({ user, transactions: userTx, mode, csrfToken, error }));
});

router.post('/transfer', requireAuth, (req, res) => {
  const mode = req.app.locals.mode;
  const users = req.app.locals.users;
  const transactions = req.app.locals.transactions;
  const { to, amount, note, _csrf } = req.body;

  if (mode === 'safe') {
    if (!_csrf || _csrf !== req.session.csrfToken) {
      return res
        .status(403)
        .redirect('/dashboard?error=' + encodeURIComponent('CSRF token missing or invalid — request blocked.'));
    }
  }

  const sender = users[req.session.user.username];
  const recipient = users[String(to || '').toLowerCase()];
  const amt = parseInt(amount, 10);

  if (!recipient || recipient.username === sender.username) {
    return res.redirect('/dashboard?error=' + encodeURIComponent('Invalid recipient.'));
  }
  if (!Number.isFinite(amt) || amt <= 0) {
    return res.redirect('/dashboard?error=' + encodeURIComponent('Invalid amount.'));
  }
  if (sender.balance < amt) {
    return res.redirect('/dashboard?error=' + encodeURIComponent('Insufficient funds.'));
  }

  sender.balance -= amt;
  recipient.balance += amt;
  transactions.push({
    from: sender.username,
    to: recipient.username,
    amount: amt,
    note: typeof note === 'string' ? note : '',
    timestamp: new Date().toISOString(),
  });

  res.redirect('/dashboard');
});

module.exports = router;
