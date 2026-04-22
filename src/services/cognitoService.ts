// src/services/cognitoService.ts
// Uses amazon-cognito-identity-js (the same lib Amplify uses internally) for SRP auth.
// This avoids the heavy Amplify SDK while maintaining the same auth flow.

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

import { COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID } from './api';

// ─── Custom AsyncStorage adapter for Cognito ─────────────────────────────────
// amazon-cognito-identity-js needs a sync storage interface with get/set/removeItem.
// AsyncStorage is async, so we wrap it with in-memory cache synced on read/write.
class AsyncStorageAdapter {
  private cache: Record<string, string> = {};

  async getAllKeys(): Promise<string[]> {
    const keys = await AsyncStorage.getAllKeys();
    return (keys ?? []).map(String);
  }

  setItem(key: string, value: string): void {
    this.cache[key] = value;
    AsyncStorage.setItem(key, value).catch(() => {});
  }

  getItem(key: string): string | undefined {
    return this.cache[key];
  }

  removeItem(key: string): void {
    delete this.cache[key];
    AsyncStorage.removeItem(key).catch(() => {});
  }

  async sync(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const keys = (allKeys ?? []).map(String);
      await Promise.all(
        keys.map(async (k) => {
          const v = await AsyncStorage.getItem(k);
          if (v !== null) this.cache[k] = v;
        }),
      );
      console.log('[Cognito] Storage synced, keys loaded:', keys.length, 'cache keys:', Object.keys(this.cache));
    } catch (e) {
      console.warn('[Cognito] Storage sync failed:', e);
    }
  }
}

const cognitStorage = new AsyncStorageAdapter();

// ─── User Pool Instance ───────────────────────────────────────────────────────
// Using AsyncStorage for token persistence across app restarts.
// The library defaults to localStorage which gets cleared on restart.
const userPool = new CognitoUserPool({
  UserPoolId: COGNITO_USER_POOL_ID,
  ClientId: COGNITO_CLIENT_ID,
  storage: cognitStorage,
});

export interface CognitoSignInResult {
  session: CognitoUserSession;
  accessToken: string;
  idToken: string;
  refreshToken: string;
  userAttributes: Record<string, string>;
}

