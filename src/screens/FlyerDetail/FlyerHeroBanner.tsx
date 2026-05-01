import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import AppImages from '../../assets/App';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_WIDTH * 1.1;

export interface FlyerHeroBannerProps {
  imageSource: ImageSourcePropType;
  isPremium?: boolean;
  isFavorited?: boolean;
  onFavoritePress?: () => void;
}

const FlyerHeroBanner: React.FC<FlyerHeroBannerProps> = ({
  imageSource,
  isPremium,
  isFavorited,
  onFavoritePress,
}) => (
  <View style={styles.container}>
    <Image source={imageSource} style={styles.image} resizeMode="contain" />
    {/* Premium Badge */}
    {isPremium && (
      <View style={styles.premiumBadge}>
        <Image source={AppImages.crown} style={styles.crownIcon} resizeMode="contain" />
      </View>
    )}

    <TouchableOpacity
      style={styles.favoriteButton}
      onPress={onFavoritePress}
      activeOpacity={0.7}
    >
      <Image
        source={AppImages.favourite}
        style={[
          styles.favoriteIcon,
          { tintColor: isFavorited ? Colors.error : Colors.textPrimary },
        ]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  premiumBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 6,
    borderRadius: 12,
  },
  crownIcon: {
    width: 20,
    height: 20,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  favoriteIcon: {
    width: 20,
    height: 20,
  },
});

export default FlyerHeroBanner;