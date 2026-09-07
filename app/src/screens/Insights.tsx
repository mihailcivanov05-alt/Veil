import { useState } from 'react'
import { Bars, Meter, WeekAreaChart } from '../components/charts'
import { Row } from '../components/Row'
import { Button, Chip, IconButton, SectionLabel, Segmented } from '../components/primitives'
import { ArrowRight, Back, Bars3, Close, ShieldPlain, Sparkle, TrendUp } from '../components/icons'

const BY_SURFACE = [
  { label: 'Reels tab', value: 526, pct: 41 },
  { label: 'Explore grid', value: 283, pct: 22 },
  { label: 'Shorts shelves', value: 231, pct: 18 },
  { label: 'Shared-reel scroll', value: 141, pct: 11 },
  { label: 'Shorts tab', value: 64, pct: 5 },
  { label: 'Feed suggestions', value: 39, pct: 3 },
]

export function Insights({ onBack }: { onBack: () => void }) {
  const [range, setRange] = useState<'week' | 'month'>('week')

  return (
    <div className="screen">
      <div className="veil-topbar">
        <IconButton label="Back" onClick={onBack}><Back /></IconButton>
        <span className="veil-topbar__title">Insights</span>
        <span style={{ width: 44 }} />
      </div>

      <div className="veil-glass">
        <div className="hero-head">
          <div>
            <div className="veil-stat__label">Focus reclaimed · this {range}</div>
            <div className="veil-stat__value">{range === 'week' ? '5h 40m' : '23h 10m'}</div>
            <div className="veil-stat__delta">
              <TrendUp width={14} height={14} />
              +23% vs last {range}
            </div>
          </div>
          <Segmented
            value={range}
            onChange={setRange}
            options={[
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
            ]}
          />
        </div>
        <WeekAreaChart />
        <div className="faint" style={{ fontSize: 'var(--fs-caption)', marginTop: 6, textAlign: 'center' }}>
          Peak Thu · 47 interceptions
        </div>
      </div>

      <div className="veil-card between" style={{ marginTop: 'var(--sp-4)' }}>
        <div>
          <div className="veil-stat__label">Interceptions · all time</div>
          <div className="veil-stat__value" style={{ fontSize: 28 }}>1,284</div>
        </div>
        <div className="veil-stat__delta">
          <TrendUp width={14} height={14} />
          +23% this week
        </div>
      </div>

      <SectionLabel>By surface</SectionLabel>
      <div className="veil-card">
        {BY_SURFACE.map((s) => (
          <Meter key={s.label} label={s.label} value={s.value} pct={s.pct} />
        ))}
      </div>

      <SectionLabel>Weekly volume</SectionLabel>
      <div className="veil-card">
        <Bars values={[38, 54, 46, 88, 66, 50, 60]} hot={3} />
      </div>

      <SectionLabel>By platform</SectionLabel>
      <div className="mini-grid">
        <div className="veil-card">
          <div className="veil-stat__label">Instagram</div>
          <div className="veil-stat__value" style={{ fontSize: 26 }}>812</div>
        </div>
        <div className="veil-card">
          <div className="veil-stat__label">YouTube</div>
          <div className="veil-stat__value" style={{ fontSize: 26 }}>472</div>
        </div>
      </div>

      <SectionLabel>Time not scrolled</SectionLabel>
      <div className="veil-card">
        <div className="between">
          <div className="veil-stat__value" style={{ fontSize: 26 }}>≈ 21h</div>
          <Chip>this month</Chip>
        </div>
        <p className="faint" style={{ fontSize: 'var(--fs-caption)', margin: 'var(--sp-2) 0 0' }}>
          Estimate. Assumes ~42s per averted short-form session — tune it in Settings.
        </p>
      </div>

      <div className="veil-card veil-row" style={{ marginTop: 'var(--sp-4)' }}>
        <div className="veil-row__icon veil-row__icon--accent"><Sparkle width={18} height={18} /></div>
        <div className="veil-row__body">
          <div className="veil-row__title">Most-blocked surface: Reels tab</div>
          <div className="veil-row__sub">41% of all interceptions this month</div>
        </div>
      </div>

      <SectionLabel>Recent interceptions</SectionLabel>
      <div className="veil-card" style={{ paddingTop: 'var(--sp-2)', paddingBottom: 'var(--sp-2)' }}>
        <Row
          icon={<Close width={18} height={18} />}
          iconTone="accent"
          title="Reels tab blocked"
          sub="Instagram · nav"
          meta={<>2m ago<br /><span className="faint">×12 today</span></>}
        />
        <Row
          icon={<ArrowRight width={18} height={18} />}
          iconTone="accent"
          title="Short redirected to player"
          sub="YouTube · /shorts → /watch"
          meta="18m ago"
        />
        <Row
          icon={<ShieldPlain width={18} height={18} />}
          iconTone="danger"
          title="Infinite feed trapped"
          sub="Instagram · shared reel in DM"
          meta="1h ago"
        />
        <Row
          icon={<Bars3 width={18} height={18} />}
          title="Shorts shelf removed"
          sub="YouTube · Home feed"
          meta="3h ago"
        />
      </div>
    </div>
  )
}
