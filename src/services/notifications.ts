import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { registerDeviceToken } from './notificationService';

export async function initNotifications() {
  const authStatus = await messaging().requestPermission();

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) return;

  const token = await messaging().getToken();
  console.log('FCM TOKEN:', token);

  try {
    await registerDeviceToken(token, Platform.OS === 'ios' ? 'ios' : 'android');
  } catch (err) {
    // Non-fatal: token will be re-sent on next launch
    console.warn('Failed to register device token:', err);
  }
}
