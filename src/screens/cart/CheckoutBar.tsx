import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

export interface CheckoutBarProps {
  total: string;
  itemCount: number;
  isProcessing?: boolean;
  onPressCheckout: () => void;
}

const CheckoutBar: React.FC<CheckoutBarProps> = ({
  total,
  itemCount,
  isProcessing = false,
  onPressCheckout,
}) => (
  <View style={styles.container}>
    <View style={styles.left}>
      <Text style={styles.totalLabel}>Total</Text>
      <Text style={styles.totalValue}>{total}</Text>
      <Text style={styles.metaText}>
        {itemCount} {itemCount === 1 ? 'item' : 'items'} • Secure checkout
      </Text>
    </View>

    <TouchableOpacity
      style={[styles.button, isProcessing && styles.buttonDisabled]}
      onPress={onPressCheckout}
      disabled={isProcessing}
      activeOpacity={0.85}
    >
      <Text style={styles.buttonText}>
        {isProcessing ? 'Opening…' : 'Checkout'}
      </Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  left: {
    flex: 1,
    minWidth: 0,
  },
  totalLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: Typography.fontWeights.bold,
  },
  totalValue: {
    marginTop: 1,
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.black,
    color: Colors.textPrimary,
  },
  metaText: {
    marginTop: 0,
    fontSize: 11,
    color: Colors.textMuted,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.black,
    color: Colors.primaryForeground,
    letterSpacing: 0.3,
  },
});

export default CheckoutBar;
