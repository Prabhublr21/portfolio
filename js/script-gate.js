/* ============================================================
   CASE STUDY COACH — private page gate
   ------------------------------------------------------------
   Separate from the case-study gate (js/gate.js): different
   password, different storage key, so sharing one never exposes
   the other.

   NOTE: this is a deterrent, not real security. The page source
   is served to the browser before the password is entered, and
   this repository is public. Treat anything on this page as
   readable by a determined person.

   To change the password:
     1. printf '%s' 'NewPassword' | base64
     2. Replace ENCODED below with the output.
     3. Bump STORAGE_KEY to force everyone to re-enter it.
   ============================================================ */

(function () {
  'use strict';

  var ENCODED     = 'c2NyaXB0QDIwMjY='; // base64 of "script@2026"
  var STORAGE_KEY = 'pf_script_gate_v1';

  try {
    if (sessionStorage.getItem(STORAGE_KEY) === 'granted') return;
  } catch (e) { /* private mode — fall through and prompt */ }

  var css = document.createElement('style');
  css.id = 'sg-style';
  css.textContent = [
    'body{visibility:hidden;}',
    'body.sg-on{visibility:visible;}',
    'body.sg-on > *:not(#sg){display:none !important;}',
    '#sg{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;',
    '  justify-content:center;padding:24px;background:#F1F3EF;',
    '  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}',
    '@media (prefers-color-scheme: dark){#sg{background:#0D1414;}}',
    '.sg__box{width:100%;max-width:400px;padding:40px 32px;background:#FFFFFF;',
    '  border-radius:16px;box-shadow:0 8px 40px rgba(20,30,28,.10);text-align:center;}',
    '@media (prefers-color-scheme: dark){.sg__box{background:#141D1D;box-shadow:0 8px 40px rgba(0,0,0,.5);}}',
    '.sg__eyebrow{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;',
    '  letter-spacing:.09em;text-transform:uppercase;color:#0B7A6C;margin:0 0 10px;}',
    '@media (prefers-color-scheme: dark){.sg__eyebrow{color:#35C9B0;}}',
    '.sg__title{font-family:Georgia,serif;font-size:24px;font-weight:700;color:#16211E;margin:0 0 8px;}',
    '@media (prefers-color-scheme: dark){.sg__title{color:#EAEFEE;}}',
    '.sg__desc{font-size:14px;line-height:1.5;color:#4E5F5A;margin:0 0 22px;}',
    '@media (prefers-color-scheme: dark){.sg__desc{color:#93A6A3;}}',
    '#sg-form{display:flex;flex-direction:column;gap:10px;}',
    '#sg-input{width:100%;box-sizing:border-box;padding:14px 16px;font-size:16px;',
    '  font-family:inherit;border:1px solid #D2D8D4;border-radius:10px;background:#F7F9F7;color:#16211E;}',
    '#sg-input:focus{outline:none;border-color:#0E9483;background:#fff;}',
    '@media (prefers-color-scheme: dark){#sg-input{background:#1B2626;border-color:#2B3A39;color:#EAEFEE;}',
    '  #sg-input:focus{background:#22302F;border-color:#35C9B0;}}',
    '#sg-form button{padding:14px 20px;font-size:15px;font-weight:600;font-family:inherit;',
    '  border:none;border-radius:10px;background:#0E9483;color:#fff;cursor:pointer;}',
    '#sg-form button:hover{background:#0B7A6C;}',
    '@media (prefers-color-scheme: dark){#sg-form button{background:#35C9B0;color:#06231F;}}',
    '.sg__err{min-height:20px;margin:12px 0 0;font-size:13px;font-weight:500;color:#B23A48;}',
    '@media (prefers-color-scheme: dark){.sg__err{color:#E88;}}'
  ].join('');
  document.head.appendChild(css);

  function build() {
    document.body.classList.add('sg-on');

    var wrap = document.createElement('div');
    wrap.id = 'sg';
    wrap.innerHTML =
      '<div class="sg__box">' +
        '<p class="sg__eyebrow">Private</p>' +
        '<h1 class="sg__title">Case Study Coach</h1>' +
        '<p class="sg__desc">This page is not listed anywhere. Enter the access password to continue.</p>' +
        '<form id="sg-form" autocomplete="off">' +
          '<input type="password" id="sg-input" placeholder="Password" ' +
                 'autocomplete="current-password" autocapitalize="off" ' +
                 'autocorrect="off" spellcheck="false" required>' +
          '<button type="submit">Unlock</button>' +
        '</form>' +
        '<p class="sg__err" id="sg-err" role="alert"></p>' +
      '</div>';
    document.body.appendChild(wrap);

    var form  = document.getElementById('sg-form');
    var input = document.getElementById('sg-input');
    var err   = document.getElementById('sg-err');

    input.focus();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var expected;
      try { expected = atob(ENCODED); } catch (x) { expected = null; }

      if (expected !== null && input.value === expected) {
        try { sessionStorage.setItem(STORAGE_KEY, 'granted'); } catch (x) {}
        wrap.remove();
        document.body.classList.remove('sg-on');
        var s = document.getElementById('sg-style');
        if (s) s.remove();
      } else {
        err.textContent = 'Incorrect password — try again.';
        input.value = '';
        input.focus();
      }
    });
  }

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
