import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

export interface ExtraItem {
  id: string;
  label: string;
  price: string;
  isFree?: boolean;
}

export interface ExtrasSelectorProps {
  extras: ExtraItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

const ExtrasSelector: React.FC<ExtrasSelectorProps> = ({
  extras,
  selectedIds,
  onToggle,
}) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>Extras</Text>
    <View style={styles.list}>
      {extras.map((extra) => {
        const isSelected = selectedIds.includes(extra.id);
        return (
          <TouchableOpacity
            key={extra.id}
            style={styles.row}
            onPress={() => onToggle(extra.id)}
            activeOpacity={0.8}
          >
            {/* Checkbox */}
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && (
                <Text style={styles.checkMark}>✓</Text>
              )}
            </View>

            {/* Label */}
            <Text style={styles.extraLabel}>{extra.label}</Text>

            {/* Price */}
            {extra.isFree ? (
              <Text style={styles.freePrice}>FREE</Text>
            ) : (
              <Text style={styles.price}>{extra.price}</Text>
            )}
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
  list: {
    gap: 0,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkMark: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.black,
  },
  extraLabel: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
  },
  price: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textPrimary,
  },
  freePrice: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.black,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
});

export default ExtrasSelector;