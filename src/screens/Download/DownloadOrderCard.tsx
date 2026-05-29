import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

// ─── Download Arrow Icon ──────────────────────────────────────────────────────
const DownloadIcon: React.FC<{ color?: string; size?: number }> = ({
  color = Colors.textPrimary,
  size = 18,
}) => (
  <View style={{ width: size, height: size, alignItems: 'center' }}>
    {/* Vertical shaft */}
    <View
      style={{
        position: 'absolute',
        top: 0,
        width: 2,
        height: size * 0.58,
        backgroundColor: color,
        borderRadius: 1,
      }}
    />
    {/* Left wing of arrow */}
    <View
      style={{
        position: 'absolute',
        top: size * 0.34,
        left: size * 0.07,
        width: size * 0.38,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        transform: [{ rotate: '45deg' }],
      }}
    />
    {/* Right wing of arrow */}
    <View
      style={{
        position: 'absolute',
        top: size * 0.34,
        right: size * 0.07,
        width: size * 0.38,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        transform: [{ rotate: '-45deg' }],
      }}
    />
    {/* Base line */}
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        width: size * 0.85,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
      }}
    />
  </View>
);

// ─── Folder Icon ──────────────────────────────────────────────────────────────
const FolderIcon: React.FC<{ color?: string; size?: number }> = ({
  color = Colors.primary,
  size = 20,
}) => (
  <View style={{ width: size, height: size }}>
    {/* Folder tab */}
    <View
      style={{
        position: 'absolute',
        top: size * 0.08,
        left: 0,
        width: size * 0.4,
        height: size * 0.18,
        backgroundColor: color,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 5,
      }}
    />
    {/* Folder body */}
    <View
      style={{
        position: 'absolute',
        top: size * 0.22,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: color,
        borderRadius: 4,
        borderTopLeftRadius: 0,
      }}
    />
  </View>
);

// ─── Check Circle Icon ────────────────────────────────────────────────────────
const CheckCircleIcon: React.FC<{ color?: string; size?: number }> = ({
  color = Colors.textMuted,
  size = 20,
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 2,
      borderColor: color,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    {/* Checkmark left */}
    <View
      style={{
        position: 'absolute',
        width: size * 0.25,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        bottom: size * 0.3,
        left: size * 0.15,
        transform: [{ rotate: '45deg' }],
      }}
    />
    {/* Checkmark right */}
    <View
      style={{
        position: 'absolute',
        width: size * 0.42,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        bottom: size * 0.33,
        right: size * 0.1,
        transform: [{ rotate: '-55deg' }],
      }}
    />
  </View>
);

// ─── Three Dots (preparing) Icon ──────────────────────────────────────────────
const ThreeDotsIcon: React.FC<{ color?: string; size?: number }> = ({
  color = Colors.textMuted,
  size = 28,
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 1.5,
      borderColor: color,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: size * 0.12,
    }}
  >
    {[0, 1, 2].map((i) => (
      <View
        key={i}
        style={{
          width: size * 0.1,
          height: size * 0.1,
          borderRadius: size * 0.05,
          backgroundColor: color,
        }}
      />
    ))}
  </View>
);

// ─── File Icon (generic doc) ──────────────────────────────────────────────────
const FileIcon: React.FC<{ color?: string; size?: number }> = ({
  color = Colors.textSecondary,
  size = 20,
}) => (
  <View style={{ width: size, height: size }}>
    {/* Page body */}
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: size * 0.28,
        bottom: 0,
        borderWidth: 1.5,
        borderColor: color,
        borderRadius: 3,
      }}
    />
    {/* Folded corner */}
    <View
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: size * 0.32,
        height: size * 0.32,
        borderBottomLeftRadius: 3,
        borderLeftWidth: 1.5,
        borderBottomWidth: 1.5,
        borderColor: color,
      }}
    />
    {/* Lines */}
    {[0.38, 0.54, 0.7].map((pos, i) => (
      <View
        key={i}
        style={{
          position: 'absolute',
          top: size * pos,
          left: size * 0.16,
          right: size * 0.36,
          height: 1.5,
          backgroundColor: color,
          borderRadius: 1,
          opacity: 0.6,
        }}
      />
    ))}
  </View>
);

// ─── Types ────────────────────────────────────────────────────────────────────
export type OrderStatus = 'preparing' | 'new' | 'delivered';

const STATUS_META: Record<
  OrderStatus,
  { label: string; bg: string; fg: string; iconBg: string }
> = {
  new: {
    label: 'New',
    bg: `${Colors.primary}22`,
    fg: Colors.primary,
    iconBg: `${Colors.primary}22`,
  },
  delivered: {
    label: 'Delivered',
    bg: `${Colors.success}1A`,
    fg: Colors.success,
    iconBg: Colors.surfaceElevated,
  },
  preparing: {
    label: 'Preparing',
    bg: `${Colors.warning}1A`,
    fg: Colors.warning,
    iconBg: Colors.surfaceElevated,
  },
};

export interface DownloadFile {
  id: string;
  name: string;
  size: string;
  type: string;
  thumbnail?: ImageSourcePropType;
}

export interface DownloadOrder {
  id: string;
  orderNumber: string;
  deliveredAt: string;
  status: OrderStatus;
  files: DownloadFile[];
}

