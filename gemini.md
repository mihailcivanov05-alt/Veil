# Project Constitution: "No Reels" (Instagram & YouTube Shorts Blocker)

## 🏛️ Architectural Invariants & Behavioral Rules

1. **Deterministic Blocking**: The system must deterministically identify and neutralize doomscrolling triggers (Reels tab, Shorts tab, Explore video grid, infinite scroll on shared reels) without relying on fuzzy heuristics.
2. **Preserve Legitimate Usage**: Messaging (DMs), user search, creator profiles, and regular long-form YouTube videos must remain 100% accessible and unobstructed.
3. **Fail-Safe Mode**: If detection fails on an untrusted video feed or scroll attempt, the UI fails closed (e.g., black screen overlay / video freeze) rather than letting the user fall into a doomscroll loop.
4. **Zero Layout Distortion**: Navigation items are hidden cleanly with CSS/DOM adjustments to prevent visual artifacts or broken layouts.

---

## 📊 Data & State Schemas

### 1. Configuration & Feature Flags Schema (`ConfigState`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ConfigState",
  "type": "object",
  "properties": {
    "instagram": {
      "type": "object",
      "properties": {
        "hideReelsTab": { "type": "boolean", "default": true },
        "exploreGridMode": { 
          "type": "string", 
          "enum": ["blackout", "blur", "hide_videos_only"], 
          "default": "blackout" 
        },
        "blockSharedReelScroll": { "type": "boolean", "default": true },
        "allowProfileReelsOnly": { "type": "boolean", "default": true },
        "feedReelsHidden": { "type": "boolean", "default": true }
      },
      "required": ["hideReelsTab", "exploreGridMode", "blockSharedReelScroll", "allowProfileReelsOnly"]
    },
    "youtube": {
      "type": "object",
      "properties": {
        "hideShortsTab": { "type": "boolean", "default": true },
        "hideShortsShelves": { "type": "boolean", "default": true },
        "blockShortsPlayer": { "type": "boolean", "default": true }
      },
      "required": ["hideShortsTab", "hideShortsShelves", "blockShortsPlayer"]
    }
  },
  "required": ["instagram", "youtube"]
}
```

### 2. Runtime Context & Navigation State Schema (`RuntimeState`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "RuntimeState",
  "type": "object",
  "properties": {
    "currentUrl": { "type": "string" },
    "platform": { "type": "string", "enum": ["instagram", "youtube", "unknown"] },
    "pageType": { 
      "type": "string", 
      "enum": ["home_feed", "direct_messages", "explore_search", "creator_profile", "shared_reel", "reels_tab", "yt_home", "yt_watch", "yt_shorts"] 
    },
    "isSharedReelActive": { "type": "boolean" },
    "initialReelId": { "type": ["string", "null"] },
    "isBlackedOut": { "type": "boolean" }
  },
  "required": ["currentUrl", "platform", "pageType", "isBlackedOut"]
}
```

---

