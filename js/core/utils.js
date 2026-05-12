/**
 * BraidMap — utils.js
 * Pure helpers: XSS-safe escaping, initials, booking URL validation,
 * URL params, debounce. No side effects, no DOM mutations.
 */
(function (root) {
  'use strict';
  var BM = root.BM = root.BM || {};

  function userInitial(name) {
    return ((name || '').replace(/[^a-zA-Z]/g, '')[0] || 'M').toUpperCase();
  }

  /** Escape text for safe insertion into innerHTML. */
  function esc(str) {
    var d = document.createElement('div');
    d.textContent = String(str == null ? '' : str);
    return d.innerHTML;
  }

  /** Escape a value for use inside an HTML attribute (href, value, etc.). */
  function escAttr(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/'/g, '&#39;');
  }

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
    return String(url).replace(/^http:\/\//i, 'https://');
  }

  /** Read a single URL param safely. */
  function urlParam(name) {
    try {
      var p = new URLSearchParams(window.location.search);
      return p.get(name);
    } catch (e) { return null; }
  }

  /** Simple trailing-edge debounce. */
  function debounce(fn, wait) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait || 150);
    };
  }

  BM.utils = {
    userInitial:       userInitial,
    esc:               esc,
    escAttr:           escAttr,
    isValidBookingUrl: isValidBookingUrl,
    safeBookingUrl:    safeBookingUrl,
    urlParam:          urlParam,
    debounce:          debounce
  };
}(window));
