/**
 * Bookmarklet bridge — carries veil:config across origins.
 *
 * The dashboard writes veil:config to its own origin's localStorage. The
 * userscript reads it from instagram.com / m.youtube.com. Those are separate
 * localStorage buckets, so the dashboard can't reach the shield directly.
 *
 * Flow: copy the payload here -> in Safari, open Instagram / YouTube -> tap the
 * "Veil Sync" bookmark. It reads the clipboard (or prompts), validates, writes
 * veil:config on that origin, and reloads. The userscript picks it up next load.
 */

import type { VeilConfig } from './config'

/** Compact JSON the "Veil Sync" bookmarklet expects on the clipboard. */
export function configPayload(cfg: VeilConfig): string {
  return JSON.stringify(cfg)
}

/**
 * Static `javascript:` bookmarklet — save once in Safari as "Veil Sync", then
 * run it on instagram.com / m.youtube.com. Never needs regenerating; the config
 * travels via the clipboard, not baked into this string.
 */
export const APPLY_BOOKMARKLET =
  "javascript:(function(){var K='veil:config';function a(t){var o;try{o=JSON.parse(t)}catch(e){alert('Veil: clipboard is not valid JSON');return}if(!o||typeof o!='object'||(!o.instagram&&!o.youtube&&!('paused' in o))){alert('Veil: that does not look like a Veil config');return}try{localStorage.setItem(K,JSON.stringify(o))}catch(e){alert('Veil: could not save ('+e+')');return}alert('Veil applied to '+location.hostname+'. Reloading.');location.reload()}if(navigator.clipboard&&navigator.clipboard.readText){navigator.clipboard.readText().then(a,function(){var t=prompt('Paste Veil config JSON');if(t)a(t)})}else{var t=prompt('Paste Veil config JSON');if(t)a(t)}})();"
