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
  RefreshControl,
  Linking,
  TouchableOpacity,
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

type HomeListHeaderProps = {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSearchSubmit: (text: string) => void;
  isBannersLoading: boolean;
  mappedBanners: BannerSlide[];
  flyersError?: string | null;
  onRetry?: () => void;
};

const HomeListHeader = React.memo(function HomeListHeader({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  isBannersLoading,
  mappedBanners,
  flyersError,
  onRetry,
}: HomeListHeaderProps) {
  return (
    <View>
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={onSearchChange}
          onSubmit={onSearchSubmit}
          placeholder="Search premium flyers..."
        />
      </View>

      {/* Banner: show skeleton only on first load (no banners yet), keep showing banner during refresh */}
      {isBannersLoading && mappedBanners.length === 0 ? (
        <BannerSkeleton />
      ) : mappedBanners.length > 0 ? (
        <HeroBanner slides={mappedBanners} autoPlayInterval={5000} />
      ) : null}

      {flyersError ? (
        <View style={styles.errorState}>
          {/* Icon — red circle with signal bars drawn as stacked rects */}
          <View style={styles.errorIconWrap}>
            <View style={styles.errorIconCircle}>
              <View style={styles.errorSignalRow}>
                <View style={[styles.errorSignalBar, styles.errorSignalBar1]} />
                <View style={[styles.errorSignalBar, styles.errorSignalBar2]} />
                <View style={[styles.errorSignalBar, styles.errorSignalBar3]} />
                <View style={[styles.errorSignalBar, styles.errorSignalBar4]} />
              </View>
              <View style={styles.errorSlash} />
            </View>
          </View>

          <Text style={styles.errorTitle}>Couldn't load flyers</Text>
          <Text style={styles.errorSubtitle}>
            {flyersError.toLowerCase().includes('network') ||
            flyersError.toLowerCase().includes('connect')
              ? 'Check your internet connection and try again.'
              : 'Something went wrong on our end. Please try again.'}
          </Text>

          {onRetry && (
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={onRetry}
              activeOpacity={0.8}
            >
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}
    </View>
  );
});

const HomeScreen: React.FC = observer(() => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { flyerStore, cartStore, authStore } = useStores();
	const {
	    addToFavorites,
	    banners,
	    bannerError,
	    error: flyersError,
	    fetchBanners,
	    fetchCarousels,
	    fetchCategories,
	    fetchFlyersForCategoryTab,
	    hydrateHomeCache,
	    getLocalFlyersForCategoryTab,
	    isBannersLoading,
	    isCarouselsLoading,
	    isCategoriesLoading,
	    orderedHomeTabs,
	  } = flyerStore;
  const loadCart = cartStore.load;
  const userId = authStore.user?.id;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sectionApiFlyersById, setSectionApiFlyersById] = useState<Record<string, Flyer[]>>({});
  const [sectionLoadCycle, setSectionLoadCycle] = useState(0);

  const [sectionPagination, setSectionPagination] = useState<Record<string, SectionPagination>>({});

	useEffect(() => {
	    // Banners run immediately — do NOT wait for cache hydration
	    void fetchBanners().catch(() => {});
	    void hydrateHomeCache();

	    const task = InteractionManager.runAfterInteractions(() => {
	      void fetchCategories().catch(() => {});
	      setTimeout(() => {
	        void fetchCarousels().catch(() => {});
	      }, 300);
	    });

	    return () => task.cancel();
	  }, [fetchBanners, fetchCarousels, fetchCategories, hydrateHomeCache]);

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
	        fetchCarousels(),
	        fetchCategories(),
	      ]);
	    } finally {
	      setIsRefreshing(false);
	    }
	  }, [fetchBanners, fetchCarousels, fetchCategories]);

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
	          isRecentlyAdded: categoryName === 'Recently Added' || sectionId === 'recently_added',
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
        ctaLabel: b.button_text || b.ctaLabel || 'GET IT',
        imageSource: { uri: b.image_url },
        onCtaPress: () => {
          const tabs = flyerStore.orderedCategoryTabs;
          const linkVal = b.link_value ?? '';

          // Resolve any URL as an in-app route — strips the domain so it works
          // regardless of which environment the admin saved the URL from.
          const resolveUrl = (url: string): boolean => {
            try {
              const path = url.startsWith('http')
                ? url.replace(/^https?:\/\/[^/]+/, '')
                : url;

              // /categories?slug=birthday-flyers  (slug may be first or later param)
              if (path.includes('/categories')) {
                const slugMatch = path.match(/[?&]slug=([^&#\s]+)/);
                if (slugMatch) {
                  const slug = decodeURIComponent(slugMatch[1]);
                  const tab = tabs.find(
                    t =>
                      t.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase() ||
                      t.name.toLowerCase() === slug.toLowerCase(),
                  );
                  navigation.navigate('CategoryFlyers', {
                    categoryId: tab?.id ?? slug,
                    categoryName: tab?.name ?? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                  });
                  return true;
                }
                // /categories with no slug — not useful, let title-fallback handle it
                return false;
              }

              // /flyer/{id}
              const flyerMatch = path.match(/^\/flyer\/([^/?#\s]+)/);
              if (flyerMatch) {
                navigation.navigate('FlyerDetail', { flyerId: flyerMatch[1] });
                return true;
              }
            } catch {}
            return false;
          };

          if (b.link_type !== 'none' && linkVal) {
            if (b.link_type === 'category') {
              // link_value is the plain category name e.g. "Birthday Flyers"
              // but could also be a full URL if admin misconfigured it
              if (resolveUrl(linkVal)) return;
              const tab = tabs.find(t => t.name.toLowerCase() === linkVal.toLowerCase());
              navigation.navigate('CategoryFlyers', {
                categoryId: tab?.id ?? linkVal,
                categoryName: tab?.name ?? linkVal,
              });
              return;
            }
            if (b.link_type === 'flyer') {
              navigation.navigate('FlyerDetail', { flyerId: linkVal });
              return;
            }
            if (b.link_type === 'external') {
              // Always try to handle in-app first — only open the browser
              // for URLs that don't match any internal route pattern
              if (resolveUrl(linkVal)) return;
              Linking.openURL(linkVal).catch(() => {});
              return;
            }
          }

          // Fallback: infer destination from banner title
          const titleLower = b.title.toLowerCase();
          const matched = tabs.find(
            t =>
              titleLower.includes(t.name.toLowerCase()) ||
              t.name.toLowerCase().includes(titleLower),
          );
          if (matched) {
            navigation.navigate('CategoryFlyers', {
              categoryId: matched.id,
              categoryName: matched.name,
            });
            return;
          }

          navigation.navigate('Categories' as never);
        },
      })),
    [banners, navigation, flyerStore],
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

	  const orderedTabs = orderedHomeTabs;
	  const orderedTabsKey = orderedTabs
	    .map(tab => `${tab.id}:${tab.name}`)
	    .join('|');

	  const localSections: LocalHomeSection[] = orderedTabs
	    .map(tab => ({
	      id: tab.id,
	      title: tab.name,
	      data: getLocalFlyersForCategoryTab({
	        categoryName: tab.name,
	        isRecentlyAdded: tab.name === 'Recently Added' || tab.id === 'recently_added',
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
	          isRecentlyAdded: tab.name === 'Recently Added' || tab.id === 'recently_added',
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

	    const isPremiumSection = item.title === 'Premium Flyers';

	    return (
	      <View
	        style={[
	          styles.categorySection,
	          isPremiumSection ? styles.premiumCategorySection : null,
	        ]}
	      >
	        <SectionHeader
          title={item.title}
          onTitlePress={() =>
            navigation.navigate('CategoryFlyers', {
              categoryId: item.id,
              categoryName: item.title,
            })
          }
          onActionPress={() =>
            navigation.navigate('CategoryFlyers', {
              categoryId: item.id,
              categoryName: item.title,
            })
          }
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

  return (
    <View style={styles.container}>
      <FlatList
        data={homeSections}
        renderItem={renderCategorySection}
        keyExtractor={item => item.id}
        style={styles.list}
        ListHeaderComponent={
          <HomeListHeader
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
            isBannersLoading={isBannersLoading}
            mappedBanners={mappedBanners}
            flyersError={flyersError}
            onRetry={handleRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews
        ListEmptyComponent={
          (isCategoriesLoading ||
            isCarouselsLoading ||
            (orderedTabs.length > 0 && !hasSectionApiData && homeSections.length === 0)) ? (
            <>
              <HomeSectionSkeleton />
              <HomeSectionSkeleton />
              <HomeSectionSkeleton />
            </>
          ) : !isCategoriesLoading &&
            !isBannersLoading &&
            !flyersError &&
            !bannerError &&
            homeSections.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No flyers found.</Text>
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
  list: {
    flex: 1,
  },
  searchWrapper: {
    paddingHorizontal: 4,
    paddingTop: 14,
    paddingBottom: 10,
  },
  categorySection: {
    marginTop: 24,
  },
  premiumCategorySection: {
    backgroundColor: `${Colors.primary}E6`,
    paddingTop: 8,
    paddingBottom: 12,
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
  // ─── Error state ──────────────────────────────────────────────────────────
  errorState: {
    marginHorizontal: 24,
    marginVertical: 32,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${Colors.error}33`,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },
  errorIconWrap: {
    marginBottom: 8,
  },
  errorIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${Colors.error}18`,
    borderWidth: 1.5,
    borderColor: `${Colors.error}55`,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  errorSignalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    marginBottom: 4,
  },
  errorSignalBar: {
    width: 7,
    borderRadius: 2,
    backgroundColor: `${Colors.error}50`,
  },
  errorSignalBar1: { height: 8 },
  errorSignalBar2: { height: 14 },
  errorSignalBar3: { height: 20 },
  errorSignalBar4: { height: 26 },
  errorSlash: {
    position: 'absolute',
    width: 50,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: Colors.error,
    transform: [{ rotate: '-40deg' }],
  },
  errorTitle: {
    fontSize: 17,
    fontFamily: 'Geist-Bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  errorSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: Colors.error,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Geist-SemiBold',
    letterSpacing: 0.3,
  },
  // ─── Empty state ──────────────────────────────────────────────────────────
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});

export default HomeScreen;
