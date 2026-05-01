import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import AppImages from '../../assets/App';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_WIDTH = (SCREEN_WIDTH - 16 * 2 - 12) / 2;

// ─── Folder Icon ──────────────────────────────────────────────────────────────
const FolderIcon: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <View style={{ width: size, height: size }}>
    <View
      style={{
        position: 'absolute',
        top: size * 0.12,
        left: 0,
        width: size * 0.42,
        height: size * 0.2,
        backgroundColor: Colors.primary,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 6,
      }}
    />
    <View
      style={{
        position: 'absolute',
        top: size * 0.26,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: Colors.primary,
        borderRadius: 5,
        borderTopLeftRadius: 0,
      }}
    />
  </View>
);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface QuickAccessItem {
  id: string;
  label: string;
  sublabel: string;
  icon: 'heart' | 'folder';
  onPress: () => void;
}

export interface QuickAccessGridProps {
  items: QuickAccessItem[];
}

// ─── Component ────────────────────────────────────────────────────────────────
const QuickAccessGrid: React.FC<QuickAccessGridProps> = ({ items }) => (
  <View style={styles.grid}>
    {items.map((item) => (
      <TouchableOpacity
        key={item.id}
        style={styles.tile}
        onPress={item.onPress}
        activeOpacity={0.8}
      >
        {/* Icon circle */}
        <View style={styles.iconCircle}>
          {item.icon === 'heart' ? (
            <Image
              source={AppImages.favourite}
              style={{ width: 26, height: 26, tintColor: Colors.primary }}
              resizeMode="contain"
            />
          ) : (
            <FolderIcon size={26} />
          )}
        </View>

        <Text style={styles.tileLabel}>{item.label}</Text>
        <Text style={styles.tileSublabel}>{item.sublabel}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  tile: {
    width: TILE_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + '22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileLabel: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  tileSublabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default QuickAccessGrid;