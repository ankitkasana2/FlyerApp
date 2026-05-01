import { makeAutoObservable, runInAction } from 'mobx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import cognitoService from '../services/cognitoService';
import { getApiUrl, COGNITO_DOMAIN, COGNITO_CLIENT_ID } from '../services/api';
import { Linking } from 'react-native';
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
  resetEmail: string | null = null;
  loading: boolean = false;
  error: string | null = null;

  private flyerStore: any;
  private cartStore: any;

  constructor(flyerStore?: any, cartStore?: any) {
    this.flyerStore = flyerStore;
    this.cartStore = cartStore;
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
          this.isLoading = false;
        });
        return; // Early return since we successfully restored standard session
      }
    } catch (e) {
      console.warn('[AuthStore] Standard session restore threw an error:', e);
    }

    // Fallback: check for manually stored OAuth tokens if no normal session was restored
    try {
      const storedTokensStr = await AsyncStorage.getItem('@auth_tokens');
      const storedUserRaw = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (storedTokensStr && storedUserRaw) {
        const tokens = JSON.parse(storedTokensStr);
        runInAction(() => {
          this.accessToken = tokens.accessToken;
          this.idToken = tokens.idToken;
          this.refreshToken = tokens.refreshToken;
          this.user = JSON.parse(storedUserRaw);
          this.isAuthenticated = true;
        });
      } else {
        console.warn('[AuthStore] Session restore failed, user not logged in.');
      }
    } catch (e) {
      console.warn('[AuthStore] Failed to restore manual tokens', e);
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

    // 2. Clear our persisted user object and tokens
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem('@auth_tokens');
    } catch (e) {
      console.error('[AuthStore] Failed to clear storage during logout', e);
    }

    // 3. Reset related stores (same pattern as website)
    if (this.flyerStore) {
      this.flyerStore.reset();
    }
    if (this.cartStore) {
      this.cartStore.reset();
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

  async resendVerificationCode() {
    if (!this.pendingEmail) {
      throw new Error('Session expired. Please sign up again.');
    }
    await cognitoService.resendSignUpCode(this.pendingEmail);
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

  sendOTP = async (email: string) => {
    runInAction(() => {
      this.loading = true;
      this.error = null;
    });

    try {
      // Basic validation
      if (!email) {
        throw new Error('Email is required');
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      await cognitoService.sendPasswordResetCode(email);

      runInAction(() => {
        this.loading = false;
        this.resetEmail = email;
      });

      return {
        success: true,
        message: 'Password reset code sent to your email.',
      };
    } catch (error: any) {
      let errorMessage = 'Failed to send password reset code';
      const errorString = error?.message || error?.toString() || '';

      // User not found scenarios - Comprehensive coverage for password reset
      if (
        errorString.includes('UserNotFoundException') ||
        errorString.includes('User does not exist') ||
        errorString.includes('user not found') ||
        errorString.includes('USER_NOT_FOUND') ||
        errorString.includes('User not found') ||
        errorString.includes('Username does not exist') ||
        errorString.includes('username does not exist') ||
        errorString.includes('USERNAME_DOES_NOT_EXIST') ||
        errorString.includes('Invalid username') ||
        errorString.includes('invalid username') ||
        errorString.includes('INVALID_USERNAME') ||
        errorString.includes('No such user') ||
        errorString.includes('no such user') ||
        errorString.includes('NO_SUCH_USER')
      ) {
        errorMessage =
          'No account found with this email address. Please check your email or create a new account.';
      } else if (errorString.includes('InvalidParameterException')) {
        if (errorString.includes('email')) {
          errorMessage =
            'Invalid email format. Please enter a valid email address.';
        } else {
          errorMessage = 'Invalid input. Please check your email address.';
        }
      } else if (
        errorString.includes('LimitExceededException') ||
        errorString.includes('TooManyRequestsException')
      ) {
        errorMessage =
          'Too many password reset attempts. Please wait a moment and try again.';
      } else if (
        errorString.includes('Network error') ||
        errorString.includes('fetch')
      ) {
        errorMessage =
          'Network connection error. Please check your internet connection and try again.';
      } else if (errorString.includes('timeout')) {
        errorMessage =
          'Request timed out. Please check your connection and try again.';
      } else if (errorString.includes('Email is required')) {
        errorMessage = 'Please enter your email address.';
      } else if (errorString.includes('Please enter a valid email address')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      runInAction(() => {
        this.loading = false;
        this.error = errorMessage;
      });
      throw new Error(errorMessage);
    }
  };

  verifyOTP = async (email: string, code: string, newPassword: string) => {
    runInAction(() => {
      this.loading = true;
      this.error = null;
    });

    try {
      // Basic validation
      if (!email || !code || !newPassword) {
        throw new Error('All fields are required');
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Code validation
      if (code.trim().length < 1) {
        throw new Error('Verification code is required');
      }

      // Password validation (basic checks, Cognito will enforce policy)
      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      await cognitoService.confirmPasswordReset(email, code, newPassword);

      runInAction(() => {
        this.loading = false;
        this.resetEmail = null;
      });

      return {
        success: true,
        message:
          'Password reset successful. You can now sign in with your new password.',
      };
    } catch (error: any) {
      let errorMessage = 'Failed to reset password';
      const errorString = error?.message || error?.toString() || '';

      // User not found scenarios - Comprehensive coverage for OTP verification
      if (
        errorString.includes('UserNotFoundException') ||
        errorString.includes('User does not exist') ||
        errorString.includes('user not found') ||
        errorString.includes('USER_NOT_FOUND') ||
        errorString.includes('User not found') ||
        errorString.includes('Username does not exist') ||
        errorString.includes('username does not exist') ||
        errorString.includes('USERNAME_DOES_NOT_EXIST') ||
        errorString.includes('Invalid username') ||
        errorString.includes('invalid username') ||
        errorString.includes('INVALID_USERNAME') ||
        errorString.includes('No such user') ||
        errorString.includes('no such user') ||
        errorString.includes('NO_SUCH_USER')
      ) {
        errorMessage =
          'No account found with this email address. Please check your email or create a new account.';
      } else if (errorString.includes('InvalidParameterException')) {
        if (errorString.includes('code')) {
          errorMessage =
            'Invalid verification code. Please check the code and try again.';
        } else if (errorString.includes('password')) {
          errorMessage =
            'New password does not meet security requirements. Please choose a stronger password.';
        } else {
          errorMessage = 'Invalid input. Please check all fields and try again.';
        }
      } else if (errorString.includes('CodeMismatchException')) {
        errorMessage =
          'Invalid verification code. Please check the code and try again.';
      } else if (errorString.includes('ExpiredCodeException')) {
        errorMessage =
          'The verification code has expired. Please request a new code.';
      } else if (errorString.includes('InvalidPasswordException')) {
        if (errorString.includes('Password did not conform with policy')) {
          errorMessage =
            'Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.';
        } else {
          errorMessage =
            'New password does not meet security requirements. Please choose a stronger password.';
        }
      } else if (
        errorString.includes('LimitExceededException') ||
        errorString.includes('TooManyRequestsException')
      ) {
        errorMessage =
          'Too many verification attempts. Please wait a moment and try again.';
      } else if (
        errorString.includes('Network error') ||
        errorString.includes('fetch')
      ) {
        errorMessage =
          'Network connection error. Please check your internet connection and try again.';
      } else if (errorString.includes('timeout')) {
        errorMessage =
          'Request timed out. Please check your connection and try again.';
      } else if (errorString.includes('All fields are required')) {
        errorMessage = 'Please fill in all required fields.';
      } else if (errorString.includes('Please enter a valid email address')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (errorString.includes('Verification code is required')) {
        errorMessage = 'Please enter the verification code.';
      } else if (
        errorString.includes('New password must be at least 8 characters long')
      ) {
        errorMessage = 'New password must be at least 8 characters long.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      runInAction(() => {
        this.loading = false;
        this.error = errorMessage;
      });
      throw new Error(errorMessage);
    }
  };

  private mapAttributes(attrs: Record<string, string>) {
    return {
      id: attrs.sub || '',
      name: attrs.name || attrs.given_name || attrs.email || 'User',
      email: attrs.email || '',
      phone: attrs.phone_number || '',
      provider: 'email',
    };
  }

  signInWithProvider = async (provider: 'google' | 'apple') => {
    try {
      const identityProvider = provider === 'google' ? 'Google' : 'SignInWithApple'; 
      const redirectUri = encodeURIComponent('flyerapp://auth');
      const authUrl = `${COGNITO_DOMAIN}/oauth2/authorize?identity_provider=${identityProvider}&response_type=code&client_id=${COGNITO_CLIENT_ID}&redirect_uri=${redirectUri}&scope=email+openid+profile`;

      try {
        await Linking.openURL(authUrl);
      } catch (openErr) {
        console.error('[AuthStore] Linking.openURL failed:', openErr);
        throw new Error('Cannot open web browser for sign in.');
      }
    } catch (error: any) {
      let errorMessage = `Failed to sign in with ${provider}`;
      const errorString = error?.message || error?.toString() || '';

      if (errorString.includes('NotAuthorizedException')) {
        errorMessage = `${provider} sign-in not authorized. Please check your ${provider} account settings.`;
      } else if (errorString.includes('UserNotConfirmedException')) {
        errorMessage = `Your ${provider} account needs to be verified. Please check your email.`;
      } else if (errorString.includes('Network error') || errorString.includes('fetch')) {
        errorMessage = 'Network connection error. Please check your internet connection and try again.';
      } else if (errorString.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (errorString.includes('TooManyRequestsException')) {
        errorMessage = 'Too many sign-in attempts. Please wait a moment and try again.';
      } else if (errorString.includes('InvalidParameterException')) {
        errorMessage = 'Invalid sign-in parameters. Please try again.';
      } else if (errorString.includes('UserLambdaValidationException')) {
        errorMessage = 'Unable to sign in with social account. The service is temporarily unavailable. Please try again later.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      runInAction(() => {
        this.error = errorMessage;
      });
      throw new Error(errorMessage);
    }
  };

  handleOAuthCallback = async (url: string) => {
    if (url && url.includes('?code=')) {
      const code = url.split('?code=')[1].split('&')[0];
      
      runInAction(() => { 
        this.loading = true; 
        this.error = null; 
      });
      
      try {
        const redirectUri = encodeURIComponent('flyerapp://auth');
        const tokenUrl = `${COGNITO_DOMAIN}/oauth2/token`;
        
        const body = `grant_type=authorization_code&client_id=${COGNITO_CLIENT_ID}&code=${code}&redirect_uri=${redirectUri}`;

        const response = await axios.post(tokenUrl, body, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        const { access_token, id_token, refresh_token } = response.data;
        
        // Fetch user info using the access token
        const userInfoResponse = await axios.get(`${COGNITO_DOMAIN}/oauth2/userInfo`, {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        });
        
        const payload = userInfoResponse.data;
        const user = {
          id: payload.sub,
          name: payload.name || payload.given_name || payload.email || 'User',
          email: payload.email,
          phone: payload.phone_number || '',
          provider: 'social',
        };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        await AsyncStorage.setItem('@auth_tokens', JSON.stringify({
          accessToken: access_token,
          idToken: id_token,
          refreshToken: refresh_token
        }));

        runInAction(() => {
          this.accessToken = access_token;
          this.idToken = id_token;
          this.refreshToken = refresh_token;
          this.user = user;
          this.isAuthenticated = true;
          this.loading = false;
        });

      } catch (error: any) {
        console.error('[AuthStore] OAuth Callback Error:', error?.response?.data || error);
        runInAction(() => {
          this.error = 'Failed to authenticate with social provider.';
          this.loading = false;
        });
      }
    }
  };
}
