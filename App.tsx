import React, { useCallback, useEffect, useRef } from 'react';
import { AppState, Linking, Text, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  StripeProvider,
  useStripe,
} from '@stripe/stripe-react-native';
import Config from 'react-native-config';
import messaging from '@react-native-firebase/messaging';
import RootNavigator from './src/navigation/RootNavigator';
import { StoreProvider } from './src/stores/StoreContext';
import { rootStore } from './src/stores/rootStore';
import Toast from 'react-native-toast-message';
import Colors from './src/theme/colors';
import Typography from './src/theme/typography';
import { toastConfig } from './src/components/common/AppToast';
import { initNotifications } from './src/services/notifications';

const globalTextStyle = { fontFamily: Typography.fontFamilies.regular };
const globalInputStyle = {
  fontFamily: Typography.fontFamilies.regular,
  color: Colors.textPrimary,
};

const TextWithDefaults = Text as typeof Text & {
  defaultProps?: { style?: unknown };
};
const TextInputWithDefaults = TextInput as typeof TextInput & {
  defaultProps?: { style?: unknown };
};

TextWithDefaults.defaultProps = TextWithDefaults.defaultProps || {};
TextWithDefaults.defaultProps.style = [
  globalTextStyle,
  TextWithDefaults.defaultProps.style,
].filter(Boolean);

TextInputWithDefaults.defaultProps = TextInputWithDefaults.defaultProps || {};
TextInputWithDefaults.defaultProps.style = [
  globalInputStyle,
  TextInputWithDefaults.defaultProps.style,
].filter(Boolean);

const AppShell = () => {
  const { handleURLCallback } = useStripe();
  const oauthCancelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearOAuthCancelTimeout = useCallback(() => {
    if (oauthCancelTimeoutRef.current) {
      clearTimeout(oauthCancelTimeoutRef.current);
      oauthCancelTimeoutRef.current = null;
    }
  }, []);

  const handleDeepLink = useCallback(
    async (url: string | null) => {
      if (!url) {
        return;
      }

      const stripeHandled = await handleURLCallback(url);
      if (stripeHandled) {
        return;
      }

      if (url.startsWith('flyerapp://auth')) {
        clearOAuthCancelTimeout();
        rootStore.authStore.handleOAuthCallback(url);
      }
    },
    [clearOAuthCancelTimeout, handleURLCallback],
  );

  // Cold-start: run only once so we never double-process the initial URL.
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      handleDeepLink(url);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live listener: re-subscribes only if handleDeepLink identity changes.
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });
    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        clearOAuthCancelTimeout();
        oauthCancelTimeoutRef.current = setTimeout(() => {
          rootStore.authStore.cancelOAuthLoading();
          oauthCancelTimeoutRef.current = null;
        }, 1500);
      }
    });
    return () => {
      clearOAuthCancelTimeout();
      sub.remove();
    };
  }, [clearOAuthCancelTimeout]);

  useEffect(() => {
    initNotifications();
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      const title = remoteMessage.notification?.title ?? 'Notification';
      const message = remoteMessage.notification?.body ?? '';
      Toast.show({ type: 'info', text1: title, text2: message });
    });

    return unsubscribe;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
          <Toast config={toastConfig} topOffset={52} visibilityTime={3000} />
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const App = () => (
  <StripeProvider
    publishableKey={
      Config.STRIPE_PUBLISHABLE_KEY ||
      Config.PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      Config.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      ''
    }
    merchantIdentifier={Config.STRIPE_MERCHANT_IDENTIFIER}
    urlScheme="flyerapp"
  >
    <AppShell />
  </StripeProvider>
);

export default App;
