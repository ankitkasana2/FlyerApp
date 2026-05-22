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
  onApplePress: () => void;
  onGooglePress: () => void;
}

const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onApplePress,
  onGooglePress,
}) => (
  <View style={styles.wrapper}>
    {/* OR divider */}
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>OR</Text>
      <View style={styles.dividerLine} />
    </View>

    {/* Social buttons */}
    <View style={styles.buttonsRow}>
      {/* Apple */}
      <TouchableOpacity
        style={styles.socialBtn}
        onPress={onApplePress}
        activeOpacity={0.7}
      >
        <Image 
          source={Images.apple} 
          style={[styles.socialIcon, { tintColor: Colors.textPrimary }]} 
          resizeMode="contain" 
        />
      </TouchableOpacity>

      {/* Google */}
      <TouchableOpacity
        style={styles.socialBtn}
        onPress={onGooglePress}
        activeOpacity={0.7}
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
  buttonsRow: {
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
  socialIcon: {
    width: 24,
    height: 24,
  },
});

export default SocialAuthButtons;
