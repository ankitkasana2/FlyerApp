import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import ScreenHeader from '../../components/common/ScreenHeader';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import { useStores } from '../../stores/StoreContext';
import { API_BASE_URL } from '../../services/api';
import type {
  DjEntry,
  HostEntry,
  Order,
  OrderStatus,
  SponsorEntry,
} from '../../types/api';
import type { AppStackParamList } from '../../navigation/types';
import Images from '../../assets';

type DetailedOrder = Order & {
  presenting?: string;
  event_title?: string;
  event_date?: string;
  address_phone?: string;
  flyer_info?: string;
  venue_logo?: string | null;
  image_url?: string | null;
  djs?: DjEntry[] | string;
  host?: HostEntry | string;
  sponsors?: SponsorEntry[] | string;
  delivery_time?: string;
  custom_notes?: string;
  venue_text?: string;
  story_size_version?: boolean | number;
  custom_flyer?: boolean | number;
  animated_flyer?: boolean | number;
  instagram_post_size?: boolean | number;
  flyer?: { image?: string | null; image_url?: string | null } | null;
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, '');

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

const formatDate = (value?: string) => {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatAmount = (value?: number | null) => currency.format(Number(value ?? 0));

const resolveMedia = (value?: string | null) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `${backendOrigin}/${String(value).replace(/^\/+/, '')}`;
};

const resolveOrderImage = (order?: DetailedOrder | null) => {
  if (!order) return null;
  return (
    resolveMedia(order.image_url) ||
    resolveMedia(order.flyer?.image_url || order.flyer?.image || null) ||
    resolveMedia(order.venue_logo) ||
    null
  );
};

