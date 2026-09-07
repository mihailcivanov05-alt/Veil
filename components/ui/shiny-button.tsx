"use client"

import type React from "react"
import { useEffect } from "react"

/**
 * ShinyButton — Veil primary CTA
 * ------------------------------------------------------------------
 * Adapted from the 21st.dev "shiny-cta" snippet:
 *   • Recolored strictly to Veil brand tokens (green, never blue).
 *   • `<style jsx>` (Next.js-only) replaced with a one-time injected
 *     <style> tag so this works in ANY React setup (Vite / CRA / Next).
 *   • Honours prefers-reduced-motion.
 *
 * NOTE: this project has no build system yet (see PROJECT_DOCUMENTATION.md).
 * The canonical, framework-free implementation lives in
 * `design-system/veil-ui.css` as `.veil-btn.veil-btn--primary`. Keep the two
 * in sync — this file is the drop-in for a future React/shadcn app.
 */

interface ShinyButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  /** Filled green body with dark label — e.g. "Send Money" / "Return to Safety". */
  solid?: boolean
  type?: "button" | "submit" | "reset"
  disabled?: boolean
}

const STYLE_ID = "veil-shiny-cta-styles"

const CSS = `
@property --gradient-angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
@property --gradient-angle-offset { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
@property --gradient-percent { syntax: "<percentage>"; initial-value: 5%; inherits: false; }
@property --gradient-shine { syntax: "<color>"; initial-value: #d8ffe8; inherits: false; }

.shiny-cta {
  --shiny-cta-bg: #05070a;
  --shiny-cta-bg-subtle: #141821;
  --shiny-cta-fg: #f4f7fb;
  --shiny-cta-highlight: #17d861;
  --shiny-cta-highlight-subtle: #7ef2ab;
  --animation: gradient-angle linear infinite;
  --duration: 3s;
  --shadow-size: 2px;
  --transition: 800ms cubic-bezier(0.23, 1, 0.32, 1);

  isolation: isolate;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  outline-offset: 4px;
  padding: 1rem 2.25rem;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.2;
  font-weight: 550;
  letter-spacing: -0.006em;
  border: 1px solid transparent;
  border-radius: 360px;
  color: var(--shiny-cta-fg);
  background: linear-gradient(var(--shiny-cta-bg), var(--shiny-cta-bg)) padding-box,
    conic-gradient(
      from calc(var(--gradient-angle) - var(--gradient-angle-offset)),
      transparent,
      var(--shiny-cta-highlight) var(--gradient-percent),
      var(--gradient-shine) calc(var(--gradient-percent) * 2),
      var(--shiny-cta-highlight) calc(var(--gradient-percent) * 3),
      transparent calc(var(--gradient-percent) * 4)
    ) border-box;
  box-shadow: inset 0 0 0 1px var(--shiny-cta-bg-subtle);
  transition: var(--transition);
  transition-property: --gradient-angle-offset, --gradient-percent, --gradient-shine;
}

.shiny-cta.shiny-cta--solid {
  --shiny-cta-bg: #17d861;
  --shiny-cta-bg-subtle: #0a7d38;
  color: #04160b;
  font-weight: 620;
  box-shadow: inset 0 0 0 1px #0a7d38, 0 8px 24px -10px rgba(23, 216, 97, 0.38);
}

.shiny-cta::before,
.shiny-cta::after,
.shiny-cta span::before {
  content: "";
  pointer-events: none;
  position: absolute;
  inset-inline-start: 50%;
  inset-block-start: 50%;
  translate: -50% -50%;
  z-index: -1;
}

.shiny-cta:active { translate: 0 1px; }
.shiny-cta:disabled { pointer-events: none; filter: grayscale(1) opacity(0.5); }

.shiny-cta::before {
  --size: calc(100% - var(--shadow-size) * 3);
  --position: 2px;
  --space: calc(var(--position) * 2);
  width: var(--size);
  height: var(--size);
  background: radial-gradient(
    circle at var(--position) var(--position),
    #d8ffe8 calc(var(--position) / 4),
    transparent 0
  ) padding-box;
  background-size: var(--space) var(--space);
  background-repeat: space;
  mask-image: conic-gradient(from calc(var(--gradient-angle) + 45deg), black, transparent 10% 90%, black);
  border-radius: inherit;
  opacity: 0.32;
  z-index: -1;
}

.shiny-cta::after {
  --animation: shimmer linear infinite;
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(-50deg, transparent, var(--shiny-cta-highlight), transparent);
  mask-image: radial-gradient(circle at bottom, transparent 40%, black);
  opacity: 0.55;
}

.shiny-cta span { z-index: 1; }

.shiny-cta span::before {
  --size: calc(100% + 1rem);
  width: var(--size);
  height: var(--size);
  box-shadow: inset 0 -1ex 2rem 4px var(--shiny-cta-highlight);
  opacity: 0;
  transition: opacity var(--transition);
  animation: calc(var(--duration) * 1.5) breathe linear infinite;
}

.shiny-cta,
.shiny-cta::before,
.shiny-cta::after {
  animation: var(--animation) var(--duration),
    var(--animation) calc(var(--duration) / 0.4) reverse paused;
  animation-composition: add;
}

.shiny-cta:is(:hover, :focus-visible) {
  --gradient-percent: 20%;
  --gradient-angle-offset: 95deg;
  --gradient-shine: var(--shiny-cta-highlight-subtle);
}

.shiny-cta:is(:hover, :focus-visible),
.shiny-cta:is(:hover, :focus-visible)::before,
.shiny-cta:is(:hover, :focus-visible)::after {
  animation-play-state: running;
}

.shiny-cta:is(:hover, :focus-visible) span::before { opacity: 1; }

@keyframes gradient-angle { to { --gradient-angle: 360deg; } }
@keyframes shimmer { to { rotate: 360deg; } }
@keyframes breathe { from, to { scale: 1; } 50% { scale: 1.2; } }

@media (prefers-reduced-motion: reduce) {
  .shiny-cta,
  .shiny-cta::before,
  .shiny-cta::after,
  .shiny-cta span::before { animation: none !important; }
  .shiny-cta { --gradient-percent: 16%; --gradient-angle-offset: 90deg; }
}
`

function useShinyStyles() {
  useEffect(() => {
    if (typeof document === "undefined") return
    if (document.getElementById(STYLE_ID)) return
    const el = document.createElement("style")
    el.id = STYLE_ID
    el.textContent = CSS
    document.head.appendChild(el)
  }, [])
}

export function ShinyButton({
  children,
  onClick,
  className = "",
  solid = false,
  type = "button",
  disabled = false,
}: ShinyButtonProps) {
  useShinyStyles()
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`shiny-cta ${solid ? "shiny-cta--solid" : ""} ${className}`.trim()}
    >
      <span>{children}</span>
    </button>
  )
}
