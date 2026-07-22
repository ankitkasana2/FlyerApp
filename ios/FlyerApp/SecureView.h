#import <React/RCTView.h>

// Renders its React children inside the same private canvas layer iOS
// uses internally for secure text entry (password fields). Content in
// that layer is excluded by the system compositor from screenshots,
// screen recordings, AirPlay mirroring and App Switcher snapshots.
//
// This relies on UITextField's undocumented private view hierarchy,
// which is not a stable public contract -- Apple could change it in a
// future iOS release. If the expected canvas subview can't be found,
// content falls back to rendering directly on self (visible again,
// never silently hidden forever).
@interface SecureView : RCTView
@end
