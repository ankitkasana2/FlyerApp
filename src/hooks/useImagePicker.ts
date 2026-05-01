// src/hooks/useImagePicker.ts
// Wraps react-native-image-picker with a clean async API.
// Handles camera vs library selection and returns a typed asset.

import { useCallback } from 'react';
import {
  launchImageLibrary,
  launchCamera,
  type ImageLibraryOptions,
  type CameraOptions,
  type Asset,
} from 'react-native-image-picker';
import { Alert, Platform, PermissionsAndroid } from 'react-native';

/**
 * Android requires explicit runtime permission if the CAMERA permission
 * is declared in AndroidManifest.xml.
 */
const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'Flyer App needs access to your camera to take photos.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('[useImagePicker] Permission request error:', err);
    return false;
  }
};

export interface PickedImage {
  uri: string;
  name: string;
  type: string;
}

const SHARED_OPTIONS: ImageLibraryOptions = {
  mediaType: 'photo',
  quality: 0.8,
  maxWidth: 1200,
  maxHeight: 1200,
  selectionLimit: 1,
  includeBase64: false,
};

const CAMERA_OPTIONS: CameraOptions = {
  mediaType: 'photo',
  quality: 0.8,
  maxWidth: 1200,
  maxHeight: 1200,
  saveToPhotos: false,
  includeBase64: false,
};

/**
 * Resolves an asset to a PickedImage, normalising platform-specific URI quirks.
 */
const resolveAsset = (asset: Asset): PickedImage | null => {
  let uri = asset.uri;
  if (!uri) return null;

  // On Android the uri may come without the file:// scheme
  if (Platform.OS === 'android' && !uri.startsWith('file://') && !uri.startsWith('content://')) {
    uri = `file://${uri}`;
  }

  const name = asset.fileName ?? uri.split('/').pop() ?? `image_${Date.now()}.jpg`;
  const type = asset.type ?? 'image/jpeg';

  return { uri, name, type };
};

/**
 * useImagePicker
 *
 * Returns two stable callbacks:
 *  - `pickFromLibrary()` → opens the photo library picker
 *  - `pickFromCamera()`  → opens the camera
 *
 * Both return `PickedImage | null`.
 */
export const useImagePicker = () => {
  const pickFromLibrary = useCallback((): Promise<PickedImage | null> => {
    return new Promise((resolve) => {
      launchImageLibrary(SHARED_OPTIONS, (response) => {
        if (response.didCancel || response.errorCode) {
          if (response.errorCode) {
            console.warn('[useImagePicker] library error:', response.errorMessage);
            if (response.errorCode === 'permission') {
              Alert.alert(
                'Permission Required',
                'Please allow photo library access in your device settings to choose images.',
              );
            }
          }
          return resolve(null);
        }

        const asset = response.assets?.[0];
        if (!asset) return resolve(null);

        resolve(resolveAsset(asset));
      });
    });
  }, []);

  const pickFromCamera = useCallback((): Promise<PickedImage | null> => {
    return new Promise(async (resolve) => {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please allow camera access in your device settings to take photos.',
        );
        return resolve(null);
      }

      launchCamera(CAMERA_OPTIONS, (response) => {
        if (response.didCancel || response.errorCode) {
          if (response.errorCode) {
            console.warn('[useImagePicker] camera error:', response.errorMessage);
            if (response.errorCode === 'permission') {
              Alert.alert(
                'Permission Required',
                'Please allow camera access in your device settings to take photos.',
              );
            }
          }
          return resolve(null);
        }

        const asset = response.assets?.[0];
        if (!asset) return resolve(null);

        resolve(resolveAsset(asset));
      });
    });
  }, []);

  /**
   * Shows an action sheet asking the user to choose camera or library,
   * then returns the picked image.
   */
  const pickWithPrompt = useCallback(
    (title = 'Select Image'): Promise<PickedImage | null> => {
      return new Promise((resolve) => {
        Alert.alert(title, 'Choose a source', [
          {
            text: '📷  Camera',
            onPress: async () => resolve(await pickFromCamera()),
          },
          {
            text: '🖼️  Photo Library',
            onPress: async () => resolve(await pickFromLibrary()),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ]);
      });
    },
    [pickFromCamera, pickFromLibrary],
  );

  return { pickFromLibrary, pickFromCamera, pickWithPrompt };
};
