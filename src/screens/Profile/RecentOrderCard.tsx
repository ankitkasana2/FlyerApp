import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
  Dimensions,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.52;
const CARD_HEIGHT = CARD_WIDTH * 0.82;

export type OrderStatus = 'COMPLETED' | 'PROCESSING' | 'PENDING' | 'CANCELLED';

const STATUS_COLORS: Record<OrderStatus, string> = {
  COMPLETED: '#4CAF50',
  PROCESSING: '#2196F3',
  PENDING: '#FF9800',
  CANCELLED: Colors.primary,
};

export interface RecentOrderCardProps {
  id: string;
  title: string;
  orderNumber: string;
  status: OrderStatus;
  imageSource: ImageSourcePropType;
  onPress: (id: string) => void;
}

const RecentOrderCard: React.FC<RecentOrderCardProps> = ({
  id,
  title,
  orderNumber,
  status,
  imageSource,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => onPress(id)}
    activeOpacity={0.85}
  >
    {/* Background image */}
    <Image source={imageSource} style={styles.image} resizeMode="cover" />

    {/* Dark overlay */}
    <View style={styles.overlay} />

    {/* Status badge */}
    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[status] }]}>
      <Text style={styles.statusText}>{status}</Text>
    </View>

    {/* Bottom info */}
    <View style={styles.bottomInfo}>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <Text style={styles.orderNumber}>{orderNumber}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  statusText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.black,
    color: Colors.textPrimary,
    letterSpacing: 0.6,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    gap: 3,
  },
  title: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  orderNumber: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.regular,
    color: 'rgba(255,255,255,0.65)',
  },
});

export default RecentOrderCard;