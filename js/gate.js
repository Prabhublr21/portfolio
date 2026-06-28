/* ============================================================
   PRABHAKAR SEENAPPA — PORTFOLIO
   Case-study password gate (client-side deterrent)
   ------------------------------------------------------------
   NOTE: This is a deterrent, NOT real security. A determined
   visitor with browser dev tools can bypass it. Do not put
   any genuinely confidential or NDA-bound content behind it.

   To change the password later:
   1. Run in terminal:
        printf '%s' 'YourNewPassword' | base64
   2. Replace the value of ENCODED below with the output.
   3. Optionally bump STORAGE_KEY so existing logged-in
      visitors are forced to re-enter the new password.
   ============================================================ */

(function () {
  'use strict';

  const ENCODED     = 'Zm9saW9hY2Nlc3NAMjAyNg=='; // base64 of "folioaccess@2026"
  const STORAGE_KEY = 'pf_gate_2026';

  if (sessionStorage.getItem(STORAGE_KEY) === 'granted') return;

  /* Inject lock + gate styles before body renders */
  const css = document.createElement('style');
  css.id = 'pf-gate-style';
  css.textContent = `
    body { visibility: hidden; }
    body.pf-gate-active { visibility: visible; }
    body.pf-gate-active > *:not(#pf-gate) { display: none !important; }

    #pf-gate {
      position: fixed; inset: 0; z-index: 99999;
      display: flex; align-items: center; justify-content: center;
      background: #F5F5F5;
      font-family: 'Inter', system-ui, -apple-system, Segoe UI, sans-serif;
      padding: 24px;
    }
    .pf-gate__box {
      max-width: 440px; width: 100%;
      padding: 48px 40px;
      background: #FFFFFF;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.08);
      text-align: center;
    }
    .pf-gate__logo {
      font-weight: 700; font-size: 22px;
      color: #1E1E1E; margin-bottom: 32px;
      display: inline-flex; align-items: center;
    }
    .pf-gate__dot {
      display: inline-block; width: 8px; height: 8px;
      background: #4F6479; border-radius: 9999px;
      margin-left: 4px;
    }
    .pf-gate__title {
      font-size: 26px; font-weight: 700; color: #1E1E1E;
      margin: 0 0 12px;
    }
    .pf-gate__desc {
      font-size: 15px; color: #555; line-height: 1.5;
      margin: 0 0 24px;
    }
    #pf-gate-form {
      display: flex; flex-direction: column; gap: 12px;
    }
    #pf-gate-input {
      width: 100%; box-sizing: border-box;
      padding: 14px 16px; font-size: 15px;
      border: 1px solid #DDD; border-radius: 10px;
      background: #FAFAFA; color: #1E1E1E;
      transition: border-color .2s ease, background .2s ease;
      font-family: inherit;
    }
    #pf-gate-input:focus {
      outline: none; border-color: #4F6479;
      background: #FFFFFF;
    }
    #pf-gate-form button {
      padding: 14px 20px; font-size: 15px; font-weight: 600;
      background: #1E1E1E; color: #FFFFFF;
      border: none; border-radius: 10px; cursor: pointer;
      transition: background .2s ease, transform .1s ease;
      font-family: inherit;
    }
    #pf-gate-form button:hover { background: #333; }
    #pf-gate-form button:active { transform: translateY(1px); }
    .pf-gate__error {
      min-height: 20px; margin: 14px 0 0;
      color: #B23A48; font-size: 13px; font-weight: 500;
    }
    .pf-gate__back {
      display: inline-block; margin-top: 22px;
      color: #777; font-size: 13px; text-decoration: none;
      transition: color .2s ease;
    }
    .pf-gate__back:hover { color: #1E1E1E; }

    @media (max-width: 480px) {
      .pf-gate__box { padding: 36px 24px; }
      .pf-gate__title { font-size: 22px; }
    }
  `;
  document.head.appendChild(css);

  function buildGate() {
    document.body.classList.add('pf-gate-active');

    const overlay = document.createElement('div');
    overlay.id = 'pf-gate';
    overlay.innerHTML = `
      <div class="pf-gate__box">
        <div class="pf-gate__logo">Prabhakar<span class="pf-gate__dot"></span></div>
        <h2 class="pf-gate__title">Case Study Access</h2>
        <p class="pf-gate__desc">Please enter the access password to view this case study.</p>
        <form id="pf-gate-form" autocomplete="off">
          <input type="password" id="pf-gate-input" placeholder="Enter password" autocomplete="off" required>
          <button type="submit">Unlock</button>
        </form>
        <p class="pf-gate__error" id="pf-gate-error"></p>
        <a class="pf-gate__back" href="../index.html">← Back to homepage</a>
      </div>
    `;
    document.body.appendChild(overlay);

    const form  = document.getElementById('pf-gate-form');
    const input = document.getElementById('pf-gate-input');
    const error = document.getElementById('pf-gate-error');

    input.focus();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const entered  = input.value;
      const expected = atob(ENCODED);
      if (entered === expected) {
        sessionStorage.setItem(STORAGE_KEY, 'granted');
        overlay.remove();
        document.body.classList.remove('pf-gate-active');
        document.body.style.visibility = '';
        const styleEl = document.getElementById('pf-gate-style');
        if (styleEl) styleEl.remove();
      } else {
        error.textContent = 'Incorrect password — please try again.';
        input.value = '';
        input.focus();
      }
    });
  }

  if (document.body) {
    buildGate();
  } else {
    document.addEventListener('DOMContentLoaded', buildGate);
  }
})();
