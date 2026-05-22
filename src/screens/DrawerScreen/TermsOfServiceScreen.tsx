import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Images from '../../assets';
import AppImages from '../../assets/App';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import ScreenHeader from '../../components/common/ScreenHeader';

interface TermsSection {
  id: string;
  icon: ImageSourcePropType;
  title: string;
  body?: string;
  bullets?: string[];
}

const TERMS_SECTIONS: TermsSection[] = [
  {
    id: 'services',
    icon: Images.terms,
    title: '1. Services',
    body: 'Grodify provides an online marketplace for digital event flyers, templates, and promotional graphics. Access is provided on an "as is" basis for intended promotional use.',
  },
  {
    id: 'user',
    icon: AppImages.profile,
    title: '2. User Responsibilities',
    bullets: [
      'Maintain the confidentiality of your account credentials.',
      'Do not use templates for illegal, deceptive, or harmful activities.',
      'Provide accurate billing and contact information.',
    ],
  },
  {
    id: 'orders',
    icon: Images.myorders,
    title: '3. Orders & Payments',
    bullets: [
      'All sales are final due to the digital nature of the products.',
      'Prices are subject to change without prior notice.',
    ],
  },
  {
    id: 'ip',
    icon: Images.privacy,
    title: '4. Intellectual Property',
    body: 'Purchasing a flyer grants a non-exclusive license to use the design for promotional purposes. You may not resell, redistribute, or claim ownership of the original template files.',
  },
];

const SUPPORT_EMAIL = 'admin@grodify.com';

const TermsOfServiceScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleContactUs = useCallback(() => {
    navigation.navigate('ContactUs');
  }, [navigation]);

  const handleEmailPress = useCallback(() => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader
        title="TERMS OF SERVICE"
        onBackPress={handleBack}
        showAvatar={false}
        showSearch={false}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleBlock}>
          <Text style={styles.subtitle}>
            By accessing or using Grodify, you agree to the following terms.
          </Text>
          <Text style={styles.effectiveDate}>Effective Date: January 2024</Text>
        </View>

        {/* Sections */}
        {TERMS_SECTIONS.map(section => (
          <View key={section.id} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrap}>
                <Image
                  source={section.icon}
                  style={styles.sectionIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            {section.body ? (
              <Text style={styles.bodyText}>{section.body}</Text>
            ) : null}

            {section.bullets ? (
              <View style={styles.bulletsWrap}>
                {section.bullets.map((bullet, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ))}

        {/* CTA Card */}
        <View style={styles.ctaCard}>
          <Image
            source={Images.faq}
            style={styles.ctaTopIcon}
            resizeMode="contain"
          />
          <Text style={styles.ctaTitle}>Questions About Our Terms?</Text>
          <Text style={styles.ctaBody}>
            Reach out to our legal team at{'\n'}
            <Text style={styles.ctaEmail} onPress={handleEmailPress}>
              {SUPPORT_EMAIL}
            </Text>
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleContactUs}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaButtonText}>Contact Us</Text>
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
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  effectiveDate: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.regular,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#2A1010',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIcon: {
    width: 18,
    height: 18,
    tintColor: Colors.primary,
  },
  sectionTitle: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
  },
  bodyText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.regular,
    lineHeight: 22,
  },
  bulletsWrap: {
    gap: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.regular,
    lineHeight: 22,
  },
  ctaCard: {
    backgroundColor: '#1A0A0A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#2A1010',
  },
  ctaTopIcon: {
    width: 28,
    height: 28,
    marginBottom: 12,
    tintColor: Colors.primary,
  },
  ctaTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.extraBold,
    textAlign: 'center',
    marginBottom: 10,
  },
  ctaBody: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  ctaEmail: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
  },
});

export default TermsOfServiceScreen;
