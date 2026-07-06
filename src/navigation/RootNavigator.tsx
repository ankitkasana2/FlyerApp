import React, { useState, useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores/StoreContext';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import SplashScreen from '../screens/Splash/SplashScreen';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import Colors from '../theme/colors';

type Phase = 'splash' | 'onboarding' | 'ready';

const RootNavigator = observer(() => {
  const { authStore } = useStores();
  const [phase, setPhase] = useState<Phase>('splash');

  const handleSplashFinish = useCallback(() => {
    // Authenticated users go straight to the app; unauthenticated users see onboarding first
    setPhase(authStore.isAuthenticated ? 'ready' : 'onboarding');
  }, [authStore.isAuthenticated]);

  const handleOnboardingDone = useCallback(() => {
    setPhase('ready');
  }, []);

  if (phase === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (phase === 'onboarding') {
    return <OnboardingScreen onDone={handleOnboardingDone} />;
  }

  if (authStore.isLoading || authStore.loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return authStore.isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
});

export default RootNavigator;
