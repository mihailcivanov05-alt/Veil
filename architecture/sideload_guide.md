# Step-by-Step Sideloading SOP: Installing NoReels on iPhone

## Overview
This SOP outlines the complete procedure to obtain decrypted `.ipa` files for Instagram and YouTube, patch them with `NoReels.dylib` using our automated tool, and install them onto an iPhone.

---

## 🛠️ Required Tools
1. **Patcher Script**: `tools/patch_ipa.py` (provided in this project).
2. **Compiled Tweak Dylibs**: `tweak/NoReelsIG.dylib` and `tweak/NoReelsYT.dylib`.
3. **Sideloading Client (Choose ONE based on preference)**:
   - **Option A: Sideloadly (Recommended for Mac/PC)**: Free, automatic resigning with your Apple ID, 1-click install over Wi-Fi/USB.
   - **Option B: SideStore**: On-device sideloading via local VPN (no computer needed after initial setup).
   - **Option C: AltStore**: Standard free sideloading server via Mac/PC.
   - **Option D: TrollStore (iOS 14.0–17.0 on supported versions)**: Permanent signing with zero 7-day expiration.

---

## 📋 Execution Workflow

### Step 1: Obtain Decrypted IPA Files
Because App Store IPAs are DRM-encrypted by Apple, tweaks must be injected into decrypted binaries:
- Download clean, decrypted `.ipa` files for Instagram and YouTube from trusted repositories (e.g. Decrypted App Store, ARMConverter, or dumping from your own device using `frida-ios-dump` / `TrollDecrypt`).

### Step 2: Patch the IPA with NoReels
Run the automated patcher tool:
```bash
python3 tools/patch_ipa.py --ipa Instagram.ipa --tweak tweak/NoReelsIG.dylib --output Instagram_NoReels.ipa
python3 tools/patch_ipa.py --ipa YouTube.ipa --tweak tweak/NoReelsYT.dylib --output YouTube_NoShorts.ipa
```

### Step 3: Install onto iPhone
1. Connect your iPhone to your Mac (or use SideStore on-device).
2. Open **Sideloadly** (or AltStore).
3. Drag and drop `Instagram_NoReels.ipa` into Sideloadly.
4. Enter your Apple ID (used strictly for free personal code-signing).
5. Click **Start**. The app installs directly onto your iPhone home screen.
6. On your iPhone: Go to **Settings > General > VPN & Device Management > Trust [Your Apple ID]**.
7. Open the app and enjoy a 100% Reels-free and Shorts-free experience!
