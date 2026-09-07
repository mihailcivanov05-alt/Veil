import type { ReactNode } from 'react'
import { HomeIcon, ChartBars, Gear } from './icons'

export type Screen = 'home' | 'insights' | 'settings'

const ITEMS: { id: Screen; label: string; icon: ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  { id: 'insights', label: 'Insights', icon: <ChartBars /> },
  { id: 'settings', label: 'Settings', icon: <Gear /> },
]

export function Nav({
  current,
  onNavigate,
}: {
  current: Screen
  onNavigate: (s: Screen) => void
}) {
  return (
    <div className="veil-dock">
      <nav className="veil-nav" aria-label="Primary">
        {ITEMS.map((it) => (
          <button
            key={it.id}
            className="veil-nav__item"
            aria-current={current === it.id ? 'page' : undefined}
            aria-label={it.label}
            onClick={() => onNavigate(it.id)}
          >
            {it.icon}
          </button>
        ))}
      </nav>
    </div>
  )
}
