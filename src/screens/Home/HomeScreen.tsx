// screens/Home/HomeScreen.tsx

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  InteractionManager,
  Image,
} from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';

import Colors from '../../theme/colors';
import { useStores } from '../../stores/StoreContext';
import SearchBar from '../../components/common/SearchBar';
import HeroBanner, { BannerSlide } from '../../components/home/HeroBanner';
import BannerSkeleton from '../../components/home/BannerSkeleton';
import HomeSectionSkeleton from '../../components/home/HomeSectionSkeleton';
import SectionHeader from '../../components/home/SectionHeader';
import FlyerCard, {
  CARD_WIDTH,
  CARD_GAP,
  HORIZONTAL_PADDING,
} from '../../components/home/FlyerCard';
import type { Flyer } from '../../types/flyer';
import type { AppStackParamList } from '../../navigation/types';

type HomeSection = {
  id: string;
  title: string;
  data: Flyer[];
  isLoaded: boolean;
};

type LocalHomeSection = Omit<HomeSection, 'isLoaded'>;
type SectionPagination = { page: number; hasMore: boolean; isLoading: boolean };

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
  const {
    addToFavorites,
    banners,
    bannerError,
    error: flyersError,
    fetchBanners,
    fetchCategories,
    fetchFlyersForCategoryTab,
    hydrateHomeCache,
    getLocalFlyersForCategoryTab,
    isBannersLoading,
    isCategoriesLoading,
    orderedCategoryTabs,
  } = flyerStore;
  const loadCart = cartStore.load;
  const userId = authStore.user?.id;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bannerImageReady, setBannerImageReady] = useState(false);
  const [sectionApiFlyersById, setSectionApiFlyersById] = useState<Record<string, Flyer[]>>({});
  const [sectionLoadCycle, setSectionLoadCycle] = useState(0);

  const [sectionPagination, setSectionPagination] = useState<Record<string, SectionPagination>>({});

  useEffect(() => {
    // Banners run immediately — do NOT wait for cache hydration
    void fetchBanners().catch(() => {});
    void hydrateHomeCache();

    const task = InteractionManager.runAfterInteractions(() => {
      void fetchCategories().catch(() => {});
    });

    return () => task.cancel();
  }, [fetchBanners, fetchCategories, hydrateHomeCache]);

  useEffect(() => {
    if (userId) {
      loadCart(userId);
    }
  }, [loadCart, userId]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setSectionApiFlyersById({});
    setSectionPagination({});
    setSectionLoadCycle(prev => prev + 1);
    try {
      await Promise.all([
        fetchBanners(),
        fetchCategories(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchBanners, fetchCategories]);

  const handleSectionLoadMore = useCallback(
    async (sectionId: string, categoryName: string) => {
      const current = sectionPagination[sectionId];
      if (current?.isLoading || current?.hasMore === false) return;

      const nextPage = (current?.page ?? 1) + 1;

      setSectionPagination(prev => ({
        ...prev,
        [sectionId]: { page: current?.page ?? 1, hasMore: true, isLoading: true },
      }));

      try {
        const { flyers, hasMore } = await flyerStore.fetchNextPageForSection({
          categoryName,
          isRecentlyAdded: sectionId === 'recently_added',
          sortBy: HOME_SECTION_SORT_BY,
          sortDir: HOME_SECTION_SORT_DIR,
          page: nextPage,
        });

        setSectionApiFlyersById(prev => ({
          ...prev,
          [sectionId]: [...(prev[sectionId] ?? []), ...flyers],
        }));
        setSectionPagination(prev => ({
          ...prev,
          [sectionId]: { page: nextPage, hasMore, isLoading: false },
        }));
      } catch {
        setSectionPagination(prev => ({
          ...prev,
          [sectionId]: { ...(prev[sectionId] ?? { page: 1, hasMore: true }), isLoading: false },
        }));
      }
    },
    [flyerStore, sectionPagination],
  );

  const mappedBanners: BannerSlide[] = useMemo(
    () =>
      (banners || []).map(b => ({
        id: b.id,
        tag: b.tag,
        title: b.title,
        description: b.description,
        ctaLabel: b.button_text || b.ctaLabel || 'Explore',
        imageSource: { uri: b.image_url },
        onCtaPress: () => navigation.navigate('Categories' as never),
      })),
    [banners, navigation],
  );

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
      if (!userId) {
        Alert.alert('Sign In Required', 'Please sign in to save flyers to your favorites.');
        return;
      }
      try {
        const flyer = flyerStore.allFlyers.find(f => String(f._id ?? f.id) === id);
        if (flyer?.isFavorited) {
          await flyerStore.removeFromFavorites(userId, Number(id));
        } else {
          await addToFavorites(userId, Number(id));
        }
      } catch (err: any) {
        console.error('Favorite toggle error:', err);
      }
    },
    [addToFavorites, flyerStore, userId],
  );

  const orderedTabs = orderedCategoryTabs;
  const orderedTabsKey = orderedTabs
    .map(tab => `${tab.id}:${tab.name}`)
    .join('|');

  const localSections: LocalHomeSection[] = orderedTabs
    .map(tab => ({
      id: tab.id,
      title: tab.name,
      data: getLocalFlyersForCategoryTab({
        categoryName: tab.name,
        isRecentlyAdded: tab.id === 'recently_added',
        sortBy: HOME_SECTION_SORT_BY,
        sortDir: HOME_SECTION_SORT_DIR,
      }).slice(0, HOME_SECTION_LIMIT),
    }))
    .filter(section => section.title && section.data.length > 0);
  const hasSectionApiData = Object.keys(sectionApiFlyersById).length > 0;

  useEffect(() => {
    const tabs = orderedTabs;

    if (tabs.length === 0) {
      return;
    }

    let isCancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    tabs.forEach((tab, index) => {
      const fetchSection = () => {
        fetchFlyersForCategoryTab({
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
      };

      if (index < 2) {
        fetchSection();
        return;
      }

      const timer = setTimeout(fetchSection, 200 * (index - 1));
      timers.push(timer);
    });

    return () => {
      isCancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [fetchFlyersForCategoryTab, orderedTabs, orderedTabsKey, sectionLoadCycle]);

  const homeSections: HomeSection[] = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const resolvedSections = orderedTabs.map(tab => {
      const localSection = localSections.find(section => section.id === tab.id);
      const hasNetworkData = Array.isArray(sectionApiFlyersById[tab.id]);
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
        isLoaded: hasNetworkData || shuffledData.length > 0,
      };
    });

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
      .filter(section => (query ? section.data.length > 0 : true))
      .filter(section => section.title);
  }, [localSections, orderedTabs, searchQuery, sectionApiFlyersById, sectionLoadCycle]);

  useEffect(() => {
    banners.slice(0, 2).forEach(banner => {
      if (banner?.image_url) {
        void Image.prefetch(banner.image_url);
      }
    });
  }, [banners]);

  useEffect(() => {
    homeSections.slice(0, 5).forEach(section => {
      section.data.slice(0, 6).forEach(flyer => {
        const url = flyer.image_url ?? flyer.imageUrl ?? flyer.image;
        if (url) {
          void Image.prefetch(url);
        }
      });
    });
  }, [homeSections]);

  const renderCategorySection = ({
    item,
  }: {
    item: HomeSection;
  }) => {
    if (!item.isLoaded) {
      return <HomeSectionSkeleton />;
    }

    if (item.data.length === 0) {
      return null;
    }

    return (
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
          snapToInterval={CARD_WIDTH + CARD_GAP}
          decelerationRate="fast"
          initialNumToRender={3}
          maxToRenderPerBatch={4}
          windowSize={5}
          removeClippedSubviews
          getItemLayout={(_, index) => ({
            length: CARD_WIDTH + CARD_GAP,
            offset: HORIZONTAL_PADDING + index * (CARD_WIDTH + CARD_GAP),
            index,
          })}
          onEndReachedThreshold={0.4}
          onEndReached={() => handleSectionLoadMore(item.id, item.title)}
        />
      </View>
    );
  };

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

      {/* HeroBanner renders at full height whenever data is ready so the
          FlatList inside actually mounts and images start loading.
          The skeleton sits on top as an absolute overlay until the first
          image fires onLoad, then it is removed. */}
      {mappedBanners.length > 0 && (
        <HeroBanner
          slides={mappedBanners}
          autoPlayInterval={5000}
          onFirstImageLoad={() => setBannerImageReady(true)}
        />
      )}
      {!bannerImageReady && (isBannersLoading || mappedBanners.length > 0) && (
        <View style={mappedBanners.length > 0 ? styles.bannerSkeletonOverlay : undefined}>
          <BannerSkeleton />
        </View>
      )}

      {flyersError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{flyersError}</Text>
        </View>
      ) : null}

      {(isCategoriesLoading || (orderedTabs.length > 0 && !hasSectionApiData && homeSections.length === 0)) ? (
        <View style={styles.skeletonStack}>
          <HomeSectionSkeleton />
          <HomeSectionSkeleton />
        </View>
      ) : null}

      {!isCategoriesLoading &&
        !isBannersLoading &&
        !flyersError &&
        !bannerError &&
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
        ListHeaderComponent={renderHeader()}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  bannerSkeletonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
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
  skeletonStack: {
    gap: 2,
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
