// src/screens/Download/DownloadsScreen.tsx

import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Theme
import Colors from '../../theme/colors';
import ScreenHeader from '../../components/common/ScreenHeader';

import DownloadOrderCard, { DownloadOrder } from './DownloadOrderCard';

const ItemSeparator = () => <View style={styles.separator} />;

// ─── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_ORDERS: DownloadOrder[] = [
  {
    id: 'order_1',
    orderNumber: '#FL-8829',
    deliveredAt: '2 hours ago',
    status: 'new',
    files: [
      {
        id: 'file_1',
        name: 'Elite Friday Night Poster',
        size: '12.4 MB',
        type: 'PSD',
        thumbnail: { uri: 'https://picsum.photos/seed/elite-poster/200/200' },
      },
      {
        id: 'file_2',
        name: 'Social Media Assets',
        size: '4.8 MB',
        type: 'ZIP',
      },
    ],
  },
  {
    id: 'order_2',
    orderNumber: '#FL-8825',
    deliveredAt: 'Yesterday',
    status: 'delivered',
    files: [
      {
        id: 'file_3',
        name: 'Business Conference Flyer',
        size: '8.2 MB',
        type: 'PDF',
        thumbnail: { uri: 'https://picsum.photos/seed/conf-flyer/200/200' },
      },
    ],
  },
  {
    id: 'order_3',
    orderNumber: '#FL-8820',
    deliveredAt: 'Waiting...',
    status: 'preparing',
    files: [],
  },
];

const DownloadsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const orders = useMemo(() => MOCK_ORDERS, []);

  const handleViewDetails = (orderNumber: string) => {
    console.log('View details for:', orderNumber);
  };

  const handleDownloadFile = (orderId: string, fileId: string) => {
    console.log('Downloading file:', fileId, 'from order:', orderId);
  };

  const readyCount = useMemo(
    () => orders.filter(order => order.status !== 'preparing').length,
    [orders],
  );

  const newCount = useMemo(
    () => orders.filter(order => order.status === 'new').length,
    [orders],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Downloads"
        subtitle={undefined}
        onBackPress={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('Home');
        }}
        rightSlot={null}
        containerStyle={styles.headerBar}
      />

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={ItemSeparator}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryChip}>
                <Text style={styles.summaryValue}>{orders.length}</Text>
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
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No downloads yet</Text>
            <Text style={styles.emptySubtitle}>
              Your purchased files will show up here when they are delivered.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

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
