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

export interface VenueLogoUploadProps {
  /** Currently picked image (null = nothing chosen yet) */
  pickedImage: PickedImage | null;
  /** Called when the user taps "Upload Logo" (camera) */
  onUploadPress: () => void;
  /** Called when the user taps "Choose from Library" */
  onChooseFromLibrary: () => void;
  /** Called when the user taps the ✕ on the preview to remove */
  onRemove?: () => void;
}

const VenueLogoUpload: React.FC<VenueLogoUploadProps> = ({
  pickedImage,
  onUploadPress,
  onChooseFromLibrary,
  onRemove,
}) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>Venue Logo</Text>

    {/* ── Preview if image is chosen ── */}
    {pickedImage ? (
      <View style={styles.previewRow}>
        <Image
          source={{ uri: pickedImage.uri }}
          style={styles.preview}
          resizeMode="cover"
        />
        <View style={styles.previewMeta}>
          <Text style={styles.previewName} numberOfLines={1}>
            {pickedImage.name}
          </Text>
          <Text style={styles.previewHint}>Tap × to remove</Text>
        </View>
        {onRemove && (
          <TouchableOpacity style={styles.removeBtn} onPress={onRemove} activeOpacity={0.8}>
            <Text style={styles.removeText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    ) : (
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={onUploadPress}
          activeOpacity={0.8}
        >
          <Image source={AppImages.upload} style={styles.uploadIconImage} />
          <Text style={styles.uploadBtnText}>UPLOAD LOGO</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.libraryBtn}
          onPress={onChooseFromLibrary}
          activeOpacity={0.8}
        >
          <Text style={styles.libraryBtnText}>CHOOSE FROM LIBRARY</Text>
        </TouchableOpacity>
      </View>
    )}
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
  buttonRow: {
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
    flex: 1,
    justifyContent: 'center',
  },
  uploadIconImage: {
    width: 16,
    height: 16,
  },
  uploadBtnText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.black,
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  libraryBtn: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flex: 1,
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
    gap: 12,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  preview: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  previewMeta: {
    flex: 1,
    gap: 2,
  },
  previewName: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textPrimary,
  },
  previewHint: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: Typography.fontWeights.bold,
  },
});

export default VenueLogoUpload;