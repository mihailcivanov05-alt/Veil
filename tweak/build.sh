#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔨 Compiling NoReels iOS Dynamic Libraries for ARM64..."

# Compile NoReelsIG.dylib
clang -target arm64-apple-darwin \
      -dynamiclib \
      -fobjc-arc \
      -Wall \
      -Wno-unused-variable \
      -O2 \
      -Wl,-flat_namespace,-undefined,suppress \
      -install_name @rpath/NoReelsIG.dylib \
      HookUtils.m NoReelsIG.m \
      -o NoReelsIG.dylib

# Compile NoReelsYT.dylib
clang -target arm64-apple-darwin \
      -dynamiclib \
      -fobjc-arc \
      -Wall \
      -Wno-unused-variable \
      -O2 \
      -Wl,-flat_namespace,-undefined,suppress \
      -install_name @rpath/NoReelsYT.dylib \
      HookUtils.m NoReelsYT.m \
      -o NoReelsYT.dylib

echo "✅ Compilation Complete!"
ls -lh NoReelsIG.dylib NoReelsYT.dylib
