import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import FirebaseCore

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  private var privacyOverlay: UIVisualEffectView?
  private var isAppInactive = false
  private var isBeingRecorded = false

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    FirebaseApp.configure()

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "Grodify",
      in: window,
      launchOptions: launchOptions
    )

    setUpScreenCapturePrivacyProtections()

    return true
  }

  // MARK: - Screenshot / screen recording protection
  //
  // iOS has no public API to block screenshots or recording outright (unlike
  // Android's FLAG_SECURE), so this only detects and reacts: it blurs the
  // screen for as long as a recording/mirror is active, blurs it whenever the
  // app isn't in the foreground (hides content from the App Switcher
  // snapshot), and shows a native warning after a screenshot is taken.
  private func setUpScreenCapturePrivacyProtections() {
    NotificationCenter.default.addObserver(
      self, selector: #selector(handleScreenshotTaken),
      name: UIApplication.userDidTakeScreenshotNotification, object: nil
    )
    NotificationCenter.default.addObserver(
      self, selector: #selector(handleCaptureStateChanged),
      name: UIScreen.capturedDidChangeNotification, object: nil
    )
    NotificationCenter.default.addObserver(
      self, selector: #selector(handleWillResignActive),
      name: UIApplication.willResignActiveNotification, object: nil
    )
    NotificationCenter.default.addObserver(
      self, selector: #selector(handleDidBecomeActive),
      name: UIApplication.didBecomeActiveNotification, object: nil
    )
  }

  @objc private func handleScreenshotTaken() {
    guard let topController = window?.rootViewController else { return }
    let alert = UIAlertController(
      title: "Screenshot Detected",
      message: "For your security, please avoid sharing screenshots of this app's content.",
      preferredStyle: .alert
    )
    alert.addAction(UIAlertAction(title: "OK", style: .default))
    topController.present(alert, animated: true)
  }

  @objc private func handleCaptureStateChanged() {
    isBeingRecorded = UIScreen.main.isCaptured
    updatePrivacyOverlay()
  }

  @objc private func handleWillResignActive() {
    isAppInactive = true
    updatePrivacyOverlay()
  }

  @objc private func handleDidBecomeActive() {
    isAppInactive = false
    updatePrivacyOverlay()
  }

  private func updatePrivacyOverlay() {
    if isAppInactive || isBeingRecorded {
      showPrivacyOverlay()
    } else {
      hidePrivacyOverlay()
    }
  }

  private func showPrivacyOverlay() {
    guard privacyOverlay == nil, let window = window else { return }
    let blur = UIVisualEffectView(effect: UIBlurEffect(style: .systemMaterialDark))
    blur.frame = window.bounds
    blur.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    window.addSubview(blur)
    window.bringSubviewToFront(blur)
    privacyOverlay = blur
  }

  private func hidePrivacyOverlay() {
    privacyOverlay?.removeFromSuperview()
    privacyOverlay = nil
  }

  // Forwards custom-scheme redirects (e.g. the Cognito Hosted UI OAuth
  // callback "flyerapp://auth?code=...") to RN's Linking module.
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return RCTLinkingManager.application(app, open: url, options: options)
  }

  // Forwards universal links to RN's Linking module.
  func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(
      forBundleRoot: "index",
      fallbackExtension: nil
    )
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
