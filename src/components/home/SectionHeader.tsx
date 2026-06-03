// components/common/SectionHeader.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  onTitlePress?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel = 'See All',
  onActionPress,
  onTitlePress,
}) => (
  <View style={styles.container}>
    <TouchableOpacity
      onPress={onTitlePress}
      activeOpacity={onTitlePress ? 0.7 : 1}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      disabled={!onTitlePress}
    >
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
    {onActionPress && (
      <TouchableOpacity
        onPress={onActionPress}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.action}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 14,
  },
  title: {
    fontSize: Typography.fontSizes.lg,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  action: {
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.semiBold,
    color: Colors.primary,
    letterSpacing: 0.2,
  },
});

export default SectionHeader;
