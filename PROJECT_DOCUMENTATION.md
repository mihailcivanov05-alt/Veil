# Veil — No Reels & No Shorts (Browser Pivot)

**Date:** September 2026  
**Target Platform:** iOS 17+ Safari (iPhone 17 Pro) via Userscripts extension  
**Project State:** userscript v3.2 (route logic 30/30, ARMED gate 10/10; CSS selectors pending on-device confirmation) · Design System v2 · companion app rebuilt (Home master + IG/YT panels, Insights, Settings).

---

## 1. Project Overview & Philosophy

**Veil** is a privacy-first, zero-cost anti-doomscrolling shield that deterministically blocks Instagram Reels and YouTube Shorts in mobile Safari on iPhone.

**Core Directives (from `GEMINI.md` Constitution):**
1. **Deterministic Blocking:** Targets exact URL routes (`/reels/`, `/reel/{code}`, `/shorts/{id}`) and stable accessibility attributes (`aria-label`, `href`, custom element tags). No fuzzy heuristics, no minified CSS classes.
2. **Preserve Legitimate Usage:** DMs, search, creator profiles, stories, and long-form YouTube videos remain 100% accessible and unobstructed.
3. **Fail-Safe UI:** If an infinite reel/short feed is detected (URL change to different reel, or upward swipe), the system immediately shows a full-screen blackout overlay. Never fails open.
4. **Zero Layout Distortion:** Elements are hidden with `display: none !important` — no visual artifacts or broken layouts.

---

## 2. Architecture: Safari Userscript Engine

The entire blocking system is a single JavaScript file (`userscripts/veil_shield.user.js`) that runs inside Safari via the free, open-source **Userscripts** extension (App Store).

### Why This Approach (Post-Audit Decision)

| Approach | Stability | Ban Risk | Cost | Surgical Control |
| :--- | :--- | :--- | :--- | :--- |
| ~~Native dylib injection~~ | ~2 weeks (obfuscated classes rotate) | **HIGH** (account ban) | $99/yr + 7-day resigning | Full |
| ~~DNS/VPN blocking~~ | N/A (shared CDN hostnames) | None | Varies | **Impossible** |
| ~~Screen Time~~ | Stable | None | Free | **Whole-app only** |
| **Safari Userscript** ✅ | **Years** (public URL contracts) | **None** | **Free** | **Full** |

### How It Works

```
┌─────────────────────────────────────────────────────┐
│  iOS Safari on iPhone                                │
│  ┌───────────────────────────────────────────────┐  │
│  │  Userscripts Extension (App Store)            │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │  veil_shield.user.js                    │  │  │
│  │  │  ├─ Anti-flicker CSS (document-start)   │  │  │
│  │  │  ├─ URL Route Detector (deterministic)  │  │  │
│  │  │  ├─ SPA History Hooks (pushState, etc)  │  │  │
│  │  │  ├─ MutationObserver (dynamic elements) │  │  │
│  │  │  ├─ Touch Gesture Interceptor (iOS)     │  │  │
│  │  │  ├─ YouTube /shorts/ → /watch redirect  │  │  │
│  │  │  └─ Fail-Safe Overlay Manager           │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ instagram.com│  │m.youtube.com │                 │
│  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────┘
```

---

## 3. Files & Structure

```
No Reels/
├── userscripts/
│   └── veil_shield.user.js          ← The entire blocking engine (v3.2)
├── design-system/                   ← Veil Design System v2 (framework-agnostic)
│   ├── tokens.css                   ← single source of truth: colour, type, motion, z
│   ├── veil-ui.css                  ← component + app-shell classes (.veil-btn, .veil-shield-btn, .veil-switch, .veil-nav …)
│   └── design-system.html           ← visual spec / reference page
├── app/                             ← Veil companion dashboard — Vite + React + TS
│   ├── index.html  src/  vite.config.ts  tsconfig.json  package.json
│   │                                  `npm install` then `npm run dev` → http://localhost:5173
│   │                                  imports ../design-system/*.css directly (server.fs.allow)
│   └── legacy-static.html            ← the pre-React single-file version, kept for reference
├── components/ui/
│   ├── shiny-button.tsx             ← React drop-in of the primary CTA (stub until a build exists)
│   └── shiny-button.demo.tsx
├── tests/
│   └── web_shield_test.html         ← Browser-based verification suite
├── docs/
│   └── ios_setup_guide.md           ← Step-by-step iPhone install guide
├── tools/
│   └── generate_mobileconfig.py     ← Safari WebClip generator (FullScreen: false)
├── noreels_mockup.html              ← dashboard prototype (now on DS v2 tokens)
├── NoReels_DistractionFree.mobileconfig  ← Ready-to-install profile
├── GEMINI.md                        ← Project constitution & schemas
└── PROJECT_DOCUMENTATION.md         ← This file
```

## 3b. Design System v2

Dark OLED + glassmorphism, accent retuned to the brighter spring-green from the
reference screenshots (old `#34d399` / `#2ed573` retired → `--accent: #17d861`).
**One token set** (`design-system/tokens.css`) drives both the companion
dashboard and the in-page shield overlay the userscript injects.

