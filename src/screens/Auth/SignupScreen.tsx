import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Spacing, BorderRadius } from '../../theme/spacing';

type SignupNavProp = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

const SignupScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<SignupNavProp>();

  const handleSignup = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    Alert.alert('Coming soon', 'Registration is not yet connected to a backend.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Text style={styles.brandEmoji}>✈️</Text>
          <Text style={styles.brandName}>FlyerApp</Text>
          <Text style={styles.brandTagline}>Create your account</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Get started</Text>
          <Text style={styles.cardSub}>It only takes a minute</Text>

          {[
            { label: 'Full Name', icon: '🙂', value: name, set: setName, placeholder: 'Your name', keyboard: 'default' as const },
            { label: 'Email', icon: '📧', value: email, set: setEmail, placeholder: 'you@email.com', keyboard: 'email-address' as const },
            { label: 'Password', icon: '🔒', value: password, set: setPassword, placeholder: '••••••••', keyboard: 'default' as const, secure: true },
          ].map(f => (
            <View key={f.label} style={styles.field}>
              <Text style={styles.label}>{f.label}</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>{f.icon}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={f.placeholder}
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  keyboardType={f.keyboard}
                  secureTextEntry={f.secure}
                  value={f.value}
                  onChangeText={f.set}
                />
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.signupBtn, (!name.trim() || !email.trim() || !password.trim()) && styles.signupBtnDisabled]}
            onPress={handleSignup}
            disabled={!name.trim() || !email.trim() || !password.trim()}
          >
            <Text style={styles.signupBtnText}>Create Account →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  brand: { alignItems: 'center', gap: Spacing.xs },
  brandEmoji: { fontSize: 56 },
  brandName: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.extraBold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandTagline: { fontSize: FontSize.md, color: Colors.textMuted },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.base,
  },
  cardTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  cardSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: -8 },
  field: { gap: Spacing.xs },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.textSecondary,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  inputIcon: { fontSize: 16 },
  input: {
    flex: 1,
    height: 48,
    color: Colors.textPrimary,
    fontSize: FontSize.base,
  },
  signupBtn: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  signupBtnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  signupBtnDisabled: {
    backgroundColor: Colors.textMuted,
    opacity: 0.6,
  },
  footer: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  footerLink: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
});
