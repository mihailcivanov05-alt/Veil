import { useEffect, useMemo, useRef, useState } from 'react'

/* Inlined so this file is self-contained for registries (21st.dev Studio,
   shadcn-style installs) that only bundle the exact file(s) you publish and
   won't resolve a sibling .css import. Rendered as a single <style> tag. */
const BBD2_CSS = `/* broken by design. ---------------------------------------------------- */

.bbd2 {
  position: relative;
  width: 100%;
  overflow: hidden;
  isolation: isolate;
  background: #030407;
  perspective: 1250px;
  container-type: inline-size;
  font-family: 'Space Grotesk', 'Archivo Black', system-ui, sans-serif;
  user-select: none;
}

.bbd2-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse 62% 50% at 50% 42%, rgba(125, 150, 200, 0.08), transparent 62%),
    radial-gradient(ellipse 100% 80% at 50% 118%, rgba(45, 55, 90, 0.18), transparent 60%),
    #030407;
}

.bbd2-stage { position: absolute; inset: 6% 4.5%; }

.bbd2-title, .bbd2-slice {
  position: absolute; display: grid; place-items: center;
  pointer-events: none; white-space: nowrap; font-weight: 700;
  font-size: clamp(26px, 10cqw, 190px); letter-spacing: -0.035em; line-height: 1;
}

.bbd2-title { inset: 0; z-index: 1; opacity: 0; animation: bbd2-cracks-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.bbd2-title--under span, .bbd2-title--under .bbd2-stack { color: rgba(188, 198, 220, 0.24); }

.bbd2--portrait .bbd2-title, .bbd2--portrait .bbd2-slice { font-size: clamp(44px, 20cqw, 190px); }

.bbd2-stack { display: flex; flex-direction: column; align-items: center; gap: 0.08em; transform: rotate(-8deg); line-height: 0.92; }
.bbd2-stack em { font-style: normal; display: block; }
.bbd2-stack em:nth-child(2) { font-size: 0.44em; align-self: flex-end; margin-right: 8%; opacity: 0.85; }

.bbd2-cracks { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 2; pointer-events: none; opacity: 0; animation: bbd2-cracks-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

@keyframes bbd2-cracks-in { to { opacity: 1; } }

.bbd2-cracks path { fill: none; vector-effect: non-scaling-stroke; }
.bbd2-cracks-line path { stroke: rgba(198, 214, 244, 0.34); stroke-width: 1; }
.bbd2-cracks-glow path { stroke: rgba(170, 195, 240, 0.10); stroke-width: 2.6; }
.bbd2-cracks-fine path { stroke: rgba(198, 214, 244, 0.17); stroke-width: 0.75; }

.bbd2-pane { position: absolute; inset: 0; z-index: 5; transform-style: preserve-3d; pointer-events: none; }

.bbd2-shard { position: absolute; transform-origin: 50% 50%; pointer-events: auto; will-change: transform; transition: filter 0.45s cubic-bezier(0.16, 1, 0.3, 1); }

.bbd2-shard--hot { z-index: 40 !important; filter: brightness(1.22) drop-shadow(0 42px 54px rgba(0,0,0,0.72)) drop-shadow(0 0 30px rgba(150,185,255,0.18)); }

.bbd2-inlay { position: absolute; inset: 0; overflow: hidden; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-size: 100% 100%; mask-size: 100% 100%; pointer-events: none; }

.bbd2-glassimg { position: absolute; inset: 0; background-size: 100% 100%; background-repeat: no-repeat; }

.bbd2-glassimg::after { content: ''; position: absolute; inset: 0; background: linear-gradient(132deg, rgba(165,185,232,0.13) 0%, rgba(165,185,232,0.03) 30%, transparent 46%, transparent 60%, rgba(112,96,178,0.08) 100%); mix-blend-mode: screen; }

.bbd2-slice > span, .bbd2-slice > .bbd2-stack { color: rgba(222,232,252,0.52); mix-blend-mode: screen; filter: blur(0.3px); transform: var(--jt); text-shadow: 0 0 12px rgba(165,195,250,0.22); }

.bbd2-slice > .bbd2-stack { transform: var(--jt) rotate(-8deg); }

.bbd2-specular { position: absolute; inset: 0; opacity: 0; background: radial-gradient(42% 42% at var(--mx,50%) var(--my,50%), rgba(205,225,255,0.34), rgba(140,170,230,0.08) 46%, transparent 72%); mix-blend-mode: screen; transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1); }

.bbd2-shard--hot .bbd2-specular { opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  .bbd2-shard, .bbd2-specular { transition: none; }
  .bbd2-cracks, .bbd2-title { animation: none; opacity: 1; }
}
`

export interface BrokenByDesignProps {
  assetsBase?: string
  title?: string
  height?: string
  sound?: boolean
  interactive?: boolean
  className?: string
}

export default function BrokenByDesign({
  title = 'broken by design.',
  height = '100dvh',
  interactive = true,
  className = '',
}: BrokenByDesignProps) {
  return (
    <>
      <style>{BBD2_CSS}</style>
      <section
        className={`bbd2 ${className}`}
        style={{ height }}
        aria-label={title}
      >
        <div className="bbd2-bg" aria-hidden="true" />
        <div className="bbd2-stage">
          <div className="bbd2-title bbd2-title--under" aria-hidden="true">
            <span>{title}</span>
          </div>
        </div>
      </section>
    </>
  )
}