interface DownloadOrderCardProps {
  order: DownloadOrder;
  onViewDetails: (orderNumber: string) => void;
  onDownloadFile: (orderId: string, fileId: string) => void;
}

// ─── Order Status Icon ────────────────────────────────────────────────────────
const OrderStatusIcon: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const size = 36;
  const meta = STATUS_META[status];
  const bg = meta?.iconBg ?? Colors.surfaceElevated;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        backgroundColor: bg,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {status === 'preparing' && <DownloadIcon color={Colors.textSecondary} size={18} />}
      {status === 'new' && <FolderIcon color={Colors.primary} size={20} />}
      {status === 'delivered' && <CheckCircleIcon color={Colors.textMuted} size={20} />}
    </View>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const DownloadOrderCard: React.FC<DownloadOrderCardProps> = ({
  order,
  onViewDetails,
  onDownloadFile,
}) => {
  const statusMeta = STATUS_META[order.status];
  const handleViewDetails = useCallback(
    () => onViewDetails(order.orderNumber),
    [order.orderNumber, onViewDetails],
  );

  return (
    <View style={styles.card}>
      {/* ── Order Header ── */}
      <View style={styles.orderHeader}>
        <OrderStatusIcon status={order.status} />

        <View style={styles.orderMeta}>
          <View style={styles.orderTopRow}>
            <View style={styles.orderTitleWrap}>
              <Text style={styles.orderTitle}>Order {order.orderNumber}</Text>
              <Text style={styles.orderSub}>
                {order.status === 'preparing'
                  ? `Updated ${order.deliveredAt}`
                  : `Delivered ${order.deliveredAt}`}
              </Text>
            </View>

            <View
              style={[styles.statusPill, { backgroundColor: statusMeta.bg }]}
            >
              <Text style={[styles.statusPillText, { color: statusMeta.fg }]}>
                {statusMeta.label}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleViewDetails}
            activeOpacity={0.72}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.viewDetailsRow}>
              <Text style={styles.viewDetailsText}>View order details</Text>
              {/* External link arrow */}
              <View style={styles.externalIcon}>
                <View style={styles.externalArrowShaft} />
                <View style={styles.externalArrowHead} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Files ── */}
      {order.status === 'preparing' ? (
        <View style={styles.preparingBox}>
          <ThreeDotsIcon color={Colors.textMuted} size={30} />
          <Text style={styles.preparingText}>Files are being prepared...</Text>
        </View>
      ) : (
        <View style={styles.filesBlock}>
          {order.files.map((file) => (
            <View key={file.id} style={styles.fileRow}>
              {/* File thumbnail or generic icon */}
              <View style={styles.fileThumbnailWrapper}>
                {file.thumbnail ? (
                  <Image
                    source={file.thumbnail}
                    style={styles.fileThumbnail}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.fileIconBox}>
                    <FileIcon color={Colors.textSecondary} size={22} />
                  </View>
                )}
              </View>

              {/* File info */}
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
                <View style={styles.fileMetaRow}>
                  <Text style={styles.fileMeta}>{file.size}</Text>
                  <View style={styles.dot} />
                  <View style={styles.typeChip}>
                    <Text style={styles.typeChipText}>{file.type}</Text>
                  </View>
                </View>
              </View>

              {/* Download button */}
              <TouchableOpacity
                style={styles.fileDownloadBtn}
                onPress={() => onDownloadFile(order.id, file.id)}
                activeOpacity={0.75}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <View style={styles.downloadBtnInner}>
                  <DownloadIcon color={Colors.textPrimary} size={18} />
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  orderMeta: {
    flex: 1,
    gap: 6,
  },
  orderTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  orderTitleWrap: {
    flex: 1,
    gap: 2,
  },
  orderTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  orderSub: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.regular,
    color: Colors.textSecondary,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: Typography.fontWeights.semiBold,
    letterSpacing: 0.3,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.primary,
  },
  externalIcon: {
    width: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  externalArrowShaft: {
    position: 'absolute',
    width: 7,
    height: 1.5,
    backgroundColor: Colors.primary,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
    top: 1,
    right: 0,
  },
  externalArrowHead: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 5,
    height: 5,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: Colors.primary,
  },

  // Preparing state
  preparingBox: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 30,
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceElevated,
  },
  preparingText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textMuted,
    fontWeight: Typography.fontWeights.medium,
  },

  // File rows
  filesBlock: {
    gap: 12,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fileThumbnailWrapper: {
    width: 48,
    height: 48,
    borderRadius: 10,
    overflow: 'hidden',
  },
  fileThumbnail: {
    width: '100%',
    height: '100%',
  },
  fileIconBox: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  fileInfo: {
    flex: 1,
    gap: 3,
  },
  fileName: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textPrimary,
  },
  fileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileMeta: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.regular,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
    opacity: 0.8,
  },
  typeChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: `${Colors.primary}18`,
    borderWidth: 1,
    borderColor: `${Colors.primary}33`,
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.primary,
    letterSpacing: 0.4,
  },
  fileDownloadBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadBtnInner: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: `${Colors.primary}22`,
    borderWidth: 1,
    borderColor: `${Colors.primary}33`,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DownloadOrderCard;
