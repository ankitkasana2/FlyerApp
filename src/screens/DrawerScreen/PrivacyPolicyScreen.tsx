import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import ScreenHeader from '../../components/common/ScreenHeader';
import { Image } from 'react-native';
import Images from '../../assets';
import AppImages from '../../assets/App';

interface PolicySection {
  id: string;
  icon: any;
  title: string;
  bullets: string[];
}

const POLICY_SECTIONS: PolicySection[] = [
  {
    id: 'collect',
    icon: Images.helpTrust,
    title: 'Information We Collect',
    bullets: [
      'Name and email address',
      'Payment information (processed securely via Stripe — we do not store card details)',
      'Order details and uploaded files',
      'Technical data such as IP address, browser type, and device information',
    ],
  },
  {
    id: 'use',
    icon: Images.password,
    title: 'How We Use Your Information',
    bullets: [
      'Process orders and payments',
      'Deliver purchased flyers and services',
      'Communicate order updates and support messages',
    ],
  },
  {
    id: 'protect',
    icon: Images.eyeOpen,
    title: 'Data Protection',
    bullets: [
      'All data is stored securely using industry-standard practices',
      'Payments are handled through Stripe',
      'Files are stored using secure cloud infrastructure',
    ],
  },
  {
    id: 'third_party',
    icon: Images.helpTrust,
    title: 'Third-Party Services',
    bullets: [
      'We use trusted third-party services (such as Stripe and AWS) strictly for platform operation',
      'These services follow their own privacy and security standards',
    ],
  },
  {
    id: 'rights',
    icon: AppImages.profile,
    title: 'Your Rights',
    bullets: [
      'Request access to your personal data',
      'Request correction of your personal data',
      'Request deletion of your personal data',
      'Contact us at admin@grodify.com for any requests',
    ],
  },
];

const SUPPORT_EMAIL = 'admin@grodify.com';

const PrivacyPolicyScreen: React.FC = () => {
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
        title="PRIVACY POLICY"
        onBackPress={handleBack}
        showAvatar={false}
        showSearch={false}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.subtitle}>
            Your privacy is important to us. Learn how we protect your
            information.
          </Text>
          <Text style={styles.effectiveDate}>Effective Date: January 2024</Text>
        </View>

        {/* Policy Sections */}
        {POLICY_SECTIONS.map(section => (
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
            <View style={styles.divider} />
            {section.bullets.map((bullet, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* CTA Card */}
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>
            <Text style={styles.ctaTitleWhite}>Questions About{'\n'}</Text>
            <Text style={styles.ctaTitleRed}>Privacy</Text>
            <Text style={styles.ctaTitleWhite}>?</Text>
          </Text>
          <Text style={styles.ctaBody}>
            Email us at{' '}
            <Text style={styles.ctaEmail} onPress={handleEmailPress}>
              {SUPPORT_EMAIL}
            </Text>{' '}
            if you have any questions...
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
  titleRow: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.extraBold,
    marginBottom: 10,
    textAlign: 'center',
  },
  titleWhite: {
    color: Colors.textPrimary,
  },
  titleRed: {
    color: Colors.primary,
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
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
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
    width: 20,
    height: 20,
    tintColor: Colors.primary,
  },
  sectionTitle: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 14,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 7,
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
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#2A1010',
  },
  ctaTitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaTitleWhite: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.extraBold,
    lineHeight: 30,
  },
  ctaTitleRed: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.extraBold,
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

export default PrivacyPolicyScreen;
