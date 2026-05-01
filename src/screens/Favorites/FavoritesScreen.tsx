import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStores } from '../../stores/StoreContext';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import ScreenHeader from '../../components/common/ScreenHeader';
import FlyerCard, { CARD_GAP, HORIZONTAL_PADDING } from '../../components/home/FlyerCard';
import type { Flyer } from '../../types/flyer';

const FavoritesScreen: React.FC = observer(() => {
  const navigation = useNavigation<any>();
  const { flyerStore, authStore } = useStores();
  const userId = authStore.user?.id;

  useEffect(() => {
    if (userId) {
      flyerStore.fetchFavorites(userId);
    }
  }, [userId, flyerStore]);

  const handleRefresh = useCallback(async () => {
    if (userId) {
      await flyerStore.fetchFavorites(userId);
    }
  }, [userId, flyerStore]);

  const handleCardPress = useCallback((id: string) => {
    navigation.navigate('FlyerDetail', { flyerId: id });
  }, [navigation]);

  const handleFavoritePress = useCallback(async (id: string) => {
    if (!userId) return;
    try {
      // In a real app, you might want a removeFavorite method, 
      // but if addToFavorites toggles or if we just want to remove from list:
      await flyerStore.addToFavorites(userId, Number(id));
      // Refresh list to show updated favorites
      flyerStore.fetchFavorites(userId);
    } catch (err) {
      console.error('Favorite toggle error:', err);
    }
  }, [userId, flyerStore]);

  const renderItem = ({ item }: { item: Flyer }) => {
    const flyerId = String(item._id ?? item.id);
    return (
      <View style={styles.cardWrapper}>
        <FlyerCard
          id={flyerId}
          title={item.title}
          price={String(item.price)}
          imageSource={{ uri: item.image_url || item.imageUrl || item.image }}
          isPremium={item.isPremium}
          isFavorited={true} // They are in favorites list
          onPress={handleCardPress}
          onFavoritePress={handleFavoritePress}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="MY FAVORITES"
        onBackPress={() => navigation.goBack()}
      />

      {flyerStore.loading && flyerStore.favoritesData.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      ) : (
        <FlatList
          data={flyerStore.favoritesData}
          renderItem={renderItem}
          keyExtractor={(item) => String(item._id ?? item.id)}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={flyerStore.loading}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>You haven't added any favorites yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 16,
    paddingBottom: 32,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardWrapper: {
    // FlyerCard handles its own width/height usually but we can constrain it here if needed
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.base,
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.base,
    textAlign: 'center',
  },
});

export default FavoritesScreen;
