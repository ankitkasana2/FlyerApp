import React from 'react';
import AppNavigator from './AppNavigator';
import { observer } from 'mobx-react-lite';

const RootNavigator = observer(() => {
  const { authStore } = useStores();

  return authStore.isLoggedIn ? <AppNavigator /> : <AuthNavigator />;
});

export default RootNavigator;
