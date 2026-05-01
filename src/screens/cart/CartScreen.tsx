// screens/CartScreen.tsx

import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';

// Theme
import { Colors } from '../../theme/colors';
import Typography from '../../theme/typography';

// Stores
import { useStores } from '../../stores/StoreContext';
import type { CartItem } from '../../stores/cartStore';

// Components
import ScreenHeader from '../../components/common/ScreenHeader';
import CartItemCard, { CartItemData } from './CartItemCard';
import OrderSummary from './OrderSummary';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SERVICE_FEE_RATE = 0.05; // 5%

const formatPrice = (num: number): string => `$${num.toFixed(2)}`;

/**
 * Maps the delivery_time string from the backend to a human-readable label.
 * Backend stores values like '1h', '5h', '24h'.
 */
const mapDeliveryLabel = (dt: string | null | undefined): string => {
  if (!dt) return 'Standard';
  if (dt === '1h')  return '1 Hour';
  if (dt === '5h')  return '5 Hours';
  if (dt === '24h') return '24 Hours';
  return dt;
};

/**
 * Formats a UTC date string into a readable format (e.g., 02 MAY 2026).
 */
const formatEventDate = (dateString?: string | null): string => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options).toUpperCase();
  } catch {
    return dateString;
  }
};

/**
 * Maps a CartItem from the backend/store to the CartItemData shape used by
 * the CartItemCard component.
 */
const mapCartItemToCard = (item: CartItem): CartItemData => {
  // Build platform tag from extras
  const extras: string[] = [];
  if (item.story_size_version)  extras.push('Story');
  if (item.instagram_post_size) extras.push('Instagram Post');
  if (item.animated_flyer)      extras.push('Animated');
  if (item.custom_flyer)        extras.push('Custom');

  const platform = extras.length > 0 ? extras.join(', ') : 'Standard Post';

  // Resolve image
  const imageSource = item.flyer?.image
    ? { uri: item.flyer.image }
    : item.flyer_image_url
    ? { uri: item.flyer_image_url }
    : item.venue_logo
    ? { uri: item.venue_logo }
    : { uri: 'https://picsum.photos/seed/flyer_default/300/400' };

  return {
    id: String(item.id),
    title: item.event_title || item.flyer?.title || item.flyer_title || `Flyer #${item.flyer_is}`,
    templateName: String(item.flyer_is),
    platform,
    status: (item.status as CartItemData['status']) || 'active',
    infoLabel: item.flyer?.type || (item.flyer_info ? 'Has Info' : undefined),
    presenter: item.presenting || '—',
    date: formatEventDate(item.event_date),
    delivery: mapDeliveryLabel(item.delivery_time),
    price: formatPrice(item.total_price ? Number(item.total_price) : 0),
    image: imageSource,
  };
};

// ─── CartScreen ───────────────────────────────────────────────────────────────

