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


// ─── Types ────────────────────────────────────────────────────────────────────
export interface ScreenHeaderProps {
  /** Screen/page title shown in the center */
  title: string;
  /** Optional smaller line under the title (e.g. price) */
  subtitle?: string;
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
  subtitle,
  onBackPress,
  rightSlot,
  showSearch = false,
  searchBadgeCount = 0,
  onSearchPress,
  showAvatar = false,
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
        <Image
          source={AppImages.backIcon}
          style={styles.backIconImg}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Title + Subtitle */}
      <View style={styles.titleWrap} pointerEvents="none">
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
            {subtitle}
          </Text>
        ) : null}
      </View>

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
    paddingVertical: 18,
    minHeight: 64,
    position: 'relative',
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
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
    position: 'absolute',
    left: 16,
  },
  backIconImg: {
    width: 22,
    height: 22,
    tintColor: Colors.textPrimary,
  },
  titleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 16 + 44 + 12,
    right: 16 + 44 + 12,
  },
  title: {
    fontSize: Typography.fontSizes.lg,
    fontFamily: Typography.fontFamilies.medium,
    color: Colors.textPrimary,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 2,
    fontSize: Typography.fontSizes.xs,
    fontFamily: Typography.fontFamilies.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  rightWrapper: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    minWidth: 36,
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
    backgroundColor: Colors.badge,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textInverse,
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
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textInverse,
    letterSpacing: 0.5,
  },
});

export default ScreenHeader;
