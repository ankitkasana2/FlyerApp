// screens/CartScreen.tsx

import React, { useCallback, useEffect, useState } from 'react';
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
import Config from 'react-native-config';
import { useStripe } from '@stripe/stripe-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Theme
import { Colors } from '../../theme/colors';
import Typography from '../../theme/typography';

// Stores
import { useStores } from '../../stores/StoreContext';
import type { CartItem } from '../../stores/cartStore';

// Components
import CartItemCard, { CartItemData } from './CartItemCard';
import OrderSummary from './OrderSummary';
import CheckoutBar from './CheckoutBar';
import ScreenHeader from '../../components/common/ScreenHeader';
import {
  buildCheckoutPayload,
  createPaymentSheet,
  finalizePayment,
  STRIPE_RETURN_URL,
} from '../../services/stripeService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SERVICE_FEE_RATE = 0.05; // 5%
const CHECKOUT_BAR_SPACER = 78;

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
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const stripePublishableKey =
    Config.STRIPE_PUBLISHABLE_KEY ||
    Config.PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    Config.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

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

  const handleContinueShopping = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleProceedToCheckout = useCallback(async () => {
    if (!cartStore.cartItems.length) {
      Alert.alert('Cart is empty', 'Add at least one flyer before checkout.');
      return;
    }

    if (!stripePublishableKey) {
      Alert.alert(
        'Stripe not configured',
        'Add `STRIPE_PUBLISHABLE_KEY` to your `.env` before testing checkout.',
      );
      return;
    }

    setIsProcessingCheckout(true);

    try {
      const paymentSheet = await createPaymentSheet(
        buildCheckoutPayload(cartStore.cartItems, totalNum, authStore.user?.id),
      );

      const { error } = await initPaymentSheet({
        merchantDisplayName: 'FlyerApp',
        paymentIntentClientSecret: paymentSheet.paymentIntent,
        customerId: paymentSheet.customer,
        customerEphemeralKeySecret: paymentSheet.ephemeralKey,
        allowsDelayedPaymentMethods: true,
        returnURL: STRIPE_RETURN_URL,
      });

      if (error) {
        Alert.alert('Checkout unavailable', error.message);
        return;
      }

      const paymentResult = await presentPaymentSheet();

      if (paymentResult.error) {
        Alert.alert('Payment not completed', paymentResult.error.message);
        return;
      }

      try {
        if (paymentSheet.paymentIntentId) {
          await finalizePayment(paymentSheet.paymentIntentId);
        }
      } catch {
        // Webhook may still finalize; keep UX optimistic.
      }

      const userId = authStore.user?.id;
      if (userId) {
        cartStore.load(userId);
      }

      Alert.alert('Payment successful', 'Your order is being processed.', [
        {
          text: 'View Orders',
          onPress: () => navigation.navigate('MyOrders'),
        },
        { text: 'OK' },
      ]);
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to start Stripe checkout.';

      Alert.alert('Checkout failed', message);
    } finally {
      setIsProcessingCheckout(false);
    }
  }, [
    authStore.user?.id,
    cartStore,
    initPaymentSheet,
    navigation,
    presentPaymentSheet,
    stripePublishableKey,
    totalNum,
  ]);

  // ── Loading State ────────────────────────────────────────────────────────────
  if (cartStore.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        title="Cart"
        subtitle={undefined}
        onBackPress={handleContinueShopping}
        rightSlot={null}
        containerStyle={styles.header}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {cartCardItems.length === 0 ? (
          renderEmpty()
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Items</Text>
            </View>
            {/* ── Cart Items ── */}
            {cartCardItems.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onRemove={handleRemove}
              />
            ))}

            {/* ── Spacer ── */}
            <View style={styles.sectionGap} />

            {/* ── Order Summary ── */}
            <OrderSummary
              subtotal={formatPrice(subtotalNum)}
              serviceFees={formatPrice(serviceFeesNum)}
              total={formatPrice(totalNum)}
            />
          </>
        )}

        {/* Error banner */}
        {cartStore.error ? (
          <Text style={styles.errorText}>{cartStore.error}</Text>
        ) : null}

        <View
          style={[
            styles.bottomPadding,
            cartCardItems.length > 0 && { height: CHECKOUT_BAR_SPACER },
          ]}
        />
      </ScrollView>

      {cartCardItems.length > 0 ? (
        <View style={styles.checkoutBarWrap} pointerEvents="box-none">
          <CheckoutBar
            total={formatPrice(totalNum)}
            itemCount={cartCardItems.length}
            isProcessing={isProcessingCheckout}
            onPressCheckout={handleProceedToCheckout}
          />
        </View>
      ) : null}
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
    paddingTop: 0,
    paddingBottom: 8,
    flexGrow: 1,
  },
  header: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  sectionGap: {
    height: 20,
  },
  bottomPadding: {
    height: 36,
  },
  checkoutBarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },

  // ── Empty State ──
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    justifyContent: 'center',
    paddingTop: 24,
    paddingBottom: 24,
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
