import React, { useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import AppImages from '../../assets/App';
import { useStores } from '../../stores/StoreContext';
import type { Notification, NotificationType } from '../../types/api';

// ─── Type config (matches web admin: info/success/warning/error) ──────────────
const TYPE_CONFIG: Record<NotificationType, { icon: any; bg: string; tint: string }> = {
  info:    { icon: AppImages.bell,       bg: '#1a2a3a', tint: '#4A9EFF' },
  success: { icon: AppImages.cart,       bg: '#1a2d1a', tint: '#4CAF72' },
  warning: { icon: AppImages.download,   bg: '#2d2a1a', tint: '#FFB74D' },
  error:   { icon: AppImages.categories, bg: '#2d1a1a', tint: '#FF6B6B' },
};

const formatTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

// ─── Back Arrow ───────────────────────────────────────────────────────────────
const BackArrow: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity style={styles.backBtn} onPress={onPress} activeOpacity={0.7}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
    <Image source={AppImages.backIcon} style={styles.backIconImg} resizeMode="contain" />
  </TouchableOpacity>
);

// ─── Notification Card ────────────────────────────────────────────────────────
const NotificationCard = memo(({
  item,
  onPress,
}: {
  item: Notification;
  onPress: (item: Notification) => void;
}) => {
  const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.info;
  const isUnread = item.is_read === 0;

  return (
    <TouchableOpacity
      style={[styles.card, isUnread && styles.cardUnread]}
      onPress={() => onPress(item)}
      activeOpacity={0.75}
    >
      <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
        <Image
          source={config.icon}
          style={[styles.cardIcon, { tintColor: config.tint }]}
          resizeMode="contain"
        />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          {isUnread && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.cardText} numberOfLines={2}>{item.message}</Text>

        {/* order_id / flyer_id badges */}
        {(item.order_id || item.flyer_id) && (
          <View style={styles.badges}>
            {item.order_id && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Order #{item.order_id}</Text>
              </View>
            )}
            {item.flyer_id && (
              <View style={[styles.badge, styles.badgeFlyer]}>
                <Text style={styles.badgeText}>Flyer #{item.flyer_id}</Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.cardTime}>{formatTime(item.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );
});

NotificationCard.displayName = 'NotificationCard';

// ─── Screen ───────────────────────────────────────────────────────────────────
const NotificationsScreen: React.FC = observer(() => {
  const navigation = useNavigation<any>();
  const { notificationStore } = useStores();
  const {
    sortedNotifications,
    unreadCount,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    refreshNotifications,
    loadMoreNotifications,
    markRead,
    markAllRead,
  } = notificationStore;

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  const handleRefresh = useCallback(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  const handleLoadMore = useCallback(() => {
    if (sortedNotifications.length === 0 || !hasMore || isLoadingMore || isRefreshing || isLoading) return;
    void loadMoreNotifications();
  }, [hasMore, isLoading, isLoadingMore, isRefreshing, loadMoreNotifications, sortedNotifications.length]);

  const hasBlockingError = !isLoading && !!error && sortedNotifications.length === 0;

  const handleCardPress = useCallback((item: Notification) => {
    void markRead(item.id);
    if (item.flyer_id) {
      navigation.navigate('FlyerDetail', { flyerId: String(item.flyer_id) });
    } else if (item.order_id) {
      // navigate to orders once that screen exists
    }
  }, [markRead, navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <BackArrow onPress={() => navigation.goBack()} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={() => void markAllRead()} activeOpacity={0.7} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRight} />
        )}
      </View>

      {/* Initial loading */}
      {isLoading && sortedNotifications.length === 0 && (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      )}

      {/* Error */}
      {hasBlockingError && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      {!hasBlockingError && (
        <FlatList
          data={sortedNotifications}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <NotificationCard item={item} onPress={handleCardPress} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.35}
          ListFooterComponent={
            sortedNotifications.length > 0 && isLoadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={Colors.primary} size="small" />
                <Text style={styles.footerText}>Loading more</Text>
              </View>
            ) : sortedNotifications.length > 0 && !hasMore ? (
              <View style={styles.footerEnd}>
                <Text style={styles.footerEndText}>You’re all caught up</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.empty}>
                <Image source={AppImages.bell} style={styles.emptyIcon} resizeMode="contain" />
                <Text style={styles.emptyTitle}>No notifications yet</Text>
                <Text style={styles.emptySubtitle}>
                  We'll let you know when something important happens.
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIconImg: {
    width: 22,
    height: 22,
    tintColor: Colors.textPrimary,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.lg,
    fontFamily: Typography.fontFamilies.medium,
    color: Colors.textPrimary,
    letterSpacing: 0.1,
  },
  markAllBtn: {
    width: 90,
    alignItems: 'flex-end',
  },
  markAllText: {
    fontSize: 12,
    fontFamily: Typography.fontFamilies.medium,
    color: Colors.primary,
  },
  headerRight: {
    width: 90,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardUnread: {
    borderColor: `${Colors.primary}44`,
    backgroundColor: `${Colors.primary}08`,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  cardIcon: {
    width: 22,
    height: 22,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: Typography.fontFamilies.semiBold,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    flexShrink: 0,
  },
  cardText: {
    fontSize: 13,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  badge: {
    backgroundColor: `${Colors.primary}22`,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeFlyer: {
    backgroundColor: '#4A9EFF22',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: Typography.fontFamilies.medium,
    color: Colors.textSecondary,
  },
  cardTime: {
    fontSize: 11,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.tabBarInactive,
    marginTop: 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontFamily: Typography.fontFamilies.regular,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 13,
    fontFamily: Typography.fontFamilies.semiBold,
    color: '#fff',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    tintColor: Colors.tabBarInactive,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: Typography.fontFamilies.semiBold,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  footerLoader: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamilies.medium,
  },
  footerEnd: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  footerEndText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamilies.medium,
  },
});

export default NotificationsScreen;
