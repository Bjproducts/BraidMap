/**
 * BraidMap — storage.js
 * Safe localStorage wrapper. Returns null/false on quota errors, private
 * browsing modes, or missing storage. Never throws.
 */
(function (root) {
  'use strict';
  var BM = root.BM = root.BM || {};
  var log = BM.log || { warn: function(){}, info: function(){} };

  function available() {
    try {
      var t = '__bm_test__';
      localStorage.setItem(t, '1');
      localStorage.removeItem(t);
      return true;
    } catch (e) {
      return false;
    }
  }

  var ok = available();
  if (!ok) log.warn('localStorage unavailable — auth and recents disabled.');

  BM.storage = {
    available: ok,

    get: function (key) {
      if (!ok) return null;
      try { return localStorage.getItem(key); } catch (e) { return null; }
    },

    set: function (key, value) {
      if (!ok) return false;
      try { localStorage.setItem(key, value); return true; }
      catch (e) { log.warn('storage.set failed:', key, e); return false; }
    },

    remove: function (key) {
      if (!ok) return false;
      try { localStorage.removeItem(key); return true; } catch (e) { return false; }
    },

    getJSON: function (key, fallback) {
      var raw = this.get(key);
      if (raw == null) return fallback === undefined ? null : fallback;
      try { return JSON.parse(raw); }
      catch (e) { return fallback === undefined ? null : fallback; }
    },

    setJSON: function (key, value) {
      try { return this.set(key, JSON.stringify(value)); }
      catch (e) { return false; }
    }
  };
}(window));
