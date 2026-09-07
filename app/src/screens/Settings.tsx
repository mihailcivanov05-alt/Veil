import { useState } from 'react'
import { Row } from '../components/Row'
import { Button, Chip, IconButton, SectionLabel, Segmented } from '../components/primitives'
import { Back, Extension, Lock, ShieldPlain } from '../components/icons'

export function Settings({ onBack }: { onBack: () => void }) {
  const [secs, setSecs] = useState<'25' | '42' | '90'>('42')

  return (
    <div className="screen">
      <div className="veil-topbar">
        <IconButton label="Back" onClick={onBack}><Back /></IconButton>
        <span className="veil-topbar__title">Settings</span>
        <span style={{ width: 44 }} />
      </div>

      <SectionLabel>Shield health</SectionLabel>
      <div className="veil-card" style={{ paddingTop: 'var(--sp-2)', paddingBottom: 'var(--sp-2)' }}>
        <Row
          icon={<ShieldPlain width={18} height={18} />}
          iconTone="accent"
          title="Userscript v3.2"
          sub="Active on instagram.com & m.youtube.com"
          meta={<Chip tone="accent">On</Chip>}
        />
        <Row
          icon={<Extension width={18} height={18} />}
          title="Userscripts extension"
          sub="Enabled in Safari"
          meta={<Chip tone="accent">On</Chip>}
        />
        <Row
          icon={<Lock width={18} height={18} />}
          iconTone="danger"
          title="Screen Time lock"
          sub="Not set — nothing stops a quick disable"
          meta={<button className="veil-link">Set up</button>}
        />
      </div>

      <SectionLabel>Enforcement</SectionLabel>
      <div className="veil-card">
        <p className="muted" style={{ margin: 0, fontSize: 'var(--fs-label)' }}>
          Delete the native Instagram &amp; YouTube apps, or cap them at a 1-minute daily limit, so the
          protected Safari versions are the only way in.
        </p>
        <Button size="sm" style={{ marginTop: 'var(--sp-4)' }}>Open setup guide</Button>
      </div>

      <SectionLabel>Estimate</SectionLabel>
      <div className="veil-card between">
        <div className="rule__text">
          <div className="rule__title">Seconds per averted session</div>
          <div className="rule__sub">Feeds the "time not scrolled" figure</div>
        </div>
        <Segmented
          value={secs}
          onChange={setSecs}
          options={[
            { value: '25', label: '25s' },
            { value: '42', label: '42s' },
            { value: '90', label: '90s' },
          ]}
        />
      </div>

      <p
        className="faint"
        style={{ fontSize: 'var(--fs-caption)', textAlign: 'center', marginTop: 'var(--sp-8)' }}
      >
        Veil · Companion for the scroll shield
        <br />
        Design System v2 · dark
      </p>
    </div>
  )
}