const CartScreen: React.FC = observer(() => {
  const navigation = useNavigation<any>();
  const { cartStore, authStore } = useStores();

  // Fetch cart on mount whenever user is authenticated
  useEffect(() => {
    const userId = authStore.user?.id;
    if (userId) {
      cartStore.load(userId);
    }
  }, [authStore.user, cartStore]);

  // Map store items to card data
  const cartCardItems = cartStore.cartItems.map(mapCartItemToCard);

  // ── Derived totals ──────────────────────────────────────────────────────────
  const subtotalNum    = cartStore.subtotal;
  const serviceFeesNum = subtotalNum * SERVICE_FEE_RATE;
  const totalNum       = subtotalNum + serviceFeesNum;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleSearchPress = useCallback(() => {
    console.log('Search pressed');
  }, []);

  const handleAvatarPress = useCallback(() => {
    console.log('Avatar pressed');
  }, []);

  const handleEdit = useCallback((id: string) => {
    // Navigate to FlyerDetail or edit modal in the future
    console.log('Edit cart item:', id);
  }, []);

  const handleRemove = useCallback((id: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const userId = authStore.user?.id;
            if (userId) {
              cartStore.removeFromCart(Number(id), userId);
            }
          },
        },
      ],
    );
  }, [cartStore, authStore.user]);

  const handleCheckout = useCallback((id: string) => {
    console.log('Checkout item:', id);
    // navigation.navigate('Checkout', { itemId: id });
  }, []);

  const handleContinueShopping = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleProceedToCheckout = useCallback(() => {
    console.log('Proceed to Checkout — total:', formatPrice(totalNum));
    // navigation.navigate('Checkout', { total: totalNum });
  }, [totalNum]);

  // ── Loading State ────────────────────────────────────────────────────────────
  if (cartStore.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScreenHeader
          title="CART"
          onBackPress={handleBack}
          showSearch
          searchBadgeCount={0}
          onSearchPress={handleSearchPress}
          showAvatar
          avatarInitials="AK"
          onAvatarPress={handleAvatarPress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your cart…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Empty State ─────────────────────────────────────────────────────────────
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {/* Empty cart icon */}
      <View style={styles.emptyIconWrapper}>
        <View style={styles.emptyCartBody} />
        <View style={styles.emptyCartHandle} />
        <View style={[styles.emptyCartWheel, { left: '25%' }]} />
        <View style={[styles.emptyCartWheel, { right: '25%' }]} />
      </View>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>
        Explore premium flyers and add them to your cart.
      </Text>
      <TouchableOpacity
        style={styles.emptyCtaBtn}
        onPress={handleContinueShopping}
        activeOpacity={0.85}
      >
        <Text style={styles.emptyCtaText}>Browse Flyers</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>

      <ScreenHeader
        title="CART"
        onBackPress={handleBack}
        showSearch
        searchBadgeCount={cartStore.itemCount}
        onSearchPress={handleSearchPress}
        showAvatar
        avatarInitials="AK"
        onAvatarPress={handleAvatarPress}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Page Subtitle ── */}
        <View style={styles.pageTitleBlock}>
          <Text style={styles.pageSubtitle}>
            Review your flyer templates and proceed to secure checkout.
          </Text>
        </View>

        {cartCardItems.length === 0 ? (
          renderEmpty()
        ) : (
          <>
            {/* ── Items Header Row ── */}
            <View style={styles.itemsHeaderRow}>
              <Text style={styles.itemsCount}>
                Items ({cartCardItems.length})
              </Text>
            </View>

            {/* ── Cart Items ── */}
            {cartCardItems.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onRemove={handleRemove}
                onCheckout={handleCheckout}
                onContinueShopping={handleContinueShopping}
              />
            ))}

            {/* ── Spacer ── */}
            <View style={styles.sectionGap} />

            {/* ── Order Summary ── */}
            <OrderSummary
              subtotal={formatPrice(subtotalNum)}
              serviceFees={formatPrice(serviceFeesNum)}
              total={formatPrice(totalNum)}
              onProceedToCheckout={handleProceedToCheckout}
            />
          </>
        )}

        {/* Error banner */}
        {cartStore.error ? (
          <Text style={styles.errorText}>{cartStore.error}</Text>
        ) : null}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  pageTitleBlock: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  pageSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontWeight: Typography.fontWeights.regular,
  },
  itemsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  itemsCount: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textPrimary,
  },
  sectionGap: {
    height: 20,
  },
  bottomPadding: {
    height: 36,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.base,
  },
  errorText: {
    color: Colors.primary,
    textAlign: 'center',
    fontSize: Typography.fontSizes.sm,
    paddingHorizontal: 16,
    marginTop: 12,
  },

  // ── Empty State ──
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    marginBottom: 24,
    position: 'relative',
    alignItems: 'center',
  },
  emptyCartBody: {
    width: 56,
    height: 40,
    borderWidth: 2.5,
    borderColor: Colors.textMuted,
    borderRadius: 6,
    position: 'absolute',
    top: 14,
  },
  emptyCartHandle: {
    width: 30,
    height: 20,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: Colors.textMuted,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  },
  emptyCartWheel: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    position: 'absolute',
    bottom: 0,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  emptyCtaBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 10,
  },
  emptyCtaText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
});

export default CartScreen;
