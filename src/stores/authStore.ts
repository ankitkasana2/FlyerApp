import { makeAutoObservable, runInAction } from 'mobx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import cognitoService from '../services/cognitoService';
import { COGNITO_DOMAIN, COGNITO_CLIENT_ID } from '../services/api';
import { setAccessToken } from '../services/tokenStore';
import { initNotifications } from '../services/notifications';
import * as authService from '../services/authService';
import { Linking } from 'react-native';
import axios from 'axios';
import type { UpdateProfilePayload, ChangePasswordPayload } from '../types/api';

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
  resetEmail: string | null = null;
  loading: boolean = false;
  error: string | null = null;

  private flyerStore: any;
  private cartStore: any;
  private notificationStore: any;

  constructor(flyerStore?: any, cartStore?: any, notificationStore?: any) {
    this.flyerStore = flyerStore;
    this.cartStore = cartStore;
    this.notificationStore = notificationStore;
    makeAutoObservable(this);
    this.initialize();
  }

  private formatCognitoUserId(userId: string, provider: string = 'cognito') {
    if (!userId) return '';
    return userId.includes('_') ? userId : `${provider}_${userId}`;
  }

  private getPreferredApiToken(params: {
    backendToken?: string | null;
    idToken?: string | null;
    accessToken?: string | null;
  }) {
    return params.backendToken || params.idToken || params.accessToken || null;
  }

  private async syncBackendSession(user: {
    fullname: string;
    email: string;
    user_id: string;
    fallbackAccessToken?: string | null;
    fallbackIdToken?: string | null;
  }) {
    const result = await this.registerUserInDatabase(user);
    const responseData =
      result.success && result.data && typeof result.data === 'object'
        ? (result.data as Record<string, unknown>)
        : null;
    const backendToken =
      typeof responseData?.token === 'string'
        ? responseData.token
        : typeof responseData?.access_token === 'string'
          ? responseData.access_token
          : typeof responseData?.accessToken === 'string'
            ? responseData.accessToken
            : typeof responseData?.jwt === 'string'
              ? responseData.jwt
              : responseData?.data &&
                  typeof responseData.data === 'object' &&
                  typeof (responseData.data as Record<string, unknown>).token === 'string'
                ? (responseData.data as Record<string, unknown>).token as string
              : null;

    if (backendToken) {
      setAccessToken(backendToken);
      return backendToken;
    }

    const fallbackToken = this.getPreferredApiToken({
      idToken: user.fallbackIdToken ?? this.idToken,
      accessToken: user.fallbackAccessToken ?? this.accessToken,
    });

    if (fallbackToken) {
      setAccessToken(fallbackToken);
    }

    return fallbackToken;
  }

  async initialize() {
    try {
      const session = await cognitoService.getCurrentSession();
      if (session && session.isValid()) {
        const attrs = await cognitoService.getCurrentUserAttributes();
        const storedUserRaw = await AsyncStorage.getItem(STORAGE_KEY);
        const user = storedUserRaw
          ? this.normalizeStoredUser(JSON.parse(storedUserRaw))
          : this.mapAttributes(attrs);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        const accessToken = session.getAccessToken().getJwtToken();
        const idToken = session.getIdToken().getJwtToken();
        const backendToken = await this.syncBackendSession({
          fullname: user.name || user.email,
          email: user.email,
          user_id: user.id,
          fallbackAccessToken: accessToken,
          fallbackIdToken: idToken,
        });
        runInAction(() => {
          this.accessToken = backendToken || accessToken;
          this.idToken = idToken;
          this.refreshToken = session.getRefreshToken().getToken();
          this.user = user;
          this.isAuthenticated = true;
          this.isLoading = false;
        });
        void initNotifications();
        return;
      }
    } catch (e: any) {
      if (e?.message === 'ACCOUNT_DELETED') {
        await this.logout();
        runInAction(() => { this.isLoading = false; });
        return;
      }
      console.warn('[AuthStore] Standard session restore threw an error:', e);
    }

    try {
      const storedTokensStr = await AsyncStorage.getItem('@auth_tokens');
      const storedUserRaw = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTokensStr && storedUserRaw) {
        const tokens = JSON.parse(storedTokensStr);
        const user = this.normalizeStoredUser(JSON.parse(storedUserRaw));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        const backendToken = await this.syncBackendSession({
          fullname: user.name || user.email,
          email: user.email,
          user_id: user.id,
          fallbackAccessToken: tokens.accessToken,
          fallbackIdToken: tokens.idToken,
        });
        runInAction(() => {
          this.accessToken = backendToken || tokens.accessToken;
          this.idToken = tokens.idToken;
          this.refreshToken = tokens.refreshToken;
          this.user = user;
          this.isAuthenticated = true;
        });
        void initNotifications();
      } else {
        console.warn('[AuthStore] Session restore failed, user not logged in.');
      }
    } catch (e: any) {
      if (e?.message === 'ACCOUNT_DELETED') {
        await AsyncStorage.removeItem(STORAGE_KEY);
        await AsyncStorage.removeItem('@auth_tokens');
      } else {
        console.warn('[AuthStore] Failed to restore manual tokens', e);
      }
    } finally {
      runInAction(() => { this.isLoading = false; });
    }
  }

  async login(username: string, password: string) {
    try {
      const result = await cognitoService.signIn(username, password);
      const attrs = result.userAttributes;
      const user = {
        id: this.formatCognitoUserId(attrs.sub || '', 'cognito'),
        name: attrs.name || attrs.given_name || attrs.email || 'User',
        email: attrs.email || username,
        phone: attrs.phone_number || '',
        provider: 'email',
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      const backendToken = await this.syncBackendSession({
        fullname: user.name,
        email: user.email,
        user_id: user.id,
        fallbackAccessToken: result.accessToken,
        fallbackIdToken: result.idToken,
      });

      runInAction(() => {
        this.accessToken = backendToken || result.accessToken;
        this.idToken = result.idToken;
        this.refreshToken = result.refreshToken;
        this.user = user;
        this.isAuthenticated = true;
      });
      void initNotifications();

      return { success: true };
    } catch (error: any) {
      if (error?.message === 'ACCOUNT_DELETED') {
        // Cognito login succeeded but backend blocked this deleted account —
        // sign out of Cognito so they can't keep trying and clear any stored data
        try { await cognitoService.signOut(); } catch {}
        await AsyncStorage.removeItem(STORAGE_KEY);
        await AsyncStorage.removeItem('@auth_tokens');
        const err = new Error('This account has been deleted. Please sign up to create a new account.');
        throw err;
      }
      console.error('[AuthStore] Login error:', error.message || error);
      throw error;
    }
  }

  deleteAccount = async () => {
    runInAction(() => { this.loading = true; this.error = null; });
    try {
      await this.getBackendToken();
      await authService.deleteAccount();
    } catch (err: any) {
      // If backend deletion fails, still proceed — user must be able to delete locally
      console.warn('[AuthStore] Backend account deletion failed:', err.message);
    }

    try {
      await cognitoService.deleteUser();
    } catch (err: any) {
      // Social login users don't have a deletable Cognito record via SDK — that's fine
      console.warn('[AuthStore] Cognito deleteUser failed:', err.message);
    }

    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem('@auth_tokens');
    } catch {}

    setAccessToken(null);

    if (this.flyerStore) this.flyerStore.reset();
    if (this.cartStore) this.cartStore.reset();
    if (this.notificationStore) this.notificationStore.reset();

    runInAction(() => {
      this.isAuthenticated = false;
      this.user = null;
      this.accessToken = null;
      this.idToken = null;
      this.refreshToken = null;
      this.loading = false;
    });
  };

  async logout() {
    try {
      await cognitoService.signOut();
    } catch (e) {
      console.warn('[AuthStore] Cognito sign out error:', e);
    }

    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem('@auth_tokens');
    } catch (e) {
      console.error('[AuthStore] Failed to clear storage during logout', e);
    }

    setAccessToken(null);

    if (this.flyerStore) this.flyerStore.reset();
    if (this.cartStore) this.cartStore.reset();
    if (this.notificationStore) this.notificationStore.reset();

    runInAction(() => {
      this.isAuthenticated = false;
      this.user = null;
      this.accessToken = null;
      this.idToken = null;
      this.refreshToken = null;
    });
  }

  // ─── Profile Management ───────────────────────────────────────────────────

  private async getBackendToken() {
    if (!this.user?.email || !this.user?.id) {
      throw new Error('User session is missing required profile details.');
    }

    const normalizedUser = this.normalizeStoredUser(this.user);
    if (normalizedUser.id !== this.user.id) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUser));
      runInAction(() => {
        this.user = normalizedUser;
      });
    }

    const result = await this.registerUserInDatabase({
      fullname: normalizedUser.name || normalizedUser.email,
      email: normalizedUser.email,
      user_id: normalizedUser.id,
    });

    const backendToken =
      result.success && result.data && typeof result.data === 'object'
        ? (result.data as { token?: string }).token
        : null;
    if (backendToken) {
      setAccessToken(backendToken);
      return backendToken as string;
    }

    const fallbackToken = this.getPreferredApiToken({
      idToken: this.idToken,
      accessToken: this.accessToken,
    });

    if (!fallbackToken) {
      throw new Error('Unable to refresh your session. Please sign in again.');
    }

    setAccessToken(fallbackToken);
    return fallbackToken;
  }

  updateProfile = async (payload: UpdateProfilePayload) => {
    runInAction(() => { this.loading = true; this.error = null; });
    try {
      await this.getBackendToken();
      const { data } = await authService.updateProfile(payload);
      if (data.success) {
        const nextPhone = payload.phone ?? payload.mobile ?? this.user?.phone ?? '';
        const updatedUser = {
          ...this.user,
          name: data.user.fullname,
          email: data.user.email,
          phone: data.user.phone || data.user.mobile || nextPhone,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
        runInAction(() => {
          this.user = updatedUser;
          // Update token if backend rotates it on profile change
          if (data.token) {
            setAccessToken(data.token);
          }
          this.loading = false;
        });
        return { success: true };
      }
      throw new Error('Failed to update profile');
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message;
        this.loading = false;
      });
      throw err;
    }
  };

  changePassword = async (payload: ChangePasswordPayload) => {
    runInAction(() => { this.loading = true; this.error = null; });
    try {
      await this.getBackendToken();
      const { data } = await authService.changePassword(payload);
      runInAction(() => { this.loading = false; });
      return { success: data.success };
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message;
        this.loading = false;
      });
      throw err;
    }
  };

  // ─── Registration & Email Verification ───────────────────────────────────

  private async registerUserInDatabase(params: {
    fullname: string;
    email: string;
    user_id: string;
  }) {
    try {
      const { data } = await authService.registerUser(params);
      return { success: true, data };
    } catch (err: any) {
      // apiClient interceptor strips err.response — check the message text instead
      if (
        err?.response?.status === 403 ||
        err?.message?.toLowerCase().includes('has been deleted')
      ) {
        throw new Error('ACCOUNT_DELETED');
      }
      console.warn('[AuthStore] DB register failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  async register(fullname: string, email: string, password: string) {
    if (!fullname?.trim() || !email?.trim() || !password) {
      throw new Error('All fields are required');
    }
    if (fullname.trim().length < 2) throw new Error('Name must be at least 2 characters long');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error('Please enter a valid email address');
    if (password.length < 8) throw new Error('Password must be at least 8 characters long');

    // If this email was previously deleted, clear the blocklist entry so the user
    // can create a fresh account. Silent OAuth re-login is still blocked because
    // it goes through a different code path (handleOAuthCallback / initialize).
    try {
      const { data } = await authService.checkEmailDeleted(email);
      if (data.deleted) {
        await authService.clearDeletedAccount(email);
      }
    } catch {
      // Network/server error — ignore and let Cognito decide
    }

    const { userId, isSignUpComplete, userConfirmed } =
      await cognitoService.signUp(email, password, fullname);

    try {
      await this.registerUserInDatabase({ fullname, email, user_id: userId });
    } catch (err: any) {
      if (err?.message === 'ACCOUNT_DELETED') {
        // Delete the freshly created Cognito account and surface a clear error
        try { await cognitoService.signOut(); } catch {}
        throw new Error('This email belongs to a deleted account. Please use a different email address.');
      }
      throw err;
    }

    if (isSignUpComplete || userConfirmed) {
      try {
        const result = await cognitoService.signIn(email, password);
        const attrs = result.userAttributes;
        const user = {
          id: this.formatCognitoUserId(attrs.sub || userId, 'cognito'),
          name: attrs.name || fullname,
          email: attrs.email || email,
          phone: attrs.phone_number || '',
          provider: 'email',
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        setAccessToken(
          this.getPreferredApiToken({
            idToken: result.idToken,
            accessToken: result.accessToken,
          }),
        );
        const backendToken = await this.syncBackendSession({
          fullname,
          email,
          user_id: userId,
          fallbackAccessToken: result.accessToken,
          fallbackIdToken: result.idToken,
        });
        runInAction(() => {
          this.accessToken = backendToken || result.accessToken;
          this.idToken = result.idToken;
          this.refreshToken = result.refreshToken;
          this.user = user;
          this.isAuthenticated = true;
        });
        void initNotifications();
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

  async resendVerificationCode() {
    if (!this.pendingEmail) throw new Error('Session expired. Please sign up again.');
    await cognitoService.resendSignUpCode(this.pendingEmail);
  }

  async verifyEmail(code: string) {
    if (!this.pendingEmail || !this.pendingPassword) {
      throw new Error('Session expired. Please sign up again.');
    }
    await cognitoService.confirmSignUp(this.pendingEmail, code);
    const result = await cognitoService.signIn(this.pendingEmail, this.pendingPassword);
    const attrs = result.userAttributes;
    const userId = this.formatCognitoUserId(attrs.sub || this.pendingEmail, 'cognito');
    const user = {
      id: userId,
      name: attrs.name || '',
      email: attrs.email || this.pendingEmail,
      phone: attrs.phone_number || '',
      provider: 'email',
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setAccessToken(
      this.getPreferredApiToken({
        idToken: result.idToken,
        accessToken: result.accessToken,
      }),
    );
    const backendToken = await this.syncBackendSession({
      fullname: user.name || '',
      email: user.email,
      user_id: userId,
      fallbackAccessToken: result.accessToken,
      fallbackIdToken: result.idToken,
    });
    runInAction(() => {
      this.accessToken = backendToken || result.accessToken;
      this.idToken = result.idToken;
      this.refreshToken = result.refreshToken;
      this.user = user;
      this.isAuthenticated = true;
      this.pendingEmail = null;
      this.pendingPassword = null;
    });
    void initNotifications();
    return { success: true };
  }

  // ─── Password Reset ───────────────────────────────────────────────────────

  sendOTP = async (email: string) => {
    runInAction(() => { this.loading = true; this.error = null; });
    try {
      if (!email) throw new Error('Email is required');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) throw new Error('Please enter a valid email address');

      await cognitoService.sendPasswordResetCode(email);
      runInAction(() => { this.loading = false; this.resetEmail = email; });
      return { success: true, message: 'Password reset code sent to your email.' };
    } catch (error: any) {
      const errorMessage = this.mapCognitoError(error, 'password_reset');
      runInAction(() => { this.loading = false; this.error = errorMessage; });
      throw new Error(errorMessage);
    }
  };

  verifyOTP = async (email: string, code: string, newPassword: string) => {
    runInAction(() => { this.loading = true; this.error = null; });
    try {
      if (!email || !code || !newPassword) throw new Error('All fields are required');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) throw new Error('Please enter a valid email address');
      if (code.trim().length < 1) throw new Error('Verification code is required');
      if (newPassword.length < 8) throw new Error('New password must be at least 8 characters long');

      await cognitoService.confirmPasswordReset(email, code, newPassword);
      runInAction(() => { this.loading = false; this.resetEmail = null; });
      return {
        success: true,
        message: 'Password reset successful. You can now sign in with your new password.',
      };
    } catch (error: any) {
      const errorMessage = this.mapCognitoError(error, 'otp_verify');
      runInAction(() => { this.loading = false; this.error = errorMessage; });
      throw new Error(errorMessage);
    }
  };

  // ─── Social / OAuth ───────────────────────────────────────────────────────

  signInWithProvider = async (provider: 'google' | 'apple') => {
    try {
      const identityProvider = provider === 'google' ? 'Google' : 'SignInWithApple';
      const redirectUri = encodeURIComponent('flyerapp://auth');
      const authUrl = `${COGNITO_DOMAIN}/oauth2/authorize?identity_provider=${identityProvider}&response_type=code&client_id=${COGNITO_CLIENT_ID}&redirect_uri=${redirectUri}&scope=email+openid+profile`;
      await Linking.openURL(authUrl);
    } catch (error: any) {
      const errorMessage = this.mapCognitoError(error, 'social');
      runInAction(() => { this.error = errorMessage; });
      throw new Error(errorMessage);
    }
  };

  handleOAuthCallback = async (url: string) => {
    if (!url?.includes('?code=')) return;
    const code = url.split('?code=')[1].split('&')[0];
    runInAction(() => { this.loading = true; this.error = null; });
    try {
      const redirectUri = encodeURIComponent('flyerapp://auth');
      const body = `grant_type=authorization_code&client_id=${COGNITO_CLIENT_ID}&code=${code}&redirect_uri=${redirectUri}`;
      const tokenResponse = await axios.post(`${COGNITO_DOMAIN}/oauth2/token`, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, id_token, refresh_token } = tokenResponse.data;
      const userInfoResponse = await axios.get(`${COGNITO_DOMAIN}/oauth2/userInfo`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const payload = userInfoResponse.data;
      const provider = payload.identities?.[0]?.providerName?.toLowerCase().includes('google')
        ? 'google'
        : payload.identities?.[0]?.providerName?.toLowerCase().includes('apple')
          ? 'apple'
          : 'social';
      const user = {
        id: this.formatCognitoUserId(payload.sub, provider),
        name: payload.name || payload.given_name || payload.email || 'User',
        email: payload.email,
        phone: payload.phone_number || '',
        provider,
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      await AsyncStorage.setItem('@auth_tokens', JSON.stringify({
        accessToken: access_token,
        idToken: id_token,
        refreshToken: refresh_token,
      }));
      setAccessToken(
        this.getPreferredApiToken({
          idToken: id_token,
          accessToken: access_token,
        }),
      );
      const backendToken = await this.syncBackendSession({
        fullname: user.name || '',
        email: user.email,
        user_id: user.id,
        fallbackAccessToken: access_token,
        fallbackIdToken: id_token,
      });

      runInAction(() => {
        this.accessToken = backendToken || access_token;
        this.idToken = id_token;
        this.refreshToken = refresh_token;
        this.user = user;
        this.isAuthenticated = true;
        this.loading = false;
      });
      void initNotifications();
    } catch (error: any) {
      if (error?.message === 'ACCOUNT_DELETED') {
        runInAction(() => {
          this.error = 'This account has been deleted. Please sign up to create a new account.';
          this.loading = false;
        });
        return;
      }
      console.error('[AuthStore] OAuth Callback Error:', error?.response?.data || error);
      runInAction(() => {
        this.error = 'Failed to authenticate with social provider.';
        this.loading = false;
      });
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private mapAttributes(attrs: Record<string, string>) {
    return {
      id: this.formatCognitoUserId(attrs.sub || '', 'cognito'),
      name: attrs.name || attrs.given_name || attrs.email || 'User',
      email: attrs.email || '',
      phone: attrs.phone_number || '',
      provider: 'email',
    };
  }

  private normalizeStoredUser(user: any) {
    const provider =
      user?.provider === 'google' || user?.provider === 'apple'
        ? user.provider
        : 'cognito';

    return {
      ...user,
      id: this.formatCognitoUserId(String(user?.id ?? ''), provider),
    };
  }

  private mapCognitoError(
    error: any,
    context: 'password_reset' | 'otp_verify' | 'social',
  ): string {
    const s = error?.message || error?.toString() || '';

    if (
      s.includes('UserNotFoundException') || s.includes('User does not exist') ||
      s.includes('Username does not exist') || s.includes('user not found')
    ) {
      return 'No account found with this email address. Please check your email or create a new account.';
    }
    if (s.includes('CodeMismatchException')) {
      return 'Invalid verification code. Please check the code and try again.';
    }
    if (s.includes('ExpiredCodeException')) {
      return 'The verification code has expired. Please request a new code.';
    }
    if (s.includes('InvalidPasswordException') || s.includes('Password did not conform with policy')) {
      return 'Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters.';
    }
    if (s.includes('LimitExceededException') || s.includes('TooManyRequestsException')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    if (s.includes('Network error') || s.includes('fetch')) {
      return 'Network connection error. Please check your internet connection and try again.';
    }
    if (s.includes('NotAuthorizedException') && context === 'social') {
      return 'Social sign-in not authorized. Please check your account settings.';
    }
    return error?.message || `An error occurred. Please try again.`;
  }
}
