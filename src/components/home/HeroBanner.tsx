// components/home/HeroBanner.tsx

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  ImageSourcePropType,
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
  description?: string;
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
  description,
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
        {description && <Text style={styles.description}>{description}</Text>}

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
  const [loadedBannerIds, setLoadedBannerIds] = useState<Record<string, boolean>>({});
  const [failedBannerIds, setFailedBannerIds] = useState<Record<string, boolean>>({});

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
        renderItem={({ item }) => {
          const itemId = String(item.id);
          const hasLoaded = !!loadedBannerIds[itemId];
          const hasFailed = !!failedBannerIds[itemId];

          return (
            <View style={styles.slide}>
              <ImageBackground
                source={item.imageSource}
                style={styles.image}
                resizeMode="cover"
                onLoad={() => {
                  setLoadedBannerIds(prev => ({ ...prev, [itemId]: true }));
                }}
                onError={event => {
                  console.error('[HeroBanner] failed to load banner image', {
                    id: itemId,
                    source: item.imageSource,
                    error: event.nativeEvent?.error,
                  });
                  setFailedBannerIds(prev => ({ ...prev, [itemId]: true }));
                }}
              >
                {!hasLoaded && !hasFailed ? <View style={styles.loadingOverlay} /> : null}
                <View style={styles.content}>
                  <Text style={styles.title}>{item.title}</Text>
                  {item.description ? (
                    <Text style={styles.description}>{item.description}</Text>
                  ) : null}

                  <TouchableOpacity
                    style={styles.ctaButton}
                    onPress={item.onCtaPress}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.ctaText}>{item.ctaLabel || 'Explore'}</Text>
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </View>
          );
        }}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111114',
  },
  content: {
    padding: 20,
    paddingBottom: 22,
  },
  tag: {
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.primary,
    letterSpacing: 1.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: Typography.fontSizes.xl,
    fontFamily: Typography.fontFamilies.black,
    color: Colors.textPrimary,
    lineHeight: 32,
    marginBottom: 8,
    maxWidth: '80%',
  },
  description: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
    maxWidth: '85%',
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
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textInverse,
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
