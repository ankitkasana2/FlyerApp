import React, { useEffect } from 'react';
import { Linking, Text, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { StoreProvider } from './src/stores/StoreContext';
import { rootStore } from './src/stores/rootStore';
import Toast from 'react-native-toast-message';
import Colors from './src/theme/colors';
import Typography from './src/theme/typography';

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

const App = () => {
  useEffect(() => {
    // Handle deep links when app is running or in background
    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (url.startsWith('flyerapp://auth')) {
        rootStore.authStore.handleOAuthCallback(url);
      }
    });

    // Handle deep link when app is opened from a killed state
    Linking.getInitialURL().then((url) => {
      if (url && url.startsWith('flyerapp://auth')) {
        rootStore.authStore.handleOAuthCallback(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
          <Toast />
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
