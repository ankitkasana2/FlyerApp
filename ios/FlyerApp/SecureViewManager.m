#import <React/RCTViewManager.h>
#import "SecureView.h"

@interface SecureViewManager : RCTViewManager
@end

@implementation SecureViewManager

RCT_EXPORT_MODULE(SecureView)

- (UIView *)view
{
  return [[SecureView alloc] init];
}

@end
