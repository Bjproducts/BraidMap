/**
 * BraidMap — ui.js
 * Small UI utilities shared across pages: toast notifications,
 * button loading states, and skeleton card factories. No frameworks,
 * no heavy DOM rewrites — just polish helpers.
 *
 * Public API:
 *   BM.ui.toast(message, opts)              // opts: { type:'info'|'success'|'error', duration }
 *   BM.ui.setLoading(buttonEl, isLoading)   // disables + shows spinner inline
 *   BM.ui.skeletonCard()                    // returns HTMLElement skeleton card
 *   BM.ui.skeletonCardHtml()                // returns HTML string for inline grid
 */
(function (root) {
  'use strict';
  var BM  = root.BM = root.BM || {};

  // ── Toast ─────────────────────────────────────────────────────────────────
  var _toastWrap = null;
  function ensureToastWrap() {
    if (_toastWrap && document.body.contains(_toastWrap)) return _toastWrap;
    _toastWrap = document.createElement('div');
    _toastWrap.className = 'bm-toast-wrap';
    _toastWrap.setAttribute('role', 'status');
    _toastWrap.setAttribute('aria-live', 'polite');
    document.body.appendChild(_toastWrap);
    return _toastWrap;
  }

  function toast(message, opts) {
    opts = opts || {};
    var type     = opts.type || 'info';
    var duration = opts.duration || 3200;
    var wrap     = ensureToastWrap();

    var el = document.createElement('div');
    el.className = 'bm-toast bm-toast--' + type;
    el.textContent = String(message == null ? '' : message);
    wrap.appendChild(el);

    // Force reflow then add .show for the CSS transition
    /* eslint-disable no-unused-expressions */
    el.offsetHeight;
    /* eslint-enable no-unused-expressions */
    el.classList.add('show');

    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
    }, duration);
  }

  // ── Button loading state ──────────────────────────────────────────────────
  function setLoading(btn, isLoading) {
    if (!btn) return;
    if (isLoading) {
      if (btn._bmLoading) return;
      btn._bmLoading = true;
      btn._bmOriginalHtml = btn.innerHTML;
      btn._bmOriginalDisabled = btn.disabled;
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.classList.add('is-loading');
      btn.innerHTML = '<span class="bm-spinner" aria-hidden="true"></span><span class="bm-btn-text">Loading…</span>';
    } else {
      if (!btn._bmLoading) return;
      btn._bmLoading = false;
      btn.disabled = !!btn._bmOriginalDisabled;
      btn.removeAttribute('aria-busy');
      btn.classList.remove('is-loading');
      if (btn._bmOriginalHtml != null) btn.innerHTML = btn._bmOriginalHtml;
      btn._bmOriginalHtml = null;
    }
  }

  // ── Skeleton card ─────────────────────────────────────────────────────────
  function skeletonCardHtml() {
    return (
      '<div class="card card--skeleton" aria-hidden="true">' +
        '<div class="card-body">' +
          '<div class="card-head">' +
            '<div class="skeleton sk-av"></div>' +
            '<div class="skeleton sk-badge"></div>' +
          '</div>' +
          '<div class="skeleton sk-line sk-line--name"></div>' +
          '<div class="skeleton sk-line sk-line--handle"></div>' +
          '<div class="sk-tags">' +
            '<div class="skeleton sk-tag"></div>' +
            '<div class="skeleton sk-tag"></div>' +
            '<div class="skeleton sk-tag"></div>' +
          '</div>' +
        '</div>' +
        '<div class="card-footer">' +
          '<div class="skeleton sk-line sk-line--short"></div>' +
          '<div class="skeleton sk-btn"></div>' +
        '</div>' +
      '</div>'
    );
  }

  function skeletonGrid(count) {
    count = count || 6;
    var html = '';
    for (var i = 0; i < count; i++) html += skeletonCardHtml();
    return '<div class="cards-grid">' + html + '</div>';
  }

  BM.ui = {
    toast:           toast,
    setLoading:      setLoading,
    skeletonCardHtml: skeletonCardHtml,
    skeletonGrid:    skeletonGrid
  };
}(window));
