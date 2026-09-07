#import <Foundation/Foundation.h>
#import "UIKitStubs.h"
#import "HookUtils.h"

#pragma mark - State Tracking
static NSString *g_currentProfileCreator = nil;

#pragma mark - Instagram TabBar Hooking (Remove Reels Tab)

@interface IGTabBarController_Hook : UIViewController
- (void)nr_viewWillAppear:(BOOL)animated;
- (void)nr_setTabBarItems:(NSArray *)items;
- (void)nr_stripReelsTab;
@end

@implementation IGTabBarController_Hook

- (void)nr_viewWillAppear:(BOOL)animated {
    [self nr_viewWillAppear:animated];
    [self nr_stripReelsTab];
}

- (void)nr_setTabBarItems:(NSArray *)items {
    NSMutableArray *filteredItems = [NSMutableArray array];
    for (id item in items) {
        NSString *desc = [NSString stringWithFormat:@"%@ - %@", [item description], [item class]];
        NSString *title = @"";
        if ([item respondsToSelector:@selector(title)]) {
            title = [item performSelector:@selector(title)];
        }
        
        BOOL isReels = [desc localizedCaseInsensitiveContainsString:@"sundial"] ||
                       [desc localizedCaseInsensitiveContainsString:@"reels"] ||
                       [desc localizedCaseInsensitiveContainsString:@"clips"] ||
                       [title localizedCaseInsensitiveContainsString:@"reels"] ||
                       [title localizedCaseInsensitiveContainsString:@"clips"];
        
        if (!isReels) {
            [filteredItems addObject:item];
        } else {
            NSLog(@"[NoReelsIG] Neutralized and removed Reels tab item: %@", item);
        }
    }
    
    [self nr_setTabBarItems:filteredItems];
}

- (void)nr_stripReelsTab {
    UIView *tabBarView = NRFindSubviewOfClass(self.view, @"IGTabBar");
    if (!tabBarView) {
        tabBarView = NRFindSubviewOfClass(self.view, @"IGBottomPerfBarView");
    }
    
    if (tabBarView) {
        for (UIView *button in tabBarView.subviews) {
            NSString *btnDesc = [NSString stringWithFormat:@"%@ - %@", [button description], [button class]];
            if ([btnDesc localizedCaseInsensitiveContainsString:@"sundial"] ||
                [btnDesc localizedCaseInsensitiveContainsString:@"reels"] ||
                [btnDesc localizedCaseInsensitiveContainsString:@"clips"] ||
                button.tag == 4) { // Reels tab index
                button.hidden = YES;
                button.userInteractionEnabled = NO;
                [button removeFromSuperview];
                NSLog(@"[NoReelsIG] Removed Reels button from active tab bar");
            }
        }
    }
}

@end

#pragma mark - Instagram Explore / Search Grid Hooking (Blackout Explore Grid)

@interface IGExploreGridViewController_Hook : UIViewController
- (void)nr_viewDidLoad;
- (void)nr_viewWillAppear:(BOOL)animated;
- (void)nr_applyExploreBlackout;
- (NSInteger)nr_numberOfSectionsInCollectionView:(UICollectionView *)collectionView;
@end

@implementation IGExploreGridViewController_Hook

- (void)nr_viewDidLoad {
    [self nr_viewDidLoad];
    [self nr_applyExploreBlackout];
}

- (void)nr_viewWillAppear:(BOOL)animated {
    [self nr_viewWillAppear:animated];
    [self nr_applyExploreBlackout];
}

- (void)nr_applyExploreBlackout {
    // Keep search bar active, but black out and hide the explore grid collection view
    for (UIView *subview in self.view.subviews) {
        if ([subview isKindOfClass:[UICollectionView class]] ||
            [NSStringFromClass([subview class]) containsString:@"Grid"] ||
            [NSStringFromClass([subview class]) containsString:@"Feed"]) {
            
            subview.hidden = YES;
            subview.userInteractionEnabled = NO;
            NSLog(@"[NoReelsIG] Blanked explore recommendation grid");
        }
    }
    
    // Add clean minimal dark canvas under search header
    self.view.backgroundColor = [UIColor blackColor];
    
    // Ensure search bar / search navigation view remains visible on top
    UIView *searchBar = NRFindSubviewOfClass(self.view, @"IGSearchBar");
    if (!searchBar) {
        searchBar = NRFindSubviewOfClass(self.view, @"UISearchBar");
    }
    if (searchBar) {
        searchBar.hidden = NO;
        searchBar.userInteractionEnabled = YES;
        [self.view bringSubviewToFront:searchBar];
    }
}

