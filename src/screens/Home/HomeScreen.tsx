// screens/Home/HomeScreen.tsx

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';

// Theme
import Colors from '../../theme/colors';

// Stores
import { useStores } from '../../stores/StoreContext';

// Common Components
import SearchBar from '../../components/common/SearchBar';

// Home Components
import Header from '../../components/home/Header';
import HeroBanner, { BannerSlide } from '../../components/home/HeroBanner';
import SectionHeader from '../../components/home/SectionHeader';
import FlyerCard, {
  CARD_GAP,
  HORIZONTAL_PADDING,
} from '../../components/home/FlyerCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Flyer } from '../../types/flyer';

// ─── Helper: resolve image source from a Flyer ────────────────────────────────
const getFlyerImage = (flyer: Flyer) => {
  const url = flyer.image_url ?? flyer.imageUrl ?? flyer.image;
  if (url) return { uri: url };
  // Fallback placeholder while real image loads
  return { uri: `https://picsum.photos/seed/${flyer._id ?? flyer.id}/400/550` };
};

// ─── Helper: format price ─────────────────────────────────────────────────────
const formatPrice = (price: number | string | undefined | null): string => {
  if (price === undefined || price === null) return '$0.00';
  if (typeof price === 'number') return `$${price.toFixed(2)}`;
  const priceStr = String(price);
  return priceStr.startsWith('$') ? priceStr : `$${priceStr}`;
};

// ─── HomeScreen ───────────────────────────────────────────────────────────────
const HomeScreen: React.FC = observer(() => {
  const navigation = useNavigation();
  const { flyerStore } = useStores();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cartCount] = useState<number>(2);

  // Fetch data on mount
  useEffect(() => {
    // Parallel fetching for faster load
    flyerStore.fetchBanners();
    flyerStore.fetchFlyers(true);
  }, [flyerStore]);

  // Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      flyerStore.fetchBanners(),
      flyerStore.fetchFlyers(true),
    ]);
  }, [flyerStore]);

  // Mapped Banners for HeroBanner
  const mappedBanners: BannerSlide[] = (flyerStore.banners || []).map((b) => ({
    id: b.id,
    tag: b.tag,
    title: b.title,
    ctaLabel: b.ctaLabel,
    imageSource: { uri: b.image_url },
    onCtaPress: () => console.log('Banner CTA pressed:', b.id),
  }));

  // Load more flyers (Pagination)
  const handleLoadMore = useCallback(() => {
    flyerStore.fetchFlyers();
  }, [flyerStore]);

  const handleSearchChange = useCallback((text: string) => setSearchQuery(text), []);
  const handleSearchSubmit = useCallback((text: string) => {
    console.log('Search submitted:', text);
  }, []);

  const handleCardPress = useCallback((id: string) => {
    console.log('Card pressed:', id);
  }, []);

  const handleFavoritePress = useCallback((id: string) => {
    flyerStore.toggleFavourite(id);
  }, [flyerStore]);

  // ─── Helper: Shuffle array (Fisher-Yates) ───────────────────────────────────
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Group flyers by category and shuffle them
  const groupedCategories = useMemo(() => {
    const categoriesMap: Record<string, Flyer[]> = {};
    const flyersToMap = searchQuery.trim()
      ? flyerStore.flyers.filter((f) =>
          f.title.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : flyerStore.flyers;

    flyersToMap.forEach((flyer) => {
      const cats = flyer.categories || (flyer.category ? [flyer.category] : ['Uncategorized']);
      cats.forEach((cat) => {
        if (!categoriesMap[cat]) {
          categoriesMap[cat] = [];
        }
        // Avoid duplicate flyers in the same category Shelf
        if (!categoriesMap[cat].find((f) => (f._id || f.id) === (flyer._id || flyer.id))) {
          categoriesMap[cat].push(flyer);
        }
      });
    });

    return Object.entries(categoriesMap).map(([title, data]) => ({
      title,
      data: shuffleArray(data), // Randomize the sequence in this category
    }));
  }, [flyerStore.flyers, searchQuery]);

  // Render Horizontal Category Section
  const renderCategorySection = ({ item }: { item: { title: string; data: Flyer[] } }) => (
    <View style={styles.categorySection}>
      <SectionHeader
        title={item.title}
        onActionPress={() => console.log('See all', item.title)}
      />
      <FlatList
        horizontal
        data={item.data}
        renderItem={({ item: flyer }) => {
          const flyerId = String(flyer._id ?? flyer.id);
          return (
            <View style={styles.horizontalCardWrapper}>
              <FlyerCard
                id={flyerId}
                title={flyer.title}
                price={formatPrice(flyer.price)}
                imageSource={getFlyerImage(flyer)}
                isPremium={flyer.isPremium}
                isFavorited={flyer.isFavorited}
                onPress={handleCardPress}
                onFavoritePress={handleFavoritePress}
              />
            </View>
          );
        }}
        keyExtractor={(flyer) => String(flyer._id ?? flyer.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContent}
        snapToInterval={CARD_GAP + 160} // approximate
        decelerationRate="fast"
      />
    </View>
  );

  // Header Component
  const renderHeader = () => (
    <View>
      <Header
        cartCount={cartCount}
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        onSearchPress={() => console.log('Search icon pressed')}
        onCartPress={() => navigation.navigate('Cart' as never)}
        onNotificationPress={() => console.log('Notifications pressed')}
      />

      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          onSubmit={handleSearchSubmit}
          placeholder="Search premium flyers..."
        />
      </View>

      {/* Hero Banner Slider */}
      {mappedBanners.length > 0 && (
        <HeroBanner slides={mappedBanners} autoPlayInterval={5000} />
      )}

      {/* Hero Banner Loading Skeleton Placeholder */}
      {flyerStore.isBannersLoading && mappedBanners.length === 0 && (
        <View style={styles.bannerLoading}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      )}

      {/* Loading state for initial flyer load */}
      {flyerStore.isLoading && flyerStore.flyers.length === 0 && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {/* Error state */}
      {flyerStore.error && !flyerStore.isLoading && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{flyerStore.error}</Text>
        </View>
      )}

      {/* Empty state */}
      {!flyerStore.isLoading && !flyerStore.error && groupedCategories.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No flyers found.</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FlatList
        data={groupedCategories}
        renderItem={renderCategorySection}
        keyExtractor={(item) => item.title}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={() => (
          flyerStore.isFetchingNextPage ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null
        )}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={flyerStore.isLoading}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchWrapper: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 12,
  },
  bannerLoading: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: HORIZONTAL_PADDING,
    borderRadius: 16,
  },
  categorySection: {
    marginTop: 24,
  },
  horizontalListContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 8,
  },
  horizontalCardWrapper: {
    marginRight: CARD_GAP,
  },
  center: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});

export default HomeScreen;
