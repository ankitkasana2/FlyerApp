// src/screens/Download/DownloadsScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Theme
import Colors from '../../theme/colors';

// Components
import Header from '../../components/home/Header';
import FilterTabs, { FilterTab } from './FilterTabs';
import DownloadOrderCard, { DownloadOrder } from './DownloadOrderCard';

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
  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  const handleMenuPress = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  const handleSearchPress = useCallback(() => {
    console.log('Search pressed');
  }, []);

  const handleCartPress = useCallback(() => {
    navigation.navigate('Cart');
  }, [navigation]);

  const handleNotificationPress = useCallback(() => {
    console.log('Notifications pressed');
  }, []);

  const handleTabPress = useCallback((tab: FilterTab) => {
    setActiveTab(tab);
  }, []);

  const handleViewDetails = useCallback((orderNumber: string) => {
    console.log('View details for:', orderNumber);
  }, []);

  const handleDownloadFile = useCallback((orderId: string, fileId: string) => {
    console.log('Downloading file:', fileId, 'from order:', orderId);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* ── Header ── */}
      <Header
        cartCount={2}
        onMenuPress={handleMenuPress}
        onSearchPress={handleSearchPress}
        onCartPress={handleCartPress}
        onNotificationPress={handleNotificationPress}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.title}>Downloads</Text>
          <Text style={styles.subtitle}>
            Access your purchased templates and resources.
          </Text>
        </View>

        <View style={styles.filterSection}>
          <FilterTabs activeTab={activeTab} onTabPress={handleTabPress} />
        </View>

        <View style={styles.ordersList}>
          {MOCK_ORDERS.map((order) => (
            <DownloadOrderCard
              key={order.id}
              order={order}
              onViewDetails={handleViewDetails}
              onDownloadFile={handleDownloadFile}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  ordersList: {
    gap: 16,
  },
});

export default DownloadsScreen;