- (NSInteger)nr_numberOfSectionsInCollectionView:(UICollectionView *)collectionView {
    // Stub data source to 0 items so no algorithmic media is loaded
    return 0;
}

@end

#pragma mark - Instagram Shared Reel & Profile Reels Hooking

@interface IGSundialViewerViewController_Hook : UIViewController
@property (nonatomic, strong) UICollectionView *collectionView;
- (void)nr_viewDidLoad;
- (void)nr_viewDidAppear:(BOOL)animated;
- (void)nr_configureReelRestrictions;
- (void)nr_handleScrollAttempt:(UIGestureRecognizer *)gesture;
- (void)nr_showBlackoutOverlay;
- (void)nr_addDismissButton;
- (void)nr_dismissViewer;
@end

@implementation IGSundialViewerViewController_Hook

- (void)nr_viewDidLoad {
    [self nr_viewDidLoad];
    [self nr_configureReelRestrictions];
}

- (void)nr_viewDidAppear:(BOOL)animated {
    [self nr_viewDidAppear:animated];
    [self nr_configureReelRestrictions];
}

- (void)nr_configureReelRestrictions {
    NSString *vcDesc = [self description];
    
    // Check if opened from a creator profile
    BOOL isFromProfile = [vcDesc localizedCaseInsensitiveContainsString:@"profile"] || (g_currentProfileCreator != nil);
    
    // Find the primary scrolling collection view / viewer feed
    UICollectionView *cv = (UICollectionView *)NRFindSubviewOfClass(self.view, @"UICollectionView");
    if (cv) {
        if (!isFromProfile) {
            // Direct share / DM link: strictly lock scrolling to single reel
            cv.scrollEnabled = NO;
            cv.bounces = NO;
            NSLog(@"[NoReelsIG] Direct share Reel detected: Vertical scroll locked");
            
            // Add scroll prevention overlay if user attempts vertical swipe
            for (UIGestureRecognizer *gr in self.view.gestureRecognizers) {
                if ([gr isKindOfClass:[UIPanGestureRecognizer class]] ||
                    [gr isKindOfClass:[UISwipeGestureRecognizer class]]) {
                    [gr addTarget:self action:@selector(nr_handleScrollAttempt:)];
                }
            }
        } else {
            NSLog(@"[NoReelsIG] Profile Reel viewer active for creator: %@", g_currentProfileCreator ?: @"Current Profile");
        }
    }
    
    // Add clean Exit / Dismiss button on top left/right
    [self nr_addDismissButton];
}

- (void)nr_handleScrollAttempt:(UIGestureRecognizer *)gesture {
    if (gesture.state == UIGestureRecognizerStateBegan || gesture.state == UIGestureRecognizerStateChanged) {
        [self nr_showBlackoutOverlay];
    }
}

