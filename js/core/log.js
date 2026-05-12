/**
 * BraidMap — log.js
 * Safe console wrappers. Tags messages with "BraidMap:" prefix so they
 * stand out in DevTools, and respects BM.config.debug.
 */
(function (root) {
  'use strict';
  var BM = root.BM = root.BM || {};
  var cfg = BM.config || {};

  function safe(method, args) {
    if (typeof console === 'undefined' || typeof console[method] !== 'function') return;
    try { console[method].apply(console, args); } catch (e) { /* swallow */ }
  }

  BM.log = {
    info: function () {
      if (!cfg.debug) return;
      var args = ['[BraidMap]'].concat(Array.prototype.slice.call(arguments));
      safe('log', args);
    },
    warn: function () {
      var args = ['[BraidMap]'].concat(Array.prototype.slice.call(arguments));
      safe('warn', args);
    },
    error: function () {
      var args = ['[BraidMap]'].concat(Array.prototype.slice.call(arguments));
      safe('error', args);
    }
  };
}(window));
