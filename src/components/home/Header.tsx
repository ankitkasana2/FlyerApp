// components/home/Header.tsx

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import AppImages from '../../assets/App';

// ─── Icon: Hamburger ──────────────────────────────────────────────────────────
const HamburgerIcon: React.FC<{ color?: string }> = ({
  color = Colors.textPrimary,
}) => (
  <View style={{ gap: 5 }}>
    {[0, 1, 2].map(i => (
      <View
        key={i}
        style={{
          width: i === 2 ? 14 : 20,
          height: 2,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
    ))}
  </View>
);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface HeaderProps {
  cartCount?: number;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onCartPress?: () => void;
  onNotificationPress?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const Header: React.FC<HeaderProps> = ({
  cartCount = 0,
  onMenuPress,
  onSearchPress,
  onCartPress,
  onNotificationPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Left: Hamburger + Logo */}
      <View style={styles.leftSection}>
        <TouchableOpacity
          style={styles.iconButton}
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

      {/* Right: Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onSearchPress}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image source={AppImages.search} style={styles.headerIcon} resizeMode="contain" />
        </TouchableOpacity>

        {/* Cart with Badge */}
        <TouchableOpacity
          style={[styles.iconButton, styles.cartWrapper]}
          onPress={onCartPress}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image source={AppImages.cart} style={styles.headerIcon} resizeMode="contain" />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {cartCount > 9 ? '9+' : cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Bell */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Image source={AppImages.bell} style={styles.headerIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.background,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    height: 28,
    width: 110,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    height: 28,
  },
  headerIcon: {
    width: 22,
    height: 22,
    tintColor: Colors.textPrimary,
  },
  cartWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: Colors.badge,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    lineHeight: 14,
  },
});

export default Header;
