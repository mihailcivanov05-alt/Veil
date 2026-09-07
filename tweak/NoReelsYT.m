#import <Foundation/Foundation.h>
#import "UIKitStubs.h"
#import "HookUtils.h"

#pragma mark - YouTube Pivot Bar Hook (Remove Shorts Tab)

@interface YTPivotBarView_Hook : UIView
- (void)nr_setItems:(NSArray *)items;
- (void)nr_layoutSubviews;
@end

@implementation YTPivotBarView_Hook

- (void)nr_setItems:(NSArray *)items {
    NSMutableArray *filteredItems = [NSMutableArray array];
    for (id item in items) {
        NSString *desc = [NSString stringWithFormat:@"%@ - %@", [item description], [item class]];
        NSString *title = @"";
        if ([item respondsToSelector:@selector(title)]) {
            title = [item performSelector:@selector(title)];
        }
        
        BOOL isShorts = [desc localizedCaseInsensitiveContainsString:@"shorts"] ||
                        [desc localizedCaseInsensitiveContainsString:@"FEshorts"] ||
                        [desc localizedCaseInsensitiveContainsString:@"reel"] ||
                        [title localizedCaseInsensitiveContainsString:@"shorts"];
        
        if (!isShorts) {
            [filteredItems addObject:item];
        } else {
            NSLog(@"[NoReelsYT] Neutralized and removed Shorts pivot bar item");
        }
    }
    
    [self nr_setItems:filteredItems];
}

- (void)nr_layoutSubviews {
    [self nr_layoutSubviews];
    
    // Safety check: ensure any lingering Shorts button subviews are hidden
    for (UIView *subview in self.subviews) {
        NSString *desc = [NSString stringWithFormat:@"%@ - %@", [subview description], [subview class]];
        if ([desc localizedCaseInsensitiveContainsString:@"shorts"] ||
            [desc localizedCaseInsensitiveContainsString:@"FEshorts"] ||
            [desc localizedCaseInsensitiveContainsString:@"reel"]) {
            subview.hidden = YES;
            subview.userInteractionEnabled = NO;
        }
    }
}

@end

#pragma mark - YouTube Feed Shorts Shelf Neutralization

@interface YTSectionListViewController_Hook : UIViewController
- (void)nr_viewWillAppear:(BOOL)animated;
- (void)nr_stripShortsShelves;
@end

@implementation YTSectionListViewController_Hook

- (void)nr_viewWillAppear:(BOOL)animated {
    [self nr_viewWillAppear:animated];
    [self nr_stripShortsShelves];
}

- (void)nr_stripShortsShelves {
    for (UIView *subview in self.view.subviews) {
        if ([subview isKindOfClass:[UICollectionView class]] || [subview isKindOfClass:[UITableView class]]) {
            UIScrollView *scrollView = (UIScrollView *)subview;
            for (UIView *cell in scrollView.subviews) {
                NSString *desc = [cell description];
                if ([desc localizedCaseInsensitiveContainsString:@"reel_shelf"] ||
                    [desc localizedCaseInsensitiveContainsString:@"shorts_shelf"] ||
                    [desc localizedCaseInsensitiveContainsString:@"YTReelShelf"]) {
                    cell.hidden = YES;
                    cell.frame = CGRectZero;
                }
            }
        }
    }
}

@end

#pragma mark - YouTube Shorts Playback Redirection

@interface YTShortsViewController_Hook : UIViewController
- (void)nr_viewWillAppear:(BOOL)animated;
- (void)nr_exitShorts;
@end

@implementation YTShortsViewController_Hook

- (void)nr_viewWillAppear:(BOOL)animated {
    [self nr_viewWillAppear:animated];
    NSLog(@"[NoReelsYT] Shorts view controller blocked. Redirecting to standard player / exiting.");
    
    // Add clean exit overlay
    UIView *overlay = [[UIView alloc] initWithFrame:self.view.bounds];
    overlay.backgroundColor = [UIColor blackColor];
    overlay.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    
    UILabel *label = [[UILabel alloc] initWithFrame:CGRectMake(20, self.view.bounds.size.height / 2 - 40, self.view.bounds.size.width - 40, 40)];
    label.text = @"YouTube Shorts Blocked";
    label.textColor = [UIColor whiteColor];
    label.textAlignment = NSTextAlignmentCenter;
    label.font = [UIFont boldSystemFontOfSize:18];
    [overlay addSubview:label];
    
    UIButton *exitBtn = [UIButton buttonWithType:UIButtonTypeSystem];
    exitBtn.frame = CGRectMake((self.view.bounds.size.width - 140) / 2, self.view.bounds.size.height / 2 + 20, 140, 44);
    [exitBtn setTitle:@"Close" forState:UIControlStateNormal];
    [exitBtn setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    exitBtn.backgroundColor = [UIColor colorWithRed:0.8 green:0.1 blue:0.1 alpha:1.0];
    exitBtn.layer.cornerRadius = 22;
    [exitBtn addTarget:self action:@selector(nr_exitShorts) forControlEvents:UIControlEventTouchUpInside];
    [overlay addSubview:exitBtn];
    
    [self.view addSubview:overlay];
}

- (void)nr_exitShorts {
    if (self.navigationController) {
        [self.navigationController popViewControllerAnimated:YES];
    } else {
        [self dismissViewControllerAnimated:YES completion:nil];
    }
}

@end

#pragma mark - Dynamic Injection Constructor

__attribute__((constructor))
static void NoReelsYT_Initialize(void) {
    @autoreleasepool {
        NSLog(@"==================================================");
        NSLog(@"[NoReelsYT] Initializing NoReels Tweak for YouTube");
        NSLog(@"==================================================");
        
        // 1. Hook Pivot Bar to remove Shorts button
        Class pivotBarClass = objc_getClass("YTPivotBarView");
        if (pivotBarClass) {
            NRSwizzleInstanceMethod(pivotBarClass, @selector(setItems:), @selector(nr_setItems:));
            NRSwizzleInstanceMethod(pivotBarClass, @selector(layoutSubviews), @selector(nr_layoutSubviews));
        }
        
        // 2. Hook Feed Section Lists to strip Shorts shelves
        Class sectionListClass = objc_getClass("YTSectionListViewController");
        if (sectionListClass) {
            NRSwizzleInstanceMethod(sectionListClass, @selector(viewWillAppear:), @selector(nr_viewWillAppear:));
        }
        
        // 3. Hook Shorts View Controller
        Class shortsVCClass = objc_getClass("YTShortsViewController");
        if (!shortsVCClass) shortsVCClass = objc_getClass("YTShortsMainViewController");
        if (shortsVCClass) {
            NRSwizzleInstanceMethod(shortsVCClass, @selector(viewWillAppear:), @selector(nr_viewWillAppear:));
        }
        
        NSLog(@"[NoReelsYT] Initialization Complete. All YouTube hooks active.");
    }
}
