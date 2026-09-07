/**
 * veil:config — the single settings object the companion app and the userscript
 * share. Shape MUST stay in sync with veil_shield.user.js `loadConfig()`
 * (DEFAULTS + `paused` / `instagram.paused` / `youtube.paused`).
 */

export type ExploreMode = 'blackout' | 'blur' | 'hide_videos_only'

export interface VeilConfig {
  /** global master — the circular Shield button */
  paused: boolean
  instagram: {
    /** per-platform master */
    paused: boolean
    hideReelsTab: boolean
    exploreGridMode: ExploreMode
    blockSharedReelScroll: boolean
    allowProfileReelsOnly: boolean
    feedReelsHidden: boolean
  }
  youtube: {
    paused: boolean
    hideShortsTab: boolean
    hideShortsShelves: boolean
    blockShortsPlayer: boolean
  }
}

export const DEFAULTS: VeilConfig = {
  paused: false,
  instagram: {
    paused: false,
    hideReelsTab: true,
    exploreGridMode: 'blackout',
    blockSharedReelScroll: true,
    allowProfileReelsOnly: true,
    feedReelsHidden: true,
  },
  youtube: {
    paused: false,
    hideShortsTab: true,
    hideShortsShelves: true,
    blockShortsPlayer: true,
  },
}

const KEY = 'veil:config'

export function loadConfig(): VeilConfig {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(DEFAULTS)
    const o = (JSON.parse(raw) ?? {}) as Partial<VeilConfig>
    return {
      paused: o.paused === true,
      instagram: { ...DEFAULTS.instagram, ...(o.instagram ?? {}) },
      youtube: { ...DEFAULTS.youtube, ...(o.youtube ?? {}) },
    }
  } catch {
    return structuredClone(DEFAULTS)
  }
}

export function saveConfig(c: VeilConfig): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(c))
  } catch {
    /* private mode / quota — ignore, same as the userscript */
  }
}
