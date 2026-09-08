// ==UserScript==
// @name         Veil Shield — No Reels & No Shorts (iOS Safari)
// @namespace    com.veil.anti-doomscroll
// @version      3.4.0
// @description  Deterministic Reels & Shorts blocker for iOS Mobile Safari on iPhone.
//               Preserves DMs, Search, Creator Profiles, and long-form YouTube.
//               Anchored exclusively on stable href / aria-label / custom-element selectors.
// @match        https://www.instagram.com/*
// @match        https://instagram.com/*
// @match        https://m.youtube.com/*
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

/*
 * ============================================================================
 * VEIL SHIELD v3.2 — Browser Pivot
 * ----------------------------------------------------------------------------
 * v3.2: master pause. localStorage["veil:config"] may carry `paused` (global)
 * and `instagram.paused` / `youtube.paused` (per-platform), written by the
 * companion app (app/index.html). Each page load is single-platform, so one
 * ARMED check gates the whole engine — a paused platform injects nothing.
 *
 * v3.3: shared-reel scroll lock hardened for IG mobile web. IG's reel viewer
 * advances the feed without a pushState and consumes touch events on its own
 * scroller, so the v3.2 bubble-phase 45px-magnitude backstop never fired.
 * Now: a CAPTURE-phase touchmove on the /reel/{id} permalink preventDefault()s
 * every predominantly-vertical drag (deterministic — no magnitude guess), and
 * the first upward pull raises the blackout once. wheel is locked too.
 *
 * v3.4: reels shared into a DM. Tapping one opens a fullscreen vertical video
 * feed while the URL stays on /direct/t/{id}/ — a whitelisted route, so nothing
 * ran. checkDmReelViewer() now arms the v3.3 lock when 2+ near-fullscreen
 * <video>s are present on a /direct/ route (a shape normal messaging can't
 * produce); the blackout returns to the thread, not out of DMs.
 * ============================================================================
 *
 * Changes from v3.0 (post-review):
 *   - Bootstrap now runs fully at document-start. The page attribute + CSS +
 *     YouTube redirect all land before first paint (v3.0 waited for
 *     DOMContentLoaded, so Explore/feed rules flashed on every load & nav).
 *   - Page scope attribute moved to <html> (exists at document-start) — was
 *     <body> (does not).
 *   - Explore is split: /explore(/) = grid (blocked) vs /explore/... = a
 *     user-initiated search/tag (left fully functional). No more guessing at
 *     `main > div > div` structure or force-revealing the search box.
 *   - Explore grid rules now hide media *tiles* by href (a[href^="/p/"],
 *     a[href^="/reel/"]) instead of structural containers — non-destructive,
 *     can never hide the search field or results.
 *   - @match widened: instagram.com (no-www) + www/youtube.com so a Short
 *     opened from another app is caught before the m. redirect.
 *   - Shorts click interceptor uses location.replace() (was .href — left a
 *     back-button entry pointing at the Short).
 *   - Bare /reel/ with no id is guarded (was: locked to '' then false-fired).
 *   - Redundant CSS props trimmed; console.log gated behind DEBUG.
 *   - CONFIG can be overridden from localStorage['veil:config'] (safe-parsed).
 *
 * Constitution Compliance (GEMINI.md):
 *   Invariant 1 — Deterministic: URL paths + aria-labels + custom-element tags.
 *                 The shared-reel scroll lock (v3.3) blocks every vertical drag
 *                 on a /reel/{id} permalink in capture phase — no magnitude
 *                 guess. The URL-change check stays primary; set
 *                 sharedReelTouchBackstop:false to drop the gesture lock only.
 *   Invariant 2 — Preserve Legitimate: DMs, search, tags, profiles, stories,
 *                 long-form YouTube: never touched.
 *   Invariant 3 — Fail-Safe: unknown / auto-advancing reel feed → blackout.
 *   Invariant 4 — Zero Layout Distortion: display:none, applied pre-paint.
 * ============================================================================
 */

