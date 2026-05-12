/**
 * BraidMap — data.js
 * Hardened JSON fetch utility:
 *   • timeout (AbortController)
 *   • retry with linear backoff
 *   • in-memory cache (per URL)
 *   • graceful error reporting
 * Also exposes BM.data.loadStylists() which is the single entry point
 * for the stylist dataset.
 */
(function (root) {
  'use strict';
  var BM   = root.BM = root.BM || {};
  var cfg  = BM.config;
  var log  = BM.log;

  var _cache = {}; // url -> { data, ts }

  /**
   * Fetch JSON with timeout + retry.
   * @param {string} url
   * @param {object} [opts] { timeout, retries, retryDelay, cache, signal }
   * @returns {Promise<any>}
   */
  function fetchJson(url, opts) {
    opts = opts || {};
    var timeout    = opts.timeout    != null ? opts.timeout    : cfg.fetchTimeoutMs;
    var retries    = opts.retries    != null ? opts.retries    : cfg.fetchRetries;
    var retryDelay = opts.retryDelay != null ? opts.retryDelay : cfg.fetchRetryDelay;
    var useCache   = opts.cache !== false;

    if (useCache && _cache[url]) {
      return Promise.resolve(_cache[url].data);
    }

    function attempt(remaining) {
      var ctrl = ('AbortController' in root) ? new AbortController() : null;
      var timer = setTimeout(function () {
        if (ctrl) ctrl.abort();
      }, timeout);

      var init = { method: 'GET', credentials: 'same-origin' };
      if (ctrl) init.signal = ctrl.signal;

      return fetch(url, init)
        .then(function (res) {
          clearTimeout(timer);
          if (!res.ok) throw new Error('HTTP ' + res.status + ' on ' + url);
          return res.json();
        })
        .then(function (data) {
          if (useCache) _cache[url] = { data: data, ts: Date.now() };
          return data;
        })
        .catch(function (err) {
          clearTimeout(timer);
          var aborted = err && (err.name === 'AbortError');
          var msg = aborted ? ('timeout after ' + timeout + 'ms') : (err && err.message) || 'fetch failed';
          if (remaining > 0) {
            log.warn('fetchJson retrying (' + remaining + ' left):', url, msg);
            return new Promise(function (resolve, reject) {
              setTimeout(function () {
                attempt(remaining - 1).then(resolve, reject);
              }, retryDelay);
            });
          }
          log.error('fetchJson failed:', url, msg);
          throw err;
        });
    }

    return attempt(retries);
  }

  /** Clears the in-memory cache (use on logout or explicit refresh). */
  function clearCache() { _cache = {}; }

  /** Load the BraidMap stylist dataset (singleton-cached). */
  function loadStylists() {
    return fetchJson(cfg.dataUrl).then(function (data) {
      // Defensive normalization — never let undefined break a page
      data = data || {};
      data.stylists     = Array.isArray(data.stylists)     ? data.stylists     : [];
      data.tag_labels   = (data.tag_labels   && typeof data.tag_labels   === 'object') ? data.tag_labels   : {};
      data.cities       = Array.isArray(data.cities)       ? data.cities       : [];
      data.style_counts = (data.style_counts && typeof data.style_counts === 'object') ? data.style_counts : {};
      return data;
    });
  }

  BM.data = {
    fetchJson:    fetchJson,
    loadStylists: loadStylists,
    clearCache:   clearCache
  };
}(window));
