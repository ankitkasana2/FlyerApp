import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = SCREEN_WIDTH * 0.56;

const BASE = '#1A1A1D';
const STRIPE = 'rgba(255,255,255,0.07)';
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
    <View style={styles.wrapper}>
      {/* Shimmer sweep stripe */}
      <Animated.View
        style={[styles.shimmerStripe, { transform: [{ translateX }] }]}
      />

      {/* Skeleton content blocks at bottom */}
      <View style={styles.content}>
        <View style={styles.tag} />
        <View style={styles.titleLine1} />
        <View style={styles.titleLine2} />
        <View style={styles.cta} />
      </View>

      {/* Dots row matching HeroBanner */}
      <View style={styles.dotsRow}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: BASE,
    overflow: 'hidden',
  },
  shimmerStripe: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.55,
    backgroundColor: STRIPE,
    transform: [{ skewX: '-20deg' }],
  },

  // ── Content placeholder ─────────────────────────────────────────────────────
  content: {
    height: BANNER_HEIGHT,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 22,
    gap: 10,
  },
  tag: {
    width: 72,
    height: 13,
    borderRadius: 4,
    backgroundColor: BLOCK,
  },
  titleLine1: {
    width: '60%',
    height: 22,
    borderRadius: 6,
    backgroundColor: BLOCK,
  },
  titleLine2: {
    width: '42%',
    height: 22,
    borderRadius: 6,
    backgroundColor: BLOCK,
    marginTop: -2,
  },
  cta: {
    width: 96,
    height: 36,
    borderRadius: 8,
    backgroundColor: BLOCK,
    marginTop: 6,
  },

  // ── Dots ────────────────────────────────────────────────────────────────────
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BLOCK,
  },
  dotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333336',
  },
});

export default BannerSkeleton;
