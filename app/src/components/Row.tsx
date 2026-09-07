import type { ReactNode } from 'react'

export function Row({
  icon,
  iconTone,
  title,
  sub,
  meta,
}: {
  icon: ReactNode
  iconTone?: 'accent' | 'danger'
  title: string
  sub: ReactNode
  meta?: ReactNode
}) {
  return (
    <div className="veil-row">
      <div className={`veil-row__icon${iconTone ? ` veil-row__icon--${iconTone}` : ''}`}>{icon}</div>
      <div className="veil-row__body">
        <div className="veil-row__title">{title}</div>
        <div className="veil-row__sub">{sub}</div>
      </div>
      {meta != null && <div className="veil-row__meta">{meta}</div>}
    </div>
  )
}
