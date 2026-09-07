# 📱 Veil Shield — iOS Setup Guide (iPhone 17 Pro)

> **Time required:** ~5 minutes  
> **Cost:** $0  
> **Requirements:** iPhone with iOS 17+, Safari browser

---

## Step 1: Install the Userscripts Extension

1. Open the **App Store** on your iPhone.
2. Search for **Userscripts** (by Justin Wasack / quoid).
   - Direct link: [Userscripts on App Store](https://apps.apple.com/app/userscripts/id1463298887)
3. Tap **Get** to install it (100% free, open-source).

---

## Step 2: Enable the Extension in Safari

1. Open **Settings** → **Safari** → **Extensions**.
2. Tap **Userscripts** and toggle it **ON**.
3. Set permission to **All Websites** → **Allow**.
   - *(Or selectively allow only `instagram.com` and `youtube.com`)*

---

## Step 3: Set Up a Script Directory

The Userscripts extension reads `.user.js` files from a folder you choose:

1. Open the **Files** app on your iPhone.
2. In **iCloud Drive** (or **On My iPhone**), create a folder called `Userscripts`.
3. Open **Safari**, tap the **extensions icon** (puzzle piece or `Aa` in address bar).
4. Tap **Userscripts** → tap the gear icon → **Set Userscripts Directory**.
5. Navigate to the `Userscripts` folder you just created and tap **Open**.

---

## Step 4: Install the Veil Shield Script

### Option A: Via Files App
1. Transfer `veil_shield.user.js` to your iPhone (AirDrop, iCloud, email attachment).
2. Save it into the `Userscripts` folder you created in Step 3.
3. The extension auto-detects and loads it.

### Option B: Copy & Paste
1. Open Safari and tap the extensions icon → **Userscripts**.
2. Tap **+** (New Script).
3. Paste the entire contents of `veil_shield.user.js`.
4. Tap **Save**.

---

## Step 5: Verify It Works

### Instagram (`www.instagram.com` in Safari)
- ✅ **Reels tab is gone** from the bottom navigation bar.
- ✅ **DMs work normally** at `/direct/inbox/`.
- ✅ **Search works** on `/explore/` — video grid is hidden, search bar is active.
- ✅ **Creator profiles work** — you can view any user's profile and their reels tab.
- ✅ **Shared Reels** — opening a reel link lets you watch that one video. Swiping up triggers a shield overlay.
- ✅ **Reels feed blocked** — navigating to `/reels/` shows a full-screen blackout shield.

### YouTube (`m.youtube.com` in Safari)
- ✅ **Shorts tab is gone** from the bottom navigation.
- ✅ **Shorts shelves are gone** from the home feed and search results.
- ✅ **Shorts links redirect** — any `/shorts/{id}` URL opens in the standard video player (`/watch?v={id}`).
- ✅ **Regular videos work normally** — long-form content is completely untouched.

---

## Step 6 (Optional): Anti-Relapse Lock

To prevent yourself from easily disabling the extension:

1. Go to **Settings** → **Screen Time** → **Content & Privacy Restrictions** → toggle **ON**.
2. Have someone else set the Screen Time passcode (one you don't know), or generate a random one and store it somewhere inconvenient.
3. Set **Content & Privacy Restrictions → Apps → Deleting Apps → Don't Allow**. This stops you deleting the Userscripts extension host on impulse. (Screen Time cannot lock the per-extension toggle itself — this is the closest equivalent.)

### Optional: Block Native Apps
Under **Screen Time** → **App Limits**, set a **1 minute daily limit** on the native Instagram and YouTube apps so they're effectively unusable, forcing you onto the protected Safari versions. Or just delete them.

---

## ⚠️ Important: Do NOT Use "Add to Home Screen"

If you save Instagram or YouTube to your home screen as a web app (PWA), it opens in **standalone mode** where Safari extensions **do not run**. Always open these sites in a regular Safari tab.

The `.mobileconfig` profile included in this project creates home screen shortcuts that correctly open in standard Safari (not standalone mode).

---

## 🔧 Troubleshooting

| Issue | Fix |
| :--- | :--- |
| Script not running | Check Settings → Safari → Extensions → Userscripts is ON |
| Reels tab still visible | Hard-refresh the page (pull down on address bar) |
| YouTube Shorts still showing | Clear Safari cache: Settings → Safari → Clear History and Website Data |
| "Open in app" banners appearing | The script auto-dismisses most of these; tap the X if one persists |
| Explore/feed reels flash briefly then vanish | Expected on a cold load if the network is slow; v3.1 sets the block pre-paint so this should be rare. If it persists, the page selectors need tuning (see below) |
| Reels tab / Shorts shelf never hides | The selector for that element has drifted. Open the page in Safari on Mac (**Develop → [your iPhone] → the tab**), inspect the element, and add its `href` / `aria-label` / tag to `veil_shield.user.js` §4 |

## Changing behaviour without editing the file

The script reads an optional override from `localStorage['veil:config']` on each site. To e.g. switch Explore from full blackout to only hiding video tiles, run once in the Safari console on `instagram.com` (Develop menu, or a bookmarklet):

```js
localStorage.setItem('veil:config', JSON.stringify({ instagram: { exploreGridMode: 'hide_videos_only' } }));
```

Keys mirror the `DEFAULTS` block at the top of `veil_shield.user.js`. Delete the key to return to defaults.
