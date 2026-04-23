import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
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

// Theme & Assets
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import Images from '../../assets';

// Stores
import { useStores } from '../../stores/StoreContext';

// Auth shared components
import AuthHeader from './AuthHeader';
import AuthInput from './AuthInput';
import PasswordStrengthBar from './PasswordStrengthBar';

function ResetPasswordScreen() {
  const { authStore } = useStores();
  const navigation = useNavigation();

  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  // ── Derived validation states ──────────────────────────────────────────────
  const newPasswordState =
    newPassword.length === 0
      ? 'idle'
      : newPassword.length >= 8
      ? 'valid'
      : 'error';

  const confirmPasswordState =
    confirmPassword.length === 0
      ? 'idle'
      : confirmPassword === newPassword && newPassword.length >= 8
      ? 'valid'
      : 'error';

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    setLocalError(null);
    try {
      await authStore.sendOTP(email.trim());
      setStep('verify');
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  const handleReset = async () => {
    setLocalError(null);
    
    if (!otp.trim()) {
      setLocalError('Please enter the verification code');
      return;
    }
    if (newPassword.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      await authStore.verifyOTP(email.trim(), otp.trim(), newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  const handleBack = () => {
    if (step === 'verify') {
      setStep('email');
    } else {
      navigation.goBack();
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <View style={styles.successContainer}>
          <View style={styles.successCircle}>
            <View style={styles.successCheckLeft} />
            <View style={styles.successCheckRight} />
          </View>
          <Text style={styles.successTitle}>Password Reset!</Text>
          <Text style={styles.successSubtitle}>
            Your password has been updated successfully. You can now sign in
            with your new password.
          </Text>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => (navigation as any).navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.resetBtnText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

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
          <AuthHeader 
            onBackPress={handleBack}
          />

          <View style={styles.formBlock}>
            <Text style={styles.pageTitle}>
              {step === 'email' ? 'Forgot Password' : 'Reset Password'}
            </Text>
            <Text style={styles.pageSubtitle}>
              {step === 'email' 
                ? 'Enter your email address and we\'ll send you a code to reset your password.'
                : `We've sent a 6-digit verification code to ${email}.`}
            </Text>

            {step === 'email' ? (
              <>
                <AuthInput
                  label="EMAIL ADDRESS"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    setLocalError(null);
                  }}
                  keyboardType="email-address"
                  leftIcon={
                    <Image 
                      source={Images.email} 
                      style={styles.inputIcon} 
                      resizeMode="contain" 
                    />
                  }
                  returnKeyType="done"
                  onSubmitEditing={() => handleSendOTP()}
                />

                {localError || authStore.error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{localError || authStore.error}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[styles.resetBtn, authStore.loading && styles.resetBtnDisabled]}
                  onPress={() => handleSendOTP()}
                  activeOpacity={0.8}
                  disabled={authStore.loading}
                >
                  <Text style={styles.resetBtnText}>
                    {authStore.loading ? 'Sending Code...' : 'Send Code'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <AuthInput
                  label="VERIFICATION CODE"
                  placeholder="000000"
                  value={otp}
                  onChangeText={(t) => {
                    setOtp(t);
                    setLocalError(null);
                  }}
                  keyboardType="number-pad"
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

                <AuthInput
                  label="NEW PASSWORD"
                  placeholder="••••••••"
                  value={newPassword}
                  onChangeText={(t) => {
                    setNewPassword(t);
                    setLocalError(null);
                  }}
                  secureTextEntry
                  leftIcon={
                    <Image 
                      source={Images.password} 
                      style={styles.inputIcon} 
                      resizeMode="contain" 
                    />
                  }
                  validationState={newPasswordState as any}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                  ref={passwordRef}
                />

                <PasswordStrengthBar password={newPassword} />

                <AuthInput
                  label="CONFIRM PASSWORD"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={(t) => {
                    setConfirmPassword(t);
                    setLocalError(null);
                  }}
                  secureTextEntry
                  leftIcon={
                    <Image 
                      source={Images.password} 
                      style={styles.inputIcon} 
                      resizeMode="contain" 
                    />
                  }
                  validationState={confirmPasswordState as any}
                  returnKeyType="done"
                  onSubmitEditing={() => handleReset()}
                  ref={confirmRef}
                />

                {localError || authStore.error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{localError || authStore.error}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[styles.resetBtn, authStore.loading && styles.resetBtnDisabled]}
                  onPress={() => handleReset()}
                  activeOpacity={0.8}
                  disabled={authStore.loading}
                >
                  <Text style={styles.resetBtnText}>
                    {authStore.loading ? 'Resetting Password...' : 'Reset Password'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handleSendOTP()} 
                  style={styles.resendBtn}
                  disabled={authStore.loading}
                >
                  <Text style={styles.resendText}>Didn't get the code? <Text style={styles.resendLink}>Resend</Text></Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    gap: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: '#9CA3AF',
    marginBottom: 12,
    lineHeight: 20,
  },
  inputIcon: {
    width: 20,
    height: 20,
    tintColor: '#9CA3AF',
  },
  resetBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  resetBtnDisabled: {
    opacity: 0.6,
  },
  resetBtnText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.white,
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
  resendBtn: {
    alignItems: 'center',
    marginTop: 12,
  },
  resendText: {
    fontSize: Typography.fontSizes.sm,
    color: '#9CA3AF',
  },
  resendLink: {
    color: Colors.primary,
    fontWeight: Typography.fontWeights.bold,
  },

  // ── Success state ──
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  successCheckLeft: {
    position: 'absolute',
    width: 18,
    height: 3,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
    bottom: 28,
    left: 16,
    transform: [{ rotate: '45deg' }],
  },
  successCheckRight: {
    position: 'absolute',
    width: 32,
    height: 3,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
    bottom: 32,
    right: 12,
    transform: [{ rotate: '-55deg' }],
  },
  successTitle: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.black,
    color: Colors.textPrimary,
  },
  successSubtitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default observer(ResetPasswordScreen);