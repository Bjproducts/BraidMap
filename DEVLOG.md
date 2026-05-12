# BraidMap — Development Log

**Project:** BraidMap
**Repo:** https://github.com/Bjproducts/BraidMap
**Deployed on:** Netlify (static site, no backend)
**Stack:** Vanilla HTML · CSS · JavaScript · `localStorage` auth · `braidmap_data.json`
**Version:** 1.1.0

---

## Overview

BraidMap is a static directory of BIPOC hairstylists in British Columbia. Members can browse stylists, view profiles, report issues, and suggest new stylists. Authentication is simulated via `localStorage` — no server, no database, no build step.

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
│   └── braidmap.css            Shared stylesheet (18 organized sections)
├── js/
│   ├── core/                   Modular BraidMap core
│   │   ├── config.js           Constants, storage keys, routes, fetch defaults
│   │   ├── log.js              Prefixed console wrappers
│   │   ├── storage.js          Safe localStorage wrapper (never throws)
│   │   ├── utils.js            esc, escAttr, debounce, urlParam, booking helpers
│   │   ├── auth.js             login, logout, getUser, recents
│   │   ├── data.js             fetchJson (timeout + retry + cache), loadStylists
│   │   └── nav.js              renderNav + hamburger wiring
│   └── braidmap.js             Compatibility shim — exposes flat BM.xxx API
├── netlify.toml                Security headers + deploy config
├── package.json                npm start / npm run dev
├── README.md                   Setup, API reference, troubleshooting
└── DEVLOG.md                   This file
```

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

## Hardening Phases — Completed

### Phase 1 — Responsiveness Refinement ✅

Three breakpoints across all 7 pages, declared in the **correct cascade order** (wide → narrow):

| Breakpoint | Target | Key changes |
|-----------|--------|-------------|
| 1024px | Tablet | 2-col card grids, narrower sidebar, reduced padding |
| 768px  | Mobile | Hamburger nav, single-column layouts, stacked form rows |
| 480px  | Small mobile | Tighter padding on modals/hero/gates |

### Phase 2 — CSS Systemization ✅

Created `css/braidmap.css` — single shared stylesheet with **18 organized sections**:

1. Custom Properties (color palette, spacing scale, radius, fonts, easings)
2. Reset & Base
3. Accessibility (skip-link, focus-visible, reduced-motion, sr-only)
4. Typography (eyebrows, section titles)
5. Navigation (fixed nav, logo, links, auth area)
6. Mobile Navigation (hamburger, mobile drawer)
7. Hero Section (dark background with grid overlay)
8. Buttons (primary, submit, secondary, gate, lock)
9. Form Controls (inputs, labels, error/success messages)
10. Gate Overlay (sign-up modal)
11. Modal Overlays (generic modal)
12. Lock Banner (paywall)
13. Footer
14. Animations (fadeUp, reveal, skeleton, spinner)
15. Utility Classes
16. Responsive — Tablet (1024px)
17. Responsive — Mobile (768px)
18. Responsive — Small Mobile (480px)

Inline CSS per page reduced from 100–700 lines down to **30–80 lines** of page-specific rules only.

**Design tokens:**
```css
--g100: #F2F2F2;  --g200: #E0E0E0;  --g400: #A0A0A0;  --g600: #555555;  --g800: #222222;
--sp-xs:4  --sp-sm:8  --sp-md:16  --sp-lg:32  --sp-xl:48  --sp-2xl:64  --sp-3xl:80  (px)
--radius-sm:4  --radius-md:7  --radius-lg:10  --radius-xl:16  (px)
--font-serif: 'Instrument Serif';  --font-mono: 'DM Mono';  --font-sans: 'Manrope';
```

### Phase 3 — JavaScript Modularization ✅

Split the monolithic `js/braidmap.js` into `js/core/*` modules. No build step — modules attach to `window.BM` and are loaded in dependency order via `<script>` tags.

**Loading order on every HTML page:**
```html
<script src="js/core/config.js"></script>
<script src="js/core/log.js"></script>
<script src="js/core/storage.js"></script>
<script src="js/core/utils.js"></script>
<script src="js/core/auth.js"></script>
<script src="js/core/data.js"></script>
<script src="js/core/nav.js"></script>
<script src="js/braidmap.js"></script>   <!-- shim exposing flat API -->
```

**Backward compatibility:** Every existing call (`BM.isLoggedIn()`, `BM.esc()`, `BM.renderNav()`, etc.) still works. Inline page scripts required **zero changes**. Legacy aliases preserved: `BM.isSignedUp`, `BM.getUserName`, `BM.getUserEmail`, `BM.markSignedUp`, `BM.updateNav`.

### Phase 4 — Data & Fetch Hardening ✅

`BM.data.fetchJson(url, opts)` implements:

- **AbortController timeout** — default 10s, configurable
- **Retry with linear backoff** — default 2 retries × 500ms
- **In-memory cache** — keyed by URL; second call returns in 0ms
- **Clean error reporting** — rejected promises with `[BraidMap]`-prefixed log messages

`BM.loadStylists()` adds **defensive normalization** — guarantees:
- `data.stylists` is an array (never undefined)
- `data.tag_labels` is an object
- `data.cities` is an array
- `data.style_counts` is an object

Directory, profile, and member pages all migrated from raw `fetch('braidmap_data.json')` to `BM.loadStylists()`. The three pages now share **one cached fetch** — navigating between them is instant on the second visit.

### Phase 5 — Accessibility & SEO ✅

- **Skip links** on all 7 pages
- **ARIA**: `role="tablist/tab/tabpanel"` on auth tabs, `role="radiogroup/radio"` + `aria-checked` on report issue types, `role="checkbox"` + `aria-checked` on suggest tags, `aria-pressed` on directory city pills, `aria-expanded` on mobile filter button, `aria-label` on close buttons
- **Keyboard support**: Enter/Space handlers on all custom interactive elements
- **Focus-visible outlines**: keyboard-only 2px solid black
- **Reduced motion**: `prefers-reduced-motion: reduce` disables animations
- **Screen reader**: `.sr-only` utility for hidden labels
- **Open Graph tags** + meta descriptions + SVG favicon on every page
- **`rel="noopener noreferrer"`** on all external links

### Phase 6 — Performance ✅ (partial)

- Search input in directory uses `BM.utils.debounce(fn, 120)` — no re-render per keystroke
- Hamburger event listener guarded by `_bmWired` flag — prevents double-binding
- Fetch cache means directory ↔ profile ↔ member share one network round-trip

### Phase 7 — Security & XSS ✅

- All JSON data → `BM.esc()` before `innerHTML` injection
- Attribute values → `BM.escAttr()`
- Member form values set via `.value` property (not template literals)
- Nav auth area built with DOM methods (not template strings) — poisoned `braidmap_name` cannot inject HTML
- `netlify.toml` headers:
  ```toml
  X-Frame-Options = "DENY"
  X-Content-Type-Options = "nosniff"
  Referrer-Policy = "strict-origin-when-cross-origin"
  ```

### Phase 8 — Dev Tooling ✅

- `package.json` with `npm start` / `npm run dev` / `npm run serve` scripts
- `README.md` with: local dev quickstart, project structure, full API reference, hardened-fetch notes, security notes, pre-deploy checklist, troubleshooting

---

## Public API — `window.BM`

### Auth
| Method | Description |
|--------|-------------|
| `BM.isLoggedIn()` | boolean |
| `BM.getUser()` | `{ name, email }` |
| `BM.login(name, email)` | persist auth |
| `BM.logout()` | clear keys + redirect |
| `BM.getRecent()` | array of recently-viewed stylist IDs |
| `BM.addRecent(id)` | prepend, dedupe, cap at `config.recentLimit` |

### Utilities
| Method | Description |
|--------|-------------|
| `BM.esc(str)` | XSS-safe for `innerHTML` |
| `BM.escAttr(str)` | XSS-safe for HTML attribute values |
| `BM.userInitial(name)` | first letter for avatars |
| `BM.isValidBookingUrl(url)` | accept only real http/https |
| `BM.safeBookingUrl(url)` | upgrade `http://` → `https://` |
| `BM.utils.debounce(fn, ms)` | trailing-edge debounce |
| `BM.utils.urlParam(name)` | safe URLSearchParams lookup |

### Data
| Method | Description |
|--------|-------------|
| `BM.loadStylists()` | `Promise<{ stylists, tag_labels, cities, style_counts }>` — cached, normalized |
| `BM.fetchJson(url, opts)` | generic fetch with timeout + retry + cache |
| `BM.data.clearCache()` | drop in-memory cache |

### Nav
| Method | Description |
|--------|-------------|
| `BM.renderNav()` | populate `#navLinks`, `#navRight`, `#mobileMenu` from current auth state |

### Storage & Config
| Method | Description |
|--------|-------------|
| `BM.storage.available` | false if localStorage is blocked |
| `BM.storage.getJSON / setJSON` | safe JSON-in-storage |
| `BM.config` | routes, keys, fetch defaults, version |
| `BM.log.info / .warn / .error` | prefixed, never-throw console calls |

### localStorage keys
```
braidmap_signed_up   — 'true' if logged in
braidmap_name        — user's name
braidmap_email       — user's email
braidmap_recent      — JSON array of recently viewed stylist IDs
```

---

## Per-Page Notes

| Page | Notable behavior |
|------|-----------------|
| `index.html` | Landing + gate modal. Tag pills are `<button>` for a11y. Escape/overlay-click dismisses gate. |
| `braidmap-auth.html` | Two tabs (signup/login) with ARIA tab pattern. Nav is `position: static` (override). |
| `braidmap-directory.html` | Filterable, debounced search, loading spinner, lock-banner for non-members, mobile filter drawer. |
| `braidmap-profile.html` | Loads single stylist by `?id=`. All external links carry `rel="noopener noreferrer"`. Modals use Escape-to-close. |
| `braidmap-member.html` | Editable name/email. Recently-viewed grid pulls from `BM.getRecent()`. Sign Out via `BM.logout()`. |
| `braidmap-report.html` | Issue-type chips with `role="radio"`. Pre-fills user details when logged in. |
| `braidmap-suggest.html` | Multi-step form with tag checkboxes (`role="checkbox"`). Pre-fills user details when logged in. |

---

## Critical Bug Fixes

### 1. Card "Book button on next line" — nested `<a>` tags
**Bug:** Directory card was an `<a>`, with a Book button (also `<a>`) inside its footer. HTML5 forbids nested anchors; the browser auto-closed the outer `<a>` at the inner one, leaving `.card-footer` as a sibling of `.card` instead of a child — footer appeared visually detached.
**Fix:** Changed outer wrapper to `<div role="link" tabindex="0" data-href="...">` with a click handler. Inner `<a class="card-body">` wraps the main link area. `.card-footer` is now a true sibling within the same div. Keyboard handler on Enter/Space. `cursor: pointer` on `.card`.

### 2. Media query order — broke mobile on all 7 pages
**Bug:** `@media (max-width: 768px)` was declared **before** `@media (max-width: 1024px)`. Both match at mobile widths; the tablet block won the CSS cascade because it came later — cards rendered 2-column on mobile.
**Fix:** Swapped order on all 7 HTML pages — tablet block first, then mobile last.

### 3. Report submit button never wired
**Bug:** `submitReportBtn` had no event listener.
**Fix:** Added `addEventListener('click', submitReport)`.

### 4. Member page dead code
**Bug:** `getRecent()` function referenced an undefined `RECENT_KEY` constant. Duplicate form value setting (const + var).
**Fix:** Removed the dead function (use `BM.getRecent()`). Consolidated the duplicate assignment.

### 5. Index featured cards — mismatched closing tags
**Bug:** `</a>` and `</div>` were out of order in the third featured card.
**Fix:** Corrected HTML structure.

### 6. Class name inconsistencies
**Before:** `.logo-m`, `.nav-l`, `.mobile-menu`, `--grey-100`–`--grey-800`
**After:** `.logo-mark`, `.nav-links`, `.nav-mobile-menu`, `--g100`–`--g800` (with `--grey-*` as aliases)

---

## QA Verification

| Page | 375px | 768px | 1400px | JS Errors | Skip Link | OG Tags | ARIA |
|------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| index.html | ✅ | ✅ | ✅ | 0 | ✅ | ✅ | ✅ |
| braidmap-directory.html | ✅ | ✅ | ✅ | 0 | ✅ | ✅ | ✅ |
| braidmap-profile.html | ✅ | ✅ | ✅ | 0 | ✅ | ✅ | ✅ |
| braidmap-auth.html | ✅ | ✅ | ✅ | 0 | ✅ | ✅ | ✅ |
| braidmap-member.html | ✅ | ✅ | ✅ | 0 | ✅ | ✅ | ✅ |
| braidmap-report.html | ✅ | ✅ | ✅ | 0 | ✅ | ✅ | ✅ |
| braidmap-suggest.html | ✅ | ✅ | ✅ | 0 | ✅ | ✅ | ✅ |

### Module / fetch tests
| Test | Result |
|------|--------|
| All 7 HTML pages | 200 OK |
| All 8 JS module files | 200 OK |
| Module load sanity (`BM.config`, `BM.auth`, `BM.utils`, `BM.data`, `BM.nav`, `BM.storage`, `BM.log`) | All present |
| Legacy aliases (`BM.isSignedUp`, `BM.updateNav`, etc.) | Working |
| `BM.loadStylists()` first call | 121 stylists, all fields normalized |
| `BM.loadStylists()` second call (cache) | 0ms, same object reference |
| `BM.fetchJson('does-not-exist.json', { retries: 1 })` | Properly rejects with `HTTP 404 on does-not-exist.json` after retry |
| Directory renders 121 cards | ✅ Zero console errors |
| Profile (`?id=BM-0114`) renders DES Curl Spa | ✅ Zero console errors |
| Card layout — body and footer flush | `gap_body_to_footer: 0` on short (1-tag) and tall (4-tag) cards |

---

## Deployment

- **Host:** Netlify (auto-deploys on push to `main`)
- **Build command:** none (static site)
- **Publish directory:** `.` (repo root)
- **Headers:** from `netlify.toml`

### Pre-deploy checklist
- [ ] `npm start` — open every page, click around, watch DevTools console
- [ ] All 7 pages render at 375px / 768px / 1400px
- [ ] Sign-up → log out → log in cycle works
- [ ] Directory loads 121 stylists from JSON
- [ ] Profile page loads for `?id=BM-0114`
- [ ] Zero console errors on any page

---

## Deferred Work

These would be high-risk refactors of currently-working code, so they're deferred until there's a concrete maintenance pain point.

### Page script extraction
Move inline `<script>` blocks from each HTML page into `js/pages/*.js`. Requires careful preservation of init order and per-page globals (STYLISTS, TAG_LABELS).

### Component extraction
Pull repeated UI patterns (card rendering, modal lifecycle, form validation) into `js/components/*.js`.

### Build pipeline
Optional rollup/esbuild step to concatenate `js/core/*.js` into a single `dist/braidmap.bundle.js` for production. Source-of-truth stays in `js/core/`.

---

## Known Limitations

- Auth is `localStorage`-only — no real accounts/passwords/server
- Stylist data is static JSON — adding a new stylist requires editing `braidmap_data.json` and committing
- Report/suggest forms post to Netlify Forms (requires Netlify hosting to function)
- Directory renders all 121 stylists at once — no virtual scrolling. Currently fine; revisit at 500+.

---

## Version History

| Version | Notes |
|---------|-------|
| 1.0.0 | Initial clean commit — shared BM module, dynamic data fetch, XSS-safe, Netlify-ready |
| 1.1.0 | Modular `js/core/` architecture · hardened fetch (timeout/retry/cache) · debounced search · `package.json` + `README.md` · responsive bug fixes · card layout rebuild |
