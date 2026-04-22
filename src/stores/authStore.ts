import { makeAutoObservable, runInAction } from 'mobx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import cognitoService from '../services/cognitoService';
import { getApiUrl } from '../services/api';
import axios from 'axios';

const STORAGE_KEY = '@auth_user';

export class AuthStore {
  isAuthenticated: boolean = false;
  user: any = null;
  accessToken: string | null = null;
  idToken: string | null = null;
  refreshToken: string | null = null;
  isLoading: boolean = true;
  pendingEmail: string | null = null;
  pendingPassword: string | null = null;

  private flyerStore: any;

  constructor(flyerStore?: any) {
    this.flyerStore = flyerStore;
    makeAutoObservable(this);
    this.initialize();
  }

  async initialize() {
    try {
      // amazon-cognito-identity-js stores tokens in its own storage keyed by pool
      // getCurrentSession() will restore from that storage automatically
      const session = await cognitoService.getCurrentSession();

      if (session && session.isValid()) {
        const attrs = await cognitoService.getCurrentUserAttributes();
        const storedUserRaw = await AsyncStorage.getItem(STORAGE_KEY);
        const user = storedUserRaw ? JSON.parse(storedUserRaw) : this.mapAttributes(attrs);

        runInAction(() => {
          this.accessToken = session.getAccessToken().getJwtToken();
          this.idToken = session.getIdToken().getJwtToken();
          this.refreshToken = session.getRefreshToken().getToken();
          this.user = user;
          this.isAuthenticated = true;
        });
      }
    } catch {
      console.warn('[AuthStore] Session restore failed, user not logged in.');
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async login(username: string, password: string) {
    try {
      const result = await cognitoService.signIn(username, password);

      const attrs = result.userAttributes;
      const user = {
        id: attrs.sub || '',
        name: attrs.name || attrs.given_name || attrs.email || 'User',
        email: attrs.email || username,
        phone: attrs.phone_number || '',
        provider: 'email',
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));

      runInAction(() => {
        this.accessToken = result.accessToken;
        this.idToken = result.idToken;
        this.refreshToken = result.refreshToken;
        this.user = user;
        this.isAuthenticated = true;
      });

      return { success: true };
    } catch (error: any) {
      console.error('[AuthStore] Login error:', error.message || error);
      throw error;
    }
  }

  async logout() {
    // 1. Sign out from Cognito (clears tokens from library storage)
    try {
      await cognitoService.signOut();
    } catch (e) {
      console.warn('[AuthStore] Cognito sign out error:', e);
    }

    // 2. Clear our persisted user object
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('[AuthStore] Failed to clear storage during logout', e);
    }

    // 3. Reset related stores (same pattern as website)
    if (this.flyerStore) {
      this.flyerStore.reset();
    }

    // 4. Clear auth state (triggers navigation via RootNavigator)
    runInAction(() => {
      this.isAuthenticated = false;
      this.user = null;
      this.accessToken = null;
      this.idToken = null;
      this.refreshToken = null;
    });
  }

  private async registerUserInDatabase(params: {
    fullname: string;
    email: string;
    user_id: string;
  }) {
    try {
      const res = await axios.post(getApiUrl('/users/register'), params);
      return { success: true, data: res.data };
    } catch (err: any) {
      console.warn('[AuthStore] DB register failed:', err?.response?.data ?? err.message);
      return { success: false, error: err?.response?.data ?? err.message };
    }
  }

  async register(fullname: string, email: string, password: string) {
    if (!fullname?.trim() || !email?.trim() || !password) {
      throw new Error('All fields are required');
    }
    if (fullname.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const { userId, isSignUpComplete, userConfirmed } =
      await cognitoService.signUp(email, password, fullname);

    await this.registerUserInDatabase({
      fullname,
      email,
      user_id: userId,
    });

    if (isSignUpComplete || userConfirmed) {
      try {
        const result = await cognitoService.signIn(email, password);
        const attrs = result.userAttributes;
        const user = {
          id: attrs.sub || userId,
          name: attrs.name || fullname,
          email: attrs.email || email,
          phone: attrs.phone_number || '',
          provider: 'email',
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        runInAction(() => {
          this.accessToken = result.accessToken;
          this.idToken = result.idToken;
          this.refreshToken = result.refreshToken;
          this.user = user;
          this.isAuthenticated = true;
        });
        return { success: true, autoLogin: true };
      } catch {
        return { success: true, autoLogin: false };
      }
    }

    runInAction(() => {
      this.pendingEmail = email;
      this.pendingPassword = password;
    });
    return { success: true, needsVerification: true };
  }

  async verifyEmail(code: string) {
    if (!this.pendingEmail || !this.pendingPassword) {
      throw new Error('Session expired. Please sign up again.');
    }

    await cognitoService.confirmSignUp(this.pendingEmail, code);

    const result = await cognitoService.signIn(
      this.pendingEmail,
      this.pendingPassword,
    );
    const attrs = result.userAttributes;
    const userId = attrs.sub || this.pendingEmail;

    const user = {
      id: userId,
      name: attrs.name || '',
      email: attrs.email || this.pendingEmail,
      phone: attrs.phone_number || '',
      provider: 'email',
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    runInAction(() => {
      this.accessToken = result.accessToken;
      this.idToken = result.idToken;
      this.refreshToken = result.refreshToken;
      this.user = user;
      this.isAuthenticated = true;
      this.pendingEmail = null;
      this.pendingPassword = null;
    });

    return { success: true };
  }

  private mapAttributes(attrs: Record<string, string>) {
    return {
      id: attrs.sub || '',
      name: attrs.name || attrs.given_name || attrs.email || 'User',
      email: attrs.email || '',
      phone: attrs.phone_number || '',
      provider: 'email',
    };
  }
}
