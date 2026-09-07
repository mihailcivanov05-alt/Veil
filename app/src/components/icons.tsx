import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

/** stroke-style icon defaults (24-grid, rounded) */
function s(p: P): P {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...p,
  }
}

export const Menu = (p: P) => (
  <svg {...s(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
)
export const Search = (p: P) => (
  <svg {...s(p)}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
)
export const ChartBars = (p: P) => (
  <svg {...s(p)}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
)
export const Gear = (p: P) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.2.61.79 1 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)
export const Back = (p: P) => (
  <svg {...s(p)}><path d="m15 18-6-6 6-6" /></svg>
)
export const HomeIcon = (p: P) => (
  <svg {...s(p)}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 10v10h14V10" /></svg>
)
export const Shield = (p: P) => (
  <svg {...s({ strokeWidth: 1.75, ...p })}>
    <path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)
export const ShieldPlain = (p: P) => (
  <svg {...s(p)}><path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6z" /></svg>
)
export const Close = (p: P) => (
  <svg {...s(p)}><path d="M18 6 6 18M6 6l12 12" /></svg>
)
export const ArrowRight = (p: P) => (
  <svg {...s(p)}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
)
export const TrendUp = (p: P) => (
  <svg {...s({ strokeWidth: 2.5, ...p })}><path d="M7 17 17 7" /><path d="M8 7h9v9" /></svg>
)
export const Bars3 = (p: P) => (
  <svg {...s(p)}>
    <rect x="3" y="5" width="4" height="14" rx="1" />
    <rect x="10" y="5" width="4" height="14" rx="1" />
    <rect x="17" y="5" width="4" height="14" rx="1" />
  </svg>
)
export const Grid = (p: P) => (
  <svg {...s(p)}>
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
  </svg>
)
export const Extension = (p: P) => (
  <svg {...s(p)}>
    <path d="M14 7h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4" />
    <path d="M12 3v10m0 0 3-3m-3 3-3-3" />
  </svg>
)
export const Lock = (p: P) => (
  <svg {...s(p)}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
)
export const Sparkle = (p: P) => (
  <svg {...s(p)}>
    <path d="M12 2v4M12 18v4M4.9 4.9l2.9 2.9M16.2 16.2l2.9 2.9M2 12h4M18 12h4M4.9 19.1l2.9-2.9M16.2 7.8l2.9-2.9" />
  </svg>
)

/* brand glyphs (Simple Icons paths) — filled */
export const InstagramGlyph = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.06.42 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.17-1.06.37-2.23.42-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.42a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.17-.42-.37-1.06-.42-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.06-.37 2.23-.42C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.13 1.38C1.35 2.67.93 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13.67.66 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.13-1.38.66-.67 1.08-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.38-2.13C21.33 1.35 20.65.93 19.86.63 19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0m0 5.84A6.16 6.16 0 0 0 5.84 12 6.16 6.16 0 0 0 12 18.16 6.16 6.16 0 0 0 18.16 12 6.16 6.16 0 0 0 12 5.84M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m6.41-11.15a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88" />
  </svg>
)
export const YouTubeGlyph = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81M9.55 15.57V8.43L15.82 12z" />
  </svg>
)
