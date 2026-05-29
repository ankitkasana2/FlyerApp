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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';

import { useStores } from '../../stores/StoreContext';
import ScreenHeader from '../../components/common/ScreenHeader';
import FeedbackDialog from '../../components/common/FeedbackDialog';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

const EditProfileScreen: React.FC = observer(() => {
  const navigation = useNavigation<any>();
  const { authStore } = useStores();
  const user = authStore.user;

  const [fullName, setFullName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
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
    if (!fullName.trim()) {
      openDialog('info', 'Full name required', 'Please enter your full name before saving.');
      return;
    }

    setSaving(true);
    try {
      await authStore.updateProfile({
        fullname: fullName.trim(),
        email: user?.email ?? '',
        phone: phone.trim(),
        mobile: phone.trim(),
      });
      openDialog(
        'success',
        'Profile updated',
        'Your account details were saved successfully.',
        () => navigation.goBack(),
      );
    } catch (err: any) {
      openDialog('error', 'Update failed', err?.message ?? 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Edit Profile" onBackPress={() => navigation.goBack()} />
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
          {/* Full Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Email (read-only) */}
          <View style={styles.field}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputDisabled}>
              <Text style={styles.inputDisabledText}>{user?.email ?? '—'}</Text>
            </View>
            <Text style={styles.hint}>Email cannot be changed.</Text>
          </View>

          {/* Phone */}
          <View style={styles.field}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={t => setPhone(t.replace(/[^0-9]/g, '').slice(0, 10))}
              placeholder="Enter mobile number"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              maxLength={10}
              returnKeyType="done"
            />
          </View>

          {/* Account type (static) */}
          <View style={styles.field}>
            <Text style={styles.label}>Account Type</Text>
            <View style={styles.inputDisabled}>
              <Text style={styles.inputDisabledText}>Standard Customer</Text>
            </View>
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={Colors.textInverse} />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
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
  field: {
    gap: 6,
  },
  label: {
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: Typography.fontSizes.base,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textPrimary,
  },
  inputDisabled: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    opacity: 0.5,
  },
  inputDisabledText: {
    fontSize: Typography.fontSizes.base,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textPrimary,
  },
  hint: {
    fontSize: Typography.fontSizes.xs,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: Typography.fontSizes.base,
    fontFamily: Typography.fontFamilies.semiBold,
    color: Colors.textInverse,
    letterSpacing: 0.3,
  },
});

export default EditProfileScreen;
