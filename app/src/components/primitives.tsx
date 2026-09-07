import type { ButtonHTMLAttributes, KeyboardEvent, ReactNode } from 'react'

/* ---- icon button --------------------------------------------------- */
export function IconButton({
  label,
  children,
  ...rest
}: { label: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="veil-btn veil-btn--icon" aria-label={label} {...rest}>
      {children}
    </button>
  )
}

/* ---- text button -------------------------------------------------- */
export function Button({
  variant = 'secondary',
  size,
  children,
  ...rest
}: {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm'
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = ['veil-btn', `veil-btn--${variant}`, size === 'sm' && 'veil-btn--sm']
    .filter(Boolean)
    .join(' ')
  return (
    <button className={cls} {...rest}>
      <span className="veil-btn__label">{children}</span>
    </button>
  )
}

/* ---- toggle switch --------------------------------------------- */
export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
}) {
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onChange(!checked)
    }
  }
  return (
    <div
      className="veil-switch"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      tabIndex={0}
      onClick={() => onChange(!checked)}
      onKeyDown={key}
    />
  )
}

/* ---- segmented control -------------------------------------- */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="veil-segmented">
      {options.map((o) => (
        <button
          key={o.value}
          className="veil-segmented__item"
          aria-selected={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ---- chip -------------------------------------------------- */
export function Chip({ tone, children }: { tone?: 'accent' | 'danger'; children: ReactNode }) {
  return <span className={`veil-chip${tone ? ` veil-chip--${tone}` : ''}`}>{children}</span>
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="veil-section-label">{children}</div>
}

/* ---- top bar --------------------------------------------- */
export function TopBar({
  left,
  title,
  right,
}: {
  left?: ReactNode
  title: string
  right?: ReactNode
}) {
  return (
    <div className="veil-topbar">
      {left ?? <span style={{ width: 44 }} />}
      <span className="veil-topbar__title">{title}</span>
      {right ?? <span style={{ width: 44 }} />}
    </div>
  )
}
