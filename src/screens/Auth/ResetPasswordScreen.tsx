import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
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

function ResetPasswordScreen() {
  const { authStore } = useStores();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    if (!email.trim()) {
      setLocalError('Please enter your email address');
      return;
    }
    setLocalError(null);
    try {
      await authStore.sendOTP(email.trim());
      // Navigate to the OTP screen
      navigation.navigate('ResetPasswordOtp', { email: email.trim() });
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
            <Text style={styles.pageTitle}>Forgot Password</Text>
            <Text style={styles.pageSubtitle}>
              Enter your email address and we'll send you a code to reset your password.
            </Text>

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
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  inputIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.textSecondary,
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
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textInverse,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.24)',
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSizes.xs,
    textAlign: 'center',
  },
});

export default observer(ResetPasswordScreen);
