import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import SectionHeader from '../../components/home/SectionHeader';
import ProfileCard from './ProfileCard';
import RecentOrderCard, { OrderStatus } from './RecentOrderCard';
import QuickAccessGrid, { QuickAccessItem } from './QuickAccessGrid';
import SettingsMenuList, { SettingsMenuItem } from './SettingsMenuList';
import { useStores } from '../../stores/StoreContext';
import { useNavigation } from '@react-navigation/native';

// ─── Logout icon ─────────────────────────────────────────────────────────────
const LogoutIcon: React.FC = () => (
  <View style={logoutIconStyles.wrapper}>
    {/* Arrow shaft */}
    <View style={logoutIconStyles.shaft} />
    {/* Arrow head top */}
    <View style={logoutIconStyles.arrowTop} />
    {/* Arrow head bottom */}
    <View style={logoutIconStyles.arrowBottom} />
    {/* Door frame */}
    <View style={logoutIconStyles.doorTop} />
    <View style={logoutIconStyles.doorBottom} />
    <View style={logoutIconStyles.doorLeft} />
  </View>
);

const logoutIconStyles = StyleSheet.create({
  wrapper: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shaft: {
    position: 'absolute',
    width: 9,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
    left: 4,
  },
  arrowTop: {
    position: 'absolute',
    width: 5,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
    right: 2,
    top: 6,
    transform: [{ rotate: '-45deg' }],
  },
  arrowBottom: {
    position: 'absolute',
    width: 5,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
    right: 2,
    bottom: 6,
    transform: [{ rotate: '45deg' }],
  },
  doorTop: {
    position: 'absolute',
    width: 7,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
    left: 0,
    top: 0,
  },
  doorBottom: {
    position: 'absolute',
    width: 7,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
    left: 0,
    bottom: 0,
  },
  doorLeft: {
    position: 'absolute',
    width: 2,
    height: 18,
    backgroundColor: Colors.primary,
    borderRadius: 1,
    left: 0,
  },
});

// ─── Mock data ────────────────────────────────────────────────────────────────
interface RecentOrder {
  id: string;
  title: string;
  orderNumber: string;
  status: OrderStatus;
  image: { uri: string };
}

const RECENT_ORDERS: RecentOrder[] = [
  {
    id: 'o1',
    title: 'Neon Nights Volume 4',
    orderNumber: 'Order #GRD-9042',
    status: 'COMPLETED',
    image: { uri: 'https://picsum.photos/seed/neonnights/400/330' },
  },
  {
    id: 'o2',
    title: 'Underground',
    orderNumber: 'Order #GRD-8821',
    status: 'PROCESSING',
    image: { uri: 'https://picsum.photos/seed/underground/400/330' },
  },
  {
    id: 'o3',
    title: 'Summer Vibes',
    orderNumber: 'Order #GRD-8100',
    status: 'PENDING',
    image: { uri: 'https://picsum.photos/seed/summervibes/400/330' },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Format an ISO date-string or raw Date into "Month YYYY" */
function formatMemberSince(raw?: string | null): string {
  if (!raw) return 'Member';
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return raw;
  }
}

// ─── ProfileScreen ────────────────────────────────────────────────────────────
const ProfileScreen: React.FC = observer(() => {
  const { authStore, flyerStore, cartStore } = useStores();
  const navigation = useNavigation<any>();
  const user = authStore.user;
  const userId = authStore.user?.id;

  useEffect(() => {
    if (userId) {
      flyerStore.fetchFavorites(userId);
    }
  }, [userId, flyerStore]);

  // Derive display values from real user object
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const memberSince = formatMemberSince(user?.createdAt);

  const SETTINGS_ITEMS: SettingsMenuItem[] = [
    {
      id: 's1',
      label: 'Edit Profile',
      icon: 'person',
      onPress: () => console.log('Edit Profile'),
    },
    {
      id: 's2',
      label: 'Change Password',
      icon: 'lock',
      onPress: () => console.log('Change Password'),
    },
    {
      id: 's3',
      label: 'Manage Notifications',
      icon: 'bell',
      badge: 'NEW',
      onPress: () => console.log('Notifications'),
    },
    {
      id: 's4',
      label: 'Help Center',
      icon: 'help',
      onPress: () => console.log('Help Center'),
    },
  ];

  const QUICK_ACCESS_ITEMS: QuickAccessItem[] = [
    {
      id: 'qa1',
      label: 'Favorites',
      sublabel: `${flyerStore.favoritesData.length} Items Liked`,
      icon: 'heart',
      onPress: () => navigation.navigate('Favorites'),
    },
    {
      id: 'qa2',
      label: 'Media Library',
      sublabel: 'All Downloads',
      icon: 'folder',
      onPress: () => console.log('Media Library'),
    },
  ];

  const handleOrderPress = useCallback((id: string) => {
    console.log('Order pressed:', id);
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => authStore.logout(),
        },
      ],
    );
  }, [authStore]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Profile Card ── */}
      <ProfileCard
        name={displayName}
        email={displayEmail}
        memberSince={memberSince}
        totalAssets={124}
        assetLabel="FLYERS"
        membershipLabel="PREMIUM MEMBER"
      />

      {/* ── Recent Orders ── */}
      <View style={styles.section}>
        <SectionHeader
          title="Recent Orders"
          actionLabel="View All"
          onActionPress={() => console.log('View all orders')}
        />
        {/* <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ordersScroll}
        >
          {RECENT_ORDERS.map(order => (
            <RecentOrderCard
              key={order.id}
              id={order.id}
              title={order.title}
              orderNumber={order.orderNumber}
              status={order.status}
              imageSource={order.image}
              onPress={handleOrderPress}
            />
          ))}
        </ScrollView> */}
      </View>

      {/* ── Quick Access ── */}
      <View style={styles.section}>
        <QuickAccessGrid items={QUICK_ACCESS_ITEMS} />
      </View>

      {/* ── Account Settings ── */}
      <View style={styles.section}>
        <View style={styles.settingsLabelWrapper}>
          <Text style={styles.settingsLabel}>Account Settings</Text>
        </View>
        <SettingsMenuList items={SETTINGS_ITEMS} />
      </View>

      {/* ── Logout ── */}
      <View style={styles.logoutWrapper}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <LogoutIcon />
          <Text style={styles.logoutText}>Logout Account</Text>
        </TouchableOpacity>
      </View>

      {/* ── App version ── */}
      <Text style={styles.versionText}>GRODIFY MOBILE APP V2.4.1</Text>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingTop: 16,
    gap: 0,
  },
  section: {
    marginTop: 28,
  },
  ordersScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  settingsLabelWrapper: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  settingsLabel: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  logoutWrapper: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  logoutText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  versionText: {
    textAlign: 'center',
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.regular,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginTop: 20,
  },
  bottomPadding: {
    height: 20,
  },
});

export default ProfileScreen;
