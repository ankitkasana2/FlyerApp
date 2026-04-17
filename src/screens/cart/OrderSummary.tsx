// components/cart/OrderSummary.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

// ─── Bullet dot icon ─────────────────────────────────────────────────────────
const BulletDot: React.FC = () => (
  <View
    style={{
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: Colors.primary,
      marginTop: 5,
      marginRight: 8,
      flexShrink: 0,
    }}
  />
);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface OrderSummaryProps {
  subtotal: string;
  serviceFees: string;
  total: string;
  inclusions?: string[];
  onProceedToCheckout: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const OrderSummary: React.FC<OrderSummaryProps> = ({
  subtotal,
  serviceFees,
  total,
  inclusions = [
    'High-quality PDF & JPG files',
    'Commercial use license',
    '24/7 Priority support access',
  ],
  onProceedToCheckout,
}) => (
  <View style={styles.container}>
    {/* Title */}
    <Text style={styles.heading}>Order Summary</Text>

    {/* Row: Subtotal */}
    <View style={styles.row}>
      <Text style={styles.rowLabel}>Subtotal</Text>
      <Text style={styles.rowValue}>{subtotal}</Text>
    </View>

    {/* Row: Service Fees */}
    <View style={styles.row}>
      <Text style={styles.rowLabel}>Service fees</Text>
      <Text style={styles.rowValue}>{serviceFees}</Text>
    </View>

    {/* Divider */}
    <View style={styles.divider} />

    {/* Row: Total */}
    <View style={[styles.row, styles.totalRow]}>
      <Text style={styles.totalLabel}>Total</Text>
      <Text style={styles.totalValue}>{total}</Text>
    </View>

    {/* Proceed Button */}
    <TouchableOpacity
      style={styles.proceedBtn}
      onPress={onProceedToCheckout}
      activeOpacity={0.85}
    >
      <Text style={styles.proceedText}>PROCEED TO CHECKOUT</Text>
    </TouchableOpacity>

    {/* Inclusions */}
    {inclusions.length > 0 && (
      <View style={styles.inclusionsBlock}>
        <Text style={styles.inclusionsHeading}>WHAT'S INCLUDED</Text>
        {inclusions.map((item, idx) => (
          <View key={idx} style={styles.inclusionRow}>
            <BulletDot />
            <Text style={styles.inclusionText}>{item}</Text>
          </View>
        ))}
      </View>
    )}
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
  },
  heading: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rowLabel: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.regular,
  },
  rowValue: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  totalRow: {
    marginBottom: 18,
  },
  totalLabel: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.black,
    color: Colors.primary,
  },
  proceedBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  proceedText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.black,
    color: Colors.textPrimary,
    letterSpacing: 1.2,
  },
  inclusionsBlock: {
    gap: 8,
  },
  inclusionsHeading: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  inclusionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  inclusionText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});

export default OrderSummary;
