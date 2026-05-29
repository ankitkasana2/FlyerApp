import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';

import { useStores } from '../../stores/StoreContext';
import ScreenHeader from '../../components/common/ScreenHeader';
import FeedbackDialog from '../../components/common/FeedbackDialog';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

const EyeIcon: React.FC<{ visible: boolean }> = ({ visible }) => (
  <View style={eyeStyles.wrap}>
    <View style={eyeStyles.outer}>
      <View style={eyeStyles.pupil} />
    </View>
    {!visible && <View style={eyeStyles.slash} />}
  </View>
);

const eyeStyles = StyleSheet.create({
  wrap: { width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  outer: {
    width: 18, height: 12,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: Colors.textSecondary,
    justifyContent: 'center', alignItems: 'center',
  },
  pupil: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textSecondary,
  },
  slash: {
    position: 'absolute',
    width: 22, height: 1.5,
    backgroundColor: Colors.textSecondary,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },
});

const PasswordField: React.FC<{
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
}> = ({ label, value, onChangeText, placeholder, returnKeyType = 'next', onSubmitEditing }) => {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordWrap}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? label}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={!show}
          autoCapitalize="none"
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
        />
        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShow(s => !s)} activeOpacity={0.7}>
          <EyeIcon visible={show} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ChangePasswordScreen: React.FC = observer(() => {
  const navigation = useNavigation<any>();
  const { authStore } = useStores();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [dialogState, setDialogState] = useState<{
    visible: boolean;
    tone: 'success' | 'error' | 'info';
    title: string;
    message: string;
    onClose?: () => void;
  }>({
    visible: false,
    tone: 'info',
    title: '',
    message: '',
  });

  const openDialog = (
    tone: 'success' | 'error' | 'info',
    title: string,
    message: string,
    onClose?: () => void,
  ) => {
    setDialogState({
      visible: true,
      tone,
      title,
      message,
      onClose,
    });
  };

  const closeDialog = () => {
    const callback = dialogState.onClose;
    setDialogState(prev => ({
      ...prev,
      visible: false,
      onClose: undefined,
    }));
    callback?.();
  };

  const handleSave = async () => {
    if (!current || !next || !confirm) {
      openDialog('info', 'Complete all fields', 'Please fill in every password field before continuing.');
      return;
    }
    if (next.length < 8) {
      openDialog('info', 'Password too short', 'Your new password must be at least 8 characters long.');
      return;
    }
    if (next === current) {
      openDialog('info', 'Choose a new password', 'Your new password should be different from your current password.');
      return;
    }
    if (next !== confirm) {
      openDialog('info', 'Passwords do not match', 'Please make sure both new password fields match exactly.');
      return;
    }

    setSaving(true);
    try {
      await authStore.changePassword({ currentPassword: current, newPassword: next });
      openDialog(
        'success',
        'Password updated',
        'Your password has been changed successfully.',
        () => navigation.goBack(),
      );
    } catch (err: any) {
      openDialog('error', 'Update failed', err?.message ?? 'Could not change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Change Password" onBackPress={() => navigation.goBack()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PasswordField
            label="Current Password"
            value={current}
            onChangeText={setCurrent}
            placeholder="Enter current password"
          />

          <PasswordField
            label="New Password"
            value={next}
            onChangeText={setNext}
            placeholder="Minimum 8 characters"
          />

          <PasswordField
            label="Confirm New Password"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Re-enter new password"
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          {/* Rules */}
          <View style={styles.rules}>
            <Text style={styles.rulesTitle}>Password requirements:</Text>
            {[
              'At least 8 characters',
              'Must differ from current password',
              'New password and confirm must match',
            ].map(r => (
              <Text key={r} style={styles.ruleItem}>• {r}</Text>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={Colors.textInverse} />
            ) : (
              <Text style={styles.saveBtnText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <FeedbackDialog
        visible={dialogState.visible}
        tone={dialogState.tone}
        title={dialogState.title}
        message={dialogState.message}
        buttonLabel={dialogState.tone === 'error' ? 'Try Again' : 'Done'}
        onClose={closeDialog}
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 20,
  },
  field: { gap: 6 },
  label: {
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: Typography.fontSizes.base,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textPrimary,
  },
  eyeBtn: {
    padding: 6,
  },
  rules: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  rulesTitle: {
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.semiBold,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  ruleItem: {
    fontSize: Typography.fontSizes.xs,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    fontSize: Typography.fontSizes.base,
    fontFamily: Typography.fontFamilies.semiBold,
    color: Colors.textInverse,
    letterSpacing: 0.3,
  },
});

export default ChangePasswordScreen;
