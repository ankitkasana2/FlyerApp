import { createNavigationContainerRef } from '@react-navigation/native';
import type { AppStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<AppStackParamList>();

type NavigateArgs<RouteName extends keyof AppStackParamList> = undefined extends AppStackParamList[RouteName]
  ? [screen: RouteName] | [screen: RouteName, params: AppStackParamList[RouteName]]
  : [screen: RouteName, params: AppStackParamList[RouteName]];

function doNavigate<RouteName extends keyof AppStackParamList>(
  screen: RouteName,
  params?: AppStackParamList[RouteName],
) {
  (navigationRef.navigate as (name: RouteName, params?: AppStackParamList[RouteName]) => void)(
    screen,
    params,
  );
}

export function navigate<RouteName extends keyof AppStackParamList>(
  ...args: NavigateArgs<RouteName>
) {
  if (navigationRef.isReady()) {
    doNavigate(args[0], args[1]);
  }
}

// Cold start: the nav tree may still be on the splash/onboarding phase (no
// screens registered yet) when a notification tap needs to be routed, so
// retry briefly instead of dropping the deep link.
export function navigateWhenReady<RouteName extends keyof AppStackParamList>(
  ...args: NavigateArgs<RouteName>
) {
  const maxAttempts = 10;
  let attempt = 0;

  const attemptNavigate = () => {
    if (navigationRef.isReady()) {
      doNavigate(args[0], args[1]);
      return;
    }
    attempt += 1;
    if (attempt < maxAttempts) {
      setTimeout(attemptNavigate, 500);
    }
  };

  attemptNavigate();
}
