/**
 * BraidMap — auth.js
 * localStorage-backed auth + recently-viewed list.
 * No server. No passwords. Pure client state.
 */
(function (root) {
  'use strict';
  var BM   = root.BM = root.BM || {};
  var cfg  = BM.config;
  var s    = BM.storage;
  var keys = cfg.keys;

  function isLoggedIn() {
    return s.get(keys.auth) === 'true';
  }

  function getUser() {
    return {
      name:  s.get(keys.name)  || '',
      email: s.get(keys.email) || ''
    };
  }

  function login(name, email) {
    s.set(keys.auth, 'true');
    if (name)  s.set(keys.name,  name);
    if (email) s.set(keys.email, email);
  }

  function logout() {
    s.remove(keys.auth);
    s.remove(keys.name);
    s.remove(keys.email);
    s.remove(keys.recent);
    window.location.href = cfg.routes.home;
  }

  function getRecent() {
    var arr = s.getJSON(keys.recent, []);
    return Array.isArray(arr) ? arr : [];
  }

  function saveRecent(arr) {
    if (!Array.isArray(arr)) return false;
    return s.setJSON(keys.recent, arr);
  }

  function addRecent(id) {
    if (!id) return;
    var limit = cfg.recentLimit || 6;
    var next  = [id].concat(getRecent().filter(function (x) { return x !== id; })).slice(0, limit);
    saveRecent(next);
  }

  BM.auth = {
    isLoggedIn: isLoggedIn,
    getUser:    getUser,
    login:      login,
    logout:     logout,
    getRecent:  getRecent,
    saveRecent: saveRecent,
    addRecent:  addRecent
  };
}(window));
