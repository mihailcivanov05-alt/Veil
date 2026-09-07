# Technical SOP: Instagram Runtime Hooking (`NoReelsIG`)

## Purpose & Scope
This Standard Operating Procedure (SOP) defines the deterministic runtime hooks, class targets, and behavioral logic to eliminate Instagram Reels, black out the Explore suggestions grid, lock vertical scrolling on shared DM reels, and allow Reels only on creator profiles within the official iOS Instagram app.

---

## 🏛️ Class & Method Targets (iOS Instagram)

### 1. Reels Tab Removal (`IGTabBarController` / `IGTabControl`)
- **Target Classes**: `IGTabBarController`, `IGTabBar`, `IGTabControl`, `IGBottomPerfBarView`
- **Hook Strategy**:
  - Intercept `-[IGTabBarController setTabBarItems:]` and `-[IGTabBarController viewWillAppear:]`.
  - Iterate through `tabBarItems` or child view controllers.
  - Identify the item where title, accessibilityIdentifier, or class name matches `IGSundial`, `IGSundialFeedViewController`, `reels`, or `clips`.
  - Remove the item from the array or set its hidden property (`tabBarItem.hidden = YES; [tabBarItem setEnabled:NO]`) and adjust layout frame widths so the remaining 4 tabs (Home, Search, Create/Activity, Profile) are spaced symmetrically with zero distortion.

### 2. Search / Explore Grid Neutralization (`IGExploreGridViewController`)
- **Target Classes**: `IGExploreGridViewController`, `IGSearchViewController`, `IGExploreGridItemSectionController`, `IGExploreViewController`
- **Hook Strategy**:
  - In `-[IGExploreGridViewController viewDidLoad]` and `-[IGExploreGridViewController viewWillAppear:]`:
    - Keep the navigation bar and `IGSearchBar` / search header view 100% active and touch-responsive.
    - Set the underlying `UICollectionView` (or explore feed container) `hidden = YES` or replace its background with an opaque pitch-black view (`[UIColor blackColor]`).
    - Override `-[IGExploreGridViewController numberOfSectionsInCollectionView:]` and return `0`, or stub the data source so no video or image thumbnails are loaded or rendered into memory.

### 3. Shared Reel DM Scroll Locking (`IGSundialViewerViewController`)
- **Target Classes**: `IGSundialViewerViewController`, `IGSundialFeedViewController`, `IGSundialViewerSectionController`, `UISwipeGestureRecognizer`
- **Hook Strategy**:
  - Hook `-[IGSundialViewerViewController viewDidLoad]` and `-[IGSundialViewerViewController viewDidAppear:]`:
    - Check the presentation context or referrer (`viewerSource`, `entryPoint`).
    - If the entry point is from Direct Messages (`IGSundialViewerSourceDirectShare` / URL scheme), mark `isDirectShare = YES`.
    - Set `collectionView.isScrollEnabled = NO; collectionView.bounces = NO;`.
    - Disable or intercept vertical swipe gesture recognizers on the view.
    - If a scroll event is triggered or page index increments beyond index `0`:
      - Immediately apply a clean blackout overlay with message: "Direct Share Reel Finished - Scrolling Disabled".
      - Provide a clean tap-to-exit button that calls `-[UIViewController dismissViewControllerAnimated:completion:]`.

### 4. Creator Profile Reel Exception (`IGProfileViewController` / `IGSundialViewerViewController`)
- **Target Classes**: `IGProfileViewController`, `IGProfileFeedViewController`, `IGSundialViewerViewController`
- **Hook Strategy**:
  - When opening a Reel from a creator profile (`entryPoint == IGViewerSourceProfile`):
    - Allow the video player to load.
    - Restrict pagination strictly to the items belonging to the current user / creator's profile catalog.
    - If an algorithmic recommendation item is reached, freeze scroll and show dismiss action.

---

## 🔒 Fail-Safe / Self-Annealing Rules
- If class symbols change between Instagram versions:
  - The runtime uses dynamic class discovery (`objc_getClass`, `class_getInstanceMethod`) with defensive selector probing.
  - If a specific selector is renamed, the fallback safety mechanism hides all video player views (`IGVideoPlayerView`, `AVPlayerLayer`) when the active URL does not match a profile or direct share context.
