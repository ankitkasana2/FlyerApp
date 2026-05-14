// components/auth/AuthHeader.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageSourcePropType,
  Image,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import Images from '../../assets';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 250;
const DEFAULT_BACKGROUND_IMAGES: ImageSourcePropType[] = [
  Images.pic1,
  Images.pic2,
  Images.pic3,
  Images.pic4,
  Images.pic5,
  Images.pic6,
  Images.pic7,
  Images.pic8,
  Images.pic9,
  Images.pic10,
  Images.pic11,
  Images.pic12,
];

// ─── Back Arrow Icon ──────────────────────────────────────────────────────────
const BackArrowIcon: React.FC<{ color?: string; size?: number }> = ({
  color = Colors.textPrimary,
  size = 18,
}) => (
  <View style={backIconStyles.wrapper}>
    <View style={[backIconStyles.armTop, { borderColor: color, width: size * 0.52 }]} />
    <View style={[backIconStyles.shaft, { backgroundColor: color, width: size * 0.72 }]} />
    <View style={[backIconStyles.armBottom, { borderColor: color, width: size * 0.52 }]} />
  </View>
);

const backIconStyles = StyleSheet.create({
  wrapper: {
    width: 18,
    height: 18,
    justifyContent: 'center',
  },
  armTop: {
    position: 'absolute',
    height: 2,
    borderTopWidth: 2,
    borderLeftWidth: 0,
    top: 3,
    left: 0,
    transform: [{ rotate: '-45deg' }],
    borderRadius: 1,
  },
  shaft: {
    height: 2,
    borderRadius: 1,
  },
  armBottom: {
    position: 'absolute',
    height: 2,
    borderBottomWidth: 2,
    bottom: 3,
    left: 0,
    transform: [{ rotate: '45deg' }],
    borderRadius: 1,
  },
});

export interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
  stepLabel?: string;
  onBackPress?: () => void;
  backgroundImages?: ImageSourcePropType[];
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
  title = 'GRODIFY',
  subtitle = 'NEW FLYERS EVERY DAY',
  stepLabel,
  onBackPress,
  backgroundImages,
}) => {
  const gallery = backgroundImages?.length ? backgroundImages : DEFAULT_BACKGROUND_IMAGES;
  const tiledImages = Array.from({ length: 12 }, (_, index) => gallery[index % gallery.length]);
  const columns = [
    { paddingTop: 20, images: tiledImages.slice(0, 3) },
    { paddingTop: 0, images: tiledImages.slice(3, 6) },
    { paddingTop: 40, images: tiledImages.slice(6, 9) },
    { paddingTop: 10, images: tiledImages.slice(9, 12) },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.bgGrid}>
        {columns.map((column, columnIndex) => (
          <View
            key={`col-${columnIndex}`}
            style={[styles.flyerCol, { paddingTop: column.paddingTop }]}
          >
            {column.images.map((imageSource, imageIndex) => (
              <Image
                key={`img-${columnIndex}-${imageIndex}`}
                source={imageSource}
                style={styles.flyerGridImage}
                resizeMode="cover"
              />
            ))}
          </View>
        ))}

        <View style={styles.bgBaseTint} />
        <View style={styles.bgWarmTint} />
        <View style={styles.bgTopGlow} />
        <View style={styles.bgCenterSpotlight} />
        <View style={styles.bgTopFade} />
        <View style={styles.bgBottomFade} />
      </View>

      {onBackPress && (
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBackPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={18} />
        </TouchableOpacity>
      )}

      <View style={styles.centerBlock}>
        <Image source={Images.logo} style={styles.logo} resizeMode="contain" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: HEADER_HEIGHT,
    width: SCREEN_WIDTH,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bgGrid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    backgroundColor: '#000',
    gap: 12,
    paddingHorizontal: 8,
  },
  flyerCol: {
    flex: 1,
    gap: 12,
  },
  flyerGridImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 4,
  },
  bgBaseTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 12, 18, 0.22)',
  },
  bgWarmTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(120, 20, 26, 0.06)',
  },
  bgTopGlow: {
    position: 'absolute',
    top: -SCREEN_HEIGHT * 0.08,
    left: SCREEN_WIDTH * 0.1,
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_HEIGHT * 0.26,
    borderRadius: SCREEN_WIDTH * 0.42,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  bgCenterSpotlight: {
    position: 'absolute',
    top: HEADER_HEIGHT * 0.14,
    left: SCREEN_WIDTH * 0.17,
    width: SCREEN_WIDTH * 0.66,
    height: HEADER_HEIGHT * 0.5,
    borderRadius: SCREEN_WIDTH * 0.33,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
  },
  bgTopFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT * 0.22,
    backgroundColor: 'rgba(8, 10, 14, 0.12)',
  },
  bgBottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: HEADER_HEIGHT * 0.38,
    backgroundColor: 'rgba(8, 10, 14, 0.18)',
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    backgroundColor: 'rgba(12, 14, 18, 0.28)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  centerBlock: {
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
    paddingHorizontal: 24,
  },
  logo: {
    width: 220,
    height: 48,
    marginBottom: 8,
  },
  subtitle: {
    color: '#D1D1D1',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '500',
  },
  stepWrapper: {
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  stepDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  stepLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
    letterSpacing: 1.5,
  },
});

export default AuthHeader;
