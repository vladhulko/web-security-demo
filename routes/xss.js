const express = require('express');
const router = express.Router();
const searchView = require('../views/search');
const profileView = require('../views/profile');

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

router.get('/search', requireAuth, (req, res) => {
  const mode = req.app.locals.mode;
  const users = req.app.locals.users;
  const user = users[req.session.user];
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  res.send(searchView({ user, mode, q }));
});

router.get('/profile', requireAuth, (req, res) => {
  const mode = req.app.locals.mode;
  const users = req.app.locals.users;
  const user = users[req.session.user];
  res.send(profileView({ user, mode }));
});

module.exports = router;
