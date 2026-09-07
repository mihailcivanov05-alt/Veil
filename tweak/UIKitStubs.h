#import <Foundation/Foundation.h>
#import <CoreGraphics/CoreGraphics.h>

#ifndef UIKIT_STUBS_H
#define UIKIT_STUBS_H

typedef NS_ENUM(NSInteger, UIControlState) {
    UIControlStateNormal = 0,
    UIControlStateHighlighted = 1 << 0,
    UIControlStateDisabled = 1 << 1,
    UIControlStateSelected = 1 << 2
};

typedef NS_ENUM(NSInteger, UIButtonType) {
    UIButtonTypeCustom = 0,
    UIButtonTypeSystem = 1
};

typedef NS_ENUM(NSInteger, NSTextAlignment) {
    NSTextAlignmentLeft = 0,
    NSTextAlignmentCenter = 1,
    NSTextAlignmentRight = 2
};

typedef NS_OPTIONS(NSUInteger, UIViewAutoresizing) {
    UIViewAutoresizingNone = 0,
    UIViewAutoresizingFlexibleWidth = 1 << 1,
    UIViewAutoresizingFlexibleHeight = 1 << 4
};

typedef NS_ENUM(NSInteger, UIGestureRecognizerState) {
    UIGestureRecognizerStatePossible,
    UIGestureRecognizerStateBegan,
    UIGestureRecognizerStateChanged,
    UIGestureRecognizerStateEnded,
    UIGestureRecognizerStateCancelled,
    UIGestureRecognizerStateFailed
};

typedef NS_OPTIONS(NSUInteger, UIControlEvents) {
    UIControlEventTouchUpInside = 1 << 6
};

@class UIViewController, UINavigationController, UIGestureRecognizer, UIPanGestureRecognizer, UISwipeGestureRecognizer, UILabel;

@interface UIColor : NSObject
+ (UIColor *)blackColor;
+ (UIColor *)whiteColor;
+ (UIColor *)lightGrayColor;
+ (UIColor *)colorWithWhite:(CGFloat)white alpha:(CGFloat)alpha;
+ (UIColor *)colorWithRed:(CGFloat)red green:(CGFloat)green blue:(CGFloat)blue alpha:(CGFloat)alpha;
@end

@interface UIFont : NSObject
+ (UIFont *)systemFontOfSize:(CGFloat)fontSize;
+ (UIFont *)boldSystemFontOfSize:(CGFloat)fontSize;
@end

@interface UIView : NSObject
@property (nonatomic) CGRect frame;
@property (nonatomic) CGRect bounds;
@property (nonatomic, copy) UIColor *backgroundColor;
@property (nonatomic, getter=isHidden) BOOL hidden;
@property (nonatomic, getter=isUserInteractionEnabled) BOOL userInteractionEnabled;
@property (nonatomic) NSInteger tag;
@property (nonatomic) UIViewAutoresizing autoresizingMask;
@property (nonatomic, readonly) NSArray<UIView *> *subviews;
@property (nonatomic, readonly) NSArray<UIGestureRecognizer *> *gestureRecognizers;
- (instancetype)initWithFrame:(CGRect)frame;
- (void)addSubview:(UIView *)view;
- (void)removeFromSuperview;
- (void)bringSubviewToFront:(UIView *)view;
- (UIView *)viewWithTag:(NSInteger)tag;
- (void)layoutSubviews;
@end

@interface UIControl : UIView
- (void)addTarget:(id)target action:(SEL)action forControlEvents:(UIControlEvents)controlEvents;
@end

@interface UIButton : UIControl
@property (nonatomic, readonly) UILabel *titleLabel;
+ (instancetype)buttonWithType:(UIButtonType)buttonType;
- (void)setTitle:(NSString *)title forState:(UIControlState)state;
- (void)setTitleColor:(UIColor *)color forState:(UIControlState)state;
@end

@interface UILabel : UIView
@property (nonatomic, copy) NSString *text;
@property (nonatomic, strong) UIColor *textColor;
@property (nonatomic) NSTextAlignment textAlignment;
@property (nonatomic, strong) UIFont *font;
@end

@interface UIScrollView : UIView
@property (nonatomic) BOOL scrollEnabled;
@property (nonatomic) BOOL bounces;
@end

@interface UICollectionView : UIScrollView
@end

@interface UITableView : UIScrollView
@end

@interface CALayer : NSObject
@property (nonatomic) CGFloat cornerRadius;
@end

@interface UIView (CALayer)
@property (nonatomic, readonly) CALayer *layer;
@end

@interface UIGestureRecognizer : NSObject
@property (nonatomic, readonly) UIGestureRecognizerState state;
- (void)addTarget:(id)target action:(SEL)action;
@end

@interface UIPanGestureRecognizer : UIGestureRecognizer
@end

@interface UISwipeGestureRecognizer : UIGestureRecognizer
@end

@interface UIViewController : NSObject
@property (nonatomic, strong) UIView *view;
@property (nonatomic, copy) NSString *title;
@property (nonatomic, readonly) UINavigationController *navigationController;
- (void)viewDidLoad;
- (void)viewWillAppear:(BOOL)animated;
- (void)viewDidAppear:(BOOL)animated;
- (void)viewWillDisappear:(BOOL)animated;
- (void)dismissViewControllerAnimated:(BOOL)flag completion:(void (^)(void))completion;
@end

@interface UINavigationController : UIViewController
- (UIViewController *)popViewControllerAnimated:(BOOL)animated;
@end

static inline NSString *NRStringFromCGRect(CGRect r) {
    return [NSString stringWithFormat:@"{{%.1f, %.1f}, {%.1f, %.1f}}", r.origin.x, r.origin.y, r.size.width, r.size.height];
}

#endif
