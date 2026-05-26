import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as mediaService from '../../services/mediaService';
import { useImagePicker, type PickedImage } from '../../hooks/useImagePicker';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import type { MediaItem } from '../../types/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLS = 3;
const ITEM_GAP = 2;
const ITEM_SIZE = (SCREEN_WIDTH - ITEM_GAP * (NUM_COLS + 1)) / NUM_COLS;

interface MediaLibraryModalProps {
  visible: boolean;
  userId: string;
  onSelect: (image: PickedImage) => void;
  onClose: () => void;
}

const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  visible,
  userId,
  onSelect,
  onClose,
}) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { pickFromLibrary } = useImagePicker();

  const loadMedia = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const { data } = await mediaService.listMedia(userId);
      setItems(data.success ? data.media : []);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (visible && userId) {
      loadMedia();
      setSelectedId(null);
      setSearchQuery('');
    }
  }, [visible, userId, loadMedia]);

  const handleUploadNew = useCallback(async () => {
    const img = await pickFromLibrary();
    if (!img) return;
    setIsUploading(true);
    try {
      await mediaService.uploadMedia(userId, img);
      Toast.show({ type: 'success', text1: 'Image uploaded to library' });
      await loadMedia();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.message || 'Upload failed' });
    } finally {
      setIsUploading(false);
    }
  }, [userId, pickFromLibrary, loadMedia]);

  const handleDelete = useCallback(
    (item: MediaItem) => {
      Alert.alert('Delete Image', `Remove "${item.original_name}" from your library?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await mediaService.deleteMedia(item.id, userId);
              setItems(prev => prev.filter(i => i.id !== item.id));
              if (selectedId === item.id) setSelectedId(null);
              Toast.show({ type: 'success', text1: 'Image removed' });
            } catch (err: any) {
              Toast.show({ type: 'error', text1: err.message || 'Delete failed' });
            }
          },
        },
      ]);
    },
    [userId, selectedId],
  );

  const handleConfirmSelect = useCallback(() => {
    const item = items.find(i => i.id === selectedId);
    if (!item) return;
    onSelect({
      uri: item.file_url,
      name: item.original_name,
      type: 'image/jpeg',
      serverUrl: item.file_url,
    });
  }, [items, selectedId, onSelect]);

  const filtered = searchQuery.trim()
    ? items.filter(i =>
        i.original_name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : items;

  const renderItem = ({ item }: { item: MediaItem }) => {
    const isSelected = selectedId === item.id;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setSelectedId(isSelected ? null : item.id)}
        onLongPress={() => handleDelete(item)}
        style={[styles.gridItem, isSelected && styles.gridItemSelected]}
      >
        <Image
          source={{ uri: item.file_url }}
          style={styles.gridImage}
          resizeMode="cover"
        />
        {isSelected && (
          <View style={styles.checkOverlay}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
        )}
        <View style={styles.nameTag}>
          <Text style={styles.nameTagText} numberOfLines={1}>
            {item.original_name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Media Library</Text>
          <TouchableOpacity
            onPress={handleUploadNew}
            style={styles.headerBtn}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={[styles.headerBtnText, { color: Colors.primary }]}>
                + Upload
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search images..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Hint */}
        <Text style={styles.hint}>Tap to select · Long-press to delete</Text>

        {/* Grid */}
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              {items.length === 0
                ? 'No images yet.\nTap "+ Upload" to add your first image.'
                : 'No images match your search.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={item => String(item.id)}
            numColumns={NUM_COLS}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.useBtn, !selectedId && styles.useBtnDisabled]}
            onPress={handleConfirmSelect}
            disabled={!selectedId}
            activeOpacity={0.85}
          >
            <Text style={styles.useBtnText}>
              {selectedId ? 'Use Selected' : 'Select an image'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.base,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textPrimary,
  },
  headerBtn: {
    minWidth: 64,
    alignItems: 'center',
  },
  headerBtnText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamilies.medium,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hint: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 6,
  },
  gridContent: {
    paddingHorizontal: ITEM_GAP,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: ITEM_GAP / 2,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  gridItemSelected: {
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  checkOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Typography.fontFamilies.bold,
  },
  nameTag: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  nameTagText: {
    fontSize: 9,
    color: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  useBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  useBtnDisabled: {
    opacity: 0.4,
  },
  useBtnText: {
    color: '#fff',
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.bold,
  },
});

export default MediaLibraryModal;
