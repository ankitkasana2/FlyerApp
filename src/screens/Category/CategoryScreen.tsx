// screens/CategoryScreen.tsx

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  ListRenderItem,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import { useEffect } from 'react';

// Theme
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

// Common components
import SearchBar from '../../components/common/SearchBar';

// Category components
import CategoryTabs, { CategoryTab } from './CategoryTabs';
import SortButton, { SortOption } from './SortButton';
import FlyerCard, {
  CARD_GAP,
  HORIZONTAL_PADDING,
} from '../../components/home/FlyerCard';
import { useNavigation } from '@react-navigation/native';
import type { Flyer } from '../../types/flyer';

// ─── Static data ──────────────────────────────────────────────────────────────
const DEFAULT_CATEGORY_TABS: CategoryTab[] = [
  { id: 'recently_added', label: 'RECENTLY ADDED' },
];

const SORT_OPTIONS: SortOption[] = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'price_low', label: 'Price: Low to High' },
  { id: 'price_high', label: 'Price: High to Low' },
  { id: 'popular', label: 'Most Popular' },
];

// ─── Row pair type ────────────────────────────────────────────────────────────
type FlyerRow = [Flyer, Flyer | null];

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ─── CategoryScreen ───────────────────────────────────────────────────────────
const CategoryScreen: React.FC = observer(() => {
  const navigation = useNavigation();
  const { flyerStore } = useStores();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabId, setActiveTabId] = useState('recently_added');
  const [sortId, setSortId] = useState('newest');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  // ── Fetch categories on mount ──────────────────────────────────────────────
  useEffect(() => {
    flyerStore.fetchCategories();
  }, [flyerStore]);

  // ── Derived Sort Parameters ────────────────────────────────────────────────
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

  // ── Fetch flyers when tab or sort changes ──────────────────────────────────
  useEffect(() => {
    const isRecentlyAdded = activeTabId === 'recently_added';
    const selectedTab = categoryTabs.find(t => t.id === activeTabId);
    const categoryName = isRecentlyAdded ? undefined : (selectedTab as any)?.name || activeTabId;
    const templateType = selectedTemplates.length > 0 ? selectedTemplates.join(',') : undefined;

    if (!isRecentlyAdded && categoryName) {
      // Try to find local flyers first from the master cache
      const nameLower = categoryName.toLowerCase();
      const matched = flyerStore.allFlyers.filter(f => {
        const cat = f.category?.toLowerCase();
        const cats = f.categories?.map(c => c.toLowerCase()) || [];
        const isCatMatch = cat === nameLower || cats.includes(nameLower);
        
        // Also respect template filter locally if active
        if (!isCatMatch) return false;
        if (selectedTemplates.length > 0) {
          return selectedTemplates.includes(String(f.template_type));
        }
        return true;
      });

      if (matched.length > 0) {
        // Update current display with shuffled local matches from cache
        flyerStore.setFlyers(shuffleArray(matched));
        flyerStore.page = 1;
        flyerStore.hasMore = true;
        return;
      }
    }

    // If recently_added or no local matches, fetch from API
    flyerStore.fetchFlyers(
      true,
      sortParams.sortBy,
      sortParams.sortDir,
      categoryName,
      templateType,
    );
  }, [flyerStore, activeTabId, sortParams, categoryTabs, selectedTemplates]);

  // ── Load more ──────────────────────────────────────────────────────────────
  const handleLoadMore = useCallback(async () => {
    const isRecentlyAdded = activeTabId === 'recently_added';
    const selectedTab = categoryTabs.find(t => t.id === activeTabId);
    const categoryName = isRecentlyAdded ? undefined : (selectedTab as any)?.name || activeTabId;
    const templateType = selectedTemplates.length > 0 ? selectedTemplates.join(',') : undefined;

    if (flyerStore.hasMore && !flyerStore.isFetchingNextPage && !flyerStore.isLoading) {
      flyerStore.fetchFlyers(
        false,
        sortParams.sortBy,
        sortParams.sortDir,
        categoryName,
        templateType,
      );
    }
  }, [flyerStore, activeTabId, sortParams, categoryTabs, selectedTemplates]);

  // ── Combine static + dynamic tabs ──────────────────────────────────────────
  const categoryTabs = useMemo<CategoryTab[]>(() => {
    const dynamicTabs = flyerStore.categories
      .map(cat => ({
        id: String(cat._id || cat.id),
        name: String(cat.name || cat.label || ''), // Keep original name for API
        label: String(cat.name || cat.label || '').toUpperCase(),
      }))
      .filter(tab => !DEFAULT_CATEGORY_TABS.some(dt => dt.label === tab.label));
    return [...DEFAULT_CATEGORY_TABS, ...dynamicTabs];
  }, [flyerStore.categories]);

  // ── Active tab label ───────────────────────────────────────────────────────
  const activeTabLabel = useMemo(
    () => categoryTabs.find(t => t.id === activeTabId)?.label ?? '',
    [activeTabId, categoryTabs],
  );

  // ── Filtered + searched flyers ─────────────────────────────────────────────
  const filteredFlyers = useMemo(() => {
    let result = [...flyerStore.flyers];
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
  }, [flyerStore.flyers, searchQuery]);

  // ── Pair flyers into rows of 2 ─────────────────────────────────────────────
  const flyerRows = useMemo<FlyerRow[]>(() => {
    const rows: FlyerRow[] = [];
    for (let i = 0; i < filteredFlyers.length; i += 2) {
      rows.push([filteredFlyers[i], filteredFlyers[i + 1] ?? null]);
    }
    return rows;
  }, [filteredFlyers]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleToggleTemplate = (id: string) => {
    setSelectedTemplates(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };
  const handleFavorite = useCallback((id: string) => {
    flyerStore.toggleFavourite(id);
  }, [flyerStore]);

  const handleCardPress = useCallback(
    (id: string) => {
      navigation.navigate('FlyerDetail' as never, { flyerId: id } as never);
    },
    [navigation],
  );

  const handleTabPress = useCallback((id: string) => {
    setActiveTabId(id);
    // Fetch new data for the selected tab
  }, []);

  // ── Row renderer ───────────────────────────────────────────────────────────
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
          // Empty spacer to keep grid aligned
          <View style={styles.emptyCardSpacer} />
        )}
      </View>
    ),
    [handleCardPress, handleFavorite],
  );

  // ── List header ────────────────────────────────────────────────────────────
  const ListHeader = (
    <View style={styles.listHeader}>
      {/* Search bar — reusing global component, no filter icon */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search premium flyers..."
        />
      </View>

      {/* Category tabs */}
      <View style={styles.tabsWrapper}>
        <CategoryTabs
          tabs={categoryTabs}
          activeTabId={activeTabId}
          onTabPress={handleTabPress}
        />
      </View>

      {/* Section title + sort */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{activeTabLabel}</Text>
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

  // ── List footer (loader) ──────────────────────────────────────────────────
  const ListFooter = () => {
    // Show footer loader if we are fetching next page OR 
    // Show footer loader if we are fetching next page OR 
    // if we are loading initial data for a category but already have some flyers visible
    if (flyerStore.isFetchingNextPage || (flyerStore.isLoading && filteredFlyers.length > 0)) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      );
    }
    return null;
  };

  // ── Empty state ────────────────────────────────────────────────────────────
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
        ListEmptyComponent={!flyerStore.isLoading ? ListEmpty : null}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.rowGap} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
      
      {/* Initial Loading Overlay */}
      {flyerStore.isLoading && 
       flyerStore.flyers.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </View>
  )
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default CategoryScreen;
