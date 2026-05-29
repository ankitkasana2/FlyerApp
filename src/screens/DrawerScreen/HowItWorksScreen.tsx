import React, { useMemo, useState } from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../components/common/ScreenHeader';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import Images from '../../assets';

const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@grodify';

const steps = [
  {
    id: 1,
    title: 'Choose Your Flyer',
    description:
      'Browse our flyer collection, compare styles and select the design that fits your event best.',
    // Use real flyer artwork so this section feels like the live app/web flow.
    image: Images.pic2,
    details: [
      'Explore premium flyer templates across event categories',
      'Choose from basic, regular and premium style options',
      'Pick designs with or without photo layouts',
      'Find the right look before you begin customization',
    ],
  },
  {
    id: 2,
    title: 'Fill Out Your Details',
    description:
      'Complete the order form with your event details, images, logos and any extras you need.',
    image: Images.pic1,
    details: [
      'Add event title, date, time and venue information',
      'Upload photos for artists, hosts or birthday guests',
      'Include sponsor, promoter and venue logos',
      'Request story size, rush delivery or custom edits',
    ],
  },
  {
    id: 3,
    title: 'Receive Your Flyer',
    description:
      'Get your completed flyer delivered to your account and download it when it is ready.',
    image: Images.pic3,
    details: [
      'Track your completed orders inside your profile',
      'Download high-quality files for promotion and sharing',
      'Use your flyer for print, social posts and stories',
      'Reorder again anytime from your previous submissions',
    ],
  },
];

const deliveryOptions = [
  {
    time: '24 hours',
    price: 'FREE',
    note: 'Perfect for planned events',
    popular: false,
  },
  {
    time: '5 hours',
    price: '+$10',
    note: 'Best for same-day promotion',
    popular: true,
  },
  {
    time: '1 hour',
    price: '+$20',
    note: 'Built for urgent flyer needs',
    popular: false,
  },
];

const features = [
  {
    title: '10,000+ Templates',
    description: 'A large collection of flyer styles for every event type.',
  },
  {
    title: 'Easy Customization',
    description: 'A simple form flow that keeps ordering fast and clear.',
  },
  {
    title: 'Fast Delivery',
    description: 'Flexible turnaround options when timing matters most.',
  },
  {
    title: 'Quality Guaranteed',
    description: 'Professional output designed for nightlife promotion.',
  },
];

const HowItWorksScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeStep, setActiveStep] = useState(1);

  const goToCategories = () => {
    // HowItWorks is in the AppStack; Categories lives under DrawerRoot -> MainTabs (tabs).
    try {
      navigation.navigate('DrawerRoot', {
        screen: 'MainTabs',
        params: { screen: 'Categories' },
      });
    } catch {
      navigation.navigate('Categories');
    }
  };

  const activeStepData = useMemo(
    () => steps.find(step => step.id === activeStep) ?? steps[0],
    [activeStep],
  );

  const handleWatchPress = async () => {
    // `canOpenURL` is unreliable for https on some Android setups; attempt open directly.
    try {
      await Linking.openURL(YOUTUBE_CHANNEL_URL);
    } catch {
      // Fallback variant that tends to resolve more consistently.
      await Linking.openURL('https://youtube.com/@grodify');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader title="How It Works" onBackPress={() => navigation.goBack()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Simple Process</Text>
          </View>
          <Text style={styles.heroTitle}>
            How <Text style={styles.heroTitleAccent}>Grodify</Text> Works
          </Text>
          <Text style={styles.heroBody}>
            Get professional event flyers in 3 simple steps, from selection to
            delivery.
          </Text>

          <View style={styles.videoCard}>
            <Image source={Images.pic1} style={styles.videoImage} resizeMode="cover" />
            <View style={styles.videoOverlay} pointerEvents="none" />
            <TouchableOpacity
              style={styles.playButton}
              activeOpacity={0.9}
              onPress={handleWatchPress}
              accessibilityRole="button"
              accessibilityLabel="Open Grodify YouTube channel"
            >
              <Text style={styles.playButtonText}>PLAY</Text>
            </TouchableOpacity>
            <Text style={styles.videoTitle}>Watch How It Works</Text>
            <Text style={styles.videoSubtitle}>
              See the complete process in action
            </Text>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.stepTabs}>
            {steps.map(step => {
              const isActive = step.id === activeStep;
              return (
                <TouchableOpacity
                  key={step.id}
                  style={[styles.stepTab, isActive && styles.stepTabActive]}
                  activeOpacity={0.86}
                  onPress={() => setActiveStep(step.id)}
                >
                  <Text
                    style={[
                      styles.stepTabLabel,
                      isActive && styles.stepTabLabelActive,
                    ]}
                  >
                    Step {step.id}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.activeStepCard}>
            <Image
              source={activeStepData.image}
              style={styles.activeStepImage}
              resizeMode="cover"
            />
            <View style={styles.activeStepContent}>
              <View style={styles.activeStepBadge}>
                <Text style={styles.activeStepBadgeText}>
                  Step {activeStepData.id}
                </Text>
              </View>
              <Text style={styles.activeStepTitle}>{activeStepData.title}</Text>
              <Text style={styles.activeStepDescription}>
                {activeStepData.description}
              </Text>

              <View style={styles.detailList}>
                {activeStepData.details.map(detail => (
                  <View key={detail} style={styles.detailRow}>
                    <View style={styles.detailDot} />
                    <Text style={styles.detailText}>{detail}</Text>
                  </View>
                ))}
              </View>

              {activeStepData.id === 1 ? (
                <TouchableOpacity
                  style={styles.primaryButton}
                  activeOpacity={0.88}
                  onPress={goToCategories}
                >
                  <Text style={styles.primaryButtonText}>Browse Flyers</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.deliverySection}>
          <Text style={styles.sectionTitle}>Choose Your Delivery Speed</Text>
          <Text style={styles.sectionSubtitle}>
            Select the turnaround option that works best for your timeline.
          </Text>

          <View style={styles.deliveryGrid}>
            {deliveryOptions.map(option => (
              <View
                key={option.time}
                style={[
                  styles.deliveryCard,
                  option.popular && styles.deliveryCardPopular,
                ]}
              >
                {option.popular ? (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>Most Popular</Text>
                  </View>
                ) : null}
                <Text style={styles.deliveryTime}>{option.time}</Text>
                <Text style={styles.deliveryPrice}>{option.price}</Text>
                <Text style={styles.deliveryNote}>{option.note}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Choose Grodify?</Text>
          <Text style={styles.sectionSubtitle}>
            We make flyer creation simple, fast and premium.
          </Text>

          <View style={styles.featuresGrid}>
            {features.map(feature => (
              <View key={feature.title} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureIconText}>+</Text>
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Create Your Flyer?</Text>
          <Text style={styles.ctaBody}>
            Start with a design you like and complete your order in minutes.
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.88}
            onPress={goToCategories}
          >
            <Text style={styles.ctaButtonText}>Start Creating</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 28,
  },
  heroSection: {
    gap: 14,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroBadgeText: {
    fontSize: Typography.fontSizes.xs,
    fontFamily: Typography.fontFamilies.semiBold,
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: Typography.fontSizes['3xl'],
    lineHeight: 34,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textPrimary,
  },
  heroTitleAccent: {
    color: Colors.primary,
  },
  heroBody: {
    fontSize: Typography.fontSizes.base,
    lineHeight: 24,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textSecondary,
  },
  videoCard: {
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  videoImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  playButton: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: Colors.primary,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -41 }, { translateY: -41 }],
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textPrimary,
    letterSpacing: 1.2,
  },
  videoTitle: {
    fontSize: Typography.fontSizes.xl,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 74,
    marginBottom: 6,
  },
  videoSubtitle: {
    fontSize: Typography.fontSizes.sm,
    lineHeight: 20,
    fontFamily: Typography.fontFamilies.regular,
    color: '#d4d4d8',
    textAlign: 'center',
  },
  sectionBlock: {
    gap: 16,
  },
  stepTabs: {
    flexDirection: 'row',
    gap: 10,
  },
  stepTab: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    alignItems: 'center',
  },
  stepTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepTabLabel: {
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.semiBold,
    color: Colors.textSecondary,
  },
  stepTabLabelActive: {
    color: Colors.textPrimary,
  },
  activeStepCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  activeStepImage: {
    width: '100%',
    height: 220,
  },
  activeStepContent: {
    padding: 20,
    gap: 12,
  },
  activeStepBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: 'rgba(185,32,37,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(185,32,37,0.45)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeStepBadgeText: {
    fontSize: Typography.fontSizes.xs,
    fontFamily: Typography.fontFamilies.semiBold,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  activeStepTitle: {
    fontSize: Typography.fontSizes.xxl,
    lineHeight: 30,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textPrimary,
  },
  activeStepDescription: {
    fontSize: Typography.fontSizes.base,
    lineHeight: 24,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textSecondary,
  },
  detailList: {
    gap: 12,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    marginTop: 7,
  },
  detailText: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    lineHeight: 22,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textSecondary,
  },
  primaryButton: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  primaryButtonText: {
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.semiBold,
    color: Colors.textPrimary,
  },
  deliverySection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.xxl,
    lineHeight: 30,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSizes.sm,
    lineHeight: 22,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textSecondary,
  },
  deliveryGrid: {
    gap: 14,
    marginTop: 6,
  },
  deliveryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    gap: 8,
  },
  deliveryCardPopular: {
    borderColor: Colors.primary,
  },
  popularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 2,
  },
  popularBadgeText: {
    fontSize: Typography.fontSizes.xs,
    fontFamily: Typography.fontFamilies.semiBold,
    color: Colors.textPrimary,
  },
  deliveryTime: {
    fontSize: Typography.fontSizes.xl,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  deliveryPrice: {
    fontSize: Typography.fontSizes.xxl,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.primary,
  },
  deliveryNote: {
    fontSize: Typography.fontSizes.sm,
    lineHeight: 22,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textSecondary,
  },
  featuresSection: {
    gap: 10,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 6,
  },
  featureCard: {
    width: '47.8%',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    gap: 10,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(185,32,37,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(185,32,37,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconText: {
    fontSize: Typography.fontSizes.xl,
    lineHeight: 22,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.primary,
  },
  featureTitle: {
    fontSize: Typography.fontSizes.base,
    lineHeight: 22,
    fontFamily: Typography.fontFamilies.semiBold,
    color: Colors.textPrimary,
  },
  featureDescription: {
    fontSize: Typography.fontSizes.sm,
    lineHeight: 21,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textSecondary,
  },
  ctaSection: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 22,
    gap: 10,
  },
  ctaTitle: {
    fontSize: Typography.fontSizes['2xl'],
    lineHeight: 30,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textPrimary,
  },
  ctaBody: {
    fontSize: Typography.fontSizes.base,
    lineHeight: 24,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textSecondary,
  },
  ctaButton: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  ctaButtonText: {
    fontSize: Typography.fontSizes.base,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textPrimary,
  },
});

export default HowItWorksScreen;