const cognitoService = {
  /**
   * Sign in using USER_SRP_AUTH (same as Amplify's awsSignIn).
   * Uses the SRP protocol — password is never sent in plaintext.
   */
  signIn(username: string, password: string): Promise<CognitoSignInResult> {
    return new Promise((resolve, reject) => {
      console.log('[Cognito] SignIn via SRP:', { username, UserPoolId: COGNITO_USER_POOL_ID, ClientId: COGNITO_CLIENT_ID });

      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool,
        Storage: cognitStorage,
      });

      const authDetails = new AuthenticationDetails({
        Username: username,
        Password: password,
      });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (session: CognitoUserSession) => {
          console.log('[Cognito] SignIn success');

          // Fetch user attributes
          cognitoUser.getUserAttributes((err, attrs) => {
            const userAttributes: Record<string, string> = {};
            if (!err && attrs) {
              attrs.forEach((attr: CognitoUserAttribute) => {
                userAttributes[attr.getName()] = attr.getValue();
              });
            }

            resolve({
              session,
              accessToken: session.getAccessToken().getJwtToken(),
              idToken: session.getIdToken().getJwtToken(),
              refreshToken: session.getRefreshToken().getToken(),
              userAttributes,
            });
          });
        },

        onFailure: (err) => {
          console.error('[Cognito] SignIn error:', err);
          reject(err);
        },

        newPasswordRequired: (_userAttributes, _requiredAttributes) => {
          // User must set a new password - reject with a meaningful error
          reject(new Error('CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED'));
        },

        // MFA challenges (not used but we handle gracefully)
        mfaRequired: (_codeDeliveryDetails) => {
          reject(new Error('MFA_REQUIRED'));
        },
      });
    });
  },

  /**
   * Get the currently signed-in Cognito user session.
   */
  getCurrentSession(): Promise<CognitoUserSession | null> {
    return cognitStorage.sync().then(() => {
      const lastUserKey = `CognitoIdentityServiceProvider.${COGNITO_CLIENT_ID}.LastAuthUser`;
      const lastAuthUser = cognitStorage.getItem(lastUserKey);
      console.log('[Cognito] Direct getItem LastAuthUser:', lastAuthUser);

      if (!lastAuthUser) {
        return Promise.resolve(null);
      }

      const currentUser = userPool.getCurrentUser();
      const username = currentUser?.getUsername() ?? null;
      console.log('[Cognito] userPool.getCurrentUser():', username);

      if (!currentUser) {
        console.log('[Cognito] userPool.getCurrentUser() is null - reading directly from cache');
        const keyPrefix = `CognitoIdentityServiceProvider.${COGNITO_CLIENT_ID}.${lastAuthUser}`;
        const idToken = cognitStorage.getItem(`${keyPrefix}.idToken`);
        const accessToken = cognitStorage.getItem(`${keyPrefix}.accessToken`);
        const refreshToken = cognitStorage.getItem(`${keyPrefix}.refreshToken`);

        if (!idToken || !accessToken || !refreshToken) {
          console.log('[Cognito] Tokens missing - idToken:', !!idToken, 'accessToken:', !!accessToken, 'refreshToken:', !!refreshToken);
          return Promise.resolve(null);
        }

        const user = new CognitoUser({ Username: lastAuthUser, Pool: userPool, Storage: cognitStorage });
        return new Promise((resolve) => {
          user.getSession((err, session) => {
            console.log('[Cognito] Direct user.getSession():', err ? err.message : 'success', 'valid:', session?.isValid());
            resolve(session && !err && session.isValid() ? session : null);
          });
        });
      }

      return new Promise((resolve) => {
        currentUser.getSession((err, session) => {
          resolve(session && !err && session.isValid() ? session : null);
        });
      });
    });
  },

  /**
   * Get user attributes for the current user.
   */
  getCurrentUserAttributes(): Promise<Record<string, string>> {
    return new Promise((resolve, reject) => {
      const currentUser = userPool.getCurrentUser();
      if (!currentUser) {
        resolve({});
        return;
      }
      currentUser.getSession((err: any, _session: any) => {
        if (err) {
          reject(err);
          return;
        }
        currentUser.getUserAttributes((attrErr, attrs) => {
          if (attrErr) {
            reject(attrErr);
            return;
          }
          const result: Record<string, string> = {};
          attrs?.forEach((attr: CognitoUserAttribute) => {
            result[attr.getName()] = attr.getValue();
          });
          resolve(result);
        });
      });
    });
  },

  /**
   * Global sign out.
   */
  signOut(): Promise<void> {
    return new Promise((resolve) => {
      const currentUser = userPool.getCurrentUser();
      if (currentUser) {
        currentUser.signOut(() => resolve());
      } else {
        resolve();
      }
    });
  },

  /**
   * Sign up a new user with Cognito.
   */
  confirmSignUp(username: string, code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('[Cognito] ConfirmSignUp:', username);

      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool,
      });

      cognitoUser.confirmRegistration(code, true, (err) => {
        if (err) {
          console.error('[Cognito] ConfirmSignUp error:', err);
          reject(err);
          return;
        }
        console.log('[Cognito] ConfirmSignUp success');
        resolve();
      });
    });
  },

  /**
   * Sign up a new user with Cognito.
   */
  signUp(email: string, password: string, fullName: string): Promise<{
    userId: string;
    isSignUpComplete: boolean;
    userConfirmed: boolean;
  }> {
    return new Promise((resolve, reject) => {
      console.log('[Cognito] SignUp:', { email, fullName });

      const attributeList = [
        new CognitoUserAttribute({ Name: 'email', Value: email }),
        new CognitoUserAttribute({ Name: 'name', Value: fullName }),
      ];

      userPool.signUp(
        email,
        password,
        attributeList,
        [],
        (err, result) => {
          if (err) {
            console.error('[Cognito] SignUp error:', err);
            reject(err);
            return;
          }

          const cognitoUser = result?.user;
          const userId = cognitoUser?.getUsername() ?? email;
          const userConfirmed =
            result?.userConfirmed ?? false;

          console.log('[Cognito] SignUp success:', {
            userId,
            userConfirmed,
          });

          resolve({
            userId,
            isSignUpComplete: userConfirmed,
            userConfirmed,
          });
        },
      );
    });
  },
};

export default cognitoService;
