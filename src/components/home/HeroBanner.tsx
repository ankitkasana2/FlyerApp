// components/home/HeroBanner.tsx

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  FlatList,
  Dimensions,
  ImageSourcePropType,
  ViewToken,
  Animated,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = SCREEN_WIDTH * 0.56; // unchanged
const SLIDE_WIDTH = SCREEN_WIDTH - 8;      // 4 px margin each side

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
  autoPlayInterval?: number;
  onFirstImageLoad?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const HeroBanner: React.FC<HeroBannerProps> = ({
  slides,
  autoPlayInterval = 4000,
  onFirstImageLoad,
}) => {
  const flatListRef = useRef<FlatList<BannerSlide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [loadedUris, setLoadedUris] = useState<Set<string>>(new Set());
  const [failedUris, setFailedUris] = useState<Set<string>>(new Set());
  const firstImageLoadFired = useRef(false);

  // Refs so stable callbacks can read latest values without re-creating
  const activeIndexRef = useRef(0);
  activeIndexRef.current = activeIndex;
  const slidesLenRef = useRef(slides.length);
  slidesLenRef.current = slides.length;
  const isResettingRef = useRef(false);

  // Text fade animation
  const textOpacity = useRef(new Animated.Value(1)).current;
  const prevDisplayRef = useRef(0);

  // ── Infinite-loop data ──────────────────────────────────────────────────────
  // Append a clone of the first slide at the end so scrolling forward from the
  // last real slide lands on an identical image (the clone).  After the scroll
  // animation finishes we silently snap back to real index 0 — the image is
  // identical so the user sees nothing.
  const loopSlides = useMemo(
    () =>
      slides.length > 1
        ? [...slides, { ...slides[0], id: `${slides[0].id}__clone` }]
        : slides,
    [slides],
  );

  // displayIndex maps clone index → 0 for dots / text
  const displayIndex = activeIndex >= slides.length ? 0 : activeIndex;
  const currentSlide = slides[displayIndex] ?? slides[0];

  // ── Text fade on slide change ───────────────────────────────────────────────
  useEffect(() => {
    if (prevDisplayRef.current === displayIndex) return;
    prevDisplayRef.current = displayIndex;
    Animated.sequence([
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [displayIndex, textOpacity]);

  // ── Snap back from clone to real index 0 ───────────────────────────────────
  // Called by onMomentumScrollEnd — fires after every scroll animation finishes.
  const handleMomentumScrollEnd = useCallback(() => {
    const len = slidesLenRef.current;
    const idx = activeIndexRef.current;
    if (len <= 1 || idx < len || isResettingRef.current) return;
    isResettingRef.current = true;
    flatListRef.current?.scrollToIndex({ index: 0, animated: false });
    setActiveIndex(0);
    activeIndexRef.current = 0;
    // Short guard to prevent double-resets from rapid callbacks
    setTimeout(() => {
      isResettingRef.current = false;
    }, 150);
  }, []); // stable — reads everything via refs

  // ── Auto-play ───────────────────────────────────────────────────────────────
  const startAutoPlay = useCallback(() => {
    if (slidesLenRef.current <= 1) return;
    timerRef.current = setInterval(() => {
      const len = slidesLenRef.current;
      const current = activeIndexRef.current;

      // If we somehow ended up on or past the clone, do nothing — the
      // onMomentumScrollEnd reset will have already fired or is about to.
      if (current >= len || isResettingRef.current) return;

      const next = current + 1;
      // next can be up to loopSlides.length - 1 (the clone index = len)
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
      activeIndexRef.current = next;
    }, autoPlayInterval);
  }, [autoPlayInterval]); // stable

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

  // ── Viewability ─────────────────────────────────────────────────────────────
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const idx = viewableItems[0].index;
        setActiveIndex(idx);
        activeIndexRef.current = idx;
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  if (!slides || slides.length === 0) return null;

  return (
    <View>
      {/* ── Image carousel — clean, no text overlay ── */}
      <View style={styles.imageWrapper}>
        <FlatList
          ref={flatListRef}
          data={loopSlides}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScrollBeginDrag={stopAutoPlay}
          onScrollEndDrag={startAutoPlay}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: SLIDE_WIDTH,
            offset: SLIDE_WIDTH * index,
            index,
          })}
          renderItem={({ item }) => {
            const itemId = String(item.id);
            const imageUri =
              item.imageSource &&
              typeof item.imageSource === 'object' &&
              'uri' in item.imageSource
                ? (item.imageSource as { uri: string }).uri
                : null;
            const hasLoaded = imageUri ? loadedUris.has(imageUri) : false;
            const hasFailed = imageUri ? failedUris.has(imageUri) : false;

            return (
              <View style={styles.slide}>
                <ImageBackground
                  source={item.imageSource}
                  style={styles.image}
                  resizeMode="cover"
                  onLoad={() => {
                    if (imageUri) {
                      setLoadedUris(prev => new Set([...prev, imageUri]));
                    }
                    if (!firstImageLoadFired.current) {
                      firstImageLoadFired.current = true;
                      onFirstImageLoad?.();
                    }
                  }}
                  onError={event => {
                    console.error('[HeroBanner] image error', {
                      id: itemId,
                      error: event.nativeEvent?.error,
                    });
                    if (imageUri) {
                      setFailedUris(prev => new Set([...prev, imageUri]));
                    }
                  }}
                >
                  {!hasLoaded && !hasFailed ? (
                    <View style={styles.loadingOverlay} />
                  ) : null}
                </ImageBackground>
              </View>
            );
          }}
        />
      </View>

      {/* ── Content panel below image — fades when slide changes ── */}
      <Animated.View style={[styles.contentPanel, { opacity: textOpacity }]}>
        <View style={styles.titleRow}>
          <View style={styles.textBlock}>
            {currentSlide.tag ? (
              <Text style={styles.tag} numberOfLines={1}>
                {currentSlide.tag.toUpperCase()}
              </Text>
            ) : null}
            <Text style={styles.title} numberOfLines={2}>
              {currentSlide.title}
            </Text>
            {currentSlide.description ? (
              <Text style={styles.description} numberOfLines={1}>
                {currentSlide.description}
              </Text>
            ) : null}
          </View>

          {currentSlide.onCtaPress ? (
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={currentSlide.onCtaPress}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaText}>
                {currentSlide.ctaLabel || 'Explore'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Dots — show slides.length dots, not loopSlides.length */}
        {slides.length > 1 ? (
          <View style={styles.dotsRow}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === displayIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  imageWrapper: {
    marginHorizontal: 4,
    borderRadius: 14,
    overflow: 'hidden',
  },
  slide: {
    width: SLIDE_WIDTH,
  },
  image: {
    width: '100%',
    height: BANNER_HEIGHT,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111114',
  },
  contentPanel: {
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textBlock: {
    flex: 1,
    gap: 3,
  },
  tag: {
    fontSize: 10,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.primary,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: Typography.fontSizes.lg,
    fontFamily: Typography.fontFamilies.black,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  description: {
    fontSize: Typography.fontSizes.xs,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    flexShrink: 0,
  },
  ctaText: {
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.bold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 5,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
});

export default HeroBanner;
