#import <Foundation/Foundation.h>
#import "UIKitStubs.h"
#import <objc/runtime.h>
#import <objc/message.h>

#ifdef __cplusplus
extern "C" {
#endif

// Swizzles an instance method on a target class
BOOL NRSwizzleInstanceMethod(Class targetClass, SEL originalSelector, SEL swizzledSelector);

// Swizzles a class method on a target class
BOOL NRSwizzleClassMethod(Class targetClass, SEL originalSelector, SEL swizzledSelector);

// Recursively finds subviews of a specific class name
UIView *NRFindSubviewOfClass(UIView *parentView, NSString *className);

// Recursively prints view hierarchy for debugging
void NRLogViewHierarchy(UIView *view, int depth);

#ifdef __cplusplus
}
#endif
