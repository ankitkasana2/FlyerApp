import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import Colors from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = SCREEN_WIDTH * 0.56; // matches HeroBanner exactly

const BASE = '#1A1A1D';
const SHIMMER = 'rgba(255,255,255,0.07)';
const BLOCK = '#252528';

const BannerSkeleton: React.FC = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH * 1.2, SCREEN_WIDTH * 1.2],
  });

  return (
    <View>
      {/* Image placeholder */}
      <View style={styles.imageWrapper}>
        <View style={styles.imagePlaceholder}>
          <Animated.View
            style={[styles.shimmer, { transform: [{ translateX }] }]}
          />
        </View>
      </View>

      {/* Content panel below — mirrors HeroBanner layout */}
      <View style={styles.contentPanel}>
        <View style={styles.titleRow}>
          <View style={styles.textBlock}>
            <View style={styles.tagBlock} />
            <View style={styles.titleBlock} />
            <View style={styles.descBlock} />
          </View>
          <View style={styles.ctaBlock} />
        </View>

        {/* Dots */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ── Image placeholder ────────────────────────────────────────────────────────
  imageWrapper: {
    marginHorizontal: 4,
    borderRadius: 14,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    width: '100%',
    height: BANNER_HEIGHT,
    backgroundColor: BASE,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.55,
    backgroundColor: SHIMMER,
    transform: [{ skewX: '-20deg' }],
  },

  // ── Content panel ────────────────────────────────────────────────────────────
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
    gap: 6,
  },
  tagBlock: {
    width: 56,
    height: 10,
    borderRadius: 3,
    backgroundColor: BLOCK,
  },
  titleBlock: {
    width: '72%',
    height: 20,
    borderRadius: 6,
    backgroundColor: BLOCK,
  },
  descBlock: {
    width: '52%',
    height: 14,
    borderRadius: 4,
    backgroundColor: BLOCK,
  },
  ctaBlock: {
    width: 80,
    height: 38,
    borderRadius: 10,
    backgroundColor: BLOCK,
    flexShrink: 0,
  },

  // ── Dots ─────────────────────────────────────────────────────────────────────
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: BLOCK,
  },
  dotActive: {
    width: 20,
    height: 5,
    backgroundColor: '#333336',
  },
});

export default BannerSkeleton;