| Consumer | How it uses the system |
| :--- | :--- |
| `design-system/design-system.html` | `<link>`s both CSS files — the living spec |
| `noreels_mockup.html` | `<link>`s both CSS files; legacy `:root` names remapped to v2 values |
| `userscripts/veil_shield.user.js` §4 | tokens **inlined** (a userscript can't `@import` into instagram.com); keep in sync with `veil-ui.css` `.veil-shield` / `.veil-btn--primary` |
| `components/ui/shiny-button.tsx` | React port; `<style jsx>` → injected `<style>` so it works outside Next |

**Buttons:** the animated "shiny" treatment — conic ring + halftone dot wedge
(`::before`) + shimmer sweep (`::after`) + breathing glow, all running
**continuously** — is **primary only**: `.veil-btn--primary`,
`.veil-btn--primary.veil-btn--solid`, and `.veil-shield-btn` (the round master
toggle, which is a circular `.veil-btn--primary`). Secondary / ghost / icon reuse
the same pill + dual-gradient border + `:active` press, **statically**.
`prefers-reduced-motion` freezes the ring at a fixed angle; `.veil-shield-btn`
also stops everything and greys out when `aria-pressed="false"`.

### Companion dashboard — `app/` (Vite + React + TypeScript)

```
cd app && npm install && npm run dev      # → http://localhost:5173
npm run build                             # tsc --noEmit + vite build → app/dist
```

`src/main.tsx` imports the shared design system directly
(`../../design-system/tokens.css` + `veil-ui.css`) — `vite.config.ts` sets
`server.fs.allow: ['..']` so the dev server can read it. `src/lib/config.ts`
types `VeilConfig` and `src/lib/useConfig.ts` persists every change to
`localStorage["veil:config"]`. Components: `ShieldButton`, `AppPanel`/`Rule`,
`Switch`/`Segmented`/`Button` (primitives.tsx), `Nav`, `charts.tsx`, `Row`.

Three screens switched by the bottom `.veil-nav` dock, all on DS v2:

| Screen | Content |
| :--- | :--- |
| **Home** | **Master toggle** — a circular `.veil-shield-btn` (green conic ring + breathing glow when on, muted + grey glyph when off) that pauses / resumes the whole shield. Then an **Instagram panel** and a **YouTube panel**, each = brand glyph + name + per-platform pause switch + that platform's rule switches (Explore mode is a segmented control). Every change persists to `localStorage["veil:config"]` immediately. |
| **Insights** | "Focus reclaimed this week" glass hero + weekly interceptions area chart; all-time count; **by-surface** meter breakdown (Reels tab / Explore grid / Shorts shelves / shared-reel scroll / …); by-platform split; "time not scrolled" estimate; most-blocked insight; **recent interceptions** list |
| **Settings** | shield-health rows (userscript / extension / Screen Time lock); enforcement note; seconds-per-session estimate input |

**The dashboard drives the shield.** It writes `localStorage["veil:config"]` in the exact
shape `veil_shield.user.js` `loadConfig()` reads. `paused` (global) and
`instagram.paused` / `youtube.paused` (per-platform) are **pause flags** — v3.2's
`ARMED` check reads them and injects nothing when a platform is paused, while every
individual rule keeps its saved state. Changes apply on the next Instagram / YouTube
page load.

### Deprecated (Pre-Pivot)
The following files are from the abandoned native injection approach and are kept for reference only:
- `tweak/` — Objective-C dylib source (non-functional, see audit)
- `tools/patch_ipa.py` — Mach-O patcher (corrupted FAT binaries, see audit)
- `tools/test_patcher.py` — Tests against synthetic mock only
- `bbd_injection.js` — Shattered glass UI effect (dashboard prototype)
- `components/ui/liquid-metal-button.tsx`, `hero-futuristic.tsx`, `broken-by-design.tsx` — earlier React stubs, no build target

---

## 4. Blocking Behavior Summary

### Instagram (`www.instagram.com`)

| Feature | Behavior | Selector Strategy |
| :--- | :--- | :--- |
| Reels Tab | **Hidden** from navigation | `a[href^="/reels/"]`, `svg[aria-label="Reels"]` |
| Reels Feed (`/reels/`) | **Blackout overlay** | URL route detection |
| Explore **grid** (`/explore(/)`) | Media tiles **hidden**, header + search untouched | `html[data-veil-page="explore_grid"] main a[href^="/p/"]` / `a[href^="/reel/"]` |
| Explore **search / tags** (`/explore/…`) | ✅ Left fully functional (user-initiated) | Not matched |
| Shared Reel (`/reel/{id}`) | **View one**, auto-advance → blackout; swipe → blackout (backstop) | URL-change detection (primary) + touch heuristic (subordinate) |
| Feed Reels | **Hidden** from home feed | `article:has(a[href^="/reel/"])` |
| DMs | ✅ Fully accessible | Whitelisted `/direct/` |
| Creator Profiles | ✅ Fully accessible | Whitelisted `/{username}/` |
| Stories | ✅ Fully accessible | Whitelisted `/stories/` |
| Search | ✅ Fully accessible | Search inputs force-revealed |

### YouTube (`m.youtube.com`)

| Feature | Behavior | Selector Strategy |
| :--- | :--- | :--- |
| Shorts Tab | **Hidden** | `ytm-pivot-bar-item-renderer:has(div.pivot-shorts)` |
| Shorts Shelves | **Hidden** | `ytm-reel-shelf-renderer`, custom elements |
| Shorts URLs | **Redirected** to `/watch?v={id}` | `location.replace()` |
| Shorts Link Clicks | **Intercepted** before SPA router | Capture-phase click listener |
| Regular Videos | ✅ Fully accessible | No rules applied |
| Search | ✅ Fully accessible | No rules applied |
| Subscriptions | ✅ Fully accessible | No rules applied |

---

## 5. Setup

See [docs/ios_setup_guide.md](docs/ios_setup_guide.md) for the complete step-by-step installation guide.

**Quick version:**
1. Install **Userscripts** from App Store (free)
2. Enable in Settings → Safari → Extensions
3. Copy `veil_shield.user.js` into the extension
4. Open `instagram.com` / `m.youtube.com` in Safari — done
