# Technical SOP: YouTube Shorts Elimination (`NoReelsYT`)

## Purpose & Scope
This Standard Operating Procedure (SOP) defines the deterministic runtime hooks, class targets, and behavioral logic to completely eradicate YouTube Shorts from the official iOS YouTube app while preserving regular video playback, subscriptions, search, and library.

---

## 🏛️ Class & Method Targets (iOS YouTube)

### 1. Shorts Pivot Tab Removal (`YTPivotBarView`)
- **Target Classes**: `YTPivotBarView`, `YTPivotBarItemView`, `YTPivotBarItem`, `YTAppViewController`
- **Hook Strategy**:
  - Hook `-[YTPivotBarView setItems:]` or `-[YTPivotBarView layoutSubviews]`:
  - Identify pivot bar items with navigation endpoint `FEshorts` or title matching "Shorts".
  - Filter out the Shorts item from the items array before passing to the original implementation.
  - Re-layout the remaining pivot bar items (Home, Subscriptions, Library / You) symmetrically across the screen width.

### 2. Shorts Shelves Neutralization (`YTSectionListViewController` / `YTReelShelfModel`)
- **Target Classes**: `YTSectionListViewController`, `YTRelatedModel`, `YTReelShelfModel`, `_ASDisplayView`, `YTFeedItem`
- **Hook Strategy**:
  - Hook data parsers / cell providers:
    - Intercept `-[YTSectionListViewController cellForItemAtIndexPath:]` or model converters.
    - If the item model class is `YTReelShelfModel`, `YTRelatedShortsModel`, `YTRendererReelShelf`, or contains `reel_shelf_renderer`, return `nil` or a 0-height empty view.
    - Suppress Shorts carousel from Home feed, Subscriptions feed, and Search result lists.

### 3. Shorts Video Direct Link Redirection (`YTShortsViewController`)
- **Target Classes**: `YTShortsViewController`, `YTShortsMainViewController`, `YTWatchViewController`
- **Hook Strategy**:
  - Hook `-[YTShortsViewController viewWillAppear:]` or `-[YTNavigationController navigateToEndpoint:]`:
  - Extract the video ID from the endpoint payload.
  - Dismiss or abort the vertical scrolling `YTShortsViewController` and trigger navigation to standard `YTWatchViewController` with `videoId`.
  - Regular video player provides standard playback controls, scrub bar, and comments without auto-advancing vertical swipe doomscrolling.

---

## 🔒 Fail-Safe / Self-Annealing Rules
- If YouTube updates obfuscated view identifiers, hook `UIView - (void)didAddSubview:(UIView *)subview`:
  - Detect subviews containing `reel_shelf` or `shorts_pivot` in their accessibility identifier or class hierarchy.
  - Set `subview.hidden = YES; [subview removeFromSuperview];`.
