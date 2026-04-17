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
  const bg =
    status === 'preparing'
      ? Colors.surfaceElevated
      : status === 'new'
      ? Colors.primary + '22'
      : Colors.surfaceElevated;

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
            <Text style={styles.orderTitle}>
              Order {order.orderNumber}
              <Text style={styles.deliveredAt}>
                {' '}• Delivered {order.deliveredAt}
              </Text>
            </Text>
            {order.status === 'new' && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={handleViewDetails}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <View style={styles.viewDetailsRow}>
              <Text style={styles.viewDetailsText}>View Order Details</Text>
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
                <Text style={styles.fileMeta}>
                  {file.size} • {file.type}
                </Text>
              </View>

              {/* Download button */}
              <TouchableOpacity
                style={styles.fileDownloadBtn}
                onPress={() => onDownloadFile(order.id, file.id)}
                activeOpacity={0.75}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <DownloadIcon color={Colors.textPrimary} size={18} />
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
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    gap: 14,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  orderMeta: {
    flex: 1,
    gap: 4,
  },
  orderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  orderTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  deliveredAt: {
    fontWeight: Typography.fontWeights.regular,
    color: Colors.textSecondary,
  },
  newBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  newBadgeText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.black,
    color: Colors.textPrimary,
    letterSpacing: 0.8,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: Typography.fontSizes.xs,
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
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 28,
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
  fileMeta: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.regular,
  },
  fileDownloadBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DownloadOrderCard;