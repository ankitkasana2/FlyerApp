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
import HeroBanner, { BannerSlide } from '../../components/home/HeroBanner';
import BannerSkeleton from '../../components/home/BannerSkeleton';
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
  const { flyerStore, cartStore, authStore } = useStores();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Fetch data on mount
  useEffect(() => {
    // Parallel fetching for faster load
    flyerStore.fetchBanners();
    flyerStore.fetchFlyers(true);

    // Load cart if user is authenticated
    if (authStore.user?.id) {
      cartStore.load(authStore.user.id);
    }
  }, [flyerStore, cartStore, authStore.user?.id]);

  // Pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      flyerStore.fetchBanners(),
      flyerStore.fetchFlyers(true),
    ]);
    setIsRefreshing(false);
  }, [flyerStore]);

  // Mapped Banners for HeroBanner
  const mappedBanners: BannerSlide[] = (flyerStore.banners || []).map(b => ({
    id: b.id,
    tag: b.tag,
    title: b.title,
    description: b.description,
    ctaLabel: b.button_text || b.ctaLabel || 'Explore',
    imageSource: { uri: b.image_url },
    onCtaPress: () => navigation.navigate('Categories' as never),
  }));

  // Load more flyers (Pagination)
  const handleLoadMore = useCallback(() => {
    flyerStore.fetchFlyers();
  }, [flyerStore]);

  const handleSearchChange = useCallback(
    (text: string) => setSearchQuery(text),
    [],
  );
  const handleSearchSubmit = useCallback((text: string) => {
    console.log('Search submitted:', text);
  }, []);

  const handleCardPress = useCallback(
    (id: string) => {
      navigation.navigate('FlyerDetail' as never, { flyerId: id } as never);
    },
    [navigation],
  );

  const handleFavoritePress = useCallback(
    async (id: string) => {
      const userId = authStore.user?.id;
      if (!userId) {
        Alert.alert(
          'Sign In Required',
          'Please sign in to save flyers to your favorites.',
        );
        return;
      }

      try {
        await flyerStore.addToFavorites(userId, Number(id));
      } catch (err: any) {
        console.error('Failed to add to favorites:', err);
      }
    },
    [authStore.user?.id, flyerStore],
  );

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
      ? flyerStore.flyers.filter(f =>
          f.title.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : flyerStore.flyers;

    flyersToMap.forEach(flyer => {
      const cats =
        flyer.categories ||
        (flyer.category ? [flyer.category] : ['Uncategorized']);
      cats.forEach(cat => {
        if (!categoriesMap[cat]) {
          categoriesMap[cat] = [];
        }
        // Avoid duplicate flyers in the same category Shelf
        if (
          !categoriesMap[cat].find(
            f => (f._id || f.id) === (flyer._id || flyer.id),
          )
        ) {
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
  const renderCategorySection = ({
    item,
  }: {
    item: { title: string; data: Flyer[] };
  }) => (
    <View style={styles.categorySection}>
      <SectionHeader
        title={item.title}
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
        keyExtractor={flyer => String(flyer._id ?? flyer.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContent}
        snapToInterval={CARD_GAP + 160} // approximate
        decelerationRate="fast"
        onEndReached={() => flyerStore.fetchCategoryFlyers(item.title)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          flyerStore.loadingCategories[item.title] ? (
            <View style={styles.footerLoaderHorizontal}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null
        }
      />
    </View>
  );

  const renderHeader = () => (
    <View>
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          onSubmit={handleSearchSubmit}
          placeholder="Search premium flyers..."
        />
      </View>

      {/* Hero Banner Slider */}
      {mappedBanners.length > 0 ? (
        <HeroBanner slides={mappedBanners} autoPlayInterval={5000} />
      ) : (
        <BannerSkeleton />
      )}

      {/* Error state */}
      {flyerStore.error && !flyerStore.isLoading && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{flyerStore.error}</Text>
        </View>
      )}

      {/* Initial Flyers Loading */}
      {flyerStore.isLoading && groupedCategories.length === 0 && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {/* Empty state */}
      {!flyerStore.isLoading &&
        !flyerStore.isBannersLoading &&
        !flyerStore.error &&
        groupedCategories.length === 0 && (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No flyers found.</Text>
          </View>
        )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={groupedCategories}
        renderItem={renderCategorySection}
        keyExtractor={item => item.title}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchWrapper: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 12,
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
  footerLoaderHorizontal: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 250, // Match approximate height of FlyerCard
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
