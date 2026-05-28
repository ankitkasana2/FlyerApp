import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import AppImages from '../../assets/App';

// ─── Hamburger ────────────────────────────────────────────────────────────────
const HamburgerIcon: React.FC<{ color?: string }> = ({
  color = Colors.textPrimary,
}) => (
  <View style={{ gap: 5 }}>
    {[18, 18, 12].map((width, i) => (
      <View
        key={i}
        style={{ width, height: 2, backgroundColor: color, borderRadius: 1 }}
      />
    ))}
  </View>
);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface HeaderProps {
  notificationCount?: number;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const Header: React.FC<HeaderProps> = ({
  notificationCount = 0,
  onMenuPress,
  onNotificationPress,
}) => (
  <View style={styles.container}>
    {/* Left: Hamburger + Logo */}
    <View style={styles.left}>
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={onMenuPress}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <HamburgerIcon />
      </TouchableOpacity>

      <Image
        source={require('../../assets/App/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>

    {/* Right: Bell */}
    <View style={styles.right}>
      {/* Bell */}
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={onNotificationPress}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={styles.iconWrapper}>
          <Image
            source={AppImages.bell}
            style={styles.iconImg}
            resizeMode="contain"
          />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 10,
    backgroundColor: Colors.background,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    height: 28,
    width: 110,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    position: 'relative',
  },
  iconImg: {
    width: 24,
    height: 24,
    tintColor: Colors.textPrimary,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.primary,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: Typography.fontFamilies.bold,
    color: '#FFFFFF',
    lineHeight: 14,
  },
});

export default Header;
