import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';

import { useStores } from '../../stores/StoreContext';
import * as mediaService from '../../services/mediaService';
import type { MediaItem } from '../../types/api';
import ScreenHeader from '../../components/common/ScreenHeader';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

// Mirrors the web app's formatCognitoUserId — adds "cognito_" prefix for email
// users so it matches the web_user_id stored in the database.
const formatWebUserId = (userId: string, provider: string): string => {
  if (!userId || userId.includes('_')) return userId;
  const prefix = provider === 'email' || provider === 'cognito' ? 'cognito' : provider;
  return `${prefix}_${userId}`;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMNS = 2;
const CARD_GAP = 12;
const CARD_H_PAD = 16;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_H_PAD * 2 - CARD_GAP) / 2;
const CARD_IMAGE_HEIGHT = CARD_WIDTH * 1.1;

type FilterType = 'all' | 'image' | 'logo';

const MediaLibraryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { authStore } = useStores();
  const rawUserId = authStore.user?.id ?? '';
  const provider = authStore.user?.provider ?? 'email';
  const userId = formatWebUserId(rawUserId, provider);

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const fetchMedia = useCallback(async (silent = false) => {
    if (!userId) return;
    if (!silent) setLoading(true);
    try {
      const res = await mediaService.listMedia(userId);
      setItems(res.data.media ?? []);
    } catch {
      // silently ignore fetch errors
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMedia(true);
  }, [fetchMedia]);

  const handleUpload = useCallback(async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
      selectionLimit: 1,
    });

    if (result.didCancel || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const file = {
      uri: asset.uri!,
      name: asset.fileName ?? `upload_${Date.now()}.jpg`,
      type: asset.type ?? 'image/jpeg',
    };

    setUploading(true);
    try {
      await mediaService.uploadMedia(userId, file);
      await fetchMedia(true);
    } catch {
      Alert.alert('Upload failed', 'Could not upload the image. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [userId, fetchMedia]);

  const handleDelete = useCallback((item: MediaItem) => {
    Alert.alert(
      'Delete File',
      `Remove "${item.original_name}" from your library?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await mediaService.deleteMedia(item.id, userId);
              setItems(prev => prev.filter(i => i.id !== item.id));
            } catch {
              Alert.alert('Error', 'Could not delete the file.');
            }
          },
        },
      ],
    );
  }, [userId]);

  const filtered = items.filter(item => {
    if (filter === 'image') return !item.is_logo;
    if (filter === 'logo') return item.is_logo;
    return true;
  });

  const imageCount = items.filter(i => !i.is_logo).length;
  const logoCount = items.filter(i => i.is_logo).length;

  const renderItem = ({ item }: { item: MediaItem }) => (
    <View style={styles.card}>
      {/* Image */}
      <View style={styles.cardImageWrap}>
        <Image
          source={{ uri: item.file_url }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {item.is_logo ? 'LOGO' : 'IMAGE'}
          </Text>
        </View>
      </View>

      {/* Filename */}
      <Text style={styles.cardName} numberOfLines={1} ellipsizeMode="tail">
        {item.original_name}
      </Text>

      {/* Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const UploadButton = (
    <TouchableOpacity
      style={styles.uploadBtn}
      onPress={handleUpload}
      activeOpacity={0.7}
      disabled={uploading}
    >
      {uploading ? (
        <ActivityIndicator size="small" color={Colors.textInverse} />
      ) : (
        <Text style={styles.uploadBtnText}>+ Upload</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        title="Media Library"
        onBackPress={() => navigation.goBack()}
        rightSlot={UploadButton}
      />

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{items.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{imageCount}</Text>
          <Text style={styles.statLabel}>Images</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{logoCount}</Text>
          <Text style={styles.statLabel}>Logos</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filters}>
        {(['all', 'image', 'logo'] as FilterType[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f === 'all' ? `All (${items.length})` : f === 'image' ? `Images (${imageCount})` : `Logos (${logoCount})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No files yet.</Text>
          <Text style={styles.emptySubtext}>Tap "+ Upload" to add images.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => String(item.id)}
          numColumns={COLUMNS}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  uploadBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtnText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.semiBold,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginTop: 12,
    gap: 0,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: Typography.fontSizes.lg,
    fontFamily: Typography.fontFamilies.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: Typography.fontSizes.xs,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 12,
    marginBottom: 4,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabText: {
    fontSize: Typography.fontSizes.xs,
    fontFamily: Typography.fontFamilies.medium,
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.textInverse,
  },
  grid: {
    paddingHorizontal: CARD_H_PAD,
    paddingBottom: 32,
    paddingTop: 8,
  },
  row: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImageWrap: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.60)',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  typeBadgeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontFamily: Typography.fontFamilies.bold,
    letterSpacing: 0.8,
  },
  cardName: {
    fontSize: Typography.fontSizes.xs,
    fontFamily: Typography.fontFamilies.medium,
    color: Colors.textPrimary,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 6,
  },
  cardActions: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 6,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: `${Colors.primary}22`,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: Typography.fontSizes.xs,
    fontFamily: Typography.fontFamilies.semiBold,
    color: Colors.primary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: Typography.fontSizes.base,
    fontFamily: Typography.fontFamilies.semiBold,
    color: Colors.textPrimary,
  },
  emptySubtext: {
    fontSize: Typography.fontSizes.sm,
    fontFamily: Typography.fontFamilies.regular,
    color: Colors.textSecondary,
  },
});

export default MediaLibraryScreen;
