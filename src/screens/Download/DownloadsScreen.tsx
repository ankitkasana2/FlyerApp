// src/screens/Download/DownloadsScreen.tsx

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';

// Theme
import Colors from '../../theme/colors';
import ScreenHeader from '../../components/common/ScreenHeader';

import DownloadOrderCard, { DownloadOrder } from './DownloadOrderCard';
import { useStores } from '../../stores/StoreContext';
import * as orderFilesService from '../../services/orderFilesService';

const ItemSeparator = () => <View style={styles.separator} />;

const timeAgo = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const guessFileType = (fileTypeRaw?: string, fileName?: string) => {
  const normalized = String(fileTypeRaw || '').toLowerCase().trim();
  if (normalized) return normalized;
  const lowerName = String(fileName || '').toLowerCase();
  if (lowerName.endsWith('.zip')) return 'zip';
  if (lowerName.endsWith('.pdf')) return 'pdf';
  if (/\.(png|jpg|jpeg|webp|gif)$/.test(lowerName)) return 'image';
  return 'file';
};

const DownloadsScreen: React.FC = observer(() => {
  const navigation = useNavigation<any>();
  const { authStore, orderStore } = useStores();
  const userId = authStore.user?.id;
  const [filesByOrderId, setFilesByOrderId] = useState<
    Record<string, orderFilesService.OrderFileRecord[]>
  >({});
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    await orderStore.fetchUserOrders(userId, 100);
    setIsLoadingFiles(true);
    try {
      const { data } = await orderFilesService.getFilesByUser(userId);
      const next: Record<string, orderFilesService.OrderFileRecord[]> = {};
      if (data?.success && Array.isArray(data.files)) {
        data.files.forEach(file => {
          const orderKey = String(file.order_id);
          if (!next[orderKey]) next[orderKey] = [];
          next[orderKey].push(file);
        });
        // newest first
        Object.values(next).forEach(list =>
          list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')),
        );
      }
      setFilesByOrderId(next);
    } catch {
      setFilesByOrderId({});
    } finally {
      setIsLoadingFiles(false);
    }
  }, [orderStore, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const downloadOrders: DownloadOrder[] = useMemo(() => {
    const orders = orderStore.orders || [];
    return orders.map(order => {
      const orderId = String(order.id);
      const files = filesByOrderId[orderId] || [];
      const latestFileDate = files[0]?.created_at || order.created_at;

      const status: DownloadOrder['status'] =
        files.length === 0
          ? 'preparing'
          : order.status === 'completed' || order.status === 'delivered'
          ? 'delivered'
          : 'new';

      return {
        id: orderId,
        orderNumber: `#${orderId}`,
        deliveredAt: timeAgo(latestFileDate),
        status,
        files: files.map(f => {
          const type = guessFileType(f.file_type, f.original_name);
          return {
            id: String(f.id),
            name: f.original_name || `File #${f.id}`,
            size: '—',
            type: type.toUpperCase(),
            thumbnail: type === 'image' ? { uri: f.file_url } : undefined,
            url: f.file_url,
          };
        }),
      };
    });
  }, [filesByOrderId, orderStore.orders]);

  const handleViewDetails = useCallback(
    (orderId: string) => {
      navigation.navigate('OrderDetail', { orderId });
    },
    [navigation],
  );

  const handleDownloadFile = useCallback(async (fileUrl: string) => {
    if (!fileUrl) return;
    const canOpen = await Linking.canOpenURL(fileUrl);
    if (canOpen) {
      await Linking.openURL(fileUrl);
    }
  }, []);

  const readyCount = useMemo(
    () => downloadOrders.filter(order => order.status !== 'preparing').length,
    [downloadOrders],
  );

  const newCount = useMemo(
    () => downloadOrders.filter(order => order.status === 'new').length,
    [downloadOrders],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="My Designs"
        subtitle={undefined}
        onBackPress={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('Home');
        }}
        rightSlot={null}
        containerStyle={styles.headerBar}
      />

      <FlatList
        data={downloadOrders}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={ItemSeparator}
        refreshControl={
          <RefreshControl
            tintColor={Colors.primary}
            colors={[Colors.primary]}
            refreshing={orderStore.isLoading || isLoadingFiles}
            onRefresh={() => refresh()}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryChip}>
                <Text style={styles.summaryValue}>{downloadOrders.length}</Text>
                <Text style={styles.summaryLabel}>Orders</Text>
              </View>
              <View style={styles.summaryChip}>
                <Text style={styles.summaryValue}>{readyCount}</Text>
                <Text style={styles.summaryLabel}>Ready</Text>
              </View>
              <View style={styles.summaryChip}>
                <Text style={styles.summaryValue}>{newCount}</Text>
                <Text style={styles.summaryLabel}>New</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <DownloadOrderCard
            order={item}
            onViewDetails={handleViewDetails}
            onDownloadFile={handleDownloadFile}
          />
        )}
        ListEmptyComponent={
          orderStore.isLoading ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No completed designs yet</Text>
              <Text style={styles.emptySubtitle}>
                Your completed flyer designs will appear here once our team delivers them.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 10,
  },
  separator: {
    height: 14,
  },
  headerWrap: {
    paddingTop: 6,
    paddingBottom: 6,
    gap: 14,
  },
  headerBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    paddingVertical: 10,
    shadowOpacity: 0,
    elevation: 0,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryChip: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  emptyWrap: {
    paddingTop: 56,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default DownloadsScreen;
