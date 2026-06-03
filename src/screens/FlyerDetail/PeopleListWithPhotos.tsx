import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import FormField from './FormField';
import type { PickedImage } from '../../hooks/useImagePicker';
import type { RecentKey } from '../../utils/recentItems';

export type PersonWithPhoto = {
  name: string;
  image: PickedImage | null;
  hasPhoto: boolean;
};

type Props = {
  label: string;
  itemLabel?: string;
  items: PersonWithPhoto[];
  onChange: (next: PersonWithPhoto[]) => void;
  onPickImage: (index: number) => void;
  onPickFromLibrary: (index: number) => void;
  onRemoveImage: (index: number) => void;
  recentNameKey?: RecentKey;
};

const PeopleListWithPhotos: React.FC<Props> = ({
  label,
  itemLabel,
  items,
  onChange,
  onPickImage,
  onPickFromLibrary,
  onRemoveImage,
  recentNameKey,
}) => {
  const resolvedItemLabel = itemLabel ?? label.replace(/s$/i, '').trim();

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
              label={`${resolvedItemLabel} ${index + 1}`}
              placeholder="Name"
              value={item.name}
              onChangeText={t => setName(index, t)}
              recentKey={recentNameKey}
              onRecentSelect={recentNameKey ? t => setName(index, t) : undefined}
            />

            {canUpload ? (
              <View style={styles.imageRow}>
                <View style={styles.previewBox}>
                  {item.image?.uri ? (
                    <Image
                      source={{ uri: item.image.uri }}
                      style={styles.preview}
                    />
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
                    <Text style={styles.smallBtnText}>Upload Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallBtn, styles.smallBtnOutline]}
                    onPress={() => onPickFromLibrary(index)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.smallBtnOutlineText}>Media Library</Text>
                  </TouchableOpacity>
                  {item.image ? (
                    <TouchableOpacity
                      style={[styles.smallBtn, styles.smallBtnGhost]}
                      onPress={() => onRemoveImage(index)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.smallBtnText}>Remove</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            ) : null}
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
  imageRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
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
  previewHint: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.xs,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  btnCol: { flex: 1, gap: 8 },
  smallBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  smallBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  smallBtnOutlineText: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
  },
  smallBtnGhost: { backgroundColor: Colors.surfaceElevated },
  smallBtnText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
  },
});

export default memo(PeopleListWithPhotos);
