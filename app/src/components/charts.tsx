import type { ReactNode } from 'react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function Weekdays() {
  return (
    <div className="chart-x">
      {DAYS.map((d) => (
        <span key={d}>{d}</span>
      ))}
    </div>
  )
}

/** Weekly interceptions — area chart (illustrative data). */
export function WeekAreaChart() {
  return (
    <>
      <svg
        className="chart"
        viewBox="0 0 320 92"
        preserveAspectRatio="none"
        aria-label="Interceptions per day this week"
      >
        <defs>
          <linearGradient id="veil-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#17d861" stopOpacity="0.30" />
            <stop offset="1" stopColor="#17d861" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,66 L53,44 L107,55 L160,18 L213,32 L267,49 L320,38 L320,92 L0,92 Z"
          fill="url(#veil-area)"
        />
        <path
          d="M0,66 L53,44 L107,55 L160,18 L213,32 L267,49 L320,38"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="160" cy="18" r="4.5" fill="var(--bg)" stroke="var(--accent)" strokeWidth="3" />
      </svg>
      <Weekdays />
    </>
  )
}

export function Bars({ values, hot }: { values: number[]; hot: number }) {
  const max = Math.max(...values)
  return (
    <>
      <div className="bars">
        {values.map((v, i) => (
          <i key={i} className={i === hot ? 'hot' : ''} style={{ height: `${(v / max) * 100}%` }} />
        ))}
      </div>
      <Weekdays />
    </>
  )
}

export function Meter({
  label,
  value,
  pct,
}: {
  label: ReactNode
  value: number
  pct: number
}) {
  return (
    <div className="veil-meter">
      <span className="veil-meter__label">{label}</span>
      <span className="veil-meter__val">{value.toLocaleString()}</span>
      <div className="veil-meter__track">
        <div className="veil-meter__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
