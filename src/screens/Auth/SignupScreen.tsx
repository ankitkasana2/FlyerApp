// screens/SignupScreen.tsx

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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';

// Theme
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

// Auth components
import AuthHeader from './AuthHeader';
import AuthInput, { InputValidationState } from './AuthInput';
import PasswordStrengthBar from './PasswordStrengthBar';
import SocialAuthButtons from './SocialAuthButtons';
import TermsCheckbox from './TermsCheckbox';

// ─── Validation helpers ───────────────────────────────────────────────────────
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidName = (name: string) => name.trim().length >= 2;

// ─── Form state ───────────────────────────────────────────────────────────────
interface SignupFormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

type SignupNavProp = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

// ─── SignupScreen ─────────────────────────────────────────────────────────────
const SignupScreen: React.FC = observer(() => {
  const navigation = useNavigation<SignupNavProp>();
  const { authStore } = useStores();
  const [form, setForm] = useState<SignupFormState>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [emailAlreadyRegistered, setEmailAlreadyRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for focus chaining
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  // ── Field updater ──────────────────────────────────────────────────────────
  const setField = useCallback(
    <K extends keyof SignupFormState>(key: K, value: SignupFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      // Clear error on change
      if (key in errors) {
        setErrors((prev) => ({ ...prev, [key]: undefined }));
      }
      if (key === 'email') setEmailAlreadyRegistered(false);
    },
    [errors],
  );

  // ── Validation state per field ─────────────────────────────────────────────
  const nameState: InputValidationState =
    form.fullName.length === 0
      ? 'idle'
      : isValidName(form.fullName)
      ? 'valid'
      : 'error';

  const emailState: InputValidationState =
    emailAlreadyRegistered
      ? 'error'
      : form.email.length === 0
      ? 'idle'
      : isValidEmail(form.email)
      ? 'valid'
      : 'error';

  const passwordState: InputValidationState =
    form.password.length === 0 ? 'idle' : form.password.length >= 6 ? 'idle' : 'error';

  const confirmState: InputValidationState =
    form.confirmPassword.length === 0
      ? 'idle'
      : form.confirmPassword === form.password
      ? 'valid'
      : 'error';

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleCreateAccount = useCallback(async () => {
    const newErrors: FieldErrors = {};

    if (!isValidName(form.fullName)) newErrors.fullName = 'Please enter your full name';
    if (!isValidEmail(form.email)) newErrors.email = 'Please enter a valid email';
    if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!form.termsAccepted) {
      Alert.alert('Terms Required', 'Please accept the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authStore.register(form.fullName, form.email, form.password);

      if (result.success) {
        if (result.needsVerification) {
          navigation.navigate('ConfirmEmail');
        } else if (result.autoLogin) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } else {
          Alert.alert(
            'Account Created',
            'Your account has been created. Please sign in.',
            [{ text: 'Sign In', onPress: () => navigation.navigate('Login') }],
          );
        }
      }
    } catch (err: any) {
      const msg = err?.message || err?.toString() || '';
      if (
        msg.includes('UsernameExistsException') ||
        msg.includes('User already exists') ||
        msg.includes('email') ||
        msg.includes(' EMAIL')
      ) {
        setEmailAlreadyRegistered(true);
      } else {
        Alert.alert('Registration Failed', err?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Auth Header (shared with LoginScreen) ── */}
          <AuthHeader
            title="GRODIFY"
            subtitle="NEW FLYERS EVERY DAY"
            stepLabel="STEP 1 OF 2"
            onBackPress={() => navigation.goBack()}
            backgroundImages={[
              { uri: 'https://picsum.photos/seed/technonight/300/500' },
              { uri: 'https://picsum.photos/seed/hiphop/300/500' },
            ]}
          />

          {/* ── Form ── */}
          <View style={styles.formBlock}>
            {/* Full Name */}
            <AuthInput
              label="FULL NAME"
              placeholder="Julian Casablancas"
              value={form.fullName}
              onChangeText={(t) => setField('fullName', t)}
              autoCapitalize="words"
              validationState={nameState}
              errorMessage={errors.fullName}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />

            {/* Email */}
            <AuthInput
              label="EMAIL ADDRESS"
              placeholder="you@example.com"
              value={form.email}
              onChangeText={(t) => setField('email', t)}
              keyboardType="email-address"
              validationState={emailState}
              errorMessage={
                emailAlreadyRegistered
                  ? 'This email is already registered'
                  : errors.email
              }
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            {/* Password */}
            <AuthInput
              label="PASSWORD"
              placeholder="••••••••"
              value={form.password}
              onChangeText={(t) => setField('password', t)}
              secureTextEntry
              validationState={passwordState}
              errorMessage={errors.password}
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
            />

            {/* Password strength bar */}
            <PasswordStrengthBar password={form.password} />

            {/* Confirm Password */}
            <AuthInput
              label="CONFIRM PASSWORD"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChangeText={(t) => setField('confirmPassword', t)}
              secureTextEntry
              validationState={confirmState}
              errorMessage={
                confirmState === 'error' ? 'Passwords do not match' : undefined
              }
              returnKeyType="done"
              onSubmitEditing={handleCreateAccount}
            />

            {/* Terms */}
            <TermsCheckbox
              checked={form.termsAccepted}
              onToggle={() => setField('termsAccepted', !form.termsAccepted)}
              onTermsPress={() => console.log('Terms')}
              onPrivacyPress={() => console.log('Privacy')}
            />

            {/* Create Account button */}
            <TouchableOpacity
              style={[styles.createBtn, isLoading && styles.createBtnDisabled]}
              onPress={handleCreateAccount}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <Text style={styles.createBtnText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Social auth */}
            <SocialAuthButtons
              onApplePress={() => console.log('Apple sign in')}
              onGooglePress={() => console.log('Google sign in')}
            />

            {/* Sign in link */}
            <View style={styles.signinRow}>
              <Text style={styles.signinText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
              >
                <Text style={styles.signinLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────
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
  },
  formBlock: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
    gap: 18,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createBtnDisabled: {
    opacity: 0.6,
  },
  createBtnText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 8,
  },
  signinText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  signinLink: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
});

export default SignupScreen;