import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

type FeedbackTone = 'success' | 'error' | 'info';

interface FeedbackDialogProps {
  visible: boolean;
  tone?: FeedbackTone;
  title: string;
  message: string;
  buttonLabel?: string;
  onClose: () => void;
}

const toneConfig: Record<FeedbackTone, { eyebrow: string }> = {
  success: {
    eyebrow: 'Success',
  },
  error: {
    eyebrow: 'Error',
  },
  info: {
    eyebrow: 'Notice',
  },
};

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  visible,
  tone = 'info',
  title,
  message,
  buttonLabel = 'Continue',
  onClose,
}) => {
  const config = toneConfig[tone];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.dialog}>
          <View style={styles.topBar} />
          <View style={styles.copyBlock}>
            <Text style={styles.eyebrow}>{config.eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.86}
            onPress={onClose}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.74)',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  dialog: {
    backgroundColor: Colors.background,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 22,
    paddingTop: 0,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  topBar: {
    height: 3,
    backgroundColor: Colors.primary,
    marginHorizontal: -22,
    marginBottom: 18,
  },
  copyBlock: {
    gap: 6,
  },
  eyebrow: {
    fontSize: Typography.fontSizes.xs,
    fontFamily: Typography.fontFamilies.monoSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: Colors.primary,
  },
  title: {
    fontSize: Typography.fontSizes.base,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textPrimary,
  },
  message: {
    fontSize: Typography.fontSizes.base,
    lineHeight: 24,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textSecondary,
  },
  button: {
    marginTop: 22,
    minHeight: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  buttonText: {
    fontSize: Typography.fontSizes.base,
    fontFamily: Typography.fontFamilies.semiBold,
    color: Colors.textInverse,
    letterSpacing: 0.2,
  },
});

export default FeedbackDialog;
