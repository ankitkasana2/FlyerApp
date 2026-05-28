import React, { useState, useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { observer } from 'mobx-react-lite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStores } from '../stores/StoreContext';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import SplashScreen from '../screens/Splash/SplashScreen';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import Colors from '../theme/colors';

type Phase = 'splash' | 'onboarding' | 'ready';

const ONBOARDING_KEY = 'onboarding_seen';

const RootNavigator = observer(() => {
  const { authStore } = useStores();
  const [phase, setPhase] = useState<Phase>('splash');

  const handleSplashFinish = useCallback(async () => {
    try {
      const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
      setPhase(seen ? 'ready' : 'onboarding');
    } catch {
      setPhase('ready');
    }
  }, []);

  const handleOnboardingDone = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {}
    setPhase('ready');
  }, []);

  if (phase === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (phase === 'onboarding') {
    return <OnboardingScreen onDone={handleOnboardingDone} />;
  }

  if (authStore.isLoading) {
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