const parseArray = <T,>(value: T[] | string | undefined | null): T[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const parseHost = (value: HostEntry | string | undefined | null): HostEntry | null => {
  if (!value) return null;
  if (typeof value !== 'string') return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const DetailBlock = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <View style={styles.detailBlock}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || '—'}</Text>
  </View>
);

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const OrderDetailScreen: React.FC = observer(() => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<AppStackParamList, 'OrderDetail'>>();
  const { orderId } = route.params;
  const { orderStore } = useStores();
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    setHasRequested(true);
    orderStore.fetchOrder(orderId);
  }, [orderId, orderStore]);

  const order =
    (orderStore.currentOrderId === orderId
      ? (orderStore.currentOrder as DetailedOrder | null)
      : null);
  const imageUri = useMemo(() => resolveOrderImage(order), [order]);
  const djs = useMemo(() => parseArray<DjEntry>(order?.djs), [order?.djs]);
  const sponsors = useMemo(
    () => parseArray<SponsorEntry>(order?.sponsors),
    [order?.sponsors],
  );
  const host = useMemo(() => parseHost(order?.host), [order?.host]);
  const extras = useMemo(
    () =>
      [
        order?.story_size_version ? 'Story Size' : null,
        order?.custom_flyer ? 'Custom Flyer' : null,
        order?.animated_flyer ? 'Animated Flyer' : null,
        order?.instagram_post_size ? 'Instagram Post' : null,
      ].filter(Boolean) as string[],
    [order],
  );

  const isWaitingForRequest =
    !hasRequested ||
    (orderStore.currentOrderId !== orderId && orderStore.isLoadingDetail);

  if ((orderStore.isLoadingDetail || isWaitingForRequest) && !order) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScreenHeader title="Order Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScreenHeader title="Order Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Order not found</Text>
          <Text style={styles.emptyBody}>
            {orderStore.error || `We couldn't load this order right now.`}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = order.status || 'pending';
  const palette = statusStyle[status];
  const title = order.event_title || `Order #${order.id}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader title="Order Details" onBackPress={() => navigation.goBack()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.posterCard}>
          <Image
            source={imageUri ? { uri: imageUri } : Images.pic1}
            style={styles.posterImage}
            resizeMode="cover"
          />
          <View style={styles.posterOverlay} />
          <View style={[styles.statusPill, { backgroundColor: palette.bg }]}>
            <Text style={[styles.statusText, { color: palette.text }]}>
              {statusCopy[status]}
            </Text>
          </View>
          <View style={styles.posterFooter}>
            <Text style={styles.posterTitle} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.posterSubtitle}>Order #{order.id}</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <DetailBlock label="Placed" value={formatDate(order.created_at)} />
          <DetailBlock label="Delivery" value={order.delivery_time || 'Standard'} />
          <DetailBlock label="Total" value={formatAmount(order.total_price)} />
        </View>

        <SectionCard title="Event Details">
          <View style={styles.sectionGrid}>
            <DetailBlock label="Presenter" value={order.presenting || '—'} />
            <DetailBlock label="Event Date" value={formatDate(order.event_date)} />
            <DetailBlock label="Address / Phone" value={order.address_phone || '—'} />
            <DetailBlock label="Venue" value={order.venue_text || '—'} />
          </View>
        </SectionCard>

        <SectionCard title="Flyer Copy">
          <Text style={styles.bodyText}>{order.flyer_info || 'No flyer information provided.'}</Text>
          {order.custom_notes ? (
            <>
              <Text style={styles.subSectionTitle}>Custom Notes</Text>
              <Text style={styles.bodyText}>{order.custom_notes}</Text>
            </>
          ) : null}
        </SectionCard>

        {extras.length > 0 ? (
          <SectionCard title="Add-ons Included">
            <View style={styles.tagWrap}>
              {extras.map(extra => (
                <View key={extra} style={styles.tag}>
                  <Text style={styles.tagText}>{extra}</Text>
                </View>
              ))}
            </View>
          </SectionCard>
        ) : null}

        <SectionCard title="DJs & Talent">
          {djs.length > 0 ? (
            djs.map((dj, index) => (
              <View key={`${dj.name}-${index}`} style={styles.personRow}>
                <Text style={styles.personName}>{dj.name || `DJ ${index + 1}`}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.mutedText}>No DJs listed.</Text>
          )}
        </SectionCard>

        <SectionCard title="Host">
          {host?.name ? (
            <View style={styles.personRow}>
              <Text style={styles.personName}>{host.name}</Text>
            </View>
          ) : (
            <Text style={styles.mutedText}>No host listed.</Text>
          )}
        </SectionCard>

        {(sponsors.length > 0 || order.venue_logo) ? (
          <SectionCard title="Branding & Logos">
            {order.venue_logo ? (
              <Text style={styles.bodyText}>Venue logo included</Text>
            ) : null}
            {sponsors.length > 0 ? (
              sponsors.map((sponsor, index) => (
                <View key={`${sponsor.name}-${index}`} style={styles.personRow}>
                  <Text style={styles.personName}>
                    {sponsor.name || `Sponsor ${index + 1}`}
                  </Text>
                </View>
              ))
            ) : null}
          </SectionCard>
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
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.xl,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textPrimary,
  },
  emptyBody: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: Typography.fontSizes.sm,
    lineHeight: 21,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textSecondary,
  },
  posterCard: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  posterImage: {
    width: '100%',
    height: 440,
  },
  posterOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  statusPill: {
    position: 'absolute',
    top: 14,
    left: 14,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusText: {
    fontSize: Typography.fontSizes.xs,
    fontFamily: Typography.fontFamilies.semiBold,
  },
  posterFooter: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    gap: 4,
  },
  posterTitle: {
    fontSize: Typography.fontSizes.xl,
    lineHeight: 28,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.white,
  },
  posterSubtitle: {
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.medium,
    color: 'rgba(255,255,255,0.82)',
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  detailBlock: {
    flex: 1,
    minWidth: '29%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 5,
  },
  detailLabel: {
    fontSize: Typography.fontSizes.xs,
    fontFamily: Typography.fontFamilies.monoSemiBold,
    color: Colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: Typography.fontSizes.sm,
    lineHeight: 20,
    fontFamily: Typography.fontFamilies.medium,
    color: Colors.textPrimary,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    gap: 12,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textPrimary,
  },
  sectionGrid: {
    gap: 12,
  },
  bodyText: {
    fontSize: Typography.fontSizes.sm,
    lineHeight: 22,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textSecondary,
  },
  subSectionTitle: {
    marginTop: 4,
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.semiBold,
    color: Colors.textPrimary,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    borderRadius: 999,
    backgroundColor: 'rgba(185, 32, 37, 0.14)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagText: {
    fontSize: Typography.fontSizes.xs,
    fontFamily: Typography.fontFamilies.semiBold,
    color: Colors.primary,
  },
  personRow: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  personName: {
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.medium,
    color: Colors.textPrimary,
  },
  mutedText: {
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textSecondary,
  },
});

export default OrderDetailScreen;
