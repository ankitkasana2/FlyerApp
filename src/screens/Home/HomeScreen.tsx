// screens/Home/HomeScreen.tsx

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';

import Colors from '../../theme/colors';
import { useStores } from '../../stores/StoreContext';
import SearchBar from '../../components/common/SearchBar';
import HeroBanner, { BannerSlide } from '../../components/home/HeroBanner';
import BannerSkeleton from '../../components/home/BannerSkeleton';
import SectionHeader from '../../components/home/SectionHeader';
import FlyerCard, {
  CARD_GAP,
  HORIZONTAL_PADDING,
} from '../../components/home/FlyerCard';
import type { Flyer } from '../../types/flyer';
import type { AppStackParamList } from '../../navigation/types';

type HomeSection = {
  id: string;
  title: string;
  data: Flyer[];
};

const HOME_SECTION_LIMIT = 15;
const HOME_SECTION_SORT_BY = 'created_at';
const HOME_SECTION_SORT_DIR: 'asc' | 'desc' = 'desc';

const hashString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const createSeededRandom = (seed: number) => {
  let current = seed || 1;
  return () => {
    current = (current * 1664525 + 1013904223) >>> 0;
    return current / 4294967296;
  };
};

const shuffleFlyersForSection = (
  flyers: Flyer[],
  sectionId: string,
  cycle: number,
) => {
  if (flyers.length <= 1) {
    return flyers;
  }

  const seededRandom = createSeededRandom(
    hashString(`${sectionId}:${cycle}:${flyers.length}`),
  );
  const shuffled = [...flyers];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(seededRandom() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
};

const getFlyerImage = (flyer: Flyer) => {
  const url = flyer.image_url ?? flyer.imageUrl ?? flyer.image;
  if (url) return { uri: url };
  return { uri: `https://picsum.photos/seed/${flyer._id ?? flyer.id}/400/550` };
};

const formatPrice = (price: number | string | undefined | null): string => {
  if (price === undefined || price === null) return '$0.00';
  if (typeof price === 'number') return `$${price.toFixed(2)}`;
  const priceStr = String(price);
  return priceStr.startsWith('$') ? priceStr : `$${priceStr}`;
};

const HomeScreen: React.FC = observer(() => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { flyerStore, cartStore, authStore } = useStores();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sectionApiFlyersById, setSectionApiFlyersById] = useState<Record<string, Flyer[]>>({});
  const [sectionLoadCycle, setSectionLoadCycle] = useState(0);

  useEffect(() => {
    flyerStore.fetchBanners();
    flyerStore.fetchFlyers(true);
    flyerStore.fetchCategories();

    if (authStore.user?.id) {
      cartStore.load(authStore.user.id);
    }
  }, [flyerStore, cartStore, authStore.user?.id]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setSectionApiFlyersById({});
    setSectionLoadCycle(prev => prev + 1);
    try {
      await Promise.all([
        flyerStore.fetchBanners(),
        flyerStore.fetchFlyers(true),
        flyerStore.fetchCategories(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [flyerStore]);

  const mappedBanners: BannerSlide[] = (flyerStore.banners || []).map(b => ({
    id: b.id,
    tag: b.tag,
    title: b.title,
    description: b.description,
    ctaLabel: b.button_text || b.ctaLabel || 'Explore',
    imageSource: { uri: b.image_url },
    onCtaPress: () => navigation.navigate('Categories' as never),
  }));

  const handleLoadMore = useCallback(() => {
    if (flyerStore.hasMore && !flyerStore.isLoading && !flyerStore.isFetchingNextPage) {
      flyerStore.fetchFlyers();
    }
  }, [flyerStore]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleSearchSubmit = useCallback((text: string) => {
    console.log('Search submitted:', text);
  }, []);

  const handleCardPress = useCallback(
    (id: string) => {
      navigation.navigate('FlyerDetail', { flyerId: id });
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

  const orderedTabs = flyerStore.orderedCategoryTabs;
  const orderedTabsKey = orderedTabs
    .map(tab => `${tab.id}:${tab.name}`)
    .join('|');

  const localSections: HomeSection[] = orderedTabs
    .map(tab => ({
      id: tab.id,
      title: tab.name,
      data: flyerStore.getLocalFlyersForCategoryTab({
        categoryName: tab.name,
        isRecentlyAdded: tab.id === 'recently_added',
        sortBy: HOME_SECTION_SORT_BY,
        sortDir: HOME_SECTION_SORT_DIR,
      }).slice(0, HOME_SECTION_LIMIT),
    }))
    .filter(section => section.title && section.data.length > 0);

  useEffect(() => {
    const tabs = flyerStore.orderedCategoryTabs;

    if (tabs.length === 0) {
      return;
    }

    let isCancelled = false;
    tabs.forEach(tab => {
      flyerStore.fetchFlyersForCategoryTab({
        categoryName: tab.name,
        isRecentlyAdded: tab.id === 'recently_added',
        sortBy: HOME_SECTION_SORT_BY,
        sortDir: HOME_SECTION_SORT_DIR,
        limit: HOME_SECTION_LIMIT,
      })
        .then(flyers => {
          if (isCancelled) {
            return;
          }

          setSectionApiFlyersById(prev => ({
            ...prev,
            [tab.id]: flyers.slice(0, HOME_SECTION_LIMIT),
          }));
        })
        .catch(error => {
          if (isCancelled) {
            return;
          }
          console.error(`Failed to load home section ${tab.name}:`, error);
        });
    });

    return () => {
      isCancelled = true;
    };
  }, [flyerStore, orderedTabsKey, sectionLoadCycle]);

  const homeSections: HomeSection[] = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const resolvedSections = orderedTabs
      .map(tab => {
        const localSection = localSections.find(section => section.id === tab.id);
        const resolvedData = sectionApiFlyersById[tab.id] ?? localSection?.data ?? [];
        const shuffledData = shuffleFlyersForSection(
          resolvedData,
          tab.id,
          sectionLoadCycle,
        );

        return {
          id: tab.id,
          title: tab.name,
          data: shuffledData,
        };
      })
      .filter(section => section.title && section.data.length > 0);

    return resolvedSections
      .map(section => {
        const filteredData = query
          ? section.data.filter(flyer => {
              const title = flyer.title.toLowerCase();
              const categories = [
                flyer.category,
                ...(Array.isArray(flyer.categories) ? flyer.categories : []),
              ]
                .map(value => String(value ?? '').toLowerCase())
                .filter(Boolean);

              return title.includes(query) || categories.some(category => category.includes(query));
            })
          : section.data;

        return {
          ...section,
          data: filteredData,
        };
      })
      .filter(section => section.data.length > 0);
  }, [localSections, orderedTabs, searchQuery, sectionApiFlyersById, sectionLoadCycle]);

  const renderCategorySection = ({
    item,
  }: {
    item: HomeSection;
  }) => (
    <View style={styles.categorySection}>
      <SectionHeader title={item.title} />
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
        snapToInterval={CARD_GAP + 160}
        decelerationRate="fast"
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

      {mappedBanners.length > 0 ? (
        <HeroBanner slides={mappedBanners} autoPlayInterval={5000} />
      ) : (
        <BannerSkeleton />
      )}

      {flyerStore.error && !flyerStore.isLoading && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{flyerStore.error}</Text>
        </View>
      )}

      {(flyerStore.isLoading || flyerStore.isCategoriesLoading) &&
        homeSections.length === 0 && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}

      {!flyerStore.isLoading &&
        !flyerStore.isCategoriesLoading &&
        !flyerStore.isBannersLoading &&
        !flyerStore.error &&
        homeSections.length === 0 && (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No flyers found.</Text>
          </View>
        )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={homeSections}
        renderItem={renderCategorySection}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          flyerStore.isFetchingNextPage ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null
        }
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
