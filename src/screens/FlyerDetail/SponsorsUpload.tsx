import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import AppImages from '../../assets/App';
import type { PickedImage } from '../../hooks/useImagePicker';

export interface SponsorsUploadProps {
  count?: number;
  /** Array of picked images, indexed per sponsor slot */
  pickedImages: (PickedImage | null)[];
  onUploadPress: (index: number) => void;
  onLibraryPress: (index: number) => void;
  onRemove?: (index: number) => void;
}

const SponsorsUpload: React.FC<SponsorsUploadProps> = ({
  count = 3,
  pickedImages,
  onUploadPress,
  onLibraryPress,
  onRemove,
}) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>Sponsors</Text>
    <View style={styles.rowsBlock}>
      {Array.from({ length: count }).map((_, i) => {
        const img = pickedImages[i] ?? null;
        return (
          <View key={i}>
            <Text style={styles.slotLabel}>Sponsor {i + 1}</Text>

            {img ? (
              /* ── Preview ── */
              <View style={styles.previewRow}>
                <Image
                  source={{ uri: img.uri }}
                  style={styles.preview}
                  resizeMode="cover"
                />
                <Text style={styles.previewName} numberOfLines={1}>
                  {img.name}
                </Text>
                {onRemove && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => onRemove(i)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              /* ── Picker buttons ── */
              <View style={styles.sponsorRow}>
                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={() => onUploadPress(i)}
                  activeOpacity={0.8}
                >
                  <Image source={AppImages.upload} style={styles.uploadIconImage} />
                  <Text style={styles.uploadBtnText}>UPLOAD SPONSOR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.libraryBtn}
                  onPress={() => onLibraryPress(i)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.libraryBtnText}>LIBRARY</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
  rowsBlock: {
    gap: 12,
  },
  slotLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: Typography.fontWeights.medium,
  },
  sponsorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flex: 2,
    justifyContent: 'center',
  },
  uploadIconImage: {
    width: 14,
    height: 14,
  },
  uploadBtnText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.black,
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  libraryBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  libraryBtnText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.black,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  // ── Preview ──
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  preview: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: Colors.surface,
  },
  previewName: {
    flex: 1,
    fontSize: Typography.fontSizes.xs,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  removeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: Typography.fontWeights.bold,
  },
});

export default SponsorsUpload;