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
}

// ─── Component ────────────────────────────────────────────────────────────────
const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onEdit,
  onRemove,
}) => {
  const handleEdit = useCallback(() => onEdit(item.id), [item.id, onEdit]);
  const handleRemove = useCallback(() => onRemove(item.id), [item.id, onRemove]);

  const statusColor =
    item.status === 'active'
      ? Colors.success
      : item.status === 'pending'
      ? Colors.warning
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
          {/* Title + Price */}
          <View style={styles.titleRow}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.priceTop}>{item.price}</Text>
          </View>

          {/* Platform + Status + Template */}
          <View style={styles.metaRow}>
            <View style={styles.platformTag}>
              <Text style={styles.platformText}>{item.platform}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
            </View>
            <View style={styles.templateChip}>
              <Text style={styles.templateChipText} numberOfLines={1}>
                Template {item.templateName}
              </Text>
            </View>
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

          {/* Actions */}
          <View style={styles.actionsInline}>
            <TouchableOpacity
              style={styles.actionTextBtn}
              onPress={handleEdit}
              activeOpacity={0.75}
            >
              <EditIcon size={14} color={Colors.textSecondary} />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionTextBtn}
              onPress={handleRemove}
              activeOpacity={0.75}
            >
              <TrashIcon size={14} color={Colors.textSecondary} />
              <Text style={[styles.actionText, styles.removeText]}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

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
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  productRow: {
    flexDirection: 'row',
    gap: 12,
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
    gap: 10,
  },
  productTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  priceTop: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.black,
    color: Colors.textPrimary,
    marginTop: -1,
  },
  platformTag: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  platformText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textSecondary,
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
  templateChip: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: '100%',
  },
  templateChipText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
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
  actionsInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 2,
  },
  actionTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  actionText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textSecondary,
  },
  removeText: {
    color: Colors.error,
  },
});

export default CartItemCard;
