/**
 * BraidMap — braidmap.js (entry / compatibility shim)
 *
 * Loaded LAST after all core/* modules. Re-exposes the flat BM.xxx
 * API that existing inline page scripts depend on, so we get modular
 * source files with zero changes to page-level code.
 *
 * Load order (see each HTML page):
 *   1. js/core/config.js
 *   2. js/core/log.js
 *   3. js/core/storage.js
 *   4. js/core/utils.js
 *   5. js/core/auth.js
 *   6. js/core/data.js
 *   7. js/core/nav.js
 *   8. js/braidmap.js   ← this file (shim)
 */
(function (root) {
  'use strict';
  var BM = root.BM = root.BM || {};

  if (!BM.config || !BM.auth || !BM.utils || !BM.nav || !BM.data) {
    (BM.log || console).error('BraidMap: core modules missing. Check script load order.');
    return;
  }

  // ── Flat API (current contract) ───────────────────────────────────────────
  BM.isLoggedIn        = BM.auth.isLoggedIn;
  BM.getUser           = BM.auth.getUser;
  BM.login             = BM.auth.login;
  BM.logout            = BM.auth.logout;
  BM.getRecent         = BM.auth.getRecent;
  BM.saveRecent        = BM.auth.saveRecent;
  BM.addRecent         = BM.auth.addRecent;

  BM.userInitial       = BM.utils.userInitial;
  BM.esc               = BM.utils.esc;
  BM.escAttr           = BM.utils.escAttr;
  BM.isValidBookingUrl = BM.utils.isValidBookingUrl;
  BM.safeBookingUrl    = BM.utils.safeBookingUrl;

  BM.renderNav         = BM.nav.renderNav;

  // ── Legacy aliases ────────────────────────────────────────────────────────
  BM.isSignedUp   = BM.auth.isLoggedIn;
  BM.getUserName  = function () { return BM.auth.getUser().name; };
  BM.getUserEmail = function () { return BM.auth.getUser().email; };
  BM.markSignedUp = BM.auth.login;
  BM.updateNav    = BM.nav.renderNav;

  // ── Convenience: expose fetch utility at top level too ────────────────────
  BM.fetchJson    = BM.data.fetchJson;
  BM.loadStylists = BM.data.loadStylists;

  BM.log.info('BraidMap', BM.config.version, 'ready.');
}(window));