(function () {
  'use strict';

  const DEBUG = false;
  const log = (...a) => { if (DEBUG) try { console.log('[Veil]', ...a); } catch (e) {} };

  // ==========================================================================
  // §1  CONFIG — defaults, with optional localStorage override
  // ==========================================================================
  //
  // To change behaviour without editing this file, run once in the Safari
  // console on the target site (or from a bookmarklet):
  //   localStorage.setItem('veil:config', JSON.stringify({
  //     instagram: { exploreGridMode: 'hide_videos_only' }
  //   }));
  //
  // The companion dashboard (Settings -> Sync to Safari) hands you a "Veil Sync"
  // bookmarklet that does exactly this write from your clipboard, on this origin.

  const DEFAULTS = Object.freeze({
    paused: false,                          // global master — companion app "Shield" button
    instagram: {
      paused: false,                        // per-platform master
      hideReelsTab: true,
      exploreGridMode: 'blackout',          // 'blackout' | 'blur' | 'hide_videos_only'
      blockSharedReelScroll: true,
      allowProfileReelsOnly: true,
      feedReelsHidden: true,
      sharedReelTouchBackstop: true,        // subordinate heuristic (see header)
    },
    youtube: {
      paused: false,                        // per-platform master
      hideShortsTab: true,
      hideShortsShelves: true,
      blockShortsPlayer: true,
    },
  });

  function loadConfig() {
    try {
      const raw = localStorage.getItem('veil:config');
      if (!raw) return DEFAULTS;
      const o = JSON.parse(raw) || {};
      return {
        paused: o.paused === true,
        instagram: Object.assign({}, DEFAULTS.instagram, o.instagram || {}),
        youtube: Object.assign({}, DEFAULTS.youtube, o.youtube || {}),
      };
    } catch (e) {
      log('config parse failed, using defaults', e);
      return DEFAULTS;
    }
  }
  const CONFIG = loadConfig();

  // ==========================================================================
  // §2  PLATFORM + RUNTIME STATE  (mirrors GEMINI.md RuntimeState)
  // ==========================================================================

  const host = location.hostname;
  let platform = 'unknown';
  if (host === 'www.instagram.com' || host === 'instagram.com') {
    platform = 'instagram';
  } else if (host === 'm.youtube.com' || host === 'www.youtube.com' || host === 'youtube.com') {
    platform = 'youtube';
  }

  // Master switches (companion app writes these). Each page load is single-
  // platform, so one armed check gates the whole engine for this page.
  const ARMED =
    !CONFIG.paused &&
    !(platform === 'instagram' && CONFIG.instagram.paused) &&
    !(platform === 'youtube' && CONFIG.youtube.paused);

  const state = {
    currentUrl: location.href,
    platform: platform,
    pageType: 'unknown',
    isSharedReelActive: false,
    initialReelId: null,
    isBlackedOut: false,
  };

  // ==========================================================================
  // §3  ROUTE DETECTOR — deterministic (Invariant 1)
  // ==========================================================================

  const IG_RESERVED = [
    'p', 'tv', 'reel', 'reels', 'explore', 'direct', 'stories', 'accounts',
    'about', 'legal', 'developer', 'emails', 'privacy', 'terms', 'session',
    'nametag', 'challenge', 'oauth', 'api', 'graphql', 'your_activity',
    'ar', 'directory', 'web', 'push',
  ];

  function detectPageType() {
    const p = location.pathname;

    if (platform === 'instagram') {
      if (p === '/' || p === '') return 'home_feed';
      if (p.startsWith('/direct/')) return 'direct_messages';
      if (p === '/explore' || p === '/explore/') return 'explore_grid';   // pure algorithmic surface
      if (p.startsWith('/explore/')) return 'explore_search';             // search / tags / locations — user-initiated
      if (p === '/reels' || p === '/reels/' || p.startsWith('/reels/')) return 'reels_tab';
      if (p.startsWith('/reel/')) return 'shared_reel';
      if (p.startsWith('/stories/')) return 'ig_stories';

      const segs = p.split('/').filter(Boolean);
      if (segs.length >= 1 && IG_RESERVED.indexOf(segs[0]) === -1) return 'creator_profile';
      return 'ig_other';
    }

    if (platform === 'youtube') {
      if (p === '/shorts' || p.startsWith('/shorts/')) return 'yt_shorts';
      if (p.startsWith('/watch')) return 'yt_watch';
      if (p === '/' || p === '') return 'yt_home';
      if (p.startsWith('/results')) return 'yt_search';
      if (p.startsWith('/feed/')) return 'yt_feed';
      if (p.startsWith('/channel/') || p.startsWith('/@') ||
          p.startsWith('/c/') || p.startsWith('/user/')) return 'yt_channel';
      return 'yt_other';
    }

    return 'unknown';
  }

  // ==========================================================================
  // §4  CSS — injected at document-start, before first paint
  // ==========================================================================
  //
  // Every selector is anchored on href / aria-label / custom-element tag.
  // Nothing here targets a minified class name.
  // Page-scoped rules key off html[data-veil-page="..."] which §6 sets
  // synchronously at document-start and on every SPA navigation.

  const CSS = `
/* ═══════════════════════ INSTAGRAM ═══════════════════════ */

/* 1. Reels tab — removed from every navigation surface (always safe) */
a[href="/reels"],
a[href^="/reels/"],
div[role="navigation"] a[href*="/reels"],
div[role="tablist"] a[href*="/reels"],
nav a:has(> svg[aria-label="Reels"]),
div[role="navigation"] a:has(svg[aria-label="Reels"]),
div[role="navigation"] div[role="button"]:has(svg[aria-label="Reels"]) {
  display: none !important;
}

/* 2. Home feed — drop injected Reels units (scoped to home only) */
html[data-veil-page="home_feed"] article:has(a[href^="/reel/"]) {
  display: none !important;
}

/* 3. Explore GRID only — collapse the media tiles, never the header/search.
      Tiles are all /p/ or /reel/ anchors; hiding them by href cannot break
      the search field or search results (those live on explore_search). */
html[data-veil-page="explore_grid"] main a[href^="/p/"],
html[data-veil-page="explore_grid"] main a[href^="/reel/"],
html[data-veil-page="explore_grid"] main a[href^="/reels/"] {
  display: none !important;
}
html[data-veil-page="explore_grid"][data-veil-explore="blackout"] main {
  background: #000 !important;
}

/* 4. Creator profiles / stories / DMs / explore_search — no rules (Invariant 2) */


/* ═══════════════════════ YOUTUBE ═══════════════════════ */

/* 1. Shorts tab + guide/sidebar entries */
ytm-pivot-bar-item-renderer:has(a[href="/shorts"]),
ytm-pivot-bar-item-renderer[tab-identifier="FEshorts"],
ytd-guide-entry-renderer:has(a[title="Shorts"]),
ytd-guide-entry-renderer:has(a[href="/shorts"]),
ytd-mini-guide-entry-renderer:has(a[title="Shorts"]) {
  display: none !important;
}

/* 2. Shorts shelves in any feed (home / subs / search / channel) */
ytm-reel-shelf-renderer,
ytm-shorts-lockup-view-model,
ytm-shorts-lockup-view-model-v2,
ytd-reel-shelf-renderer,
ytd-rich-shelf-renderer[is-shorts],
ytm-rich-section-renderer:has(a[href^="/shorts/"]),
ytm-item-section-renderer:has(ytm-reel-shelf-renderer),
grid-shelf-view-model:has(a[href^="/shorts/"]) {
  display: none !important;
}

/* 3. Individual Shorts entries scattered in search results / lists */
ytm-video-with-context-renderer:has(a[href^="/shorts/"]),
ytd-video-renderer:has(a[href^="/shorts/"]),
a[href^="/shorts/"] {
  display: none !important;
}


/* ═══════════ FAIL-SAFE OVERLAY — Veil Design System v2 ═══════════
   Tokens inlined (a userscript can't @import design-system/tokens.css into
   instagram.com / m.youtube.com). Keep in sync with design-system/veil-ui.css
   → .veil-shield / .veil-btn--primary. Keyframe + @property names are
   veil-prefixed to avoid colliding with the host page. */

@property --veilga { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
@property --veilgo { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
@property --veilgp { syntax: "<percentage>"; initial-value: 5%; inherits: false; }
@property --veilsh { syntax: "<color>"; initial-value: #d8ffe8; inherits: false; }

#veil-failsafe-overlay {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100dvh !important;
  background: radial-gradient(ellipse at 50% 36%, #0c1a12, #020304 70%) !important;
  z-index: 2147483647 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
  color: #f4f7fb !important;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif !important;
  text-align: center !important;
  padding: env(safe-area-inset-top, 24px) 24px env(safe-area-inset-bottom, 24px) !important;
  box-sizing: border-box !important;
  touch-action: none !important;
  -webkit-user-select: none !important;
  user-select: none !important;
}
#veil-failsafe-overlay .veil-icon { color: #17d861 !important; margin-bottom: 12px !important; line-height: 0 !important; }
#veil-failsafe-overlay .veil-icon svg { width: 44px !important; height: 44px !important; display: block !important; }
#veil-failsafe-overlay h2 {
  font-size: 24px !important; font-weight: 720 !important; margin: 8px 0 0 !important;
  letter-spacing: -0.02em !important; color: #ff4d4f !important;
}
#veil-failsafe-overlay p {
  font-size: 14px !important; color: #9aa3b2 !important; line-height: 1.55 !important;
  max-width: 300px !important; margin: 0 !important;
}

/* Primary CTA — "shiny" treatment recolored to brand, scoped + hardened */
#veil-failsafe-overlay button {
  --_dur: 3s;
  isolation: isolate !important;
  position: relative !important;
  overflow: hidden !important;
  margin-top: 16px !important;
  padding: 15px 32px !important;
  font: 620 16px/1.2 "Inter", -apple-system, system-ui, sans-serif !important;
  letter-spacing: -0.006em !important;
  color: #04160b !important;
  border: 1px solid transparent !important;
  border-radius: 360px !important;
  cursor: pointer !important;
  -webkit-tap-highlight-color: transparent !important;
  background:
    linear-gradient(#17d861, #17d861) padding-box,
    conic-gradient(from calc(var(--veilga) - var(--veilgo)),
      transparent, #17d861 var(--veilgp), var(--veilsh) calc(var(--veilgp) * 2),
      #17d861 calc(var(--veilgp) * 3), transparent calc(var(--veilgp) * 4)) border-box !important;
  box-shadow: inset 0 0 0 1px #0a7d38, 0 8px 24px -10px rgba(23,216,97,0.45) !important;
  transition: translate 120ms cubic-bezier(.23,1,.32,1), filter 180ms cubic-bezier(.23,1,.32,1) !important;
  animation: veilga linear var(--_dur) !important;
}
#veil-failsafe-overlay button::after {
  content: "" !important;
  position: absolute !important;
  inset-inline-start: 50% !important; inset-block-start: 50% !important;
  translate: -50% -50% !important;
  width: 100% !important; aspect-ratio: 1 !important; z-index: -1 !important;
  background: linear-gradient(-50deg, transparent, #d8ffe8, transparent) !important;
  mask-image: radial-gradient(circle at bottom, transparent 40%, #000) !important;
  opacity: 0.35 !important; mix-blend-mode: overlay !important;
  animation: veilshim linear var(--_dur) !important;
}
#veil-failsafe-overlay button:hover { filter: brightness(1.06) !important; --veilgp: 20% !important; --veilgo: 95deg !important; }
#veil-failsafe-overlay button:active { translate: 0 1px !important; }

@keyframes veilga { to { --veilga: 360deg; } }
@keyframes veilshim { to { rotate: 360deg; } }
@media (prefers-reduced-motion: reduce) {
  #veil-failsafe-overlay button,
  #veil-failsafe-overlay button::after { animation: none !important; }
  #veil-failsafe-overlay button { --veilgp: 16% !important; --veilgo: 90deg !important; }
}
`;

  function injectCSS() {
    if (document.getElementById('veil-shield-css')) return;
    const el = document.createElement('style');
    el.id = 'veil-shield-css';
    el.textContent = CSS;
    (document.head || document.documentElement).appendChild(el);
  }

  // ==========================================================================
  // §5  FAIL-SAFE OVERLAY  (single-entry guard — no stacking / leaking)
  // ==========================================================================

  function showBlackout(title, message, returnUrl) {
    if (document.getElementById('veil-failsafe-overlay')) return;
    state.isBlackedOut = true;

    const overlay = document.createElement('div');
    overlay.id = 'veil-failsafe-overlay';

    const icon = document.createElement('div');
    icon.className = 'veil-icon';
    // Static, trusted SVG constant (no interpolation) — no emoji as UI icon.
    icon.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>';

    const heading = document.createElement('h2');
    heading.textContent = title || 'Doomscroll Blocked';

    const desc = document.createElement('p');
    desc.textContent = message || 'Veil stopped the infinite scroll loop to protect your focus.';

    const btn = document.createElement('button');
    btn.textContent = 'Return to Safety';
    btn.addEventListener('click', () => {
      overlay.remove();
      state.isBlackedOut = false;
      if (returnUrl) location.href = returnUrl;
      else history.back();
    });

    overlay.append(icon, heading, desc, btn);
    overlay.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

    if (document.body) {
      document.body.appendChild(overlay);
    } else {
      document.addEventListener('DOMContentLoaded',
        () => { if (state.isBlackedOut) document.body.appendChild(overlay); },
        { once: true });
    }
  }

  function removeBlackout() {
    const el = document.getElementById('veil-failsafe-overlay');
    if (el) el.remove();
    state.isBlackedOut = false;
  }

  // ==========================================================================
  // §6  PAGE SCOPE ATTRIBUTE  (on <html>, set pre-paint & on every nav)
  // ==========================================================================

  function syncPageAttr() {
    const root = document.documentElement;
    root.setAttribute('data-veil-platform', platform);
    root.setAttribute('data-veil-page', state.pageType || 'unknown');
    if (platform === 'instagram') {
      root.setAttribute('data-veil-explore', CONFIG.instagram.exploreGridMode);
    }
  }

  // ==========================================================================
  // §7  YOUTUBE ENGINE — Shorts neutralizer
  // ==========================================================================
  //
  // /shorts/{id} → /watch?v={id}. Every Short is the same video object, so this
  // opens it in the standard player with no vertical feed, keeps shared links
  // working, and fails safe: a rotted selector just means you land in /watch.

  function extractShortId(path) {
    if (!path.startsWith('/shorts/')) return null;
    const id = path.slice('/shorts/'.length).split(/[?#/]/)[0];
    return id || null;
  }

  function handleYouTube() {
    if (!CONFIG.youtube.blockShortsPlayer) return;
    const id = extractShortId(location.pathname);
    if (id) location.replace(location.origin + '/watch?v=' + id);
  }

  function initYouTubeClickInterceptor() {
    document.addEventListener('click', (e) => {
      if (!CONFIG.youtube.blockShortsPlayer) return;
      let el = e.target;
      if (el && el.nodeType === 3) el = el.parentElement;      // text node → element
      const link = el && el.closest ? el.closest('a[href*="/shorts/"]') : null;
      if (!link) return;

      let path = link.getAttribute('href') || '';
      try { if (path.startsWith('http')) path = new URL(path).pathname; } catch (err) {}
      const id = extractShortId(path);
      if (id) {
        e.preventDefault();
        e.stopImmediatePropagation();
        location.replace(location.origin + '/watch?v=' + id);
      }
    }, true); // capture — beat the SPA router
  }

  // ==========================================================================
  // §8  INSTAGRAM ENGINE — Reels blocker & shared-reel lock
  // ==========================================================================

  let touchStartY = 0;
  let touchStartX = 0;
  let lockedReelId = null;
  let dmReelArmed = false;      // fullscreen reel feed open on top of a /direct/ thread
  let dmThreadUrl = null;       // where to send them back to when it is

  // A reel shared into a DM opens a fullscreen vertical video feed while the URL
  // stays on /direct/t/{id}/ — the route is whitelisted, so nothing else fires.
  // Signature that cannot occur during normal messaging: 2+ near-fullscreen
  // <video>s on a /direct/ route. When present, arm the same scroll lock.
  function checkDmReelViewer() {
    if (platform !== 'instagram') return;
    if (!location.pathname.startsWith('/direct/') || !CONFIG.instagram.blockSharedReelScroll) {
      if (dmReelArmed) { dmReelArmed = false; dmThreadUrl = null; state.isSharedReelActive = false; }
      return;
    }
    const vh = window.innerHeight, vw = window.innerWidth;
    let fullscreenVids = 0;
    document.querySelectorAll('video').forEach((v) => {
      const r = v.getBoundingClientRect();
      if (r.height > vh * 0.7 && r.width > vw * 0.6) fullscreenVids++;
    });
    const open = fullscreenVids >= 2;
    if (open && !dmReelArmed) {
      dmReelArmed = true;
      dmThreadUrl = location.href;
      state.isSharedReelActive = true;
      log('DM reel viewer detected — scroll lock armed');
    } else if (!open && dmReelArmed) {
      dmReelArmed = false;
      dmThreadUrl = null;
      state.isSharedReelActive = false;
    }
  }

  function initTouchLock() {
    let announced = false;

    // Capture phase: IG's reel scroller calls stopPropagation() on its own
    // touch handlers, so a bubble-phase listener on document never sees the
    // swipe. Capture runs before any of that.
    document.addEventListener('touchstart', (e) => {
      if (!state.isSharedReelActive) return;
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      announced = false;
    }, { capture: true, passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!state.isSharedReelActive) return;
      if (!CONFIG.instagram.blockSharedReelScroll) return;
      if (CONFIG.instagram.sharedReelTouchBackstop === false) return;
      const t = e.touches[0];
      const dy = touchStartY - t.clientY;
      const dx = touchStartX - t.clientX;
      // A predominantly-vertical drag on a single-Reel permalink is a feed
      // swipe. Kill it outright — no magnitude threshold to false-negative on.
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
        e.preventDefault();
        if (!announced && dy > 24) {        // first real upward pull → say why, once
          announced = true;
          showBlackout(
            'Scroll Locked',
            dmReelArmed
              ? 'This Reel was shared in a DM. Watch it — but swiping into the feed is blocked.'
              : 'You opened one specific Reel. Swiping into the feed is blocked to protect your focus.',
            dmThreadUrl || 'https://www.instagram.com/direct/inbox/'
          );
        }
      }
    }, { capture: true, passive: false });

    // trackpad / mouse parity — inert on touch-only iOS, matters if tested elsewhere
    document.addEventListener('wheel', (e) => {
      if (!state.isSharedReelActive || !CONFIG.instagram.blockSharedReelScroll) return;
      if (CONFIG.instagram.sharedReelTouchBackstop === false) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && Math.abs(e.deltaY) > 4) e.preventDefault();
    }, { capture: true, passive: false });
  }

  function handleInstagram() {
    const page = state.pageType;

    // ── Reels tab — hard block ──
    if (page === 'reels_tab' && CONFIG.instagram.hideReelsTab) {
      state.isSharedReelActive = false;
      lockedReelId = null;
      showBlackout('Reels Tab Blocked', 'The Reels feed is disabled on this device.',
                   'https://www.instagram.com/');
      return;
    }

    // ── Shared reel — lock to the one that was opened ──
    if (page === 'shared_reel' && CONFIG.instagram.blockSharedReelScroll) {
      const reelId = (location.pathname.split('/reel/')[1] || '').split(/[/?#]/)[0];
      if (!reelId) return;                                 // bare /reel/ — nothing to lock

      if (!lockedReelId) {
        lockedReelId = reelId;
        state.initialReelId = reelId;
        state.isSharedReelActive = true;
        log('shared reel locked to', reelId);
      } else if (reelId !== lockedReelId) {
        // URL advanced to a different reel → the feed is auto-playing (Invariant 3)
        showBlackout('Infinite Feed Trapped', 'Veil prevented automatic progression to the next Reel.',
                     'https://www.instagram.com/');
      }
      return;
    }

    // ── Any other page — clear reel lock, lift a stale blackout ──
    lockedReelId = null;
    checkDmReelViewer();                    // a /direct/ thread may have a reel feed open
    if (!dmReelArmed) {
      state.isSharedReelActive = false;
      if (state.isBlackedOut) removeBlackout();
    }
  }

  // ==========================================================================
  // §9  DYNAMIC SWEEPER  (debounced; CSS does the heavy lifting)
  // ==========================================================================

  function sweep() {
    if (platform === 'youtube') {
      if (state.pageType === 'yt_watch' || state.pageType === 'yt_channel') return;
      document.querySelectorAll(
        'ytm-reel-shelf-renderer, ytm-shorts-lockup-view-model, ' +
        'ytm-shorts-lockup-view-model-v2, ytd-reel-shelf-renderer'
      ).forEach((el) => el.style.setProperty('display', 'none', 'important'));
      return;
    }

    if (platform === 'instagram') {
      checkDmReelViewer();                  // fullscreen reel feed opened from a DM
      if (state.pageType === 'direct_messages') return;
      // best-effort: dismiss "open in app" interstitials
      document.querySelectorAll(
        'div[role="dialog"] a[href*="app_store"], div[role="dialog"] a[href*="itunes.apple.com"]'
      ).forEach((a) => { const d = a.closest('[role="dialog"]'); if (d) d.remove(); });
    }
  }

  // ==========================================================================
  // §10  DISPATCHER + SPA NAVIGATION HOOKS
  // ==========================================================================

  function evaluate() {
    state.currentUrl = location.href;
    state.pageType = detectPageType();
    syncPageAttr();
    if (platform === 'youtube') handleYouTube();
    else if (platform === 'instagram') handleInstagram();
  }

  (function installHistoryHooks() {
    const _push = history.pushState;
    history.pushState = function () {
      const r = _push.apply(this, arguments);
      queueMicrotask(evaluate);
      return r;
    };
    const _replace = history.replaceState;
    history.replaceState = function () {
      const r = _replace.apply(this, arguments);
      queueMicrotask(evaluate);
      return r;
    };
    window.addEventListener('popstate', evaluate);
    window.addEventListener('hashchange', evaluate);
  })();

  let sweepTimer = null;
  const observer = new MutationObserver(() => {
    if (location.href !== state.currentUrl) evaluate();       // SPA fallback (no pushState)
    if (!sweepTimer) {
      sweepTimer = setTimeout(() => { sweepTimer = null; sweep(); }, 350);
    }
  });

  // ==========================================================================
  // §11  BOOTSTRAP — everything that is safe at document-start runs now
  // ==========================================================================

  function boot() {
    if (platform === 'unknown') return;
    if (!ARMED) { log('shield paused for', platform, '— nothing injected'); return; }

    injectCSS();
    state.pageType = detectPageType();
    syncPageAttr();

    if (platform === 'youtube') {
      handleYouTube();                 // redirect off /shorts/ BEFORE paint
      initYouTubeClickInterceptor();
    } else if (platform === 'instagram') {
      initTouchLock();
    }

    evaluate();
    observer.observe(document.documentElement, { childList: true, subtree: true });

    const ready = () => { injectCSS(); evaluate(); sweep(); };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ready, { once: true });
    } else {
      sweep();
    }

    log('active on', platform, '—', state.pageType);
  }

  boot();
})();
