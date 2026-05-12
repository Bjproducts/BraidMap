/**
 * BraidMap — nav.js
 * Renders the desktop nav, auth area, and mobile drawer based on
 * current auth state. Uses DOM methods (not innerHTML) for user-supplied
 * strings, so a poisoned localStorage name can never inject HTML.
 *
 * Targets (must exist in page markup):
 *   #navLinks   — desktop <ul>
 *   #navRight   — desktop auth area
 *   #mobileMenu — mobile drawer
 *   #hamburger  — mobile open button
 */
(function (root) {
  'use strict';
  var BM     = root.BM = root.BM || {};
  var cfg    = BM.config;
  var auth   = BM.auth;
  var utils  = BM.utils;
  var routes = cfg.routes;

  function renderNav() {
    var loggedIn  = auth.isLoggedIn();
    var user      = auth.getUser();
    var initial   = utils.userInitial(user.name);
    var firstName = user.name ? user.name.split(' ')[0] : 'My Profile';
    var currentHref = window.location.href;

    // Desktop nav links
    var navLinks = document.getElementById('navLinks');
    if (navLinks) {
      navLinks.innerHTML = '';
      var desktopItems = loggedIn
        ? [
            [routes.directory, 'Find a Stylist'],
            [routes.report,    'Report an Issue'],
            [routes.suggest,   'Suggest a Stylist']
          ]
        : [
            [routes.directory, 'Find a Stylist']
          ];

      desktopItems.forEach(function (item) {
        var li = document.createElement('li');
        var a  = document.createElement('a');
        a.href        = item[0];
        a.textContent = item[1];
        if (currentHref.indexOf(item[0]) !== -1) a.classList.add('active');
        li.appendChild(a);
        navLinks.appendChild(li);
      });
    }

    // Desktop auth area
    var navRight = document.getElementById('navRight');
    if (navRight) {
      while (navRight.firstChild) navRight.removeChild(navRight.firstChild);

      if (loggedIn) {
        var link = document.createElement('a');
        link.href = routes.member;
        link.setAttribute('aria-label', 'My Profile');
        link.style.cssText = 'display:flex;align-items:center;gap:8px;text-decoration:none;';

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
        logBtn.href = routes.auth + '?tab=login';
        logBtn.style.cssText =
          'font-size:13px;color:#555;text-decoration:none;padding:8px 14px;' +
          'border-radius:6px;border:1px solid #E0E0E0;' +
          'font-family:\'Manrope\',sans-serif;display:inline-block;margin-right:8px;' +
          'transition:border-color .15s,color .15s;';
        logBtn.textContent = 'Log In';

        var joinBtn = document.createElement('a');
        joinBtn.href = routes.auth;
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

    // Mobile drawer
    var mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
      mobileMenu.innerHTML = '';

      var mobileItems = loggedIn
        ? [
            [routes.directory, 'Find a Stylist'],
            [routes.report,    'Report an Issue'],
            [routes.suggest,   'Suggest a Stylist'],
            [routes.member,    'My Profile']
          ]
        : [
            [routes.directory,            'Find a Stylist'],
            [routes.auth + '?tab=login',  'Log In'],
            [routes.auth,                 'Join Free']
          ];

      mobileItems.forEach(function (item) {
        var a = document.createElement('a');
        a.href        = item[0];
        a.textContent = item[1];
        mobileMenu.appendChild(a);
      });

      if (loggedIn) {
        var signOut = document.createElement('a');
        signOut.href = '#';
        signOut.textContent = 'Sign Out';
        signOut.addEventListener('click', function (e) {
          e.preventDefault();
          auth.logout();
        });
        mobileMenu.appendChild(signOut);
      }
    }
  }

  // Wire the hamburger toggle once on DOMContentLoaded.
  function wireHamburger() {
    var hamburger  = document.getElementById('hamburger');
    var mobileMenu = document.getElementById('mobileMenu');
    if (hamburger && mobileMenu && !hamburger._bmWired) {
      hamburger._bmWired = true;
      hamburger.addEventListener('click', function () {
        mobileMenu.classList.toggle('open');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireHamburger);
  } else {
    wireHamburger();
  }

  BM.nav = { renderNav: renderNav };
}(window));
