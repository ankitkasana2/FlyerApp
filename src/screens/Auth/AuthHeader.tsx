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
}) => (
  <View style={styles.container}>
    {/* Background Image Mosaic Section */}
    <View style={styles.bgGrid}>
      <View style={[styles.flyerCol, { paddingTop: 20 }]}>
        <Image source={Images.pic1} style={styles.flyerGridImage} resizeMode="cover" />
        <Image source={Images.pic2} style={styles.flyerGridImage} resizeMode="cover" />
        <Image source={Images.pic3} style={styles.flyerGridImage} resizeMode="cover" />
      </View>
      <View style={[styles.flyerCol, { paddingTop: 0 }]}>
        <Image source={Images.pic4} style={styles.flyerGridImage} resizeMode="cover" />
        <Image source={Images.pic5} style={styles.flyerGridImage} resizeMode="cover" />
        <Image source={Images.pic6} style={styles.flyerGridImage} resizeMode="cover" />
      </View>
      <View style={[styles.flyerCol, { paddingTop: 40 }]}>
        <Image source={Images.pic7} style={styles.flyerGridImage} resizeMode="cover" />
        <Image source={Images.pic8} style={styles.flyerGridImage} resizeMode="cover" />
        <Image source={Images.pic9} style={styles.flyerGridImage} resizeMode="cover" />
      </View>
      <View style={[styles.flyerCol, { paddingTop: 10 }]}>
        <Image source={Images.pic10} style={styles.flyerGridImage} resizeMode="cover" />
        <Image source={Images.pic11} style={styles.flyerGridImage} resizeMode="cover" />
        <Image source={Images.pic12} style={styles.flyerGridImage} resizeMode="cover" />
      </View>

      <View style={styles.bgDimmer} />
    </View>

    {/* Back button */}
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

    {/* Center text */}
    <View style={styles.centerBlock}>
      <Image 
        source={Images.logo} 
        style={styles.logo} 
        resizeMode="contain" 
      />
    </View>
  </View>
);

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
  bgDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  centerBlock: {
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
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