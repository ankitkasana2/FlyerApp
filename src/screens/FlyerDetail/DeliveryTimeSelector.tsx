import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

export interface DeliveryOption {
  id: string;
  label: string;
  sublabel?: string;
  isFree?: boolean;
}

export interface DeliveryTimeSelectorProps {
  options: DeliveryOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const DeliveryTimeSelector: React.FC<DeliveryTimeSelectorProps> = ({
  options,
  selectedId,
  onSelect,
}) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>Delivery Time</Text>
    <View style={styles.optionsRow}>
      {options.map((opt) => {
        const isActive = opt.id === selectedId;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[styles.option, isActive && styles.optionActive]}
            onPress={() => onSelect(opt.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionLabel, isActive && styles.optionLabelActive]}>
              {opt.label}
            </Text>
            {opt.sublabel ? (
              <Text style={[styles.optionSublabel, isActive && styles.optionSublabelActive]}>
                {opt.sublabel}
              </Text>
            ) : null}
            {opt.isFree ? (
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>FREE</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  label: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  optionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textSecondary,
  },
  optionLabelActive: {
    color: Colors.textPrimary,
  },
  optionSublabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.regular,
    color: Colors.textMuted,
  },
  optionSublabelActive: {
    color: 'rgba(255,255,255,0.75)',
  },
  freeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },
  freeBadgeText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.black,
    color: Colors.textPrimary,
    letterSpacing: 0.8,
  },
});

export default DeliveryTimeSelector;