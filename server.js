const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const mode = process.argv.includes('--mode=safe') ? 'safe' : 'vulnerable';
const PORT = 3000;

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use(session({
  name: 'mockbank.sid',
  secret: 'mockbank-demo-do-not-use-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: mode === 'safe',
    sameSite: mode === 'safe' ? 'strict' : 'lax',
    secure: false,
  },
}));

if (mode === 'safe') {
  app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'");
    next();
  });
}

app.use(express.static(path.join(__dirname, 'public')));

const users = {
  vlad: { username: 'vlad', password: 'vlad123', balance: 10000 },
  misha: { username: 'misha', password: 'misha123', balance: 5000 },
};

const transactions = [];

app.locals.mode = mode;
app.locals.users = users;
app.locals.transactions = transactions;

const authRouter = require('./routes/auth');
const transferRouter = require('./routes/transfer');
const xssRouter = require('./routes/xss');

app.use(authRouter);
app.use(transferRouter);
app.use(xssRouter);

app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.redirect('/login');
});

app.use((req, res) => {
  res.status(404).send('Not found');
});

app.listen(PORT, () => {
  const banner = mode === 'safe' ? 'SAFE MODE (hardened)' : 'VULNERABLE MODE (do not expose)';
  console.log('');
  console.log('  MockBank  ——  ' + banner);
  console.log('  http://localhost:' + PORT);
  console.log('');
  console.log('  Users:');
  console.log('    vlad / vlad123  (balance 10000)');
  console.log('    misha   / misha123    (balance 5000)');
  console.log('');
});
