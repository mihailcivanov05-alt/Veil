// VeilHarness telemetry — injected at document-start just before
// veil_shield.user.js, in the same JS world. Posts to the native `veil`
// handler, which appends each message to Documents/harness.log.
//
// Structural data only (paths, data-veil-* attributes, sizes, gesture stats).
// Never page text: this runs inside a logged-in Instagram.

(function () {
  'use strict';

  const h = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.veil;
  if (!h) return;
  const post = (type, data) => {
    try { h.postMessage(Object.assign({ type: type, path: location.pathname }, data)); } catch (e) {}
  };

  // ── the shield's own log lines ([Veil] …) and errors ─────────────────────
  ['log', 'info', 'warn', 'error'].forEach((k) => {
    const orig = console[k];
    console[k] = function () {
      if (arguments[0] === '[Veil]') {
        const msg = Array.prototype.slice.call(arguments, 1).map((x) => {
          try { return typeof x === 'string' ? x : JSON.stringify(x); } catch (e) { return String(x); }
        }).join(' ');
        post('console', { level: k, msg: msg.slice(0, 2000) });
      }
      return orig.apply(this, arguments);
    };
  });
  window.addEventListener('error', (e) => {
    if (e.filename && /^https?:/.test(e.filename)) return;   // the site's own bundles
    post('error', { msg: String(e.message).slice(0, 500), line: e.lineno, col: e.colno });
  });

  // ── shield state, posted whenever it (or the path) changes ───────────────
  let lastState = '';
  setInterval(() => {
    const de = document.documentElement;
    if (!de) return;
    const st = {
      v: de.getAttribute('data-veil-v'),
      page: de.getAttribute('data-veil-page'),
      dbg: de.getAttribute('data-veil-dbg'),
      css: !!document.getElementById('veil-shield-css'),
      overlay: !!document.getElementById('veil-failsafe-overlay'),
      vw: innerWidth,
      vh: innerHeight,
    };
    const key = JSON.stringify(st) + location.pathname;
    if (key !== lastState) { lastState = key; post('state', st); }
  }, 500);

  // ── one summary per touch gesture ────────────────────────────────────────
  // Answers what v3.3–v3.5 could not see on-device: were the touchmoves still
  // cancelable, did the shield's preventDefault land, and what scrolled anyway
  // (including momentum after the finger lifts)?
  const describe = (el) =>
    (el === document.scrollingElement ? 'document' : el.tagName.toLowerCase()) +
    (el.getAttribute && el.getAttribute('role') ? '[role=' + el.getAttribute('role') + ']' : '') +
    (el.hasAttribute && el.hasAttribute('data-veil-pinned') ? '[pinned]' : '') +
    ' ' + el.clientWidth + 'x' + el.clientHeight + ' sh=' + el.scrollHeight;

  const lastTop = new WeakMap();
  let g = null;
  let flushTimer = 0;

  function flush() {
    clearTimeout(flushTimer);
    if (!g) return;
    const r = g;
    g = null;
    const scrolled = [];
    r.els.forEach((s, el) => scrolled.push({ el: describe(el), from: s.from, to: s.to, events: s.events }));
    post('gesture', {
      dy: r.dy, dx: r.dx, moves: r.moves, cancelable: r.cancelable, prevented: r.prevented,
      first: r.first, scrolled: scrolled,
      shield: document.documentElement.getAttribute('data-veil-dbg'),
      overlay: !!document.getElementById('veil-failsafe-overlay'),
    });
  }

  window.addEventListener('touchstart', (e) => {
    flush();
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    g = { x0: t.clientX, y0: t.clientY, dx: 0, dy: 0, moves: 0, cancelable: 0, prevented: 0,
          first: null, ended: false, els: new Map() };
  }, { capture: true, passive: true });

  window.addEventListener('touchmove', (e) => {
    const r = g;
    if (!r || r.ended) return;
    const t = e.touches[0];
    r.dy = Math.round(r.y0 - t.clientY);
    r.dx = Math.round(r.x0 - t.clientX);
    const n = ++r.moves;
    if (e.cancelable) r.cancelable++;
    if (n === 1) r.first = { dy: r.dy, cancelable: e.cancelable, prevented: null };
    // Read defaultPrevented after the whole dispatch, i.e. after the shield's handler.
    setTimeout(() => {
      if (e.defaultPrevented) r.prevented++;
      if (n === 1) r.first.prevented = e.defaultPrevented;
    }, 0);
  }, { capture: true, passive: true });

  const end = () => {
    if (!g) return;
    g.ended = true;
    flushTimer = setTimeout(flush, 900);   // keep collecting momentum scroll
  };
  window.addEventListener('touchend', end, { capture: true, passive: true });
  window.addEventListener('touchcancel', end, { capture: true, passive: true });

  let lastJump = 0;
  document.addEventListener('scroll', (e) => {
    const el = e.target === document ? document.scrollingElement : e.target;
    if (!el || typeof el.scrollTop !== 'number') return;
    const top = Math.round(el.scrollTop);
    const prev = lastTop.has(el) ? lastTop.get(el) : top;
    lastTop.set(el, top);
    if (g) {
      const s = g.els.get(el) || { from: prev, to: top, events: 0 };
      s.to = top;
      s.events++;
      g.els.set(el, s);
    } else if (Math.abs(top - prev) > 100 && Date.now() - lastJump > 500) {
      // a big move with no finger down: programmatic / auto-advance
      lastJump = Date.now();
      post('jump', { el: describe(el), from: prev, to: top });
    }
  }, { capture: true, passive: true });
})();
