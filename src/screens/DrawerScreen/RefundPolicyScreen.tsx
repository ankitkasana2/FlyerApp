import React, { useCallback } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Images from '../../assets';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import ScreenHeader from '../../components/common/ScreenHeader';

interface RefundSection {
  id: string;
  iconLabel: string;
  title: string;
  intro?: string;
  bullets?: string[];
  note?: string;
  body?: string;
  italic?: boolean;
}

const BACKGROUND_IMAGES = [
  Images.pic1,
  Images.pic2,
  Images.pic3,
  Images.pic4,
  Images.pic5,
  Images.pic6,
  Images.pic7,
  Images.pic8,
];

const REFUND_SECTIONS: RefundSection[] = [
  {
    id: 'no-refunds',
    iconLabel: '×',
    title: 'No Refunds',
    bullets: [
      'Once a flyer is delivered, no refunds will be issued.',
      'Completed custom designs are non-refundable as each order is manually created by our design team.',
    ],
  },
  {
    id: 'exceptions',
    iconLabel: '✓',
    title: 'Exceptions',
    intro: 'Refunds may be considered only if:',
    bullets: [
      'The service was not delivered',
      'A technical error caused a duplicate charge',
      'The delivered file is corrupted and cannot be replaced',
    ],
    note: 'Refund requests must be submitted within 24 hours of purchase.',
  },
  {
    id: 'digital-products',
    iconLabel: '!',
    title: 'Digital Products',
    body: 'Because Grodify provides custom flyer design services completed by our team, all sales are generally final.',
    italic: true,
  },
];

const RefundPolicyScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('DrawerRoot');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.backgroundGrid} pointerEvents="none">
        {BACKGROUND_IMAGES.map((source, index) => (
          <Image
            key={index}
            source={source}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        ))}
        <View style={styles.backgroundOverlay} />
      </View>

      <ScreenHeader
        title="Refund Policy"
        onBackPress={handleBack}
        showAvatar={false}
        showSearch={false}
        containerStyle={styles.header}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {REFUND_SECTIONS.map(section => (
          <View key={section.id} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrap}>
                <Text style={styles.iconLabel}>{section.iconLabel}</Text>
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            {section.intro ? (
              <Text style={styles.introText}>{section.intro}</Text>
            ) : null}

            {section.bullets ? (
              <View style={styles.bulletsWrap}>
                {section.bullets.map((bullet, index) => (
                  <View key={index} style={styles.bulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {section.note ? (
              <View style={styles.noteWrap}>
                <Text style={styles.noteText}>{section.note}</Text>
              </View>
            ) : null}

            {section.body ? (
              <Text
                style={[
                  styles.bodyText,
                  section.italic ? styles.bodyTextItalic : null,
                ]}
              >
                {section.body}
              </Text>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050505',
  },
  backgroundGrid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  backgroundImage: {
    width: '25%',
    height: '25%',
    opacity: 0.24,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.84)',
  },
  header: {
    backgroundColor: 'rgba(5, 5, 5, 0.96)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 14,
  },
  sectionCard: {
    backgroundColor: 'rgba(9, 9, 11, 0.92)',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(185, 32, 37, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(185, 32, 37, 0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    color: '#ff3341',
    fontSize: 20,
    lineHeight: 20,
    fontFamily: Typography.fontFamilies.bold,
    textAlign: 'center',
    marginTop: -1,
  },
  sectionTitle: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Typography.fontFamilies.bold,
  },
  introText: {
    color: '#f0f0f0',
    fontSize: Typography.fontSizes.md,
    lineHeight: 24,
    fontFamily: Typography.fontFamilies.regular,
    marginBottom: 16,
  },
  bulletsWrap: {
    gap: 18,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ff3341',
    marginTop: 11,
  },
  bulletText: {
    flex: 1,
    color: '#a1a1aa',
    fontSize: Typography.fontSizes.md,
    lineHeight: 24,
    fontFamily: Typography.fontFamilies.regular,
  },
  noteWrap: {
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  noteText: {
    color: '#7f8695',
    fontSize: Typography.fontSizes.sm,
    lineHeight: 22,
    fontFamily: Typography.fontFamilies.medium,
  },
  bodyText: {
    color: '#d4d4d8',
    fontSize: Typography.fontSizes.md,
    lineHeight: 24,
    fontFamily: Typography.fontFamilies.regular,
  },
  bodyTextItalic: {
    fontStyle: 'italic',
  },
});

export default RefundPolicyScreen;
