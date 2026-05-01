import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import ScreenHeader from '../../components/common/ScreenHeader';
import { Image } from 'react-native';
import Images from '../../assets';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQSection {
  id: string;
  title: string;
  items: FAQItem[];
}

const FAQ_DATA: FAQSection[] = [
  {
    id: 'product',
    title: 'Product & Quality',
    items: [
      {
        id: 'p1',
        question: 'What do I receive when I purchase a flyer?',
        answer:
          'You will receive a high-quality JPG flyer in professional resolution, ready to post on social media or print. We do not deliver PSD files. All flyers are delivered as finished designs.',
      },
      {
        id: 'p2',
        question: 'What file format will I receive?',
        answer:
          'All flyers are delivered in JPG format only. This ensures compatibility, fast delivery, and easy sharing.',
      },
      {
        id: 'p3',
        question: 'Are your flyers high quality?',
        answer:
          'Absolutely. All Grodify flyers are first-class quality, high resolution, professionally designed, and optimized for nightlife promotions. We focus on premium visuals that stand out.',
      },
      {
        id: 'p4',
        question: 'Do you offer birthday flyers?',
        answer:
          'Yes. We specialize in Birthday Flyers with premium quality, bold visuals, and nightlife-ready designs. Birthday flyers are one of our most popular products.',
      },
    ],
  },
  {
    id: 'pricing',
    title: 'Pricing & Options',
    items: [
      {
        id: 'pr1',
        question: 'What flyer prices do you offer?',
        answer:
          'We offer three fixed flyer prices: $10 – Basic Flyer, $15 – Regular Flyer, and $40 – Premium Flyer. Each price reflects the level of design detail and complexity.',
      },
      {
        id: 'pr2',
        question: 'Do you offer animated flyers?',
        answer:
          'Yes. Animated flyers are available as an add-on for $25. If selected, you will receive an animated version optimized for social media use.',
      },
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery & Trust',
    items: [
      {
        id: 'd1',
        question: 'What are your delivery times?',
        answer:
          'We offer multiple delivery options: Standard delivery (included), 5-hour rush ($10), and 1-hour express ($20). Delivery time depends on the option selected at checkout.',
      },
      {
        id: 'd2',
        question: 'What happens if my flyer is delayed?',
        answer:
          'In rare cases, delays may occur when we are experiencing a high volume of orders. However, we always deliver and honor the delivery time selected. Grodify is known for reliability and consistency in nightlife flyer design.',
      },
      {
        id: 'd3',
        question: 'Can I trust Grodify with my order?',
        answer:
          'Yes. We always complete our work. If you placed an order, expect your flyer. Grodify is one of the top platforms for nightlife flyer design, and customer satisfaction is our priority.',
      },
    ],
  },
];

const FAQScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>('p1');

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleContactSupport = useCallback(() => {
    navigation.navigate('ContactUs');
  }, [navigation]);

  const handleToggle = useCallback((id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  }, []);

  const filteredSections = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return FAQ_DATA;
    return FAQ_DATA.map(section => ({
      ...section,
      items: section.items.filter(
        item =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q),
      ),
    })).filter(s => s.items.length > 0);
  }, [search]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader
        title="FAQ"
        onBackPress={handleBack}
        showAvatar={false}
        showSearch={false}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Find answers to common questions about Grodify
        </Text>

        {/* Sections */}
        {filteredSections.map(section => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map(item => {
              const isOpen = openId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.faqCard, isOpen && styles.faqCardOpen]}
                  onPress={() => handleToggle(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.faqRow}>
                    <Text
                      style={[
                        styles.faqQuestion,
                        isOpen && styles.faqQuestionOpen,
                      ]}
                    >
                      {item.question}
                    </Text>
                    <Image
                      source={Images.drawerChevron}
                      style={[styles.chevron, isOpen && styles.chevronOpen]}
                      resizeMode="contain"
                    />
                  </View>
                  {isOpen && (
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Still Have Questions */}
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Still Have Questions?</Text>
          <Text style={styles.ctaSubtitle}>
            Our support team is ready to help you with your premium flyer needs.
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleContactSupport}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaButtonText}>Contact Support</Text>
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
    paddingBottom: 32,
    marginTop: 16,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.regular,
    marginBottom: 20,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.searchBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.searchBorder,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    marginBottom: 24,
  },
  searchIcon: {
    width: 18,
    height: 18,
    tintColor: Colors.searchIcon,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.md,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 10,
  },
  faqCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  faqCardOpen: {
    backgroundColor: Colors.surfaceElevated,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  faqQuestion: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semiBold,
    lineHeight: 20,
  },
  faqQuestionOpen: {
    color: Colors.textPrimary,
  },
  chevron: {
    width: 16,
    height: 16,
    tintColor: Colors.textSecondary,
    marginTop: 2,
    transform: [{ rotate: '90deg' }],
  },
  chevronOpen: {
    tintColor: Colors.primary,
    transform: [{ rotate: '-90deg' }],
  },
  faqAnswer: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.regular,
    lineHeight: 20,
    marginTop: 10,
  },
  ctaCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.regular,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  ctaButtonText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
  },
});

export default FAQScreen;
