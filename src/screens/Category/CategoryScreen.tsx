import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ListRenderItem,
  ActivityIndicator,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';

import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

import SearchBar from '../../components/common/SearchBar';
import CategoryTabs from './CategoryTabs';
import SortButton, { SortOption } from './SortButton';
import FlyerCard, {
  CARD_GAP,
  HORIZONTAL_PADDING,
} from '../../components/home/FlyerCard';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { Flyer } from '../../types/flyer';
import type { AppStackParamList } from '../../navigation/types';

const SORT_OPTIONS: SortOption[] = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'price_low', label: 'Price: Low to High' },
  { id: 'price_high', label: 'Price: High to Low' },
  { id: 'popular', label: 'Most Popular' },
];

type FlyerRow = [Flyer, Flyer | null];

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

const CategoryScreen: React.FC = observer(() => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { flyerStore } = useStores();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabId, setActiveTabId] = useState('recently_added');
  const [sortId, setSortId] = useState('newest');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  const [category, setCategory] = useState('Recently Added');
  const [visibleFlyers, setVisibleFlyers] = useState<Flyer[]>([]);
  const [flyersLoading, setFlyersLoading] = useState(false);
  const [flyersHasMore, setFlyersHasMore] = useState(true);
  const [isApiModeStarted, setIsApiModeStarted] = useState(false);
  const [startedQueryKey, setStartedQueryKey] = useState<string | null>(null);

  useEffect(() => {
    flyerStore.fetchCategories();
  }, [flyerStore]);

  const sortParams = useMemo(() => {
    let sortBy = 'created_at';
    let sortDir: 'asc' | 'desc' = 'desc';

    if (sortId === 'oldest') {
      sortDir = 'asc';
    } else if (sortId === 'price_low') {
      sortBy = 'price';
      sortDir = 'asc';
    } else if (sortId === 'price_high') {
      sortBy = 'price';
      sortDir = 'desc';
    } else if (sortId === 'popular') {
      sortBy = 'popularity';
    }

    return { sortBy, sortDir };
  }, [sortId]);

  const categoryTabs = flyerStore.orderedCategoryTabs;

  const queryContext = useMemo(() => {
    const isRecentlyAdded = activeTabId === 'recently_added';
    const selectedTab = categoryTabs.find(t => t.id === activeTabId);
    const categoryName = isRecentlyAdded
      ? 'Recently Added'
      : (selectedTab?.name || activeTabId);
    const apiCategory = isRecentlyAdded ? undefined : categoryName;
    const templateType = selectedTemplates.length > 0 ? selectedTemplates.join(',') : undefined;
    const queryKey = `${categoryName}::${sortParams.sortBy}::${sortParams.sortDir}::${templateType || ''}`;

    return {
      categoryName,
      apiCategory,
      templateType,
      isRecentlyAdded,
      queryKey,
    };
  }, [activeTabId, categoryTabs, selectedTemplates, sortParams]);

  const localCategoryFlyers = useMemo(() => {
    return flyerStore.getLocalFlyersForCategoryTab({
      categoryName: queryContext.categoryName,
      isRecentlyAdded: queryContext.isRecentlyAdded,
      sortBy: sortParams.sortBy,
      sortDir: sortParams.sortDir,
      templateType: selectedTemplates.length > 0 ? selectedTemplates.join(',') : undefined,
    });
  }, [flyerStore, queryContext, selectedTemplates, sortParams]);

  useEffect(() => {
    setCategory(queryContext.categoryName);
    setVisibleFlyers(localCategoryFlyers);
    setIsApiModeStarted(false);
    setStartedQueryKey(null);
    setFlyersHasMore(true);
    setFlyersLoading(false);
    flyerStore.resetPaginationState();
  }, [queryContext, localCategoryFlyers, flyerStore]);

  const handleLoadMore = useCallback(async () => {
    if (flyersLoading || flyerStore.isLoading || flyerStore.isFetchingNextPage) {
      return;
    }

    if (!isApiModeStarted) {
      if (startedQueryKey === queryContext.queryKey) {
        return;
      }

      setStartedQueryKey(queryContext.queryKey);
      setIsApiModeStarted(true);
      setFlyersLoading(true);

      try {
        flyerStore.resetPaginationState();
        flyerStore.limit = 15;

        await flyerStore.fetchFlyers(
          true,
          sortParams.sortBy,
          sortParams.sortDir,
          queryContext.apiCategory,
          queryContext.templateType,
        );

        setVisibleFlyers([...flyerStore.flyers]);
        setFlyersHasMore(flyerStore.hasMore);
      } finally {
        setFlyersLoading(false);
      }
      return;
    }

    if (!flyersHasMore) {
      return;
    }

    setFlyersLoading(true);
    try {
      flyerStore.limit = 15;
      await flyerStore.fetchFlyers(
        false,
        sortParams.sortBy,
        sortParams.sortDir,
        queryContext.apiCategory,
        queryContext.templateType,
      );
      setVisibleFlyers([...flyerStore.flyers]);
      setFlyersHasMore(flyerStore.hasMore);
    } finally {
      setFlyersLoading(false);
    }
  }, [
    flyersLoading,
    flyerStore,
    isApiModeStarted,
    startedQueryKey,
    queryContext,
    sortParams,
    flyersHasMore,
  ]);

  const activeTabLabel = useMemo(
    () => categoryTabs.find(t => t.id === activeTabId)?.label ?? '',
    [activeTabId, categoryTabs],
  );

  const filteredFlyers = useMemo(() => {
    let result = [...visibleFlyers];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        f =>
          f.title.toLowerCase().includes(q) ||
          (f.category && String(f.category).toLowerCase().includes(q)) ||
          (f.categories && f.categories.some(c => String(c).toLowerCase().includes(q))),
      );
    }
    return result;
  }, [visibleFlyers, searchQuery]);

  const flyerRows = useMemo<FlyerRow[]>(() => {
    const rows: FlyerRow[] = [];
    for (let i = 0; i < filteredFlyers.length; i += 2) {
      rows.push([filteredFlyers[i], filteredFlyers[i + 1] ?? null]);
    }
    return rows;
  }, [filteredFlyers]);

  const handleToggleTemplate = (id: string) => {
    setSelectedTemplates(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id],
    );
  };

  const handleFavorite = useCallback((id: string) => {
    flyerStore.toggleFavourite(id);
  }, [flyerStore]);

  const handleCardPress = useCallback(
    (id: string) => {
      navigation.navigate('FlyerDetail', { flyerId: id });
    },
    [navigation],
  );

  const handleTabPress = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  const renderRow: ListRenderItem<FlyerRow> = useCallback(
    ({ item: [left, right] }) => (
      <View style={styles.row}>
        <FlyerCard
          id={String(left._id ?? left.id)}
          title={left.title}
          brand={left.category || (left.categories && left.categories[0])}
          price={formatPrice(left.price)}
          imageSource={getFlyerImage(left)}
          isPremium={left.isPremium}
          isFavorited={left.isFavorited}
          onPress={handleCardPress}
          onFavoritePress={handleFavorite}
        />

        {right ? (
          <FlyerCard
            id={String(right._id ?? right.id)}
            title={right.title}
            brand={right.category || (right.categories && right.categories[0])}
            price={formatPrice(right.price)}
            imageSource={getFlyerImage(right)}
            isPremium={right.isPremium}
            isFavorited={right.isFavorited}
            onPress={handleCardPress}
            onFavoritePress={handleFavorite}
          />
        ) : (
          <View style={styles.emptyCardSpacer} />
        )}
      </View>
    ),
    [handleCardPress, handleFavorite],
  );

  const ListHeader = (
    <View style={styles.listHeader}>
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search premium flyers..."
        />
      </View>

      <View style={styles.tabsWrapper}>
        <CategoryTabs
          tabs={categoryTabs}
          activeTabId={activeTabId}
          onTabPress={handleTabPress}
        />
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{activeTabLabel || category.toUpperCase()}</Text>
        <SortButton
          options={SORT_OPTIONS}
          selectedId={sortId}
          onSelect={setSortId}
          selectedTemplates={selectedTemplates}
          onToggleTemplate={handleToggleTemplate}
        />
      </View>
    </View>
  );

  const ListFooter = () => {
    if (flyersLoading || flyerStore.isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      );
    }
    return null;
  };

  const ListEmpty = (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No flyers found</Text>
      <Text style={styles.emptySubtitle}>
        Try a different search term or category.
      </Text>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <FlatList
        data={flyerRows}
        keyExtractor={(_, index) => `row_${index}`}
        renderItem={renderRow}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={!flyersLoading ? ListEmpty : null}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.rowGap} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: 32,
  },
  listHeader: {
    gap: 0,
    marginBottom: 20,
  },
  searchWrapper: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
    paddingBottom: 16,
  },
  tabsWrapper: {
    marginBottom: 22,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.black,
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: CARD_GAP,
  },
  rowGap: {
    height: CARD_GAP + 6,
  },
  emptyCardSpacer: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default CategoryScreen;
