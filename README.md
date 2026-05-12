# BraidMap

BC's BIPOC hairstylist directory. A static, no-build-step web application.

**Stack:** Vanilla HTML · CSS · JavaScript · `localStorage` auth · `braidmap_data.json`
**Host:** Netlify (auto-deploys on push to `main`)

---

## Local Development

You need a real HTTP server — opening files via `file://` will fail because `fetch()` is blocked.

```bash
npm start
# or, without npm:
npx serve -l 3000 .
# or, without Node:
python -m http.server 3000
```

Then open **http://localhost:3000**.

---

## Project Structure

```
BraidMap-Fresh/
├── index.html                  Landing page + sign-up gate
├── braidmap-auth.html          Login / register
├── braidmap-directory.html     Filterable stylist directory
├── braidmap-profile.html       Individual stylist profile
├── braidmap-member.html        Logged-in member dashboard
├── braidmap-report.html        Report an issue
├── braidmap-suggest.html       Suggest a stylist
├── braidmap_data.json          All stylist data (~62 KB, 121 stylists)
├── css/
│   └── braidmap.css            Shared stylesheet
├── js/
│   ├── core/                   Modular BraidMap core
│   │   ├── config.js           Constants, storage keys, routes, fetch settings
│   │   ├── log.js              Safe console wrappers
│   │   ├── storage.js          localStorage wrapper (never throws)
│   │   ├── utils.js            esc, escAttr, URL helpers, debounce
│   │   ├── auth.js             login, logout, getUser, recents
│   │   ├── data.js             Hardened fetchJson + loadStylists
│   │   └── nav.js              renderNav (desktop + mobile)
│   └── braidmap.js             Compatibility shim — exposes flat BM.xxx API
├── netlify.toml                Security headers + deploy config
├── DEVLOG.md                   Development log
└── package.json
```

### Script load order

Every HTML page loads the core modules in dependency order:

```html
<script src="js/core/config.js"></script>
<script src="js/core/log.js"></script>
<script src="js/core/storage.js"></script>
<script src="js/core/utils.js"></script>
<script src="js/core/auth.js"></script>
<script src="js/core/data.js"></script>
<script src="js/core/nav.js"></script>
<script src="js/braidmap.js"></script>
```

The shim `js/braidmap.js` re-exposes `BM.isLoggedIn`, `BM.esc`, `BM.renderNav`, etc., so all existing inline page scripts work unchanged.

---

## Public API (`window.BM`)

### Auth
- `BM.isLoggedIn()` → boolean
- `BM.getUser()` → `{ name, email }`
- `BM.login(name, email)`
- `BM.logout()` — clears all keys + redirects
- `BM.getRecent()` → array of stylist IDs
- `BM.addRecent(id)` — prepend, dedupe, cap at `recentLimit`

### Utilities
- `BM.esc(str)` — XSS-safe for innerHTML
- `BM.escAttr(str)` — XSS-safe for HTML attribute values
- `BM.userInitial(name)` — first letter for avatars
- `BM.isValidBookingUrl(url)` — accept only real http/https
- `BM.safeBookingUrl(url)` — upgrade `http://` → `https://`
- `BM.utils.debounce(fn, ms)` — trailing-edge debounce
- `BM.utils.urlParam(name)` — safe query-string lookup

### Data
- `BM.loadStylists()` → `Promise<{ stylists, tag_labels, cities, style_counts }>`
- `BM.fetchJson(url, opts)` → `Promise<any>` with timeout + retry + cache
- `BM.data.clearCache()` — drop the in-memory cache

### Nav
- `BM.renderNav()` — populate `#navLinks`, `#navRight`, `#mobileMenu` from current auth state

### Config & Logging
- `BM.config` — routes, storage keys, fetch settings (read-only in practice)
- `BM.log.info / .warn / .error` — prefixed console calls; `info` respects `BM.config.debug`

---

## Hardened Fetch

`BM.fetchJson(url)` and `BM.loadStylists()` use:

- **AbortController timeout** (default 10s, see `BM.config.fetchTimeoutMs`)
- **Retry** with linear backoff (default 2 retries, 500ms delay)
- **In-memory cache** keyed by URL (skip via `{ cache: false }`)
- **Defensive normalization** — `loadStylists()` guarantees `stylists` is an array, `tag_labels` is an object, etc.

Pages calling these never see raw network errors — failures bubble up as rejected promises with a clean error message, and the page is expected to render a fallback UI in its `.catch()`.

---

## Security

- All user-supplied strings are escaped via `BM.esc()` / `BM.escAttr()` before being injected into innerHTML.
- Auth area in the nav is built with DOM methods (not template strings) so a poisoned `braidmap_name` cannot inject HTML.
- `netlify.toml` sets `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and a strict `Referrer-Policy`.
- External links use `rel="noopener noreferrer"`.

---

## Deployment

Pushing to `main` triggers a Netlify deploy. There is no build command — Netlify serves the repo root as-is. Headers come from `netlify.toml`.

### Pre-deploy checklist
- [ ] `npm start` — open every page, click around, watch DevTools console for errors
- [ ] All 7 pages render at 375px / 768px / 1400px viewports
- [ ] Sign up, log out, log in cycle works (localStorage)
- [ ] Directory loads 121 stylists from JSON
- [ ] Profile page loads for `?id=BM-0114` (example)
- [ ] No console errors on any page

---

## Troubleshooting

**"Unable to load stylists" on a freshly cloned repo**
→ You're probably opening the HTML file directly (`file://...`). Run `npm start` and use `http://localhost:3000`.

**Inline page script errors `BM is not defined`**
→ Check that all 8 `<script>` tags in the page `<head>` are present and in the documented order. The shim (`js/braidmap.js`) must load last.

**Stylist data appears stale after editing `braidmap_data.json`**
→ `BM.data` caches in memory. Hard-refresh the page (Ctrl+Shift+R) or call `BM.data.clearCache()` in DevTools.

**Nav avatar shows "M" instead of the user's initial**
→ `localStorage.braidmap_name` is missing or empty. `BM.userInitial` falls back to `M` for empty input.

---

## Known Limitations

- Auth is `localStorage`-only — no real accounts, passwords, or server.
- Stylist data is static JSON — adding a new stylist requires editing `braidmap_data.json` and committing.
- Report/suggest forms post to Netlify Forms (requires Netlify hosting to work).
- Directory renders all 121 stylists at once — no virtual scrolling. Currently fine; revisit at 500+.

---

## License

Proprietary. © BraidMap.
