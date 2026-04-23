// components/home/BannerSkeleton.tsx

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = SCREEN_WIDTH * 0.56;

const SKELETON_BASE = '#1E1E1E';
const SKELETON_HIGHLIGHT = '#2A2A2A';

const BannerSkeleton: React.FC = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.8, 0.4],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.background, { opacity }]} />
      <View style={styles.content}>
        <Animated.View style={[styles.tag, { opacity }]} />
        <Animated.View style={[styles.title, { opacity }]} />
        <Animated.View style={[styles.cta, { opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    height: BANNER_HEIGHT,
    backgroundColor: SKELETON_BASE,
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: SKELETON_HIGHLIGHT,
    borderRadius: 16,
  },
  content: {
    position: 'absolute',
    bottom: 22,
    left: 20,
    right: 20,
  },
  tag: {
    width: 70,
    height: 14,
    borderRadius: 4,
    marginBottom: 6,
    backgroundColor: SKELETON_HIGHLIGHT,
  },
  title: {
    width: '65%',
    height: 28,
    borderRadius: 4,
    marginBottom: 18,
    backgroundColor: SKELETON_HIGHLIGHT,
  },
  cta: {
    width: 90,
    height: 36,
    borderRadius: 8,
    backgroundColor: SKELETON_HIGHLIGHT,
  },
});

export default BannerSkeleton;