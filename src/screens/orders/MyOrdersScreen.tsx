import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../components/common/ScreenHeader';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import { useStores } from '../../stores/StoreContext';
import { API_BASE_URL } from '../../services/api';
import type { Order, OrderStatus } from '../../types/api';
import Images from '../../assets';

const statusCopy: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const statusStyle: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: 'rgba(245, 158, 11, 0.14)', text: '#f59e0b' },
  processing: { bg: 'rgba(255,255,255,0.08)', text: Colors.textPrimary },
  completed: { bg: 'rgba(185, 32, 37, 0.14)', text: Colors.primary },
  delivered: { bg: 'rgba(185, 32, 37, 0.14)', text: Colors.primary },
  cancelled: { bg: 'rgba(255,255,255,0.08)', text: Colors.textSecondary },
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const formatAmount = (value?: number | null) => currency.format(Number(value ?? 0));

const formatDate = (value?: string) => {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, '');

const resolveOrderImage = (order: Order) => {
  const record = order as Order & {
    image_url?: string | null;
    venue_logo?: string | null;
    flyer_is?: number | string | null;
    flyer_id?: number | string | null;
    flyer?: { image?: string | null; image_url?: string | null } | null;
  };

  const candidate =
    record.image_url ||
    order.items?.[0]?.image_url ||
    record.flyer?.image_url ||
    record.flyer?.image ||
    record.venue_logo ||
    null;

  if (!candidate) {
    return null;
  }

  if (/^https?:\/\//i.test(candidate)) {
    return candidate;
  }

  return `${backendOrigin}/${String(candidate).replace(/^\/+/, '')}`;
};

const getOrderTitle = (order: Order) =>
  order.items?.[0]?.event_title ||
  order.items?.[0]?.flyer_title ||
  `Order #${order.id}`;

const getDeliveryLabel = (order: Order) => order.items?.[0]?.delivery_time || 'Custom delivery';

const OrderCard = ({
  order,
  onPress,
}: {
  order: Order;
  onPress: (orderId: string) => void;
}) => {
  const status = order.status || 'pending';
  const palette = statusStyle[status];
  const imageUri = resolveOrderImage(order);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.86}
      onPress={() => onPress(String(order.id))}
    >
      <View style={styles.imageWrap}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={Images.pic1}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <View style={styles.imageOverlay} />
        <View style={[styles.statusPillFloating, { backgroundColor: palette.bg }]}>
          <Text style={[styles.statusText, { color: palette.text }]}>
            {statusCopy[status]}
          </Text>
        </View>
        <Text style={styles.imageTitle} numberOfLines={2}>
          {getOrderTitle(order)}
        </Text>
      </View>

      <View style={styles.cardTopRow}>
        <View style={styles.orderMeta}>
          <Text style={styles.orderEyebrow}>ORDER #{order.id}</Text>
          <Text style={styles.orderTitle}>{formatDate(order.created_at)}</Text>
        </View>
        <Text style={styles.detailValueStrong}>{formatAmount(order.total_price)}</Text>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailBlock}>
          <Text style={styles.detailLabel}>Delivery</Text>
          <Text style={styles.detailValue}>{getDeliveryLabel(order)}</Text>
        </View>
        <View style={styles.detailBlock}>
          <Text style={styles.detailLabel}>Status</Text>
          <Text style={styles.detailValue}>{statusCopy[status]}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const EmptyState = () => (
  <View style={styles.emptyState}>
    <View style={styles.emptyAccent} />
    <Text style={styles.emptyTitle}>No orders yet</Text>
    <Text style={styles.emptyBody}>
      Your completed purchases will appear here once you place an order.
    </Text>
  </View>
);

const MyOrdersScreen: React.FC = observer(() => {
  const navigation = useNavigation<any>();
  const { authStore, orderStore } = useStores();
  const userId = authStore.user?.id;

  useEffect(() => {
    if (userId) {
      void orderStore.fetchUserOrders(userId, 100);
    }
  }, [orderStore, userId]);

  const orders = useMemo(() => orderStore.orders || [], [orderStore.orders]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader title="My Orders" onBackPress={() => navigation.goBack()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            tintColor={Colors.primary}
            refreshing={orderStore.isLoading}
            onRefresh={() => {
              if (userId) {
                void orderStore.fetchUserOrders(userId, 100);
              }
            }}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {orderStore.isLoading && orders.length === 0 ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : null}

        {!orderStore.isLoading && orders.length === 0 ? <EmptyState /> : null}

        {orders.length > 0 ? (
          <View style={styles.orderGrid}>
            {orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={nextOrderId => navigation.navigate('OrderDetail', { orderId: nextOrderId })}
              />
            ))}
          </View>
        ) : null}

        {orderStore.error ? (
          <Text style={styles.errorText}>{orderStore.error}</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 16,
  },
  orderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  loaderWrap: {
    paddingVertical: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    width: '48%',
  },
  imageWrap: {
    height: 250,
    position: 'relative',
    backgroundColor: Colors.card,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.34)',
  },
  statusPillFloating: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  imageTitle: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    fontSize: Typography.fontSizes.base,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.white,
    lineHeight: 22,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  orderMeta: {
    flex: 1,
    gap: 4,
  },
  orderEyebrow: {
    fontSize: Typography.fontSizes.xs,
    fontFamily: Typography.fontFamilies.monoSemiBold,
    color: Colors.primary,
    letterSpacing: 1.2,
  },
  orderTitle: {
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.medium,
    color: Colors.textSecondary,
  },
  statusText: {
    fontSize: Typography.fontSizes.xs,
    fontFamily: Typography.fontFamilies.semiBold,
    letterSpacing: 0.2,
  },
  detailsGrid: {
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  detailBlock: {
    gap: 4,
  },
  detailLabel: {
    fontSize: Typography.fontSizes.xs,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailValue: {
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.medium,
    color: Colors.textSecondary,
  },
  detailValueStrong: {
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textPrimary,
  },
  emptyState: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 22,
    paddingVertical: 28,
    alignItems: 'flex-start',
    gap: 10,
  },
  emptyAccent: {
    width: 46,
    height: 3,
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.xl,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textPrimary,
  },
  emptyBody: {
    fontSize: Typography.fontSizes.sm,
    lineHeight: 21,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textSecondary,
  },
  errorText: {
    marginTop: 8,
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.medium,
    color: Colors.primary,
    textAlign: 'center',
  },
});

export default MyOrdersScreen;
