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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';

// Theme & Assets
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import Images from '../../assets';

// Stores
import { useStores } from '../../stores/StoreContext';

// Auth shared components
import AuthHeader from './AuthHeader';
import AuthInput, { InputValidationState } from './AuthInput';
import PasswordStrengthBar from './PasswordStrengthBar';

type ResetPasswordNewPasswordRouteProp = RouteProp<AuthStackParamList, 'ResetPasswordNewPassword'>;

const ResetPasswordNewPasswordScreen = () => {
  const { authStore } = useStores();
  const navigation = useNavigation<any>();
  const route = useRoute<ResetPasswordNewPasswordRouteProp>();
  const { email, otp } = route.params;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [localError, setLocalError] = useState<string | null>(null);

  const confirmRef = useRef<TextInput>(null);

  // ── Derived validation states ──────────────────────────────────────────────
  const newPasswordState: InputValidationState =
    newPassword.length === 0
      ? 'idle'
      : newPassword.length >= 8
      ? 'valid'
      : 'error';

  const confirmPasswordState: InputValidationState =
    confirmPassword.length === 0
      ? 'idle'
      : confirmPassword === newPassword && newPassword.length >= 8
      ? 'valid'
      : 'error';

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleReset = async () => {
    setLocalError(null);
    
    if (newPassword.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      await authStore.verifyOTP(email, otp, newPassword);
      // Navigate to Login immediately without success screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

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
            onBackPress={() => navigation.goBack()}
          />

          <View style={styles.formBlock}>
            <Text style={styles.pageTitle}>Create New Password</Text>
            <Text style={styles.pageSubtitle}>
              Please enter and confirm your new password below.
            </Text>

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
              validationState={newPasswordState}
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
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
              validationState={confirmPasswordState}
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
                {authStore.loading ? 'Updating Password...' : 'Update Password'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
});

export default observer(ResetPasswordNewPasswordScreen);
