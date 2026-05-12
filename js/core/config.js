/**
 * BraidMap — config.js
 * Single source of truth for constants, storage keys, and runtime settings.
 * Loaded first. Attaches to window.BM.config.
 */
(function (root) {
  'use strict';
  var BM = root.BM = root.BM || {};

  BM.config = {
    // localStorage keys
    keys: {
      auth:   'braidmap_signed_up',
      name:   'braidmap_name',
      email:  'braidmap_email',
      recent: 'braidmap_recent'
    },

    // Data
    dataUrl:         'braidmap_data.json',

    // Fetch defaults
    fetchTimeoutMs:  10000,
    fetchRetries:    2,
    fetchRetryDelay: 500,

    // Routes
    routes: {
      home:      'index.html',
      auth:      'braidmap-auth.html',
      directory: 'braidmap-directory.html',
      profile:   'braidmap-profile.html',
      member:    'braidmap-member.html',
      report:    'braidmap-report.html',
      suggest:   'braidmap-suggest.html'
    },

    // UI
    recentLimit:  6,
    freeLimit:    3,

    // Build / env
    version: '1.1.0',
    debug:   false
  };
}(window));
