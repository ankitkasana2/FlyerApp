// components/home/HeroBanner.tsx

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  FlatList,
  Dimensions,
  ImageSourcePropType,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewToken,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = SCREEN_WIDTH * 0.56; // ~16:9 feel

// ─── Types ────────────────────────────────────────────────────────────────────
export interface BannerSlide {
  id: string;
  tag?: string;
  title: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  imageSource: ImageSourcePropType;
}

export interface HeroBannerProps {
  slides: BannerSlide[];
  autoPlayInterval?: number; // ms, default 4000
}

// ─── Single Slide ─────────────────────────────────────────────────────────────
const SlideItem: React.FC<BannerSlide> = ({
  tag = 'NEW ARRIVAL',
  title,
  ctaLabel = 'Explore',
  onCtaPress,
  imageSource,
}) => (
  <View style={styles.slide}>
    <ImageBackground
      source={imageSource}
      style={styles.image}
      resizeMode="cover"
    >


      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={onCtaPress}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────
const HeroBanner: React.FC<HeroBannerProps> = ({
  slides,
  autoPlayInterval = 4000,
}) => {
  const flatListRef = useRef<FlatList<BannerSlide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoPlay = useCallback(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % slides.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, autoPlayInterval);
  }, [slides.length, autoPlayInterval]);

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoPlay();
    return stopAutoPlay;
  }, [startAutoPlay, stopAutoPlay]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  if (!slides || slides.length === 0) return null;

  return (
    <View style={styles.outerWrapper}>
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScrollBeginDrag={stopAutoPlay}
        onScrollEndDrag={startAutoPlay}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        renderItem={({ item }) => <SlideItem {...item} />}
      />

      {/* Pagination dots */}
      {slides.length > 1 && (
        <View style={styles.dotsContainer}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outerWrapper: {
    overflow: 'hidden',
  },
  slide: {
    width: SCREEN_WIDTH,
  },
  image: {
    width: '100%',
    height: BANNER_HEIGHT,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  content: {
    padding: 20,
    paddingBottom: 22,
  },
  tag: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
    letterSpacing: 1.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.black,
    color: Colors.textPrimary,
    lineHeight: 36,
    marginBottom: 18,
    maxWidth: '65%',
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: 8,
  },
  ctaText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
});

export default HeroBanner;
