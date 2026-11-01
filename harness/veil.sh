#!/bin/bash
# harness/veil.sh — build, run and poke the VeilHarness simulator app.
#
#   ./harness/veil.sh up [page|content]   create/boot the sim, build, install, push, launch
#   ./harness/veil.sh push                copy userscripts/veil_shield.user.js in (hot-reloads)
#   ./harness/veil.sh launch [page|content]  relaunch, optionally switching the JS world
#   ./harness/veil.sh eval 'JS'           run JS in the userscript's world, print the JSON result
#   ./harness/veil.sh nav URL             navigate the web view
#   ./harness/veil.sh log [N]             last N telemetry lines (default 40)
#   ./harness/veil.sh build | udid | docs
#
# Env: VEIL_START_URL (default https://www.instagram.com/), VEIL_VIEWPORT_H (default 714).
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$HERE")"
BUNDLE_ID=com.veil.harness
DEVICE_NAME="Veil iPhone 17 Pro"
DEVICE_TYPE=com.apple.CoreSimulator.SimDeviceType.iPhone-17-Pro
APP="$HERE/build/VeilHarness.app"
SCRIPT="$ROOT/userscripts/veil_shield.user.js"

# Dedicated simulator so the Instagram login lives on its own device.
udid() {
  local id rt
  id=$(xcrun simctl list devices -j | python3 -c '
import json, sys
name = sys.argv[1]
for devs in json.load(sys.stdin)["devices"].values():
    for d in devs:
        if d["name"] == name and d.get("isAvailable"):
            print(d["udid"]); sys.exit()
' "$DEVICE_NAME")
  if [ -z "$id" ]; then
    rt=$(xcrun simctl list runtimes -j | python3 -c '
import json, sys
rts = [r for r in json.load(sys.stdin)["runtimes"] if r.get("platform") == "iOS" and r.get("isAvailable")]
print(rts[-1]["identifier"])
')
    id=$(xcrun simctl create "$DEVICE_NAME" "$DEVICE_TYPE" "$rt")
  fi
  echo "$id"
}

boot() {
  local id; id=$(udid)
  xcrun simctl bootstatus "$id" -b >/dev/null
}

build() {
  local sdk; sdk=$(xcrun --sdk iphonesimulator --show-sdk-path)
  rm -rf "$APP"; mkdir -p "$APP"
  xcrun --sdk iphonesimulator swiftc -target "$(uname -m)-apple-ios17.0-simulator" -sdk "$sdk" \
    -swift-version 5 -parse-as-library -module-name VeilHarness -O \
    "$HERE/Sources/VeilHarness.swift" -o "$APP/VeilHarness"
  cp "$HERE/Info.plist" "$HERE/bridge.js" "$APP/"
  cp "$SCRIPT" "$APP/veil_shield.user.js"            # fallback until something is pushed
  codesign --force --sign - --timestamp=none "$APP" >/dev/null
  echo "built $APP"
}

docs() { echo "$(xcrun simctl get_app_container "$(udid)" "$BUNDLE_ID" data)/Documents"; }

push() {
  local d; d="$(docs)"; mkdir -p "$d"
  cp "$SCRIPT" "$d/veil_shield.user.js.tmp" && mv "$d/veil_shield.user.js.tmp" "$d/veil_shield.user.js"
  echo "pushed veil_shield.user.js $(grep -m1 '@version' "$SCRIPT" | awk '{print $3}')"
}

launch() {
  local world="${1:-page}"
  boot
  SIMCTL_CHILD_VEIL_WORLD="$world" \
  SIMCTL_CHILD_VEIL_START_URL="${VEIL_START_URL:-https://www.instagram.com/}" \
  SIMCTL_CHILD_VEIL_VIEWPORT_H="${VEIL_VIEWPORT_H:-714}" \
    xcrun simctl launch --terminate-running-process "$(udid)" "$BUNDLE_ID" >/dev/null
  echo "launched ($world world)"
}

# The app polls Documents/cmd.js every 300ms and answers in Documents/cmd.out.
evaljs() {
  local d js="$1"; d="$(docs)"
  case "$js" in *return*) ;; *) js="return ($js);" ;; esac
  rm -f "$d/cmd.out"
  printf '%s' "$js" > "$d/cmd.js.tmp" && mv "$d/cmd.js.tmp" "$d/cmd.js"
  for _ in $(seq 1 50); do
    if [ -f "$d/cmd.out" ]; then cat "$d/cmd.out"; echo; rm -f "$d/cmd.out"; return 0; fi
    sleep 0.2
  done
  echo "timeout: no answer from the harness (is it running?)" >&2
  return 1
}

case "${1:-}" in
  up)     boot; build; xcrun simctl install "$(udid)" "$APP"; push; launch "${2:-page}" ;;
  build)  build ;;
  push)   push ;;
  launch) launch "${2:-page}" ;;
  eval)   evaljs "$2" ;;
  nav)    evaljs "location.href = $(python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$2"); return 'ok'" ;;
  log)    tail -n "${2:-40}" "$(docs)/harness.log" ;;
  udid)   udid ;;
  docs)   docs ;;
  *)      sed -n '2,12p' "$0"; exit 1 ;;
esac