## 🛠️ Maintenance & Self-Annealing Log
- Initial draft configured.
- **2026-09 Browser Pivot:** Abandoned native dylib injection (non-functional, ban risk, no TrollStore on iOS 17+). Migrated to Safari Userscript engine targeting `www.instagram.com` and `m.youtube.com`. All selectors anchored on stable href/aria-label/custom-element contracts. YouTube Shorts redirected to standard watch player. MobileConfig fixed (`FullScreen: false`) to ensure extensions inject.
- **2026-09 v3.1 (post-review):** Bootstrap moved entirely to document-start (v3.0 waited for DOMContentLoaded → Explore/feed rules flashed every load & nav). Page scope attribute moved to `<html>`. Explore split into `explore_grid` (blocked) vs `explore_search` (user-initiated tag/query — left functional); grid now hidden by tile `href` (`a[href^="/p/"]`, `a[href^="/reel/"]`) instead of structural containers, so the search field can never be caught. `@match` widened to `instagram.com` + `www/youtube.com`. Shorts click interceptor switched to `location.replace()`. Bare `/reel/` guarded. `CONFIG` now accepts a `localStorage['veil:config']` override. Route detector: 30/30 unit cases pass. Remaining unknowns require on-device DOM inspection (IG Reels-tab markup, explore tile shape, whether IG rewrites `location` on reel auto-advance, current `ytm-*` shelf tag names).
- **2026-09 Design System v2:** Skills applied — ui-ux-pro-max (OLED-dark + glassmorphism direction, a11y checklist), emil-design-eng (strong custom easings, sub-300ms UI, `:active` press feedback), impeccable (token discipline). Accent scale retuned to the brighter reference-screenshot green: `#34d399`/`#2ed573` retired → `--accent: #17d861`. New framework-agnostic `design-system/` (tokens.css + veil-ui.css + design-system.html). One token set now feeds the dashboard mockup AND the userscript shield overlay (§4 CSS rewritten: brand palette, inline SVG shield icon replacing the 🛡 emoji per no-emoji rule, "Return to Safety" upgraded to the animated primary CTA — keyframe/@property names veil-prefixed + `!important`-hardened for the instagram.com/m.youtube.com host pages). Shiny conic-ring treatment scoped to primary CTAs only; secondary/ghost/icon share the pill + border language statically; `prefers-reduced-motion` freezes the ring. `components/ui/shiny-button.tsx` added as a React drop-in (styled-jsx → injected `<style>` so it is not Next-only). No build system introduced — project stays userscript-based.
- **2026-09 DS v2 applied — companion app:** New `app/index.html` — 4-screen Veil dashboard (Home / Insights / Rules / Settings) on DS v2, mobile-width, bottom `.veil-nav` dock. Content is Veil's own domain (interceptions, by-surface breakdown, focus-reclaimed estimate, per-platform status) — no fintech content, screenshots were reference only. Rules screen is a real control surface: every `ConfigState` field as a `.veil-switch` + Explore-mode segmented; "Save & sync" writes `localStorage['veil:config']` in the shape `veil_shield.user.js loadConfig()` reads. Added app-shell primitives to `veil-ui.css` (`.veil-switch`, `.veil-row`, `.veil-meter`, `.veil-quick`, `.veil-scroll-x`, `.veil-topbar`, `.veil-dock`, `[data-screen]` switch) and an "App primitives" section to `design-system.html`. Verified all 4 screens in a 375px viewport; config round-trip confirmed. `noreels_mockup.html` (dashboard + IG/YT simulator) left as-is on v2 tokens — rebuilding its simulator is out of scope for "apply the system".
- **2026-09 App restructure + master pause:** Home page rebuilt — one master `.veil-btn--primary` "Shield On/Off" button up top, then an Instagram panel and a YouTube panel (real brand glyphs, per-platform pause switch, all rule switches inline). "Rules" screen deleted, its switches now live in the Home panels; "Quick rules" strip removed (redundant once full panels are on Home). Dock is 3 items (Home / Insights / Settings). All graphs + recent-interceptions moved to Insights. Userscript → **v3.2**: config gained `paused` (global) + `instagram.paused` / `youtube.paused`; new `ARMED` const (single-platform-per-load, so one gate) makes `boot()` inject nothing when paused — individual rule state is preserved (pause, not reset). ARMED logic 10/10 unit cases; route detector still 30/30. `veil-ui.css` unchanged from the DS-v2-applied pass (app-shell primitives already there).
- **2026-09-07 Master toggle → circular shield button:** Replaced the full-width `.veil-btn--primary` master CTA on Home with `.veil-shield-btn` — a 132px circle: conic green ring + inset disc + shield glyph, green glow that breathes (3.4s) when armed, muted ring + grey glyph + no motion when paused. `[aria-pressed]` drives state; label ("Shield On"/"Shield Off") + status line sit below. Added to `veil-ui.css` APP SHELL and to `design-system.html`. Pause logic unchanged (writes `cfg.paused`).
- **2026-09-07 Companion app → Vite + React + TS:** `app/` scaffolded as a real project (Vite 6, React 18, TS strict). Ported Home / Insights / Settings from the single-file HTML into components (`src/components/*`, `src/screens/*`); `src/lib/config.ts` types `VeilConfig`, `useConfig` persists to `localStorage["veil:config"]` — same shape the userscript reads. `main.tsx` imports `../../design-system/{tokens,veil-ui}.css` directly (vite `server.fs.allow: ['..']`); no CSS duplicated. `npm run dev` → localhost:5173, `npm run build` = `tsc --noEmit && vite build` (passes). Old single-file version kept as `app/legacy-static.html` (Vite build ignores it). `node_modules`/`dist`/`*.tsbuildinfo` gitignored.
- **2026-09-07 Full shiny animation on primary + shield button:** `.veil-btn--primary` was only rotating its conic ring once (missing `infinite`) and its `::after` shimmer was being clobbered by a later combined `animation:` rule → both fixed; ring + dot-wedge now rotate continuously, `::after` shimmers, hover adds the faster reverse pass (composited). `.veil-shield-btn` rebuilt as a round `.veil-btn--primary`: rotating conic ring + halftone dot wedge (`::before`, mask rotates with `--veil-ga`) + shimmer (`::after`) + breathing inner glow (`__disc::before`, `veil-breathe`) — verified 4 running animations when `aria-pressed=true`, all stop + pseudos fade to 0 when `false`. `prefers-reduced-motion` freezes both at a fixed ring angle. `shiny-button.tsx` already faithful (`infinite`), untouched.
- **2026-09-07 Shield button — dark interior:** Stripped the green fill from inside `.veil-shield-btn`: removed the disc's `rgba(23,216,97,.2)` radial tint (now a flat dark `#10151c→#05070a` radial), deleted the inner breathing glow (`__disc::before`) and the `::after` shimmer sweep. What still lights up: the rotating conic ring + its outer `--accent-glow` bloom ("surrounding light") and the `::before` halftone dot wedge (rotates with `--veil-ga`). Shield glyph stays green. OFF still stops the ring + hides the dots. `.veil-btn--primary` unaffected — it keeps the full shimmer set.
- **2026-09-07 Shield button — more dots:** The dot wedge was only visible in the ~12px rim gap (occluded by the opaque disc). Added a second dot field on `.veil-shield-btn__disc::before` (disc gets `overflow:hidden`, opaque dark bg restored) that sits above the disc face, below the shield glyph — masked by (rotating conic wedge ~36°→ actually 34% of circle) ∩ (radial: none at centre, full by mid-radius) so dots fill from the rim inward and stop at the glyph. Own synced `veil-gradient-angle` animation; rim `::before` kept and bumped to opacity .5. OFF / reduced-motion hide + freeze both fields.
- **2026-09-07 Home topbar buttons removed + active-nav shiny:** Home's `.veil-topbar` menu (left) and Insights (right) icon buttons deleted — now just the centred "Veil" title (`<TopBar title="Veil" />`); `Home` lost its `onNavigate` prop / `Screen` import. `.veil-nav__item[aria-current="page"]` (the green pill on the bottom dock) gained the shiny light+shadow motion from the ShinyButton spec — kept its shape and green fill, added: rotating conic light sweep (`::after`, white, `mix-blend-mode:soft-light`, `veil-gradient-angle`), tiny halftone dot wedge (`::before`, `veil-gradient-angle`), and a breathing outer glow (`veil-nav-breathe` on box-shadow). No shimmer/`::after`-linear layer (kept it light). `prefers-reduced-motion` freezes all three. Follows `aria-current` so it moves with the active tab.
- **2026-09-07 Home topbar buttons removed; shiny motion on the nav pill (not the icons):** Home's `.veil-topbar` menu + Insights icon buttons deleted → centred "Veil" only (`<TopBar title="Veil" />`); `Home` dropped `onNavigate`/`Screen`. The ShinyButton light+shadow motion + dots now live on `.veil-nav` (the whole dock capsule), not on the buttons: rotating conic highlight on the 1px border (padding-box glass + border-box `conic-gradient`, `veil-gradient-angle`), a faint halftone dot wedge on `::before` behind the icons, and `veil-nav-breathe` pulsing the drop-glow. The 3 `.veil-nav__item`s are fully static again (`[aria-current="page"]` = green fill + static glow only). `prefers-reduced-motion` freezes the pill.
- **2026-09-07 Nav pill — ported the .shiny-cta hover:** the resting nav sweep was missing the original's hover state. Added to `.veil-nav:is(:hover, :focus-within)`: `--veil-gp` 5%→18% (highlight arc balloons, 800ms cubic-bezier(.25,1,.5,1)), `--veil-ga-offset` 0→95deg (phase shift), `--_shine` #d8ffe8→#fff, an inset `--accent-shine` bloom fades in on box-shadow, and a second faster `veil-gradient-angle` (1.25s reverse) composites in (`animation-composition: add`). Outer breathe glow moved to `.veil-nav::after` so it stays independent of hover. Verified via :focus-within: gp=18%, gaOffset=95deg, shine=#fff, inset bloom present, 2 composited spins.
- **2026-09-09 v3.3 — shared-reel scroll lock (on-device fix):** On-device: Reels tab correctly gone, but a shared reel (`/reel/{id}`) still scrolled into the feed. Cause: IG mobile web advances the reel feed with no `pushState` (URL-change primary check never fires) AND its scroller `stopPropagation()`s touch events before the v3.2 bubble-phase `document` listener, so the 45px-magnitude backstop never ran. Fix: `initTouchLock()` listeners moved to **capture phase**; the touchmove now `preventDefault()`s *every* predominantly-vertical drag (`|dy|>|dx| && |dy|>8`) on a `shared_reel` page — deterministic, no threshold to false-negative — and the first upward pull (`dy>24`) raises the blackout once. Added a capture-phase `wheel` lock for non-touch parity. `sharedReelTouchBackstop:false` now drops just the gesture lock. `node --check` OK. Tradeoff: the reel permalink's own caption/comments no longer scroll — acceptable for an anti-doomscroll tool. Still unconfirmed: whether IG ever *does* change the URL on auto-advance (would make the primary check live again).
- **2026-09-08 Git + Vercel + bookmarklet bridge:** Project put under git (was untracked), root `.gitignore` (excludes `Skills/` — local skill toolbox, not Veil) + `vercel.json` (`cd app && npm install && npm run build` → `app/dist`), pushed to `github.com/mihailcivanov05-alt/Veil` for Vercel to auto-deploy. Closed the cross-origin gap: the dashboard writes `veil:config` to *its* origin (`*.vercel.app`), the userscript reads it on `instagram.com` / `m.youtube.com` — separate `localStorage` buckets, so dashboard changes never reached the shield. New `app/src/lib/bridge.ts` = `configPayload(cfg)` (compact JSON) + `APPLY_BOOKMARKLET`, a static `javascript:` bookmarklet ("Veil Sync") that reads the clipboard (fallback `prompt()`), validates shape, writes `veil:config` on whatever origin it runs on, reloads. New Settings → "Sync to Safari" card: copy-config button + payload preview + collapsible one-time bookmark setup. Home footer line updated (no longer implies auto-pickup). Userscript §1 header notes the bookmarklet. Bridge is manual-per-change by design (keeps the zero-backend model); remote-fetch was the alternative, deferred. Build 42 modules OK, `node --check` OK, verified in 375px viewport (payload 273 chars valid, no overflow).
