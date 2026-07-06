// components/auth/SocialAuthButtons.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import Images from '../../assets';

export interface SocialAuthButtonsProps {
  onGooglePress: () => void;
  onApplePress: () => void;
  disabled?: boolean;
}

const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onGooglePress,
  onApplePress,
  disabled,
}) => (
  <View style={styles.wrapper}>
    {/* OR divider */}
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>OR</Text>
      <View style={styles.dividerLine} />
    </View>

    {/* Apple + Google side by side */}
    <View style={styles.socialRow}>
      <TouchableOpacity
        style={[styles.socialBtn, disabled && styles.socialBtnDisabled]}
        onPress={onApplePress}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Image
          source={Images.apple}
          style={styles.socialIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <TouchableOpacity
          style={[styles.socialBtn, disabled && styles.socialBtnDisabled]}
          onPress={onGooglePress}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Image
            source={Images.google}
            style={styles.socialIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    gap: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: Typography.fontSizes.xs,
    fontFamily: Typography.fontFamilies.semiBold,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialBtnDisabled: {
    opacity: 0.5,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
});

export default SocialAuthButtons;
