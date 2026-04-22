// components/auth/TermsCheckbox.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

export interface TermsCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  onTermsPress: () => void;
  onPrivacyPress: () => void;
}

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({
  checked,
  onToggle,
  onTermsPress,
  onPrivacyPress,
}) => (
  <View style={styles.wrapper}>
    <TouchableOpacity
      style={[styles.checkbox, checked && styles.checkboxChecked]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      {checked && <Text style={styles.checkMark}>✓</Text>}
    </TouchableOpacity>

    <Text style={styles.text}>
      {'I agree to the '}
      <Text style={styles.link} onPress={onTermsPress}>
        Terms of Service
      </Text>
      {' and '}
      <Text style={styles.link} onPress={onPrivacyPress}>
        Privacy Policy
      </Text>
    </Text>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkMark: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '900',
  },
  text: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  link: {
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.semiBold,
  },
});

export default TermsCheckbox;