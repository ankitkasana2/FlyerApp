import React from 'react';
import { observer } from 'mobx-react-lite';

import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';

const RootNavigator = observer(() => {
  return authStore.isLoggedIn ? <AppNavigator /> : <AuthNavigator />;
});

export default RootNavigator;
