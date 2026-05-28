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
  cartCount?: number;
  onMenuPress?: () => void;
  onCartPress?: () => void;
  onNotificationPress?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const Header: React.FC<HeaderProps> = ({
  cartCount = 0,
  onMenuPress,
  onCartPress,
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

    {/* Right: Cart + Bell */}
    <View style={styles.right}>
      {/* Cart */}
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={onCartPress}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Image
          source={AppImages.cart}
          style={styles.iconImg}
          resizeMode="contain"
        />
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
        style={styles.iconBtn}
        onPress={onNotificationPress}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Image
          source={AppImages.bell}
          style={styles.iconImg}
          resizeMode="contain"
        />
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
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImg: {
    width: 20,
    height: 20,
    tintColor: Colors.textPrimary,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
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
