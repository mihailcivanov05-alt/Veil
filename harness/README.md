# VeilHarness — simulator test bed for the shield

A tiny iOS app (one `WKWebView`) that runs `userscripts/veil_shield.user.js`
the way the Userscripts extension does, on a dedicated **Veil iPhone 17 Pro**
simulator, and reports what the shield is doing.

- Injects the script at document-start, only on its `@match` URLs.
- Web viewport is 402×714 pt, the same as Safari on an iPhone 17 Pro, because
  the shield's video detection is viewport-relative.
- Presents itself as Mobile Safari, so Instagram/YouTube serve the normal mobile web.
- Logins persist across relaunches and rebuilds (persistent website data store).
- `bridge.js` logs structural telemetry only (paths, `data-veil-*`, sizes,
  per-gesture touch/scroll stats). It never logs page text.

## Use

```bash
./harness/veil.sh up            # create/boot sim, build, install, push script, launch (Instagram)
./harness/veil.sh push          # after editing the userscript: hot-reloads the page
./harness/veil.sh log 40        # telemetry (JSON lines)
./harness/veil.sh eval '__VEIL.status()'
./harness/veil.sh nav https://m.youtube.com/
./harness/veil.sh launch content   # relaunch with the script in an isolated JS world
```

`VEIL_DEBUG` is on by default (the harness flips `const DEBUG = false`), so
`[Veil]` log lines show up as `"type":"console"`.

### Telemetry types

| type | meaning |
| :--- | :--- |
| `state` | shield attributes changed: `v`, `page`, `dbg` (armed/sra/dm/pin/black), `overlay`, viewport |
| `gesture` | one per touch: `moves`, how many were `cancelable` / `prevented`, the `first` move, and every element that `scrolled` (incl. momentum) |
| `jump` | a >100px scroll with no finger down (programmatic / auto-advance) |
| `nav`, `console`, `error`, `blockedScheme`, `alert` | as named |

## Limits

- `WKWebView` is not Safari + Userscripts: injection world and timing can
  differ (the extension's default world is `page` or `content` depending on the
  version, so test both). Final confirmation stays on the iPhone.
- Sign in to Instagram yourself in the simulator; use a secondary account.
