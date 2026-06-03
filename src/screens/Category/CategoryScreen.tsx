// screens/Category/CategoryScreen.tsx

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useStores } from '../../stores/StoreContext';
import SearchBar from '../../components/common/SearchBar';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import type { AppStackParamList } from '../../navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const H_PADDING = 16;
const COLUMN_GAP = 10;
const CARD_WIDTH  = Math.floor((SCREEN_WIDTH - H_PADDING * 2 - COLUMN_GAP) / 2);
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.42);

// ─── Gradient scrim ────────────────────────────────────────────────────────────
const SCRIM_STRIPS: { h: number; o: number }[] = [
  { h: 8,  o: 0.00 },
  { h: 8,  o: 0.04 },
  { h: 10, o: 0.12 },
  { h: 12, o: 0.24 },
  { h: 13, o: 0.40 },
  { h: 14, o: 0.58 },
  { h: 16, o: 0.74 },
  { h: 18, o: 0.86 },
  { h: 52, o: 0.94 },
];
const SCRIM_HEIGHT = SCRIM_STRIPS.reduce((s, r) => s + r.h, 0);

// ─── Unique fallback colour per category name ──────────────────────────────────
const FALLBACK_PALETTE = [
  '#1a1a2e', '#16213e', '#0f3460', '#1b1b2f',
  '#162447', '#1f4068', '#2c003e', '#1a0933',
  '#0d1b2a', '#1c2541', '#0b132b', '#1d2d44',
];
function categoryColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h * 31) + name.charCodeAt(i)) >>> 0;
  return FALLBACK_PALETTE[h % FALLBACK_PALETTE.length];
}

// ─── Types ─────────────────────────────────────────────────────────────────────
type CategoryItem = {
  id:           string;
  name:         string;
  thumbnailUri: string | null;
};

// ─── Scrim rows (shared, no re-allocation per card) ───────────────────────────
const ScrimRows = () => (
  <View style={styles.scrimContainer} pointerEvents="none">
    {SCRIM_STRIPS.map((s, i) => (
      <View key={i} style={{ height: s.h, backgroundColor: `rgba(0,0,0,${s.o})` }} />
    ))}
  </View>
);

// ─── Fallback placeholder (shown while lazy fetch is in flight) ────────────────
const FallbackCard = React.memo<{ name: string }>(({ name }) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 950, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 950, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const shimmerOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 0.14] });

  return (
    <View style={[styles.cardInner, { backgroundColor: categoryColor(name) }]}>
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: '#fff', opacity: shimmerOpacity }]}
        pointerEvents="none"
      />
      <ScrimRows />
      <View style={styles.nameOverlay}>
        <Text style={styles.categoryName} numberOfLines={2}>{name}</Text>
      </View>
    </View>
  );
});

