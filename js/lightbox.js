/* ============================================================
   PRABHAKAR SEENAPPA — PORTFOLIO
   Screen gallery zoom lightbox
   ------------------------------------------------------------
   Dense enterprise UI screens are illegible at inline width, so
   real magnification is a requirement here, not a nicety.

   Supports: click / Enter to open, scroll-wheel zoom toward the
   cursor, pinch zoom, drag to pan, double-click to toggle,
   arrow-key navigation, +/-/0 zoom keys, Esc to close.
   Focus is trapped while open and restored to the trigger on
   close.
   ============================================================ */

(function () {
  'use strict';

  const gallery = document.querySelector('[data-shots]');
  if (!gallery) return;

  const triggers = Array.prototype.slice.call(gallery.querySelectorAll('.shot__btn'));
  if (!triggers.length) return;

  const items = triggers.map(function (btn) {
    const img = btn.querySelector('img');
    return {
      full:  btn.dataset.full,
      alt:   img ? img.alt : '',
      num:   btn.dataset.num   || '',
      title: btn.dataset.title || '',
      cap:   btn.dataset.cap   || ''
    };
  });

  const MIN = 1, MAX = 4;
  let index = 0, scale = 1, tx = 0, ty = 0;
  let lastTrigger = null;

  /* ── Build the lightbox once ───────────────────────────── */
  const lb = document.createElement('div');
  lb.className = 'lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Screen viewer');
  lb.innerHTML =
    '<div class="lb__backdrop" data-close></div>' +
    '<div class="lb__bar">' +
      '<span class="lb__count" data-count></span>' +
      '<span class="lb__label" data-label></span>' +
      '<span class="lb__tools">' +
        '<button type="button" class="lb__btn" data-zoom-out aria-label="Zoom out">&minus;</button>' +
        '<button type="button" class="lb__btn lb__btn--zoom" data-zoom-reset aria-label="Reset zoom to fit">100%</button>' +
        '<button type="button" class="lb__btn" data-zoom-in aria-label="Zoom in">+</button>' +
        '<button type="button" class="lb__btn" data-close aria-label="Close viewer">&times;</button>' +
      '</span>' +
    '</div>' +
    '<div class="lb__stage" data-stage>' +
      '<button type="button" class="lb__arrow lb__arrow--prev" data-prev aria-label="Previous screen">&#8249;</button>' +
      '<img class="lb__img" data-img alt="">' +
      '<button type="button" class="lb__arrow lb__arrow--next" data-next aria-label="Next screen">&#8250;</button>' +
    '</div>' +
    '<p class="lb__cap" data-cap></p>';
  document.body.appendChild(lb);

  const stage    = lb.querySelector('[data-stage]');
  const img      = lb.querySelector('[data-img]');
  const capEl    = lb.querySelector('[data-cap]');
  const countEl  = lb.querySelector('[data-count]');
  const labelEl  = lb.querySelector('[data-label]');
  const zoomLbl  = lb.querySelector('[data-zoom-reset]');
  const prevBtn  = lb.querySelector('[data-prev]');
  const nextBtn  = lb.querySelector('[data-next]');
  const closeBtn = lb.querySelector('[data-close].lb__btn');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Transform helpers ─────────────────────────────────── */
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  function panBounds() {
    const sw = stage.clientWidth,  sh = stage.clientHeight;
    const iw = img.offsetWidth * scale, ih = img.offsetHeight * scale;
    return { x: Math.max(0, (iw - sw) / 2), y: Math.max(0, (ih - sh) / 2) };
  }

  function apply(animate) {
    const b = panBounds();
    tx = clamp(tx, -b.x, b.x);
    ty = clamp(ty, -b.y, b.y);
    img.classList.toggle('anim', !!animate && !reduceMotion);
    img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
    zoomLbl.textContent = Math.round(scale * 100) + '%';
    stage.classList.toggle('grab', scale > 1);
    lb.querySelector('[data-zoom-out]').disabled = scale <= MIN;
    lb.querySelector('[data-zoom-in]').disabled  = scale >= MAX;
  }

  function resetView(animate) {
    scale = 1; tx = 0; ty = 0;
    apply(animate);
  }

  /* Zoom keeping the point under the cursor stationary */
  function zoomAt(clientX, clientY, next) {
    next = clamp(next, MIN, MAX);
    if (next === scale) return;
    const r = stage.getBoundingClientRect();
    const cx = clientX - r.left - r.width / 2;
    const cy = clientY - r.top  - r.height / 2;
    const k = next / scale;
    tx = cx - k * (cx - tx);
    ty = cy - k * (cy - ty);
    scale = next;
    apply(false);
  }

  function zoomCentre(next, animate) {
    next = clamp(next, MIN, MAX);
    const k = next / scale;
    tx *= k; ty *= k;
    scale = next;
    apply(animate !== false);
  }

  /* ── Rendering an item ─────────────────────────────────── */
  function render(i) {
    index = (i + items.length) % items.length;
    const it = items[index];
    img.src = it.full;
    img.alt = it.alt;
    countEl.textContent = (index + 1) + ' / ' + items.length;
    labelEl.textContent = it.num ? it.num + ' — ' + it.title : it.title;
    capEl.textContent = it.cap;
    resetView(false);
  }

  /* ── Open / close ──────────────────────────────────────── */
  function open(i, trigger) {
    lastTrigger = trigger || null;
    render(i);
    lb.classList.add('on');
    document.body.classList.add('lb-open');
    closeBtn.focus();
    document.addEventListener('keydown', onKey, true);
  }

  function close() {
    lb.classList.remove('on');
    document.body.classList.remove('lb-open');
    document.removeEventListener('keydown', onKey, true);
    img.src = '';
    if (lastTrigger) { lastTrigger.focus(); lastTrigger = null; }
  }

  /* ── Keyboard ──────────────────────────────────────────── */
  function focusables() {
    return Array.prototype.filter.call(
      lb.querySelectorAll('button'),
      function (b) { return !b.disabled && b.offsetParent !== null; }
    );
  }

  function onKey(e) {
    if (!lb.classList.contains('on')) return;

    if (e.key === 'Escape')      { e.preventDefault(); close(); return; }
    if (e.key === 'ArrowLeft')   { e.preventDefault(); render(index - 1); return; }
    if (e.key === 'ArrowRight')  { e.preventDefault(); render(index + 1); return; }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomCentre(scale + 0.5); return; }
    if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomCentre(scale - 0.5); return; }
    if (e.key === '0')           { e.preventDefault(); resetView(true); return; }

    if (e.key === 'Tab') {
      const f = focusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  /* ── Wiring ────────────────────────────────────────────── */
  triggers.forEach(function (btn, i) {
    btn.addEventListener('click', function () { open(i, btn); });
  });

  lb.addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-close')) close();
  });
  prevBtn.addEventListener('click', function () { render(index - 1); });
  nextBtn.addEventListener('click', function () { render(index + 1); });
  lb.querySelector('[data-zoom-in]').addEventListener('click',  function () { zoomCentre(scale + 0.5); });
  lb.querySelector('[data-zoom-out]').addEventListener('click', function () { zoomCentre(scale - 0.5); });
  zoomLbl.addEventListener('click', function () { resetView(true); });

  /* Wheel zoom toward the pointer */
  stage.addEventListener('wheel', function (e) {
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, scale * (e.deltaY < 0 ? 1.14 : 1 / 1.14));
  }, { passive: false });

  /* Double-click toggles between fit and 2.5x */
  img.addEventListener('dblclick', function (e) {
    e.preventDefault();
    if (scale > 1) resetView(true);
    else zoomAt(e.clientX, e.clientY, 2.5);
  });

  /* Drag to pan + pinch to zoom, via pointer events */
  const pointers = new Map();
  let startTx = 0, startTy = 0, startX = 0, startY = 0;
  let pinchDist = 0, pinchScale = 1;

  stage.addEventListener('pointerdown', function (e) {
    if (e.target.closest('.lb__arrow')) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      startX = e.clientX; startY = e.clientY;
      startTx = tx; startTy = ty;
      if (scale > 1) stage.classList.add('grabbing');
      stage.setPointerCapture(e.pointerId);
    } else if (pointers.size === 2) {
      const p = Array.from(pointers.values());
      pinchDist = Math.hypot(p[1].x - p[0].x, p[1].y - p[0].y);
      pinchScale = scale;
    }
  });

  stage.addEventListener('pointermove', function (e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2 && pinchDist > 0) {
      const p = Array.from(pointers.values());
      const d = Math.hypot(p[1].x - p[0].x, p[1].y - p[0].y);
      zoomAt((p[0].x + p[1].x) / 2, (p[0].y + p[1].y) / 2, pinchScale * (d / pinchDist));
      return;
    }
    if (pointers.size === 1 && scale > 1) {
      tx = startTx + (e.clientX - startX);
      ty = startTy + (e.clientY - startY);
      apply(false);
    }
  });

  function endPointer(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchDist = 0;
    if (pointers.size === 0) stage.classList.remove('grabbing');
  }
  stage.addEventListener('pointerup', endPointer);
  stage.addEventListener('pointercancel', endPointer);

  window.addEventListener('resize', function () {
    if (lb.classList.contains('on')) apply(false);
  }, { passive: true });
})();
