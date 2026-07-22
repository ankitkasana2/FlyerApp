#import "SecureView.h"

@interface SecureView ()
@property (nonatomic, strong) UITextField *secureField;
@property (nonatomic, weak) UIView *canvasView;
@end

@implementation SecureView

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    [self setUpSecureCanvas];
  }
  return self;
}

- (void)setUpSecureCanvas
{
  UITextField *field = [[UITextField alloc] initWithFrame:self.bounds];
  field.secureTextEntry = YES;
  field.backgroundColor = [UIColor clearColor];
  field.borderStyle = UITextBorderStyleNone;
  field.tintColor = [UIColor clearColor];
  field.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
  // Empty input view so focusing the field below never shows a keyboard.
  field.inputView = [[UIView alloc] initWithFrame:CGRectZero];
  // Don't let the field's own tap/selection gestures swallow touches
  // meant for the real content sitting inside its canvas.
  for (UIGestureRecognizer *recognizer in field.gestureRecognizers) {
    recognizer.enabled = NO;
  }

  [self addSubview:field];
  self.secureField = field;

  // The canvas subview only gets instantiated once the field has been
  // focused at least once.
  [field becomeFirstResponder];
  [field resignFirstResponder];

  UIView *canvas = [self findCanvasView:field];
  self.canvasView = canvas ?: self;
}

- (UIView *)findCanvasView:(UIView *)root
{
  for (UIView *subview in root.subviews) {
    if ([NSStringFromClass([subview class]) containsString:@"Canvas"]) {
      return subview;
    }
    UIView *found = [self findCanvasView:subview];
    if (found != nil) {
      return found;
    }
  }
  return nil;
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  self.secureField.frame = self.bounds;
}

- (void)insertReactSubview:(UIView *)subview atIndex:(NSInteger)index
{
  NSUInteger clampedIndex = MIN((NSUInteger)MAX(index, 0), self.canvasView.subviews.count);
  [self.canvasView insertSubview:subview atIndex:clampedIndex];
}

- (void)removeReactSubview:(UIView *)subview
{
  [subview removeFromSuperview];
}

- (NSArray<UIView *> *)reactSubviews
{
  return self.canvasView.subviews;
}

@end
