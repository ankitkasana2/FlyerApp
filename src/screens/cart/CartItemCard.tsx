// components/cart/CartItemCard.tsx

import React, { useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

// ─── Edit Icon (pencil) ───────────────────────────────────────────────────────
const EditIcon: React.FC<{ color?: string; size?: number }> = ({
  color = Colors.textSecondary,
  size = 14,
}) => (
  <View style={{ width: size, height: size }}>
    {/* Pencil body */}
    <View
      style={{
        position: 'absolute',
        width: size * 0.28,
        height: size * 0.68,
        backgroundColor: color,
        borderRadius: 2,
        top: size * 0.08,
        left: size * 0.36,
        transform: [{ rotate: '-35deg' }],
      }}
    />
    {/* Pencil tip */}
    <View
      style={{
        position: 'absolute',
        bottom: size * 0.02,
        left: size * 0.14,
        width: 0,
        height: 0,
        borderLeftWidth: size * 0.13,
        borderRightWidth: size * 0.13,
        borderTopWidth: size * 0.22,
        borderStyle: 'solid',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: color,
        transform: [{ rotate: '-35deg' }],
      }}
    />
  </View>
);

// ─── Trash Icon ───────────────────────────────────────────────────────────────
const TrashIcon: React.FC<{ color?: string; size?: number }> = ({
  color = Colors.textSecondary,
  size = 14,
}) => (
  <View style={{ width: size, height: size }}>
    {/* Lid */}
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: size * 0.18,
        backgroundColor: color,
        borderRadius: 1,
      }}
    />
    {/* Lid handle */}
    <View
      style={{
        position: 'absolute',
        top: -size * 0.12,
        left: size * 0.3,
        width: size * 0.4,
        height: size * 0.16,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderColor: color,
      }}
    />
    {/* Body */}
    <View
      style={{
        position: 'absolute',
        top: size * 0.22,
        left: size * 0.1,
        right: size * 0.1,
        bottom: 0,
        borderWidth: 1.5,
        borderColor: color,
        borderRadius: 2,
      }}
    />
    {/* Lines inside body */}
    {[0.38, 0.55, 0.72].map((pos, i) => (
      <View
        key={i}
        style={{
          position: 'absolute',
          top: size * pos,
          left: size * 0.3,
          width: size * 0.15,
          height: size * 0.38,
          borderLeftWidth: 1.2,
          borderColor: color,
          opacity: 0.7,
          transform: [{ rotate: '0deg' }],
        }}
      />
    ))}
  </View>
);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CartItemData {
  id: string;
  title: string;
  templateName: string;
  platform: string;       // e.g. "Instagram Post"
  status: 'active' | 'pending' | 'inactive';
  infoLabel?: string;     // e.g. "Only Info"
  presenter: string;
  date: string;
  delivery: string;
  price: string;
  image: ImageSourcePropType;
}

export interface CartItemCardProps {
  item: CartItemData;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onCheckout: (id: string) => void;
  onContinueShopping: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onEdit,
  onRemove,
  onCheckout,
  onContinueShopping,
}) => {
  const handleEdit = useCallback(() => onEdit(item.id), [item.id, onEdit]);
  const handleRemove = useCallback(() => onRemove(item.id), [item.id, onRemove]);
  const handleCheckout = useCallback(() => onCheckout(item.id), [item.id, onCheckout]);

  const statusColor =
    item.status === 'active'
      ? '#4CAF50'
      : item.status === 'pending'
      ? '#FF9800'
      : Colors.textMuted;

  return (
    <View style={styles.card}>
      {/* ── Top row: item count label + clear (handled by parent, not here) ── */}

      {/* ── Product Row ── */}
      <View style={styles.productRow}>
        {/* Thumbnail */}
        <Image source={item.image} style={styles.thumbnail} resizeMode="cover" />

        {/* Details */}
        <View style={styles.details}>
          {/* Title + Platform Tag */}
          <View style={styles.titleRow}>
            <Text style={styles.productTitle}>{item.title}</Text>
            <View style={styles.platformTag}>
              <Text style={styles.platformText}>{item.platform}</Text>
            </View>
          </View>

          {/* Status + Template */}
          <View style={styles.metaRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
            </View>
            <Text style={styles.templateText} numberOfLines={1}>
              Template: {item.templateName}
            </Text>
          </View>

          {/* Info Label */}
          {item.infoLabel && (
            <View style={styles.infoLabelWrapper}>
              <Text style={styles.infoLabelText}>{item.infoLabel}</Text>
            </View>
          )}

          {/* Presenter / Date / Delivery */}
          <View style={styles.metaBlock}>
            <Text style={styles.metaLine}>
              <Text style={styles.metaKey}>Presenting: </Text>
              <Text style={styles.metaValue}>{item.presenter}</Text>
            </Text>
            <Text style={styles.metaLine}>
              <Text style={styles.metaKey}>Date: </Text>
              <Text style={styles.metaValue}>{item.date}</Text>
            </Text>
            <Text style={styles.metaLine}>
              <Text style={styles.metaKey}>Delivery: </Text>
              <Text style={styles.metaValue}>{item.delivery}</Text>
            </Text>
          </View>

          {/* Price */}
          <Text style={styles.price}>{item.price}</Text>
        </View>
      </View>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Action Buttons Row ── */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleEdit} activeOpacity={0.75}>
          <View style={styles.actionIcon}>
            <EditIcon size={14} color={Colors.textSecondary} />
          </View>
          <Text style={styles.actionBtnText}>Edit</Text>
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity style={styles.actionBtn} onPress={handleRemove} activeOpacity={0.75}>
          <View style={styles.actionIcon}>
            <TrashIcon size={14} color={Colors.textSecondary} />
          </View>
          <Text style={styles.actionBtnText}>Remove</Text>
        </TouchableOpacity>
      </View>

      {/* ── Checkout Button ── */}
      <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} activeOpacity={0.85}>
        <Text style={styles.checkoutText}>Checkout</Text>
      </TouchableOpacity>

      {/* ── Continue Shopping ── */}
      <TouchableOpacity
        style={styles.continueBtn}
        onPress={onContinueShopping}
        activeOpacity={0.75}
      >
        <Text style={styles.continueText}>Continue Shopping</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
  },
  productRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  thumbnail: {
    width: 96,
    height: 120,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
  },
  details: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  productTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  platformTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  platformText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    lineHeight: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semiBold,
  },
  templateText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    flex: 1,
  },
  infoLabelWrapper: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  infoLabelText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  metaBlock: {
    gap: 2,
  },
  metaLine: {
    fontSize: Typography.fontSizes.xs,
    lineHeight: 18,
  },
  metaKey: {
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.regular,
  },
  metaValue: {
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  price: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.black,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    backgroundColor: Colors.surfaceElevated,
  },
  actionIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textSecondary,
  },
  actionDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  checkoutText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  continueBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
  },
  continueText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textPrimary,
  },
});

export default CartItemCard;
