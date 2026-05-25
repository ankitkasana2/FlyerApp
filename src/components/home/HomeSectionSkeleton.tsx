import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Colors from '../../theme/colors';
import { CARD_GAP, HORIZONTAL_PADDING } from './FlyerCard';

const SKELETON_BASE = Colors.surface;
const SKELETON_HIGHLIGHT = Colors.surfaceElevated;

const HomeSectionSkeleton: React.FC<{ cards?: number }> = ({ cards = 2 }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );

    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.42, 0.82, 0.42],
  });

  return (
    <View style={styles.section}>
      <Animated.View style={[styles.header, { opacity }]} />
      <View style={styles.row}>
        {Array.from({ length: cards }).map((_, index) => (
          <View
            key={index}
            style={[styles.card, index < cards - 1 ? styles.cardSpacing : null]}
          >
            <Animated.View style={[styles.poster, { opacity }]} />
            <Animated.View style={[styles.line, styles.linePrimary, { opacity }]} />
            <Animated.View style={[styles.line, styles.lineSecondary, { opacity }]} />
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
  header: {
    width: 150,
    height: 22,
    borderRadius: 8,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 14,
    backgroundColor: SKELETON_HIGHLIGHT,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  card: {
    flex: 1,
    maxWidth: 190,
  },
  cardSpacing: {
    marginRight: CARD_GAP,
  },
  poster: {
    width: '100%',
    aspectRatio: 0.725,
    borderRadius: 16,
    backgroundColor: SKELETON_BASE,
  },
  line: {
    height: 14,
    borderRadius: 6,
    marginTop: 10,
    backgroundColor: SKELETON_HIGHLIGHT,
  },
  linePrimary: {
    width: '78%',
  },
  lineSecondary: {
    width: '48%',
    marginTop: 8,
  },
});

export default HomeSectionSkeleton;
