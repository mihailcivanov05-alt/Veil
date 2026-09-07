import { Shield } from './icons'

/** Circular master toggle. ON = green conic ring + breathing glow. */
export function ShieldButton({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      className="veil-shield-btn"
      aria-pressed={on}
      aria-label="Toggle shield"
      onClick={onToggle}
    >
      <span className="veil-shield-btn__disc">
        <Shield />
      </span>
    </button>
  )
}