// ─── Category card ─────────────────────────────────────────────────────────────
const CategoryCard = React.memo<{
  item:    CategoryItem;
  onPress: (item: CategoryItem) => void;
}>(({ item, onPress }) => {
  const scale        = useRef(new Animated.Value(1)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;

  const onPressIn  = useCallback(() =>
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 40, bounciness: 4 }).start(),
  [scale]);

  const onPressOut = useCallback(() =>
    Animated.spring(scale, { toValue: 1,    useNativeDriver: true, friction: 5, tension: 120 }).start(),
  [scale]);

  const onImageLoad = useCallback(() =>
    Animated.timing(imageOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start(),
  [imageOpacity]);

  const handlePress = useCallback(() => onPress(item), [item, onPress]);

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        {item.thumbnailUri ? (
          <ImageBackground
            source={{ uri: item.thumbnailUri }}
            style={styles.cardInner}
            resizeMode="cover"
            onLoad={onImageLoad}
          >
            {/* Colour skeleton fades away once the image is ready */}
            <Animated.View
              style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: categoryColor(item.name) },
                { opacity: imageOpacity.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
              ]}
              pointerEvents="none"
            />
            <ScrimRows />
            <View style={styles.nameOverlay}>
              <Text style={styles.categoryName} numberOfLines={2}>{item.name}</Text>
            </View>
          </ImageBackground>
        ) : (
          <FallbackCard name={item.name} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

// ─── Main screen ───────────────────────────────────────────────────────────────
const CategoryScreen: React.FC = observer(() => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { flyerStore } = useStores();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { flyerStore.fetchCategories(); }, [flyerStore]);

  // ── Lazy fetch for categories with no local data ─────────────────────────────
  // Fetch with limit=6 so the uniqueness filter below has several URIs to choose
  // from even if the first one is already claimed by another category.
  useEffect(() => {
    const tabs = flyerStore.orderedCategoryTabs;
    if (!tabs.length) return;

    tabs.forEach((tab, idx) => {
      const isRecentlyAdded = tab.id === 'recently_added';
      const hasLocal = flyerStore.getLocalFlyersForCategoryTab({
        categoryName: tab.name, isRecentlyAdded, sortBy: 'created_at', sortDir: 'desc',
      }).length > 0;

      const nameLower = tab.name.toLowerCase();
      const hasSemantic =
        (nameLower.includes('premium') && flyerStore.premiumFlyers.length > 0) ||
        (nameLower.includes('basic')   && flyerStore.basicFlyers.length  > 0);

      if (!hasLocal && !hasSemantic) {
        setTimeout(() => {
          flyerStore.fetchFlyersForCategoryTab({
            categoryName: tab.name, isRecentlyAdded,
            sortBy: 'created_at', sortDir: 'desc', limit: 6,
          }).catch(() => {});
        }, idx * 150);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyerStore.orderedCategoryTabs.length]);

  // ── Build category items — one pass, shared usedUris set ─────────────────────
  //
  // KEY FIX: flyers are multi-tagged, so the same flyer image can appear as the
  // first result for several categories (e.g. "Fantastic Saturday" is tagged
  // "drink flyers", "beach party", AND "brunch").  We solve this by keeping a
  // Set of URIs that have already been assigned.  When a category's first
  // candidate is taken, we walk to the next candidate in its list, guaranteeing
  // every visible card shows a distinct image.
  //
  // This runs inside observer so MobX re-evaluates it whenever allFlyers or
  // orderedCategoryTabs changes (e.g. after a lazy fetch completes).
  const getUri = (f?: { image_url?: string | null; imageUrl?: string | null; image?: string | null } | null) =>
    f ? (f.image_url ?? f.imageUrl ?? f.image ?? null) : null;

  const usedUris = new Set<string>();

  const categoryItems: CategoryItem[] = flyerStore.orderedCategoryTabs.map(tab => {
    const isRecentlyAdded = tab.id === 'recently_added';
    const nameLower       = tab.name.trim().toLowerCase();

    // Gather candidates for this category (most-recent first)
    let candidates = flyerStore.getLocalFlyersForCategoryTab({
      categoryName: tab.name, isRecentlyAdded, sortBy: 'created_at', sortDir: 'desc',
    });

    // Semantic fallbacks when exact match returns nothing
    if (candidates.length === 0 && !isRecentlyAdded) {
      if (nameLower.includes('premium')) candidates = [...flyerStore.premiumFlyers];
      else if (nameLower.includes('basic')) candidates = [...flyerStore.basicFlyers];
    }

    // Walk the candidate list until we find a URI not yet used by another card
    let thumbnailUri: string | null = null;
    for (const flyer of candidates) {
      const uri = getUri(flyer);
      if (uri && !usedUris.has(uri)) {
        thumbnailUri = uri;
        usedUris.add(uri);
        break;
      }
    }

    return { id: tab.id, name: tab.name, thumbnailUri };
  });

  // ── Search filter ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categoryItems;
    return categoryItems.filter(i => i.name.toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, categoryItems.length, flyerStore.allFlyers.length]);

  const rows = useMemo(() => {
    const r: [CategoryItem, CategoryItem | null][] = [];
    for (let i = 0; i < filtered.length; i += 2) r.push([filtered[i], filtered[i + 1] ?? null]);
    return r;
  }, [filtered]);

  const handlePress = useCallback(
    (item: CategoryItem) => navigation.navigate('CategoryFlyers', { categoryId: item.id, categoryName: item.name }),
    [navigation],
  );

  const renderRow = useCallback(
    ({ item: [left, right] }: { item: [CategoryItem, CategoryItem | null] }) => (
      <View style={styles.row}>
        <CategoryCard item={left}  onPress={handlePress} />
        {right ? <CategoryCard item={right} onPress={handlePress} /> : <View style={styles.spacer} />}
      </View>
    ),
    [handlePress],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={rows}
        keyExtractor={(_, i) => `cat_row_${i}`}
        renderItem={renderRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Categories</Text>
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search categories..." />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{searchQuery ? 'No categories found' : 'Loading categories…'}</Text>
            {searchQuery ? <Text style={styles.emptySubtitle}>Try a different search term.</Text> : null}
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: COLUMN_GAP }} />}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
      />
    </View>
  );
});

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.background },
  listContent: { paddingHorizontal: H_PADDING, paddingBottom: 32 },

  header:    { paddingTop: 14, paddingBottom: 18, gap: 14 },
  pageTitle: {
    fontSize:    Typography.fontSizes['2xl'],
    fontFamily:  Typography.fontFamilies.black,
    color:       Colors.textPrimary,
    letterSpacing: 0.2,
  },

  row:    { flexDirection: 'row', gap: COLUMN_GAP },
  spacer: { width: CARD_WIDTH },

  card: {
    width: CARD_WIDTH, height: CARD_HEIGHT,
    borderRadius: 18, overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  cardTouchable: { flex: 1 },
  cardInner:     { width: '100%', height: '100%', justifyContent: 'flex-end' },

  scrimContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: SCRIM_HEIGHT,
  },

  nameOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 52,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 10, paddingBottom: 6,
  },
  categoryName: {
    fontSize:     13,
    fontFamily:   Typography.fontFamilies.black,
    color:        '#FFFFFF',
    textAlign:    'center',
    letterSpacing: 0.4,
    lineHeight:   18,
    textShadowColor:  'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle:    { fontSize: Typography.fontSizes.base, fontFamily: Typography.fontFamilies.semiBold, color: Colors.textPrimary },
  emptySubtitle: { fontSize: Typography.fontSizes.sm,   color: Colors.textSecondary },
});

export default CategoryScreen;
