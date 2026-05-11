/**
 * BraidMap — shared auth, nav, and utility module.
 * Load this script on every page before any page-specific scripts.
 */
const BM = (function () {
  'use strict';

  // ── Storage keys ──────────────────────────────────────────────────────────
  const AUTH_KEY   = 'braidmap_signed_up';
  const NAME_KEY   = 'braidmap_name';
  const EMAIL_KEY  = 'braidmap_email';
  const RECENT_KEY = 'braidmap_recent';

  // ── Auth ──────────────────────────────────────────────────────────────────
  function isLoggedIn() {
    return localStorage.getItem(AUTH_KEY) === 'true';
  }

  function getUser() {
    return {
      name:  localStorage.getItem(NAME_KEY)  || '',
      email: localStorage.getItem(EMAIL_KEY) || ''
    };
  }

  function login(name, email) {
    localStorage.setItem(AUTH_KEY, 'true');
    if (name)  localStorage.setItem(NAME_KEY,  name);
    if (email) localStorage.setItem(EMAIL_KEY, email);
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(NAME_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(RECENT_KEY);
    window.location.href = 'index.html';
  }

  function getRecent() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function saveRecent(arr) {
    localStorage.setItem(RECENT_KEY, JSON.stringify(arr));
  }

  function addRecent(id) {
    const r = [id, ...getRecent().filter(function (x) { return x !== id; })].slice(0, 6);
    saveRecent(r);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function userInitial(name) {
    return ((name || '').replace(/[^a-zA-Z]/g, '')[0] || 'M').toUpperCase();
  }

  /** Escape text for safe insertion into innerHTML. */
  function esc(str) {
    var d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  }

  /** Escape a value for use inside an HTML attribute (href, value, etc.). */
  function escAttr(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/'/g, '&#39;');
  }

  // ── Booking URL helpers ───────────────────────────────────────────────────
  /** Returns true only for real http/https URLs; rejects DM-style text. */
  function isValidBookingUrl(booking) {
    if (!booking || typeof booking !== 'string') return false;
    var t = booking.trim();
    if (/^(dm[\s/]|dms[\s/]|message|call[\s/]|schedule\s+appointment)/i.test(t)) return false;
    return /^https?:\/\//i.test(t);
  }

  /** Upgrades insecure http:// booking links to https://. */
  function safeBookingUrl(url) {
    if (!url) return '';
    return url.replace(/^http:\/\//i, 'https://');
  }

  // ── Nav rendering ─────────────────────────────────────────────────────────
  /**
   * Renders the nav based on current auth state.
   * Updates: #navLinks (desktop link list), #navRight (desktop auth area),
   * and #mobileMenu (mobile drawer links).
   * Safe to call multiple times; always reflects current auth state.
   */
  function renderNav() {
    var loggedIn  = isLoggedIn();
    var user      = getUser();
    var initial   = userInitial(user.name);
    var firstName = user.name ? user.name.split(' ')[0] : 'My Profile';
    var currentHref = window.location.href;

    // ── Desktop nav link list ─────────────────────────────────────────────
    var navLinks = document.getElementById('navLinks');
    if (navLinks) {
      navLinks.innerHTML = '';
      var desktopItems = loggedIn
        ? [
            ['braidmap-directory.html', 'Find a Stylist'],
            ['braidmap-report.html',    'Report an Issue'],
            ['braidmap-suggest.html',   'Suggest a Stylist']
          ]
        : [
            ['braidmap-directory.html', 'Find a Stylist']
          ];

      desktopItems.forEach(function (item) {
        var href  = item[0];
        var label = item[1];
        var li = document.createElement('li');
        var a  = document.createElement('a');
        a.href        = href;
        a.textContent = label;
        if (currentHref.includes(href)) a.classList.add('active');
        li.appendChild(a);
        navLinks.appendChild(li);
      });
    }

    // ── Desktop navRight (auth buttons / avatar) ──────────────────────────
    var navRight = document.getElementById('navRight');
    if (navRight) {
      while (navRight.firstChild) navRight.removeChild(navRight.firstChild);

      if (loggedIn) {
        var link        = document.createElement('a');
        link.href       = 'braidmap-member.html';
        link.setAttribute('aria-label', 'My Profile');
        link.style.cssText =
          'display:flex;align-items:center;gap:8px;text-decoration:none;';

        var av = document.createElement('div');
        av.style.cssText =
          'width:32px;height:32px;background:#0A0A0A;border-radius:50%;' +
          'display:flex;align-items:center;justify-content:center;' +
          'font-family:\'Instrument Serif\',serif;font-style:italic;' +
          'font-size:14px;color:white;flex-shrink:0;';
        av.textContent = initial;

        var nm = document.createElement('span');
        nm.style.cssText =
          'font-size:13px;color:#555;font-family:\'Manrope\',sans-serif;font-weight:500;';
        nm.textContent = firstName;

        link.appendChild(av);
        link.appendChild(nm);
        navRight.appendChild(link);
      } else {
        var logBtn = document.createElement('a');
        logBtn.href = 'braidmap-auth.html?tab=login';
        logBtn.style.cssText =
          'font-size:13px;color:#555;text-decoration:none;padding:8px 14px;' +
          'border-radius:6px;border:1px solid #E0E0E0;' +
          'font-family:\'Manrope\',sans-serif;display:inline-block;margin-right:8px;' +
          'transition:border-color .15s,color .15s;';
        logBtn.textContent = 'Log In';

        var joinBtn = document.createElement('a');
        joinBtn.href = 'braidmap-auth.html';
        joinBtn.style.cssText =
          'font-size:13px;font-weight:600;color:white;background:#0A0A0A;' +
          'text-decoration:none;padding:9px 20px;border-radius:6px;' +
          'display:inline-block;font-family:\'Manrope\',sans-serif;' +
          'transition:opacity .15s;';
        joinBtn.textContent = 'Join Free';

        navRight.appendChild(logBtn);
        navRight.appendChild(joinBtn);
      }
    }

    // ── Mobile menu ───────────────────────────────────────────────────────
    var mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
      mobileMenu.innerHTML = '';

      var mobileItems = loggedIn
        ? [
            ['braidmap-directory.html', 'Find a Stylist'],
            ['braidmap-report.html',    'Report an Issue'],
            ['braidmap-suggest.html',   'Suggest a Stylist'],
            ['braidmap-member.html',    'My Profile']
          ]
        : [
            ['braidmap-directory.html',      'Find a Stylist'],
            ['braidmap-auth.html?tab=login', 'Log In'],
            ['braidmap-auth.html',           'Join Free']
          ];

      mobileItems.forEach(function (item) {
        var a         = document.createElement('a');
        a.href        = item[0];
        a.textContent = item[1];
        mobileMenu.appendChild(a);
      });

      if (loggedIn) {
        var signOut   = document.createElement('a');
        signOut.href  = '#';
        signOut.textContent = 'Sign Out';
        signOut.addEventListener('click', function (e) {
          e.preventDefault();
          logout();
        });
        mobileMenu.appendChild(signOut);
      }
    }
  }

  // ── Hamburger toggle (wired once, shared across all pages) ────────────────
  document.addEventListener('DOMContentLoaded', function () {
    var hamburger  = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobileMenu');
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', function () {
        mobileMenu.classList.toggle('open');
      });
    }
  });

  // ── Public API ────────────────────────────────────────────────────────────
  return {
    // Auth
    isLoggedIn:   isLoggedIn,
    getUser:      getUser,
    login:        login,
    logout:       logout,
    getRecent:    getRecent,
    saveRecent:   saveRecent,
    addRecent:    addRecent,
    userInitial:  userInitial,
    // Escaping
    esc:          esc,
    escAttr:      escAttr,
    // Booking
    isValidBookingUrl: isValidBookingUrl,
    safeBookingUrl:    safeBookingUrl,
    // Nav
    renderNav:    renderNav,
    // Legacy aliases kept for any remaining inline references
    isSignedUp:   isLoggedIn,
    getUserName:  function () { return getUser().name; },
    getUserEmail: function () { return getUser().email; },
    markSignedUp: login,
    updateNav:    renderNav
  };
}());
