import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, Dimensions } from 'react-native';
import Colors from '../../theme/colors';
import { CARD_GAP, HORIZONTAL_PADDING } from './FlyerCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.38);

const BASE = Colors.surface;
const STRIPE = 'rgba(255,255,255,0.05)';
const BLOCK = Colors.surfaceElevated;

const SkeletonCard: React.FC<{ translateX: Animated.AnimatedInterpolation<number> }> = ({
  translateX,
}) => (
  <View style={styles.card}>
    <View style={styles.poster}>
      <Animated.View
        style={[styles.shimmerStripe, { transform: [{ translateX }] }]}
      />
    </View>
    <View style={styles.line} />
    <View style={[styles.line, styles.lineShort]} />
  </View>
);

const HomeSectionSkeleton: React.FC<{ cards?: number }> = ({ cards = 3 }) => {
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
    outputRange: [-CARD_WIDTH * 1.5, CARD_WIDTH * 1.5],
  });

  return (
    <View style={styles.section}>
      {/* Section header placeholder */}
      <View style={styles.headerRow}>
        <View style={styles.headerBlock} />
        <View style={styles.headerBlockSmall} />
      </View>

      {/* Cards row */}
      <View style={styles.row}>
        {Array.from({ length: cards }).map((_, index) => (
          <View
            key={index}
            style={[styles.cardWrapper, index < cards - 1 ? styles.cardGap : null]}
          >
            <SkeletonCard translateX={translateX} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: 14,
  },
  headerBlock: {
    width: 140,
    height: 20,
    borderRadius: 6,
    backgroundColor: BLOCK,
  },
  headerBlockSmall: {
    width: 60,
    height: 14,
    borderRadius: 6,
    backgroundColor: BASE,
  },

  // ── Cards ───────────────────────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    paddingHorizontal: HORIZONTAL_PADDING,
    overflow: 'hidden',
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  cardGap: {
    marginRight: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
  },
  poster: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    backgroundColor: BASE,
    overflow: 'hidden',
  },
  shimmerStripe: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: CARD_WIDTH * 0.6,
    backgroundColor: STRIPE,
    transform: [{ skewX: '-15deg' }],
  },
  line: {
    height: 13,
    borderRadius: 6,
    marginTop: 10,
    width: '78%',
    backgroundColor: BLOCK,
  },
  lineShort: {
    width: '48%',
    marginTop: 6,
  },
});

export default HomeSectionSkeleton;
