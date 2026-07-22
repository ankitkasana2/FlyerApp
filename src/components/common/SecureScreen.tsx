import React from 'react';
import {
  Platform,
  View,
  ViewProps,
  requireNativeComponent,
} from 'react-native';

// iOS renders children inside the same private canvas layer the OS uses
// for secure text entry, which the system compositor excludes from
// screenshots, screen recordings, AirPlay mirroring and App Switcher
// snapshots. See ios/FlyerApp/SecureView.{h,m} for how this works and
// its caveats.
//
// Android has no equivalent per-view protection -- FLAG_SECURE (set
// app-wide in MainActivity.kt) already blocks capture for the whole
// app, so this is a no-op passthrough there.
const NativeSecureView =
  Platform.OS === 'ios' ? requireNativeComponent<ViewProps>('SecureView') : View;

const SecureScreen: React.FC<ViewProps> = ({ children, style, ...rest }) => {
  return (
    <NativeSecureView style={[{ flex: 1 }, style]} {...rest}>
      {children}
    </NativeSecureView>
  );
};

export default SecureScreen;
