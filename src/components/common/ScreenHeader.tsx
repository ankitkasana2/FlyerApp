// components/common/ScreenHeader.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,
  Image,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import AppImages from '../../assets/App';

// ─── Back Arrow Icon (pure View) ─────────────────────────────────────────────
const BackArrowIcon: React.FC<{ color?: string; size?: number }> = ({
  color = Colors.textPrimary,
  size = 18,
}) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    {/* Top arm of arrow */}
    <View
      style={{
        position: 'absolute',
        width: size * 0.52,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        top: size * 0.28,
        left: size * 0.06,
        transform: [{ rotate: '-45deg' }],
      }}
    />
    {/* Bottom arm of arrow */}
    <View
      style={{
        position: 'absolute',
        width: size * 0.52,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        bottom: size * 0.28,
        left: size * 0.06,
        transform: [{ rotate: '45deg' }],
      }}
    />
    {/* Horizontal shaft */}
    <View
      style={{
        position: 'absolute',
        width: size * 0.72,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        left: size * 0.06,
      }}
    />
  </View>
);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ScreenHeaderProps {
  /** Screen/page title shown in the center */
  title: string;
  /** Called when back arrow is pressed */
  onBackPress: () => void;
  /** Optional right-side element (pass null to hide) */
  rightSlot?: React.ReactNode;
  /** Show the default search icon on right (ignored if rightSlot is provided) */
  showSearch?: boolean;
  /** Notification count on search badge */
  searchBadgeCount?: number;
  /** Called when search icon is pressed */
  onSearchPress?: () => void;
  /** Show avatar initials button */
  showAvatar?: boolean;
  /** Two-letter initials for avatar */
  avatarInitials?: string;
  /** Called when avatar is pressed */
  onAvatarPress?: () => void;
  /** Extra container style */
  containerStyle?: ViewStyle;
}

// ─── Component ────────────────────────────────────────────────────────────────
const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBackPress,
  rightSlot,
  showSearch = true,
  searchBadgeCount = 0,
  onSearchPress,
  showAvatar = true,
  avatarInitials = 'AK',
  onAvatarPress,
  containerStyle,
}) => {
  const renderRight = () => {
    // If caller passes a custom right slot, use it
    if (rightSlot !== undefined) return rightSlot;

    // Default: search icon + avatar
    return (
      <View style={styles.rightGroup}>
        {showSearch && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onSearchPress}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Image source={AppImages.search} style={styles.headerIcon} resizeMode="contain" />
            {searchBadgeCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {searchBadgeCount > 9 ? '9+' : searchBadgeCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {showAvatar && (
          <TouchableOpacity
            style={styles.avatar}
            onPress={onAvatarPress}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarText}>{avatarInitials}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBackPress}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <BackArrowIcon size={18} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* Right Slot */}
      <View style={styles.rightWrapper}>{renderRight()}</View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.black,
    color: Colors.textPrimary,
    letterSpacing: 3,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginHorizontal: 8,
  },
  rightWrapper: {
    width: 36 + 32 + 8, // mirror back button width so title stays centered
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.textPrimary,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    lineHeight: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
});

export default ScreenHeader;
