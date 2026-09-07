#import "HookUtils.h"

BOOL NRSwizzleInstanceMethod(Class targetClass, SEL originalSelector, SEL swizzledSelector) {
    if (!targetClass) {
        NSLog(@"[NoReels] Target class is nil for selector: %@", NSStringFromSelector(originalSelector));
        return NO;
    }
    
    Method originalMethod = class_getInstanceMethod(targetClass, originalSelector);
    Method swizzledMethod = class_getInstanceMethod(targetClass, swizzledSelector);
    
    if (!originalMethod) {
        NSLog(@"[NoReels] Original method %@ not found in class %@", NSStringFromSelector(originalSelector), NSStringFromClass(targetClass));
        return NO;
    }
    
    if (!swizzledMethod) {
        NSLog(@"[NoReels] Swizzled method %@ not found in class %@", NSStringFromSelector(swizzledSelector), NSStringFromClass(targetClass));
        return NO;
    }
    
    BOOL didAddMethod = class_addMethod(targetClass,
                                        originalSelector,
                                        method_getImplementation(swizzledMethod),
                                        method_getTypeEncoding(swizzledMethod));
    
    if (didAddMethod) {
        class_replaceMethod(targetClass,
                            swizzledSelector,
                            method_getImplementation(originalMethod),
                            method_getTypeEncoding(originalMethod));
    } else {
        method_exchangeImplementations(originalMethod, swizzledMethod);
    }
    
    NSLog(@"[NoReels] Successfully hooked -[%@ %@]", NSStringFromClass(targetClass), NSStringFromSelector(originalSelector));
    return YES;
}

BOOL NRSwizzleClassMethod(Class targetClass, SEL originalSelector, SEL swizzledSelector) {
    if (!targetClass) return NO;
    Class metaClass = object_getClass((id)targetClass);
    return NRSwizzleInstanceMethod(metaClass, originalSelector, swizzledSelector);
}

UIView *NRFindSubviewOfClass(UIView *parentView, NSString *className) {
    if (!parentView) return nil;
    if ([NSStringFromClass([parentView class]) isEqualToString:className] ||
        [NSStringFromClass([parentView class]) containsString:className]) {
        return parentView;
    }
    for (UIView *subview in parentView.subviews) {
        UIView *found = NRFindSubviewOfClass(subview, className);
        if (found) return found;
    }
    return nil;
}

void NRLogViewHierarchy(UIView *view, int depth) {
    if (!view) return;
    NSMutableString *indent = [NSMutableString string];
    for (int i = 0; i < depth; i++) [indent appendString:@"  "];
    NSLog(@"[NoReels ViewTree] %@%@ (Frame: %@, Hidden: %d)", indent, NSStringFromClass([view class]), NRStringFromCGRect(view.frame), view.hidden);
    for (UIView *subview in view.subviews) {
        NRLogViewHierarchy(subview, depth + 1);
    }
}
