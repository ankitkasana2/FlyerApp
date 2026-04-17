import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores/StoreContext';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';

const RootNavigator = observer(() => {
  const { authStore } = useStores();
  return authStore.isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
});

export default RootNavigator;
