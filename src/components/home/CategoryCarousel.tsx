// components/home/CategoryCarousel.tsx

import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import SectionHeader from './SectionHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const CAT_CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.36);
const CARD_HEIGHT = Math.round(CAT_CARD_WIDTH * (4 / 3));
const ITEM_GAP = 12;
const H_PADDING = 16;

const CARD_COLORS = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#2d132c', '#1b262c', '#1c3144', '#3d5a80',
  '#2b2d42', '#1a1a1a',
];

const getCardColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return CARD_COLORS[hash % CARD_COLORS.length];
};

export interface CategoryItem {
  id: string;
  name: string;
  thumbnail?: string;
}

interface CardProps {
  item: CategoryItem;
  onPress: (item: CategoryItem) => void;
}

const CategoryCard: React.FC<CardProps> = ({ item, onPress }) => {
  const imageOpacity = useRef(new Animated.Value(0)).current;

  const handleLoad = useCallback(() => {
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [imageOpacity]);

  return (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={() => onPress(item)}
      activeOpacity={0.82}
    >
      <View style={styles.card}>
        {/* Deterministic color base */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: getCardColor(item.name) }]} />

        {/* Image fades in over the color base */}
        {item.thumbnail ? (
          <Animated.Image
            source={{ uri: item.thumbnail }}
            style={[StyleSheet.absoluteFill, { opacity: imageOpacity }]}
            resizeMode="cover"
            onLoadEnd={handleLoad}
          />
        ) : null}

        {/* Gradient simulation: subtle full overlay + heavy bottom overlay */}
        <View style={styles.fullOverlay} />
        <View style={styles.bottomOverlay} />

        {/* Explore badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Explore</Text>
        </View>
      </View>

      <Text style={styles.categoryName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

interface CategoryCarouselProps {
  categories: CategoryItem[];
  onCategoryPress: (item: CategoryItem) => void;
  onSeeAll?: () => void;
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories,
  onCategoryPress,
  onSeeAll,
}) => {
  if (!categories || categories.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader
        title="Popular Categories"
        actionLabel="See All"
        onActionPress={onSeeAll}
      />
      <FlatList
        horizontal
        data={categories}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CategoryCard item={item} onPress={onCategoryPress} />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: ITEM_GAP }} />}
        getItemLayout={(_, index) => ({
          length: CAT_CARD_WIDTH + ITEM_GAP,
          offset: H_PADDING + index * (CAT_CARD_WIDTH + ITEM_GAP),
          index,
        })}
        initialNumToRender={4}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  listContent: {
    paddingHorizontal: H_PADDING,
  },
  cardWrapper: {
    width: CAT_CARD_WIDTH,
    alignItems: 'center',
  },
  card: {
    width: CAT_CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 14,
  },
  badge: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: Typography.fontSizes.xs,
    fontFamily: Typography.fontFamilies.semiBold,
    color: Colors.textPrimary,
    letterSpacing: 0.4,
  },
  categoryName: {
    marginTop: 8,
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.semiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    maxWidth: CAT_CARD_WIDTH,
  },
});

export default CategoryCarousel;
