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
import Images from '../../assets/index';

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

// ─── Icon: Search ─────────────────────────────────────────────────────────────
const SearchIcon: React.FC<{ color?: string; size?: number }> = ({
  color = Colors.textPrimary,
  size = 20,
}) => (
  <View
    style={{
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: size * 0.6,
        height: size * 0.6,
        borderRadius: size * 0.3,
        borderWidth: 2,
        borderColor: color,
      }}
    />
    <View
      style={{
        position: 'absolute',
        width: 2,
        height: size * 0.32,
        backgroundColor: color,
        borderRadius: 1,
        top: size * 0.54,
        left: size * 0.54,
        transform: [{ rotate: '-45deg' }],
      }}
    />
  </View>
);

// ─── Icon: Cart ───────────────────────────────────────────────────────────────
const CartIcon: React.FC<{ color?: string; size?: number }> = ({
  color = Colors.textPrimary,
  size = 20,
}) => (
  <View style={{ width: size, height: size }}>
    {/* Cart body */}
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: size * 0.05,
        width: size * 0.85,
        height: size * 0.6,
        borderWidth: 2,
        borderColor: color,
        borderRadius: 3,
      }}
    />
    {/* Cart handle */}
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: size * 0.25,
        width: size * 0.45,
        height: size * 0.42,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderColor: color,
        borderTopLeftRadius: size * 0.2,
        borderTopRightRadius: size * 0.2,
      }}
    />
  </View>
);

// ─── Icon: Bell ───────────────────────────────────────────────────────────────
const BellIcon: React.FC<{ color?: string; size?: number }> = ({
  color = Colors.textPrimary,
  size = 20,
}) => (
  <View style={{ width: size, height: size, alignItems: 'center' }}>
    {/* Bell body */}
    <View
      style={{
        position: 'absolute',
        top: size * 0.1,
        width: size * 0.72,
        height: size * 0.65,
        borderTopLeftRadius: size * 0.36,
        borderTopRightRadius: size * 0.36,
        borderWidth: 2,
        borderColor: color,
        borderBottomWidth: 0,
      }}
    />
    {/* Bell base */}
    <View
      style={{
        position: 'absolute',
        bottom: size * 0.14,
        width: size * 0.85,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
      }}
    />
    {/* Bell clapper */}
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        width: size * 0.28,
        height: size * 0.18,
        borderBottomLeftRadius: size * 0.14,
        borderBottomRightRadius: size * 0.14,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderBottomWidth: 2,
        borderColor: color,
      }}
    />
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
        {/* Search */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onSearchPress}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <SearchIcon />
        </TouchableOpacity>

        {/* Cart with Badge */}
        <TouchableOpacity
          style={[styles.iconButton, styles.cartWrapper]}
          onPress={onCartPress}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <CartIcon />
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
          <BellIcon />
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
