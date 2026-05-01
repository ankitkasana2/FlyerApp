import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useStores } from '../stores/StoreContext';
import { observer } from 'mobx-react-lite';
import Images from '../assets';
import AppImages from '../assets/App';
import Colors from '../theme/colors';
import Typography from '../theme/typography';

interface DrawerUser {
  initials: string;
  name: string;
  email: string;
}

interface DrawerMenuItem {
  id: string;
  label: string;
  icon: ImageSourcePropType;
  badge?: string;
  hasChevron?: boolean;
  onPress?: () => void;
}

interface DrawerSection {
  sectionLabel?: string;
  items: DrawerMenuItem[];
}

interface AppDrawerProps {
  onClose?: () => void;
}

const getInitials = (name?: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

const AppDrawer: React.FC<AppDrawerProps> = observer(({ onClose }) => {
  const navigation = useNavigation<any>();
  const { authStore } = useStores();

  const userObj = authStore.user;
  const user: DrawerUser = {
    initials: getInitials(userObj?.name),
    name: userObj?.name || 'User',
    email: userObj?.email || '',
  };

  const sections: DrawerSection[] = useMemo(
    () => [
      {
        items: [
          {
            id: 'orders',
            label: 'My Orders',
            icon: Images.myorders,
            hasChevron: true,
            onPress: () => console.log('// navigation.navigate("MyOrders")'),
          },
          {
            id: 'favorites',
            label: 'Favorites',
            icon: AppImages.favourite,
            onPress: () => {
              onClose?.();
              navigation.navigate('Favorites');
            },
          },
        ],
      },
      {
        items: [
          {
            id: 'how',
            label: 'How It Works',
            icon: Images.howitworks,
            onPress: () => console.log('// navigation.navigate("HowItWorks")'),
          },
        ],
      },
      {
        sectionLabel: 'SUPPORT',
        items: [
          {
            id: 'contact',
            label: 'Contact Us',
            icon: Images.contactus,
            onPress: () => {
              onClose?.();
              navigation.navigate('ContactUs');
            },
          },
          {
            id: 'faq',
            label: 'FAQ',
            icon: Images.faq,
            onPress: () => {
              onClose?.();
              navigation.navigate('FAQ');
            },
          },
          {
            id: 'help',
            label: 'Help Center',
            icon: Images.help,
            onPress: () => {
              onClose?.();
              navigation.navigate('HelpCenter');
            },
          },
        ],
      },
      {
        sectionLabel: 'LEGAL',
        items: [
          {
            id: 'privacy',
            label: 'Privacy Policy',
            icon: Images.privacy,
            onPress: () => {
              onClose?.();
              navigation.navigate('PrivacyPolicy');
            },
          },
          {
            id: 'terms',
            label: 'Terms of Service',
            icon: Images.terms,
            hasChevron: true,
            onPress: () =>
              console.log('// navigation.navigate("TermsOfService")'),
          },
          {
            id: 'refund',
            label: 'Refund Policy',
            icon: Images.refund,
            hasChevron: true,
            onPress: () =>
              console.log('// navigation.navigate("RefundPolicy")'),
          },
        ],
      },
    ],
    [navigation, onClose],
  );

  const handleLogOut = useCallback(() => {
    onClose?.();
    authStore.logout();
  }, [authStore, onClose]);

  const handleCartPress = useCallback(() => {
    onClose?.();
    navigation.navigate('Cart');
  }, [navigation, onClose]);

  const renderMenuItem = useCallback((item: DrawerMenuItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.menuItem}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemLeft}>
          <Image
            source={item.icon}
            style={styles.menuIconImage}
            resizeMode="contain"
          />
          <Text style={styles.menuLabel}>{item.label}</Text>
        </View>
        <View style={styles.menuItemRight}>
          {item.badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          ) : null}
          {item.hasChevron ? (
            <View style={styles.chevron}>
              <Image
                source={Images.drawerChevron}
                style={styles.chevronImage}
                resizeMode="contain"
              />
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{user.initials}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Menu */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, sIdx) => (
          <View key={sIdx}>
            {section.sectionLabel ? (
              <Text style={styles.sectionLabel}>{section.sectionLabel}</Text>
            ) : null}
            <View style={styles.sectionItems}>
              {section.items.map(renderMenuItem)}
            </View>
            {sIdx < sections.length - 1 && (
              <View style={styles.sectionDivider} />
            )}
          </View>
        ))}
      </ScrollView>

      {/* Logout */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogOut}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    letterSpacing: 0.5,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semiBold,
  },
  userEmail: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.regular,
    marginTop: 2,
  },
  cartButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartIconImage: {
    width: 24,
    height: 24,
    tintColor: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semiBold,
    letterSpacing: 1.2,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  sectionItems: {
    paddingHorizontal: 12,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuIconImage: {
    width: 20,
    height: 20,
    tintColor: Colors.textPrimary,
  },
  menuLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: Colors.badge,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
  },
  chevron: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronImage: {
    width: 12,
    height: 12,
    tintColor: Colors.textMuted,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: 'transparent',
  },
  logoutIcon: {
    fontSize: 18,
    // Replace emoji with your PNG icon
  },
  logoutText: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semiBold,
  },
});

export default AppDrawer;
