// screens/Auth/OtpScreen.tsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useStores } from '../../stores/StoreContext';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

const OTP_LENGTH = 6;
const RESEND_TIME = 60;

type ConfirmEmailNavProp = NativeStackNavigationProp<AuthStackParamList, 'ConfirmEmail'>;

const OtpScreen = observer(() => {
  const navigation = useNavigation<ConfirmEmailNavProp>();
  const { authStore } = useStores();

  const email = authStore.pendingEmail ?? '';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(RESEND_TIME);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (!authStore.pendingEmail) {
      navigation.goBack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = useCallback((text: string, index: number) => {
    if (!/^\d?$/.test(text)) return;
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError(null);
    if (text && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
    if (newOtp.every((d) => d.length === 1)) {
      handleVerify(newOtp.join(''));
    }
  }, [otp]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyPress = useCallback((key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handleResend = useCallback(async () => {
    if (timer > 0) return;
    try {
      await authStore.resendVerificationCode();
      setTimer(RESEND_TIME);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to resend code. Please try again.');
    }
  }, [timer]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVerify = useCallback(async (code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authStore.verifyEmail(code);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (err: any) {
      const msg = err?.message || err?.toString() || '';
      if (msg.includes('Incorrect')) {
        setError('Incorrect code. Please try again.');
      } else if (msg.includes('expired') || msg.includes('Expired')) {
        setError('Code expired. Please request a new one.');
      } else {
        setError('Verification failed. Please try again.');
      }
      setOtp(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <View style={styles.topSection}>
            <Text style={styles.title}>Verify Account</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to{'\n'}your email
            </Text>
            <Text style={styles.email}>{email}</Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                keyboardType="number-pad"
                maxLength={1}
                style={[
                  styles.input,
                  digit ? styles.inputActive : styles.inputInactive,
                  error ? styles.inputError : null,
                ]}
                editable={!isLoading}
              />
            ))}
          </View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <TouchableOpacity
            style={[styles.verifyBtn, isLoading && styles.verifyBtnDisabled]}
            onPress={() => handleVerify(otp.join(''))}
            activeOpacity={0.85}
            disabled={isLoading || otp.some((d) => !d)}>
            <Text style={styles.verifyBtnText}>
              {isLoading ? 'Verifying...' : 'Verify'}
            </Text>
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>
              Resend code in{' '}
              <Text style={styles.timer}>00:{timer < 10 ? `0${timer}` : timer}</Text>
            </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={timer > 0}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.resendLink,
                  timer === 0 ? {} : styles.resendLinkDisabled,
                ]}>
                Resend
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  backArrow: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '300',
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  email: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.medium,
    marginTop: 8,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  input: {
    width: 60,
    height: 60,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  inputInactive: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  inputActive: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  verifyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  verifyBtnDisabled: {
    opacity: 0.6,
  },
  verifyBtnText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 6,
  },
  resendLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  timer: {
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  resendLink: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  resendLinkDisabled: {
    opacity: 0.4,
  },
});

export default OtpScreen;