- (void)nr_showBlackoutOverlay {
    static const NSInteger kOverlayTag = 888123;
    if ([self.view viewWithTag:kOverlayTag]) return;
    
    UIView *overlay = [[UIView alloc] initWithFrame:self.view.bounds];
    overlay.tag = kOverlayTag;
    overlay.backgroundColor = [UIColor blackColor];
    overlay.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    
    UILabel *titleLabel = [[UILabel alloc] initWithFrame:CGRectMake(20, self.view.bounds.size.height / 2 - 60, self.view.bounds.size.width - 40, 40)];
    titleLabel.text = @"Shared Reel Finished";
    titleLabel.textColor = [UIColor whiteColor];
    titleLabel.textAlignment = NSTextAlignmentCenter;
    titleLabel.font = [UIFont boldSystemFontOfSize:20];
    [overlay addSubview:titleLabel];
    
    UILabel *subtitleLabel = [[UILabel alloc] initWithFrame:CGRectMake(20, self.view.bounds.size.height / 2 - 20, self.view.bounds.size.width - 40, 30)];
    subtitleLabel.text = @"Infinite doomscrolling is disabled.";
    subtitleLabel.textColor = [UIColor lightGrayColor];
    subtitleLabel.textAlignment = NSTextAlignmentCenter;
    subtitleLabel.font = [UIFont systemFontOfSize:14];
    [overlay addSubview:subtitleLabel];
    
    UIButton *backButton = [UIButton buttonWithType:UIButtonTypeSystem];
    backButton.frame = CGRectMake((self.view.bounds.size.width - 160) / 2, self.view.bounds.size.height / 2 + 30, 160, 44);
    [backButton setTitle:@"Back to DMs" forState:UIControlStateNormal];
    [backButton setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    backButton.backgroundColor = [UIColor colorWithRed:0.2 green:0.4 blue:0.9 alpha:1.0];
    backButton.layer.cornerRadius = 22;
    [backButton addTarget:self action:@selector(nr_dismissViewer) forControlEvents:UIControlEventTouchUpInside];
    [overlay addSubview:backButton];
    
    [self.view addSubview:overlay];
}

- (void)nr_addDismissButton {
    static const NSInteger kDismissBtnTag = 888124;
    if ([self.view viewWithTag:kDismissBtnTag]) return;
    
    UIButton *closeBtn = [UIButton buttonWithType:UIButtonTypeCustom];
    closeBtn.tag = kDismissBtnTag;
    closeBtn.frame = CGRectMake(20, 50, 40, 40);
    [closeBtn setTitle:@"✕" forState:UIControlStateNormal];
    [closeBtn setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    closeBtn.titleLabel.font = [UIFont boldSystemFontOfSize:22];
    closeBtn.backgroundColor = [UIColor colorWithWhite:0.0 alpha:0.6];
    closeBtn.layer.cornerRadius = 20;
    [closeBtn addTarget:self action:@selector(nr_dismissViewer) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:closeBtn];
    [self.view bringSubviewToFront:closeBtn];
}

- (void)nr_dismissViewer {
    if (self.navigationController) {
        [self.navigationController popViewControllerAnimated:YES];
    } else {
        [self dismissViewControllerAnimated:YES completion:nil];
    }
}

@end

#pragma mark - Profile Tracking Hook

@interface IGProfileViewController_Hook : UIViewController
- (void)nr_viewDidAppear:(BOOL)animated;
- (void)nr_viewWillDisappear:(BOOL)animated;
@end

@implementation IGProfileViewController_Hook

- (void)nr_viewDidAppear:(BOOL)animated {
    [self nr_viewDidAppear:animated];
    g_currentProfileCreator = [self title] ?: @"CreatorProfile";
    NSLog(@"[NoReelsIG] Entered creator profile: %@", g_currentProfileCreator);
}

- (void)nr_viewWillDisappear:(BOOL)animated {
    [self nr_viewWillDisappear:animated];
    g_currentProfileCreator = nil;
}

@end

#pragma mark - Dynamic Injection Constructor

__attribute__((constructor))
static void NoReelsIG_Initialize(void) {
    @autoreleasepool {
        NSLog(@"==================================================");
        NSLog(@"[NoReelsIG] Initializing NoReels Tweak for Instagram");
        NSLog(@"==================================================");
        
        // 1. Hook TabBar to eliminate Reels icon
        Class tabBarClass = objc_getClass("IGTabBarController");
        if (tabBarClass) {
            NRSwizzleInstanceMethod(tabBarClass, @selector(viewWillAppear:), @selector(nr_viewWillAppear:));
            NRSwizzleInstanceMethod(tabBarClass, @selector(setTabBarItems:), @selector(nr_setTabBarItems:));
        }
        
        // 2. Hook Explore Grid to blackout video suggestions
        Class exploreGridClass = objc_getClass("IGExploreGridViewController");
        if (!exploreGridClass) exploreGridClass = objc_getClass("IGExploreViewController");
        if (exploreGridClass) {
            NRSwizzleInstanceMethod(exploreGridClass, @selector(viewDidLoad), @selector(nr_viewDidLoad));
            NRSwizzleInstanceMethod(exploreGridClass, @selector(viewWillAppear:), @selector(nr_viewWillAppear:));
            NRSwizzleInstanceMethod(exploreGridClass, @selector(numberOfSectionsInCollectionView:), @selector(nr_numberOfSectionsInCollectionView:));
        }
        
        // 3. Hook Sundial / Reels viewer for DM lock & profile control
        Class sundialViewerClass = objc_getClass("IGSundialViewerViewController");
        if (!sundialViewerClass) sundialViewerClass = objc_getClass("IGSundialFeedViewController");
        if (sundialViewerClass) {
            NRSwizzleInstanceMethod(sundialViewerClass, @selector(viewDidLoad), @selector(nr_viewDidLoad));
            NRSwizzleInstanceMethod(sundialViewerClass, @selector(viewDidAppear:), @selector(nr_viewDidAppear:));
        }
        
        // 4. Hook Profile View Controller for creator context tracking
        Class profileClass = objc_getClass("IGProfileViewController");
        if (profileClass) {
            NRSwizzleInstanceMethod(profileClass, @selector(viewDidAppear:), @selector(nr_viewDidAppear:));
            NRSwizzleInstanceMethod(profileClass, @selector(viewWillDisappear:), @selector(nr_viewWillDisappear:));
        }
        
        NSLog(@"[NoReelsIG] Initialization Complete. All hooks active.");
    }
}
