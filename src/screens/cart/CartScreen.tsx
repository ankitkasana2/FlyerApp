// screens/CartScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Theme
import { Colors } from '../../theme/colors';
import Typography from '../../theme/typography';

// Components
import ScreenHeader from '../../components/common/ScreenHeader';
import CartItemCard, { CartItemData } from './CartItemCard';
import OrderSummary from './OrderSummary';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Mock cart data ───────────────────────────────────────────────────────────
const INITIAL_CART_ITEMS: CartItemData[] = [
  {
    id: 'item_1',
    title: 'Elite Friday Night',
    templateName: 'Society Fri...',
    platform: 'Instagram Post',
    status: 'active',
    infoLabel: 'Only Info',
    presenter: 'Maruf',
    date: '18/04/2026',
    delivery: '24 Hours',
    price: '$41.50',
    image: { uri: 'https://picsum.photos/seed/elitenight/300/400' },
  },
];

const SERVICE_FEE_RATE = 0.05; // 5%

// ─── Helper: parse "$41.50" → 41.50 ─────────────────────────────────────────
const parsePriceNum = (priceStr: string): number =>
  parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;

const formatPrice = (num: number): string =>
  `$${num.toFixed(2)}`;

// ─── CartScreen ───────────────────────────────────────────────────────────────
const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>(); // Replace 'any' with your typed navigation prop if desired

  // In production, this would come from Redux/Context
  const [cartItems, setCartItems] = useState<CartItemData[]>(INITIAL_CART_ITEMS);

  // ── Derived totals ──────────────────────────────────────────────────────────
  const subtotalNum = cartItems.reduce(
    (sum, item) => sum + parsePriceNum(item.price),
    0,
  );
  const serviceFeesNum = subtotalNum * SERVICE_FEE_RATE;
  const totalNum = subtotalNum + serviceFeesNum;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSearchPress = useCallback(() => {
    // navigation.navigate('Search');
    console.log('Search pressed');
  }, []);

  const handleAvatarPress = useCallback(() => {
    // navigation.navigate('Profile');
    console.log('Avatar pressed');
  }, []);

  const handleEdit = useCallback((id: string) => {
    console.log('Edit item:', id);
    // navigation.navigate('EditItem', { id });
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
          onPress: () =>
            setCartItems((prev) => prev.filter((item) => item.id !== id)),
        },
      ],
    );
  }, []);

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

  // ── Empty State ─────────────────────────────────────────────────────────────
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {/* Empty cart icon: just a simple cart outline from Views */}
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


      {/* ── Global Reusable Header ── */}
      {/*
        Usage on ANY other screen:
        <ScreenHeader
          title="ORDERS"
          onBackPress={() => navigation.goBack()}
          searchBadgeCount={1}
          avatarInitials="AK"
        />
      */}
      <ScreenHeader
        title="CART"
        onBackPress={handleBack}
        showSearch
        searchBadgeCount={1}
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
        {/* ── Page Title Block ── */}
        <View style={styles.pageTitleBlock}>
          {/* <Text style={styles.pageTitle}>Your Cart</Text> */}
          <Text style={styles.pageSubtitle}>
            Review your flyer templates and proceed to secure checkout.
          </Text>
        </View>

        {cartItems.length === 0 ? (
          renderEmpty()
        ) : (
          <>
            {/* ── Items Head er Row ── */}
            <View style={styles.itemsHeaderRow}>
              <Text style={styles.itemsCount}>
                Items ({cartItems.length})
              </Text>
            </View>

            {/* ── Cart Items ── */}
            {cartItems.map((item) => (
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

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

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
  pageTitle: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.black,
    color: Colors.textPrimary,
    marginBottom: 6,
    // Underline accent matching Figma
    textDecorationLine: 'underline',
    textDecorationColor: Colors.primary,
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
