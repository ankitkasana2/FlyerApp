// screens/LoginScreen.tsx

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Theme & Assets
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import Images from '../../assets';

// Stores
import { useStores } from '../../stores/StoreContext';
import { AuthStackParamList } from '../../navigation/types';

// Auth shared components
import AuthHeader from './AuthHeader';
import AuthInput, { InputValidationState } from './AuthInput';
import SocialAuthButtons from './SocialAuthButtons';

type LoginNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen = observer(() => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { authStore } = useStores();
  const navigation = useNavigation<LoginNavProp>();

  // Refs for focus chaining
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = useCallback(async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await authStore.login(cleanEmail, cleanPassword);
      // Success: RootNavigator observes authStore.isAuthenticated and navigates automatically
    } catch (err: any) {
      console.log('[LoginScreen] Error:', err?.code, err?.message);

      // amazon-cognito-identity-js throws errors with a `code` property
      const code = err?.code || '';
      const msg = err?.message || '';
      let message = 'Login failed. Please check your credentials.';

      if (code === 'NotAuthorizedException' || msg.includes('NotAuthorizedException')) {
        if (msg.includes('Password attempts exceeded')) {
          message = 'Too many failed attempts. Please try again later.';
        } else {
          message = 'Incorrect email or password.';
        }
      } else if (code === 'UserNotFoundException' || msg.includes('UserNotFoundException')) {
        message = 'No account found with this email. Please sign up first.';
      } else if (code === 'UserNotConfirmedException' || msg.includes('UserNotConfirmedException')) {
        message = 'Please verify your email before signing in.';
      } else if (code === 'PasswordResetRequiredException') {
        message = 'A password reset is required. Please check your email.';
      } else if (code === 'TooManyRequestsException') {
        message = 'Too many login attempts. Please wait and try again.';
      } else if (code === 'NetworkError' || msg.includes('Network')) {
        message = 'Network error. Please check your internet connection.';
      } else if (msg === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        message = 'You need to set a new password. Please check your email.';
      } else if (msg) {
        message = msg;
      }

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, authStore]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Header shared with Signup */}
          <AuthHeader
            title="GRODIFY"
            subtitle="NEW FLYERS EVERY DAY"
            // No stepLabel for Login
            backgroundImages={[
              Images.pic1,
              Images.pic4,
              Images.pic7,
            ]}
          />

          <View style={styles.formBlock}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSub}>Sign in to access your premium flyers</Text>

            {/* Email Input */}
            <AuthInput
              label="EMAIL ADDRESS"
              placeholder="you@example.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError(null);
              }}
              keyboardType="email-address"
              leftIcon={
                <Image 
                  source={Images.email} 
                  style={styles.inputIcon} 
                  resizeMode="contain" 
                />
              }
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            {/* Password Input */}
            <AuthInput
              label="PASSWORD"
              placeholder="••••••••"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError(null);
              }}
              secureTextEntry
              leftIcon={
                <Image 
                  source={Images.password} 
                  style={styles.inputIcon} 
                  resizeMode="contain" 
                />
              }
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotBtn} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ResetPassword')}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text style={styles.loginBtnText}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Social Auth */}
            <SocialAuthButtons
              onApplePress={() => console.log('Apple Login')}
              onGooglePress={() => console.log('Google Login')}
            />

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Signup')}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  formBlock: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    gap: 20,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  welcomeSub: {
    fontSize: Typography.fontSizes.sm,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  inputIcon: {
    width: 20,
    height: 20,
    tintColor: '#9CA3AF',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  forgotText: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semiBold,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.2)',
  },
  errorText: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.xs,
    textAlign: 'center',
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.white,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  footerText: {
    fontSize: Typography.fontSizes.sm,
    color: '#9CA3AF',
  },
  footerLink: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
});

export default LoginScreen;
