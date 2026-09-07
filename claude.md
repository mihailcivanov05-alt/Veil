# Project Constitution: "No Reels" (Instagram & YouTube Shorts Blocker)

## 🏛️ Architectural Invariants & Behavioral Rules

1. **Deterministic Blocking**: The system must deterministically identify and neutralize doomscrolling triggers (Reels tab, Shorts tab, Explore video grid, infinite scroll on shared reels) without relying on fuzzy heuristics.
2. **Preserve Legitimate Usage**: Messaging (DMs), user search, creator profiles, and regular long-form YouTube videos must remain 100% accessible and unobstructed.
3. **Fail-Safe Mode**: If detection fails on an untrusted video feed or scroll attempt, the UI fails closed (e.g., black screen overlay / video freeze) rather than letting the user fall into a doomscroll loop.
4. **Zero Layout Distortion**: Navigation items are hidden cleanly with CSS/DOM adjustments to prevent visual artifacts or broken layouts.

---

## 📊 Data & State Schemas

### 1. Configuration & Feature Flags Schema (`ConfigState`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ConfigState",
  "type": "object",
  "properties": {
    "instagram": {
      "type": "object",
      "properties": {
        "hideReelsTab": { "type": "boolean", "default": true },
        "exploreGridMode": { 
          "type": "string", 
          "enum": ["blackout", "blur", "hide_videos_only"], 
          "default": "blackout" 
        },
        "blockSharedReelScroll": { "type": "boolean", "default": true },
        "allowProfileReelsOnly": { "type": "boolean", "default": true },
        "feedReelsHidden": { "type": "boolean", "default": true }
      },
      "required": ["hideReelsTab", "exploreGridMode", "blockSharedReelScroll", "allowProfileReelsOnly"]
    },
    "youtube": {
      "type": "object",
      "properties": {
        "hideShortsTab": { "type": "boolean", "default": true },
        "hideShortsShelves": { "type": "boolean", "default": true },
        "blockShortsPlayer": { "type": "boolean", "default": true }
      },
      "required": ["hideShortsTab", "hideShortsShelves", "blockShortsPlayer"]
    }
  },
  "required": ["instagram", "youtube"]
}
```

### 2. Runtime Context & Navigation State Schema (`RuntimeState`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "RuntimeState",
  "type": "object",
  "properties": {
    "currentUrl": { "type": "string" },
    "platform": { "type": "string", "enum": ["instagram", "youtube", "unknown"] },
    "pageType": { 
      "type": "string", 
      "enum": ["home_feed", "direct_messages", "explore_search", "creator_profile", "shared_reel", "reels_tab", "yt_home", "yt_watch", "yt_shorts"] 
    },
    "isSharedReelActive": { "type": "boolean" },
    "initialReelId": { "type": ["string", "null"] },
    "isBlackedOut": { "type": "boolean" }
  },
  "required": ["currentUrl", "platform", "pageType", "isBlackedOut"]
}
```

---

## 🛠️ Maintenance & Self-Annealing Log
- Initial draft configured.
