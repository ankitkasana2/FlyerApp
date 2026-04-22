import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores/StoreContext';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import Colors from '../theme/colors';

const RootNavigator = observer(() => {
  const { authStore } = useStores();

  if (authStore.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return authStore.isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
});

export default RootNavigator;
