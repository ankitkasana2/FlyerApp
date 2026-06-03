import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStores } from '../../stores/StoreContext';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import ScreenHeader from '../../components/common/ScreenHeader';
import FlyerCard, { CARD_GAP, HORIZONTAL_PADDING } from '../../components/home/FlyerCard';
import type { Flyer } from '../../types/flyer';
import type { AppStackParamList } from '../../navigation/types';

type RouteProps = RouteProp<AppStackParamList, 'CategoryFlyers'>;

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

const CategoryFlyersScreen: React.FC = observer(() => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProps>();
  const { categoryId, categoryName } = route.params;

  const { flyerStore } = useStores();

  const [visibleFlyers, setVisibleFlyers] = useState<Flyer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isApiStarted, setIsApiStarted] = useState(false);

  const isRecentlyAdded = categoryName === 'Recently Added' || categoryId === 'recently_added';

  // Seed with local cache immediately
  useEffect(() => {
    const local = flyerStore.getLocalFlyersForCategoryTab({
      categoryName,
      isRecentlyAdded,
      sortBy: 'created_at',
      sortDir: 'desc',
    });
    setVisibleFlyers(local);
  }, [flyerStore, categoryName, isRecentlyAdded]);

  const handleLoadMore = useCallback(async () => {
    if (isLoading || flyerStore.isLoading || flyerStore.isFetchingNextPage) return;

    if (!isApiStarted) {
      setIsApiStarted(true);
      setIsLoading(true);
      try {
        flyerStore.resetPaginationState();
        flyerStore.limit = 20;
        await flyerStore.fetchFlyers(
          true,
          'created_at',
          'desc',
          isRecentlyAdded ? undefined : categoryName,
          undefined,
        );
        setVisibleFlyers([...flyerStore.flyers]);
        setHasMore(flyerStore.hasMore);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!hasMore) return;

    setIsLoading(true);
    try {
      flyerStore.limit = 20;
      await flyerStore.fetchFlyers(
        false,
        'created_at',
        'desc',
        isRecentlyAdded ? undefined : categoryName,
        undefined,
      );
      setVisibleFlyers([...flyerStore.flyers]);
      setHasMore(flyerStore.hasMore);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, flyerStore, isApiStarted, hasMore, isRecentlyAdded, categoryName]);

  const handleCardPress = useCallback(
    (id: string) => {
      navigation.navigate('FlyerDetail', { flyerId: id });
    },
    [navigation],
  );

  const handleFavoritePress = useCallback(
    (id: string) => {
      flyerStore.toggleFavourite(id);
    },
    [flyerStore],
  );

  const flyerRows = useMemo<FlyerRow[]>(() => {
    const rows: FlyerRow[] = [];
    for (let i = 0; i < visibleFlyers.length; i += 2) {
      rows.push([visibleFlyers[i], visibleFlyers[i + 1] ?? null]);
    }
    return rows;
  }, [visibleFlyers]);

  const renderRow: ListRenderItem<FlyerRow> = useCallback(
    ({ item: [left, right] }) => (
      <View style={styles.row}>
        <FlyerCard
          id={String(left._id ?? left.id)}
          title={left.title}
          price={formatPrice(left.price)}
          imageSource={getFlyerImage(left)}
          isPremium={left.isPremium}
          isFavorited={left.isFavorited}
          onPress={handleCardPress}
          onFavoritePress={handleFavoritePress}
        />
        {right ? (
          <FlyerCard
            id={String(right._id ?? right.id)}
            title={right.title}
            price={formatPrice(right.price)}
            imageSource={getFlyerImage(right)}
            isPremium={right.isPremium}
            isFavorited={right.isFavorited}
            onPress={handleCardPress}
            onFavoritePress={handleFavoritePress}
          />
        ) : (
          <View style={styles.emptyCardSpacer} />
        )}
      </View>
    ),
    [handleCardPress, handleFavoritePress],
  );

  const ListFooter = () => {
    if (isLoading) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title={categoryName}
        onBackPress={() => navigation.goBack()}
      />
      <FlatList
        data={flyerRows}
        keyExtractor={(_, index) => `row_${index}`}
        renderItem={renderRow}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No flyers found</Text>
              <Text style={styles.emptySubtitle}>
                Check back later for new {categoryName} flyers.
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.rowGap} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 32,
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
    fontFamily: Typography.fontFamilies.bold,
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

export default CategoryFlyersScreen;
