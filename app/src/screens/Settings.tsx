import { useState } from 'react'
import type { VeilConfig } from '../lib/config'
import { APPLY_BOOKMARKLET, configPayload } from '../lib/bridge'
import { Row } from '../components/Row'
import { Button, Chip, IconButton, SectionLabel, Segmented } from '../components/primitives'
import { Back, Extension, Lock, ShieldPlain } from '../components/icons'

export function Settings({ cfg, onBack }: { cfg: VeilConfig; onBack: () => void }) {
  const [secs, setSecs] = useState<'25' | '42' | '90'>('42')
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle')
  const [bmCopied, setBmCopied] = useState(false)

  const payload = configPayload(cfg)

  const copyPayload = () =>
    navigator.clipboard.writeText(payload).then(
      () => {
        setCopied('ok')
        setTimeout(() => setCopied('idle'), 1800)
      },
      () => setCopied('fail'),
    )
  const copyBookmarklet = () =>
    navigator.clipboard.writeText(APPLY_BOOKMARKLET).then(
      () => {
        setBmCopied(true)
        setTimeout(() => setBmCopied(false), 1800)
      },
      () => setBmCopied(false),
    )

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

      <SectionLabel>Sync to Safari</SectionLabel>
      <div className="veil-card">
        <p className="muted" style={{ margin: 0, fontSize: 'var(--fs-label)' }}>
          The shield reads its settings from Instagram&rsquo;s and YouTube&rsquo;s own storage. After
          you change anything here, push it across:
        </p>

        <ol className="sync-steps">
          <li>
            <div className="sync-row">
              <span>
                <b>Copy</b> the config
              </span>
              <Button size="sm" onClick={copyPayload}>
                {copied === 'ok' ? 'Copied' : copied === 'fail' ? 'Select below' : 'Copy config'}
              </Button>
            </div>
            <textarea
              className="sync-code"
              readOnly
              rows={3}
              value={payload}
              onFocus={(e) => e.currentTarget.select()}
            />
          </li>
          <li>
            In Safari, open <b>instagram.com</b> or <b>m.youtube.com</b>, tap your <b>Veil&nbsp;Sync</b>{' '}
            bookmark, and allow paste. The shield updates on the next page load.
          </li>
        </ol>

        <details className="sync-setup">
          <summary>Set up the bookmark (one time)</summary>
          <ol>
            <li>In Safari, bookmark any page (share sheet &rarr; Add Bookmark).</li>
            <li>Bookmarks &rarr; Edit &rarr; open that bookmark.</li>
            <li>
              Rename it <b>Veil Sync</b>.
            </li>
            <li>Replace its address with the text below.</li>
          </ol>
          <div className="sync-row">
            <span className="faint" style={{ fontSize: 'var(--fs-caption)' }}>
              javascript: bookmarklet
            </span>
            <Button size="sm" variant="ghost" onClick={copyBookmarklet}>
              {bmCopied ? 'Copied' : 'Copy bookmarklet'}
            </Button>
          </div>
          <textarea
            className="sync-code"
            readOnly
            rows={4}
            value={APPLY_BOOKMARKLET}
            onFocus={(e) => e.currentTarget.select()}
          />
        </details>
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
