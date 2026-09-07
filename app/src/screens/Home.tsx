import type { ReactNode } from 'react'
import type { VeilConfig } from '../lib/config'
import { ShieldButton } from '../components/ShieldButton'
import { AppPanel, Rule } from '../components/AppPanel'
import { Segmented, Switch, TopBar } from '../components/primitives'
import { InstagramGlyph, YouTubeGlyph } from '../components/icons'

type IgBoolKey =
  | 'hideReelsTab'
  | 'blockSharedReelScroll'
  | 'allowProfileReelsOnly'
  | 'feedReelsHidden'
type YtBoolKey = 'hideShortsTab' | 'hideShortsShelves' | 'blockShortsPlayer'

function status(cfg: VeilConfig): { warn: boolean; node: ReactNode } {
  const igOn = !cfg.instagram.paused
  const ytOn = !cfg.youtube.paused
  if (cfg.paused) return { warn: true, node: <><b>Paused</b> · nothing is being blocked right now</> }
  if (igOn && ytOn) return { warn: false, node: <><b>Active</b> · Instagram &amp; YouTube protected</> }
  if (!igOn && !ytOn) return { warn: true, node: <><b>Both platforms paused</b> · master is on but idle</> }
  return { warn: false, node: <><b>Active</b> · {igOn ? 'Instagram only' : 'YouTube only'}</> }
}

export function Home({
  cfg,
  update,
}: {
  cfg: VeilConfig
  update: (mutate: (draft: VeilConfig) => void) => void
}) {
  const st = status(cfg)

  const igRule = (key: IgBoolKey, title: string, sub: string) => (
    <Rule
      title={title}
      sub={sub}
      control={
        <Switch
          checked={cfg.instagram[key]}
          onChange={(v) => update((d) => { d.instagram[key] = v })}
          label={title}
        />
      }
    />
  )
  const ytRule = (key: YtBoolKey, title: string, sub: string) => (
    <Rule
      title={title}
      sub={sub}
      control={
        <Switch
          checked={cfg.youtube[key]}
          onChange={(v) => update((d) => { d.youtube[key] = v })}
          label={title}
        />
      }
    />
  )

  return (
    <div className="screen">
      <TopBar title="Veil" />

      <div className="master-wrap">
        <ShieldButton on={!cfg.paused} onToggle={() => update((d) => { d.paused = !d.paused })} />
        <div className="master__label">{cfg.paused ? 'Shield Off' : 'Shield On'}</div>
        <div className={`master__status${st.warn ? ' is-paused' : ''}`}>{st.node}</div>
      </div>

      <div className={`panels${cfg.paused ? ' is-paused' : ''}`}>
        <AppPanel
          name="Instagram"
          icon={<InstagramGlyph />}
          iconClass="brand--ig"
          active={!cfg.instagram.paused}
          onActiveChange={(v) => update((d) => { d.instagram.paused = !v })}
        >
          {igRule('hideReelsTab', 'Hide Reels tab', 'Remove it from every nav surface')}
          <Rule
            stack
            title="Explore grid"
            sub="Search stays; the grid doesn't"
            control={
              <Segmented
                value={cfg.instagram.exploreGridMode}
                onChange={(v) => update((d) => { d.instagram.exploreGridMode = v })}
                options={[
                  { value: 'blackout', label: 'Blackout' },
                  { value: 'blur', label: 'Blur' },
                  { value: 'hide_videos_only', label: 'Videos' },
                ]}
              />
            }
          />
          {igRule('blockSharedReelScroll', 'Block shared-reel scroll', 'Watch the one that was sent; no swiping on')}
          {igRule('allowProfileReelsOnly', 'Reels on profiles only', "Allow a creator's reels when you visit them")}
          {igRule('feedReelsHidden', 'Hide feed reel suggestions', 'Strip injected reel units from Home')}
        </AppPanel>

        <AppPanel
          name="YouTube"
          icon={<YouTubeGlyph />}
          iconClass="brand--yt"
          active={!cfg.youtube.paused}
          onActiveChange={(v) => update((d) => { d.youtube.paused = !v })}
        >
          {ytRule('hideShortsTab', 'Hide Shorts tab', 'Pivot bar + sidebar entries')}
          {ytRule('hideShortsShelves', 'Hide Shorts shelves', 'Home, subscriptions, search, channels')}
          {ytRule('blockShortsPlayer', 'Redirect Shorts to player', '/shorts/{id} opens in the normal watch page')}
        </AppPanel>
      </div>

      <p
        className="faint"
        style={{ fontSize: 'var(--fs-caption)', textAlign: 'center', margin: 'var(--sp-5) 0 0' }}
      >
        Changes save on this device. Use <b>Settings &rarr; Sync to Safari</b> to push them to the shield.
      </p>
    </div>
  )
}
