import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import FormField from './FormField';
import type { PickedImage } from '../../hooks/useImagePicker';

export type PersonWithPhoto = {
  name: string;
  image: PickedImage | null;
  hasPhoto: boolean;
};

type Props = {
  label: string;
  items: PersonWithPhoto[];
  onChange: (next: PersonWithPhoto[]) => void;
  onPickImage: (index: number) => void;
  onPickFromLibrary: (index: number) => void;
  onRemoveImage: (index: number) => void;
};

const PeopleListWithPhotos: React.FC<Props> = ({
  label,
  items,
  onChange,
  onPickImage,
  onPickFromLibrary,
  onRemoveImage,
}) => {
  const setName = useCallback(
    (index: number, value: string) => {
      onChange(
        items.map((item, i) => (i === index ? { ...item, name: value } : item)),
      );
    },
    [items, onChange],
  );

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      {items.map((item, index) => {
        const canUpload = item.hasPhoto;
        return (
          <View key={`${label}_${index}`} style={styles.card}>
            <FormField
              label={`${label.slice(0, -1)} ${index + 1}`}
              placeholder="Name"
              value={item.name}
              onChangeText={t => setName(index, t)}
            />

            {canUpload ? (
              <View style={styles.imageRow}>
                <View style={styles.previewBox}>
                  {item.image?.uri ? (
                    <Image source={{ uri: item.image.uri }} style={styles.preview} />
                  ) : (
                    <Text style={styles.previewHint}>No photo</Text>
                  )}
                </View>

                <View style={styles.btnCol}>
                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={() => onPickImage(index)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.smallBtnText}>Upload</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={() => onPickFromLibrary(index)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.smallBtnText}>Library</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallBtn, styles.smallBtnGhost]}
                    onPress={() => onRemoveImage(index)}
                    activeOpacity={0.85}
                    disabled={!item.image}
                  >
                    <Text style={styles.smallBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.noPhotoHint}>Text only (no photo for this slot)</Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { gap: 12 },
  label: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
  },
  card: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    backgroundColor: Colors.surface,
  },
  imageRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  previewBox: {
    width: 84,
    height: 84,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: { width: '100%', height: '100%' },
  previewHint: { color: Colors.textSecondary, fontSize: Typography.fontSizes.xs },
  btnCol: { flex: 1, gap: 8 },
  smallBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  smallBtnGhost: { backgroundColor: Colors.surfaceElevated },
  smallBtnText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
  },
  noPhotoHint: { color: Colors.textSecondary, fontSize: Typography.fontSizes.xs },
});

export default memo(PeopleListWithPhotos);

