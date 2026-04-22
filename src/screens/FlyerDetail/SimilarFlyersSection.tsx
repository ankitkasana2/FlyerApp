import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  ImageSourcePropType,
  Dimensions,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.38;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

export interface SimilarFlyer {
  id: string;
  title: string;
  image: ImageSourcePropType;
  isPremium?: boolean;
}

export interface SimilarFlyersSectionProps {
  items: SimilarFlyer[];
  onSeeAll: () => void;
  onItemPress: (id: string) => void;
}

const SimilarFlyersSection: React.FC<SimilarFlyersSectionProps> = ({
  items,
  onSeeAll,
  onItemPress,
}) => (
  <View style={styles.wrapper}>
    {/* Section header */}
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Similar Flyers</Text>
      <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
        <Text style={styles.seeAll}>SEE ALL</Text>
      </TouchableOpacity>
    </View>

    {/* Horizontal scroll */}
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={() => onItemPress(item.id)}
          activeOpacity={0.85}
        >
          <Image source={item.image} style={styles.cardImage} resizeMode="cover" />

          {item.isPremium && (
            <View style={styles.premiumBadge}>
              {/* Replace emoji with your PNG crown icon */}
              <Text style={styles.premiumIcon}>👑</Text>
            </View>
          )}

          <View style={styles.cardOverlay} />
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.black,
    color: Colors.primary,
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    justifyContent: 'flex-end',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primary,
    width: 26,
    height: 26,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  premiumIcon: {
    fontSize: 12,
  },
  cardTitle: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textPrimary,
    paddingHorizontal: 8,
    paddingBottom: 10,
    zIndex: 1,
  },
});

export default SimilarFlyersSection;