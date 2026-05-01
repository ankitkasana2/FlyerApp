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
import AppImages from '../../assets/App';

type TabId = 'faq' | 'contact' | 'order_status';

interface HelpTopic {
  id: string;
  icon: any;
  title: string;
  subtitle: string;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'CONTACT US' },
  { id: 'order_status', label: 'ORDER STATUS' },
];

const TOPICS: HelpTopic[] = [
  {
    id: 't1',
    icon: Images.helpHowItWorks,
    title: 'How does Grodify work?',
    subtitle:
      'Grodify allows you to order high-quality nightlife flyers in just a few steps. Choose a flyer, complete the form, select your delivery time, and our design team takes care of the rest.',
  },
  {
    id: 't2',
    icon: Images.helpParcel,
    title: 'What do I receive?',
    subtitle: 'Details on file formats and deliverables.',
  },
  {
    id: 't3',
    icon: Images.helpTime,
    title: 'Delivery times',
    subtitle: 'Expected turnaround for standard and rush.',
  },
  {
    id: 't4',
    icon: Images.helpDelayed,
    title: 'Flyer delayed',
    subtitle: 'What to do if your order is taking longer.',
  },
  {
    id: 't5',
    icon: Images.helpAnimated,
    title: 'Animated flyers',
    subtitle: 'Guidelines for motion graphic orders.',
  },
  {
    id: 't6',
    icon: Images.helpCake,
    title: 'Birthday flyers',
    subtitle: 'Special requirements for birthday designs.',
  },
];

const TRUST_TOPIC: HelpTopic = {
  id: 'trust',
  icon: Images.helpTrust,
  title: 'Can I trust Grodify?',
  subtitle: 'Read our security and buyer protection policies.',
};

const HelpCenterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('faq');

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleTabPress = useCallback((id: TabId) => {
    setActiveTab(id);
  }, []);

  const handleTopicPress = useCallback((id: string) => {
    // navigation.navigate("HelpTopic", { id });
  }, []);

  const handleContactSupport = useCallback(() => {
    navigation.navigate('ContactUs');
  }, [navigation]);

  const handleBrowseFAQ = useCallback(() => {
    navigation.navigate('FAQ');
  }, [navigation]);

  const gridTopics = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return TOPICS;
    return TOPICS.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q),
    );
  }, [search]);

  const rows = useMemo(() => {
    const result: HelpTopic[][] = [];
    for (let i = 0; i < gridTopics.length; i += 2) {
      result.push(gridTopics.slice(i, i + 2));
    }
    return result;
  }, [gridTopics]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader
        title="HELP CENTER"
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
          <Text style={styles.titleRow}>
            <Text style={styles.titleWhite}>Help </Text>
            <Text style={styles.titleRed}>Center</Text>
          </Text>
          <Text style={styles.subtitle}>
            Find answers or get in touch with our team.
          </Text>
        </View>

        {/* Topic Grid */}
        <View style={styles.grid}>
          {rows.map((row, rIdx) => (
            <View key={rIdx} style={styles.gridRow}>
              {row.map(topic => (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.topicCard}
                  onPress={() => handleTopicPress(topic.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.topicIconWrap}>
                    <Image
                      source={topic.icon}
                      style={styles.topicIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Text style={styles.topicSubtitle} numberOfLines={3}>
                    {topic.subtitle}
                  </Text>
                </TouchableOpacity>
              ))}
              {/* Fill empty slot if odd */}
              {row.length === 1 && <View style={styles.topicCardEmpty} />}
            </View>
          ))}
        </View>

        {/* Trust card — full width */}
        <TouchableOpacity
          style={styles.trustCard}
          onPress={() => handleTopicPress(TRUST_TOPIC.id)}
          activeOpacity={0.8}
        >
          <View style={styles.trustIconWrap}>
            <Image
              source={TRUST_TOPIC.icon}
              style={styles.topicIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.trustText}>
            <Text style={styles.topicTitle}>{TRUST_TOPIC.title}</Text>
            <Text style={styles.topicSubtitle}>{TRUST_TOPIC.subtitle}</Text>
          </View>
        </TouchableOpacity>

        {/* CTA Card */}
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>
            What if I need help with my order?
          </Text>
          <Text style={styles.ctaSubtitle}>
            Our premium support team is available to resolve any issues with
            your nightlife flyers.
          </Text>
          <TouchableOpacity
            style={styles.ctaButtonPrimary}
            onPress={handleContactSupport}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaButtonPrimaryText}>Contact Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ctaButtonOutline}
            onPress={handleBrowseFAQ}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaButtonOutlineText}>Browse FAQ</Text>
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
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.textPrimary,
    transform: [{ rotate: '180deg' }],
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titleRow: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.extraBold,
    marginBottom: 6,
  },
  titleWhite: {
    color: Colors.textPrimary,
  },
  titleRed: {
    color: Colors.primary,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.regular,
    textAlign: 'center',
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
    marginBottom: 16,
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
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.textMuted,
  },
  tabLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semiBold,
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: Colors.textPrimary,
  },
  grid: {
    gap: 10,
    marginBottom: 10,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  topicCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
  },
  topicCardEmpty: {
    flex: 1,
  },
  topicIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#2A1010',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  topicIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  topicTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 4,
    lineHeight: 18,
  },
  topicSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.regular,
    lineHeight: 16,
  },
  trustCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 14,
    marginVertical: 10,
  },
  trustIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2A1010',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustText: {
    flex: 1,
  },
  ctaCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 24,
    marginTop: 8,
  },
  ctaTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.extraBold,
    marginBottom: 10,
    lineHeight: 28,
  },
  ctaSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.regular,
    lineHeight: 20,
    marginBottom: 20,
  },
  ctaButtonPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  ctaButtonPrimaryText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
  },
  ctaButtonOutline: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  ctaButtonOutlineText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semiBold,
  },
});

export default HelpCenterScreen;
