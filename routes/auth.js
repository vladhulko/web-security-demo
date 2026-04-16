const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = req.app.locals.users;
  const user = users[String(username || '').toLowerCase()];
  if (!user || user.password !== password) {
    return res.redirect('/login?error=1');
  }
  req.session.user = user.username;
  req.session.save((err) => {
    if (err) return res.status(500).send('Session error');
    res.redirect('/dashboard');
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send('Session error');
    res.clearCookie('mockbank.sid');
    res.redirect('/login');
  });
});

module.exports = router;
