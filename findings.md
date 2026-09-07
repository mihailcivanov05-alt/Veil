# Findings & Technical Research

## Initial Discoveries & Technical Realities

### 1. User Intent & Behavioral Rules
- **Instagram Direct Messages & Friends Posts:** Must remain intact (Instagram is used as a primary social/messaging platform).
- **Instagram Reels Tab:** Must be removed/hidden completely from navigation.
- **Instagram Search/Explore Grid:** All Reels/video previews must be blurred or blacked out completely. Search input for looking up accounts/tags must remain functional.
- **Instagram Direct Shared Reels:**
  - If a friend sends a Reel via DM, opening the shared Reel is permitted.
  - BUT scrolling to subsequent Reels must trigger a black screen / blocking mechanism.
- **Instagram Profile Reels:** Must allow viewing Reels ONLY when explicitly browsing a creator's profile page (e.g. `instagram.com/<username>`).
- **Main Feed:** Leave feed static posts / friend posts untouched for now; remove Reels recommendations.
- **YouTube Shorts:**
  - Remove Shorts tab from bottom/side navigation.
  - Remove/blackout Shorts shelves from Home feed and Search feed.
  - Standard regular YouTube videos remain untouched.

### 2. Platform Architecture Constraints (iOS vs Android vs Web)
- **Native iOS App Store App Constraints:**
  - Sandboxed 3rd-party iOS apps in the Apple App Store **cannot** inspect or alter other apps' views (Apple sandbox prevents UI modification of the official Instagram/YouTube apps).
  - Apple's Screen Time / DeviceActivity API can only block entire apps or websites, not selectively block internal tabs or sub-features.
  - *Technical Approaches for iOS / Mobile:*
    1. **Safari Web Extension (iOS & macOS):** Injects content scripts directly into `instagram.com` and `youtube.com`. Can reliably remove navigation buttons, blur search grids, blackout scrolling, and allow profile-only Reels.
    2. **Custom Standalone App (WKWebView / PWA Wrapper for iOS):** An installed native iOS app wrapping Instagram / YouTube web clients with embedded custom scripts and full DM support, push notifications / share extensions.
    3. **TrollStore / Sideloaded Tweak (Jailbroken / Sideloaded IPA):** Injects dylib hooks into the native Instagram / YouTube binaries (e.g., BHInstagram / IGNoReels / uYou).
    4. **Android Accessibility / Overlay App (if Android):** Detects current activity/view nodes and overlays black screen or performs back gesture when Reels/Shorts are detected.

---
*Will be updated as discoveries occur during Discovery and Link phases.*
