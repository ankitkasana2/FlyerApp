import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { registerDeviceToken } from './notificationService';
import { getAccessToken } from './tokenStore';

const currentPlatform = Platform.OS === 'ios' ? 'ios' : 'android';

// On iOS, getToken() throws "No APNS token specified" if called before the
// OS finishes registering the device for remote notifications — that
// registration happens asynchronously after requestPermission(), so wait
// for it here instead of racing it. Returns false if it never arrives (e.g.
// the iOS Simulator, which never completes real APNs registration).
async function ensureApnsTokenReady(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return true;
  }
  if (!messaging().isDeviceRegisteredForRemoteMessages) {
    await messaging().registerDeviceForRemoteMessages();
  }
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const apnsToken = await messaging().getAPNSToken();
    if (apnsToken) {
      return true;
    }
    await new Promise<void>(resolve => setTimeout(() => resolve(), 300));
  }
  return false;
}

let tokenRefreshUnsubscribe: (() => void) | null = null;

function subscribeToTokenRefresh() {
  if (tokenRefreshUnsubscribe) {
    return;
  }
  tokenRefreshUnsubscribe = messaging().onTokenRefresh(async token => {
    if (!getAccessToken()) {
      return;
    }
    try {
      await registerDeviceToken(token, currentPlatform);
    } catch (err) {
      console.warn('Failed to register refreshed device token:', err);
    }
  });
}

export async function initNotifications() {
  if (!getAccessToken()) {
    return;
  }

  const authStatus = await messaging().requestPermission();

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) return;

  const apnsReady = await ensureApnsTokenReady();
  if (!apnsReady) {
    // Simulators never complete real APNs registration — nothing more to do.
    console.warn('[FCM] No APNS token available (likely the iOS Simulator); skipping push registration.');
    return;
  }

  const token = await messaging().getToken();
  // TODO: remove after testing
  console.log('[FCM] Device token:', token);

  try {
    await registerDeviceToken(token, currentPlatform);
  } catch (err) {
    // Non-fatal: token will be re-sent on next launch
    console.warn('Failed to register device token:', err);
  }

  subscribeToTokenRefresh();
}
