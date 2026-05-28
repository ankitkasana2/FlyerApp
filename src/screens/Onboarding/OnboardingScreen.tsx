import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Images from '../../assets';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.33;

const SLIDES = [
  {
    id: '1',
    title: 'Design That\nStands Out',
    subtitle:
      'Browse thousands of premium flyer designs crafted for every occasion and event.',
    columns: [
      { offset: 20, images: [Images.pic1, Images.pic5, Images.pic9] },
      { offset: 0,  images: [Images.pic2, Images.pic6, Images.pic10] },
      { offset: 40, images: [Images.pic3, Images.pic7, Images.pic11] },
      { offset: 10, images: [Images.pic4, Images.pic8, Images.pic12] },
    ],
  },
  {
    id: '2',
    title: 'Order in\nMinutes',
    subtitle:
      'Add your favorites to cart and checkout seamlessly with fast, secure payments.',
    columns: [
      { offset: 30, images: [Images.pic7, Images.pic3, Images.pic11] },
      { offset: 5,  images: [Images.pic8, Images.pic4, Images.pic12] },
      { offset: 20, images: [Images.pic9, Images.pic1, Images.pic5] },
      { offset: 45, images: [Images.pic10, Images.pic2, Images.pic6] },
    ],
  },
  {
    id: '3',
    title: 'Fast &\nReliable',
    subtitle:
      'Track your order and receive beautifully printed flyers delivered right to your door.',
    columns: [
      { offset: 10, images: [Images.pic12, Images.pic8, Images.pic4] },
      { offset: 35, images: [Images.pic11, Images.pic7, Images.pic3] },
      { offset: 15, images: [Images.pic10, Images.pic6, Images.pic2] },
      { offset: 5,  images: [Images.pic9, Images.pic5, Images.pic1] },
    ],
  },
];

interface Props {
  onDone: () => void;
}

const OnboardingScreen: React.FC<Props> = ({ onDone }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: { viewAreaCoveragePercentThreshold: 50 },
      onViewableItemsChanged: ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
          setActiveIndex(viewableItems[0].index as number);
        }
      },
    },
  ]);

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      onDone();
    }
  };

  const renderSlide = ({ item }: { item: (typeof SLIDES)[0] }) => (
    <View style={styles.slide}>
      <View style={styles.mosaic}>
        {item.columns.map((col, colIdx) => (
          <View
            key={`col-${colIdx}`}
            style={[styles.mosaicCol, { paddingTop: col.offset }]}
          >
            {col.images.map((src, imgIdx) => (
              <Image
                key={`img-${colIdx}-${imgIdx}`}
                source={src}
                style={styles.mosaicImg}
                resizeMode="cover"
              />
            ))}
          </View>
        ))}

        {/* Layered overlays to create gradient-like fade */}
        <View style={styles.overlayBase} />
        <View style={styles.overlayTop} />
        <View style={styles.overlayBottom} />
      </View>

      {/* Slide text content */}
      <View style={styles.textBlock}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Top bar: logo + skip */}
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <Image source={Images.logo} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity
          onPress={onDone}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom bar: dots + button */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // ── Slide ──────────────────────────────────────────────────────────────────
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
    overflow: 'hidden',
  },

  // ── Mosaic ─────────────────────────────────────────────────────────────────
  mosaic: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 8,
  },
  mosaicCol: {
    flex: 1,
    gap: 10,
  },
  mosaicImg: {
    width: '100%',
    height: IMAGE_HEIGHT,
    borderRadius: 10,
  },
  overlayBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.40)',
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.38,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  overlayBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT * 0.48,
    backgroundColor: 'rgba(0,0,0,0.88)',
  },

  // ── Text block ─────────────────────────────────────────────────────────────
  textBlock: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.22,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    gap: 14,
  },
  title: {
    fontSize: 46,
    fontFamily: Typography.fontFamilies.black,
    color: '#FFFFFF',
    lineHeight: 52,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: Typography.fontSizes.base,
    fontFamily: Typography.fontFamilies.regular,
    color: 'rgba(255,255,255,0.68)',
    lineHeight: 24,
  },

  // ── Top bar ────────────────────────────────────────────────────────────────
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  logo: {
    width: 130,
    height: 34,
  },
  skipText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.medium,
  },

  // ── Bottom bar ─────────────────────────────────────────────────────────────
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 18,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSizes.base,
    fontFamily: Typography.fontFamilies.bold,
    letterSpacing: 0.3,
  },
});

export default OnboardingScreen;
