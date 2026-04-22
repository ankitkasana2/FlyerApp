// components/home/FlyerCard.tsx

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Animated,
  ImageSourcePropType,
  Dimensions,
  Image,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import AppImages from '../../assets/App';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.38; // portrait ratio

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FlyerCardProps {
  id: string;
  title: string;
  price: string;
  imageSource: ImageSourcePropType;
  isPremium?: boolean;
  isFavorited?: boolean;
  onPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const FlyerCard: React.FC<FlyerCardProps> = ({
  id,
  title,
  price,
  imageSource,
  isPremium = false,
  isFavorited = false,
  onPress,
  onFavoritePress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [favorited, setFavorited] = useState(isFavorited);
  const heartScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleFavorite = useCallback(() => {
    setFavorited((prev) => !prev);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onFavoritePress?.(id);
  }, [heartScale, id, onFavoritePress]);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onPress?.(id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
      >
        <ImageBackground
          source={imageSource}
          style={styles.image}
          imageStyle={styles.imageStyle}
          resizeMode="cover"
        >
          {/* Dark overlay at bottom for text */}
          <View style={styles.bottomOverlay} />

          {/* Premium Badge */}
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Image source={AppImages.crown} style={styles.crownIconImage} resizeMode="contain" />
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavorite}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.favoriteInner}>
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Image
                  source={AppImages.favourite}
                  style={[
                    styles.favoriteIconImage,
                    { tintColor: favorited ? Colors.error : Colors.textPrimary },
                  ]}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>
          </TouchableOpacity>

          {/* Price Badge (Floating) */}
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{price}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 240,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  touchable: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
  imageStyle: {
    borderRadius: 20,
  },
  premiumBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crownIconImage: {
    width: 16,
    height: 16,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  favoriteInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIconImage: {
    width: 20,
    height: 20,
  },
  priceBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(56, 38, 19, 0.85)', // dark brownish like the reference
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  priceText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: '#FFF',
  },
});

export { CARD_WIDTH, CARD_GAP, HORIZONTAL_PADDING };
export default React.memo(FlyerCard);
