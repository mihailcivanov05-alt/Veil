import type { ReactNode } from 'react'
import { Switch } from './primitives'

export function AppPanel({
  icon,
  iconClass,
  name,
  active,
  onActiveChange,
  children,
}: {
  icon: ReactNode
  iconClass: string
  name: string
  active: boolean
  onActiveChange: (v: boolean) => void
  children: ReactNode
}) {
  return (
    <section className="veil-card panel">
      <div className="panel-head">
        <span className={`brand ${iconClass}`} aria-hidden="true">
          {icon}
        </span>
        <span className="panel-head__name">{name}</span>
        <Switch checked={active} onChange={onActiveChange} label={`${name} blocking`} />
      </div>
      {children}
    </section>
  )
}

export function Rule({
  title,
  sub,
  control,
  stack,
}: {
  title: string
  sub: string
  control: ReactNode
  stack?: boolean
}) {
  return (
    <div className={`rule${stack ? ' rule--stack' : ''}`}>
      <div className="rule__text">
        <div className="rule__title">{title}</div>
        <div className="rule__sub">{sub}</div>
      </div>
      {control}
    </div>
  )
}
