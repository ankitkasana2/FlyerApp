import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

// ─── Person Icon ──────────────────────────────────────────────────────────────
const PersonIcon: React.FC<{ color?: string; size?: number }> = ({
  color = Colors.textSecondary,
  size = 18,
}) => (
  <View style={{ width: size, height: size, alignItems: 'center' }}>
    <View
      style={{
        width: size * 0.44,
        height: size * 0.44,
        borderRadius: size * 0.22,
        borderWidth: 1.8,
        borderColor: color,
        marginTop: size * 0.02,
      }}
    />
    <View
      style={{
        width: size * 0.72,
        height: size * 0.38,
        borderTopLeftRadius: size * 0.36,
        borderTopRightRadius: size * 0.36,
        borderWidth: 1.8,
        borderBottomWidth: 0,
        borderColor: color,
        marginTop: size * 0.06,
      }}
    />
  </View>
);

// ─── Lock Icon ────────────────────────────────────────────────────────────────
const LockIcon: React.FC<{ color?: string; size?: number }> = ({
  color = Colors.textSecondary,
  size = 18,
}) => (
  <View style={{ width: size, height: size, alignItems: 'center' }}>
    <View
      style={{
        width: size * 0.5,
        height: size * 0.38,
        borderTopLeftRadius: size * 0.25,
        borderTopRightRadius: size * 0.25,
        borderWidth: 1.8,
        borderBottomWidth: 0,
        borderColor: color,
        marginTop: size * 0.04,
      }}
    />
    <View
      style={{
        width: size * 0.78,
        height: size * 0.46,
        backgroundColor: color,
        borderRadius: size * 0.08,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.18,
          height: size * 0.18,
          borderRadius: size * 0.09,
          backgroundColor: Colors.surface,
        }}
      />
    </View>
  </View>
);

// ─── Bell Icon ────────────────────────────────────────────────────────────────
const BellIcon: React.FC<{ color?: string; size?: number }> = ({
  color = Colors.textSecondary,
  size = 18,
}) => (
  <View style={{ width: size, height: size, alignItems: 'center' }}>
    <View
      style={{
        width: size * 0.7,
        height: size * 0.6,
        borderTopLeftRadius: size * 0.35,
        borderTopRightRadius: size * 0.35,
        borderWidth: 1.8,
        borderBottomWidth: 0,
        borderColor: color,
        marginTop: size * 0.1,
      }}
    />
    <View
      style={{
        width: size * 0.85,
        height: 1.8,
        backgroundColor: color,
        borderRadius: 1,
      }}
    />
    <View
      style={{
        width: size * 0.28,
        height: size * 0.16,
        borderBottomLeftRadius: size * 0.14,
        borderBottomRightRadius: size * 0.14,
        borderLeftWidth: 1.8,
        borderRightWidth: 1.8,
        borderBottomWidth: 1.8,
        borderColor: color,
      }}
    />
  </View>
);

// ─── Question Icon ────────────────────────────────────────────────────────────
const HelpIcon: React.FC<{ color?: string; size?: number }> = ({
  color = Colors.textSecondary,
  size = 18,
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 1.8,
      borderColor: color,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Text
      style={{
        fontSize: size * 0.56,
        color,
        fontWeight: '700',
        lineHeight: size * 0.7,
        includeFontPadding: false,
      }}
    >
      ?
    </Text>
  </View>
);

// ─── Chevron Right ────────────────────────────────────────────────────────────
const ChevronRight: React.FC<{ color?: string }> = ({ color = Colors.textMuted }) => (
  <View style={{ width: 16, height: 16, justifyContent: 'center', alignItems: 'center' }}>
    <View
      style={{
        width: 7,
        height: 7,
        borderTopWidth: 1.8,
        borderRightWidth: 1.8,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
      }}
    />
  </View>
);

// ─── Types ────────────────────────────────────────────────────────────────────
export type SettingsIconType = 'person' | 'lock' | 'bell' | 'help';

export interface SettingsMenuItem {
  id: string;
  label: string;
  icon: SettingsIconType;
  badge?: string;
  onPress: () => void;
}

export interface SettingsMenuListProps {
  items: SettingsMenuItem[];
}

const ICON_MAP: Record<SettingsIconType, React.FC<{ color?: string; size?: number }>> = {
  person: PersonIcon,
  lock: LockIcon,
  bell: BellIcon,
  help: HelpIcon,
};

// ─── Component ────────────────────────────────────────────────────────────────
const SettingsMenuList: React.FC<SettingsMenuListProps> = ({ items }) => (
  <View style={styles.container}>
    {items.map((item, index) => {
      const IconComponent = ICON_MAP[item.icon];
      const isLast = index === items.length - 1;

      return (
        <TouchableOpacity
          key={item.id}
          style={[styles.row, !isLast && styles.rowBorder]}
          onPress={item.onPress}
          activeOpacity={0.7}
        >
          {/* Icon */}
          <View style={styles.iconWrapper}>
            <IconComponent color={Colors.textSecondary} size={18} />
          </View>

          {/* Label */}
          <Text style={styles.label}>{item.label}</Text>

          {/* Badge + chevron */}
          <View style={styles.rightSlot}>
            {item.badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            ) : null}
            <ChevronRight />
          </View>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconWrapper: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    flex: 1,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
  },
  rightSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  badgeText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.black,
    color: Colors.textPrimary,
    letterSpacing: 0.6,
  },
});

export default SettingsMenuList;