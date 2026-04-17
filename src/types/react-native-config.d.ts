// src/types/react-native-config.d.ts
// Extends react-native-config's type definition with your .env variables.
// Add any new .env key here to get TypeScript autocomplete.

declare module 'react-native-config' {
  export interface NativeConfig {
    API_BASE_URL?: string;
    APP_NAME?: string;
    LOCAL_URL?: string;
    ENVIRONMENT?: 'development' | 'production' | string;
  }

  export const Config: NativeConfig;
  export default Config;
}
