import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import ScreenHeader from '../../components/common/ScreenHeader';
import DatePickerField from '../../components/common/DatePickerField';
import FlyerHeroBanner from './FlyerHeroBanner';
import FormField from './FormField';
import SelectDropdown, { SelectOption } from './SelectDropdown';
import DynamicListField from './DynamicListField';
import VenueLogoUpload from './VenueLogoUpload';
import SponsorsUpload from './SponsorsUpload';
import DeliveryTimeSelector, { DeliveryOption } from './DeliveryTimeSelector';
import ExtrasSelector, { ExtraItem } from './ExtrasSelector';
import FlyerCard from '../../components/home/FlyerCard';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import AppImages from '../../assets/App';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores/StoreContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { AppStackParamList } from '../../navigation/types';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useImagePicker, type PickedImage } from '../../hooks/useImagePicker';

// ─── Static data ──────────────────────────────────────────────────────────────

const DELIVERY_OPTIONS: DeliveryOption[] = [
  { id: '1h', label: '1 Hour', sublabel: '+$20' },
  { id: '5h', label: '5 Hours', sublabel: '+$10' },
  { id: '24h', label: '24 Hours', sublabel: '', isFree: true },
];

const EXTRAS: ExtraItem[] = [
  { id: 'story', label: 'Story Size', price: '+$10' },
  { id: 'diff', label: 'Make Flyer Different', price: '+$30' },
  { id: 'anim', label: 'Animated Flyer', price: '+$25' },
  { id: 'insta', label: 'Instagram Post', price: 'FREE', isFree: true },
];

// Static data removed
// ─── Form state type ──────────────────────────────────────────────────────────
interface FlyerDetailFormState {
  presenter: string;
  eventTitle: string;
  date: Date | null;
  flyerInfo: string;
  addressPhone: string;
  djArtists: string[];
  hosts: string[];
  deliveryTime: string;
  selectedExtras: string[];
  designerNote: string;
}

const FlyerDetailScreen: React.FC = observer(() => {
  const { flyerStore, cartStore, authStore } = useStores();
  const route = useRoute<RouteProp<AppStackParamList, 'FlyerDetail'>>();
  const navigation = useNavigation<any>();
  const { flyerId } = route.params;

  // ── Image picker hook ───────────────────────────────────────────────────────
  const { pickFromCamera, pickFromLibrary, pickWithPrompt } = useImagePicker();

  // ── Picked image state ──────────────────────────────────────────────────────
  const [venueLogo, setVenueLogo] = useState<PickedImage | null>(null);
  const [sponsorImages, setSponsorImages] = useState<(PickedImage | null)[]>([
    null,
    null,
    null,
  ]);

  const [form, setForm] = useState<FlyerDetailFormState>({
    presenter: '',
    eventTitle: '',
    date: null,
    flyerInfo: '',
    addressPhone: '',
    djArtists: ['', ''],
    hosts: [''],
    deliveryTime: '24h',
    selectedExtras: [],
    designerNote: '',
  });

  const isInCart = useMemo(() => {
    const idToCheck = flyerStore.flyer?.id ?? flyerId;
    return cartStore.cartItems.some(
      item => String(item.flyer_is) === String(idToCheck),
    );
  }, [cartStore.cartItems, flyerStore.flyer?.id, flyerId]);

  // ── Fetch flyer data on mount ─────────────────────────────────────────────
  useEffect(() => {
    flyerStore.fetchFlyer(flyerId);
  }, [flyerId, flyerStore]);

  const similarFlyers = useMemo(() => {
    const currentCategoryId = flyerStore.flyerFormDetail.categoryId;
    const currentFlyerId = flyerStore.flyerFormDetail.flyerId || flyerId;

    if (!currentCategoryId) return [];

    // Filter from allFlyers locally, don't call API
    return flyerStore.allFlyers
      .filter(f => {
        // Must not be the current flyer
        if (String(f._id || f.id) === String(currentFlyerId)) return false;

        // Must share the category
        const categories = f.categories || [];
        return categories.includes(currentCategoryId);
      })
      .slice(0, 5); // Limit to 5
  }, [
    flyerStore.allFlyers,
    flyerStore.flyerFormDetail.categoryId,
    flyerStore.flyerFormDetail.flyerId,
    flyerId,
  ]);
  // ── Generic field updater ──────────────────────────────────────────────────
  const setField = useCallback(
    <K extends keyof FlyerDetailFormState>(
      key: K,
      value: FlyerDetailFormState[K],
    ) => {
      setForm(prev => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleToggleExtra = useCallback((id: string) => {
    setForm(prev => ({
      ...prev,
      selectedExtras: prev.selectedExtras.includes(id)
        ? prev.selectedExtras.filter(e => e !== id)
        : [...prev.selectedExtras, id],
    }));
  }, []);

  // ── Venue Logo pick handlers ────────────────────────────────────────────────
  const handleVenueLogoCamera = useCallback(async () => {
    const img = await pickFromLibrary();
    if (img) setVenueLogo(img);
  }, [pickFromLibrary]);

  const handleVenueLogoLibrary = useCallback(async () => {
    const img = await pickFromLibrary();
    if (img) setVenueLogo(img);
  }, [pickFromLibrary]);

  // ── Sponsor image pick handlers ─────────────────────────────────────────────
  const handleSponsorUpload = useCallback(
    async (index: number) => {
      const img = await pickFromLibrary();
      if (img) {
        setSponsorImages(prev => {
          const next = [...prev];
          next[index] = img;
          return next;
        });
      }
    },
    [pickFromLibrary],
  );

  const handleSponsorLibrary = useCallback(
    async (index: number) => {
      const img = await pickFromLibrary();
      if (img) {
        setSponsorImages(prev => {
          const next = [...prev];
          next[index] = img;
          return next;
        });
      }
    },
    [pickFromLibrary],
  );

  const handleSponsorRemove = useCallback((index: number) => {
    setSponsorImages(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }, []);

  // ─── Price calculation ──────────────────────────────────────────────────
  const totalPrice = useMemo(() => {
    let total = flyerStore.basePrice || 0;

    // Delivery cost
    const delivery = DELIVERY_OPTIONS.find(o => o.id === form.deliveryTime);
    if (delivery && delivery.sublabel) {
      const deliveryCost = parseInt(
        delivery.sublabel.replace(/[^0-9]/g, ''),
        10,
      );
      if (!isNaN(deliveryCost)) total += deliveryCost;
    }

    // Extras cost
    form.selectedExtras.forEach(id => {
      const extra = EXTRAS.find(e => e.id === id);
      if (extra && extra.price && !extra.isFree) {
        const extraCost = parseInt(extra.price.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(extraCost)) total += extraCost;
      }
    });

    return total;
  }, [flyerStore.basePrice, form.deliveryTime, form.selectedExtras]);

  // ─── Add to Cart handler ─────────────────────────────────────────────────
  const handleAddToCart = useCallback(async () => {
    const userId = authStore.user?.id;
    const flyerIs = flyerStore.flyer?.id ?? flyerId;

    if (!userId) {
      Alert.alert('Not Logged In', 'Please sign in to add items to your cart.');
      return;
    }

    if (!flyerIs) {
      Alert.alert('Error', 'Could not identify this flyer. Please try again.');
      return;
    }

    // Build DJs array from form (filter empty entries)
    const djsPayload = form.djArtists
      .filter(name => name.trim().length > 0)
      .map(name => ({ name }));

    // Build host from first non-empty host entry
    const hostName = form.hosts.find(h => h.trim().length > 0) || '';

    // Build sponsors array (text + file index)
    const sponsorsPayload = sponsorImages.map((img, i) => ({
      name: `Sponsor ${i + 1}`,
      _hasImage: !!img,
    }));

    const result = await cartStore.addToCart(
      {
        user_id: userId,
        flyer_is: flyerIs,
        presenting: form.presenter,
        event_title: form.eventTitle,
        event_date: form.date
          ? form.date.toISOString().split('T')[0]
          : undefined,
        address_phone: form.addressPhone,
        flyer_info: form.flyerInfo,
        delivery_time: form.deliveryTime,
        custom_notes: form.designerNote,
        story_size_version: form.selectedExtras.includes('story'),
        custom_flyer: form.selectedExtras.includes('diff'),
        animated_flyer: form.selectedExtras.includes('anim'),
        instagram_post_size: form.selectedExtras.includes('insta'),
        total_price: totalPrice,
        djs: djsPayload,
        host: { name: hostName },
        sponsors: sponsorsPayload.map(s => ({ name: s.name })),
      },
      // File attachments
      {
        venueLogo: venueLogo,
        sponsorImages: sponsorImages,
      },
    );

    if (result.success) {
      // Success is handled by the Toast in cartStore.ts
      // Optionally navigate back if desired: navigation.goBack();
    } else {
      Alert.alert(
        'Error',
        result.message || 'Failed to add to cart. Please try again.',
      );
    }
  }, [
    authStore.user,
    flyerStore.flyer,
    flyerId,
    form,
    totalPrice,
    cartStore,
    navigation,
    venueLogo,
    sponsorImages,
  ]);

  // ─── Checkout handler ────────────────────────────────────────────────────
  const handleCheckoutNow = useCallback(async () => {
    // First add to cart, then navigate
    await handleAddToCart();
    // Navigate to cart is handled inside handleAddToCart via alert
  }, [handleAddToCart]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Screen Header ── */}
      <ScreenHeader
        title={flyerStore.flyer?.name || 'FLYER DETAIL'}
        onBackPress={() => navigation.goBack()}
        showSearch={false}
        showAvatar={false}
      />

      {flyerStore.loading && !flyerStore.flyer ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading Flyer...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Hero Banner ── */}
            <FlyerHeroBanner
              imageSource={
                flyerStore.flyer?.image_url
                  ? { uri: flyerStore.flyer.image_url }
                  : { uri: 'https://via.placeholder.com/800x900?text=No+Image' }
              }
              isPremium={flyerStore.flyer?.isPremium}
              isFavorited={flyerStore.flyer?.isFavorited}
              onFavoritePress={async () => {
                const userId = authStore.user?.id;
                const id = flyerStore.flyer?.id || flyerId;
                if (!userId) {
                  Alert.alert(
                    'Sign In Required',
                    'Please sign in to save flyers to your favorites.',
                  );
                  return;
                }
                try {
                  await flyerStore.addToFavorites(userId, Number(id));
                } catch (err) {
                  console.error('Favorite error:', err);
                }
              }}
            />

            {/* ── Form Card ── */}
            <View style={styles.formCard}>
              {/* Section title */}
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Event Details</Text>
                <Image
                  source={AppImages.edit}
                  style={styles.sectionTitleIconImage}
                />
              </View>

              {/* Presenting */}
              <FormField
                label="Presenting"
                placeholder="Enter Presenter Name"
                value={form.presenter}
                onChangeText={t => setField('presenter', t)}
              />

              {/* Event Title */}
              <FormField
                label="Event Title"
                placeholder="Society Fridays"
                value={form.eventTitle}
                onChangeText={t => setField('eventTitle', t)}
              />

              {/* Date */}
              <DatePickerField
                label="Date"
                value={form.date}
                onChange={d => setField('date', d)}
                rightIcon={
                  <Image
                    source={AppImages.calender}
                    style={styles.calendarIconImage}
                  />
                }
              />

              {/* Flyer Info */}
              <FormField
                label="Flyer info"
                placeholder="Add details, dress code, age limit..."
                value={form.flyerInfo}
                onChangeText={t => setField('flyerInfo', t)}
                multiline
                numberOfLines={4}
              />

              {/* Address & Phone */}
              <FormField
                label="Address & Phone"
                placeholder="123 Nightlife St, +1 234 567 890"
                value={form.addressPhone}
                onChangeText={t => setField('addressPhone', t)}
                keyboardType="default"
              />

              {/* Venue Logo */}
              <VenueLogoUpload
                pickedImage={venueLogo}
                onUploadPress={handleVenueLogoCamera}
                onChooseFromLibrary={handleVenueLogoLibrary}
                onRemove={() => setVenueLogo(null)}
              />

              {/* DJs & Artists */}
              <DynamicListField
                label="DJs & Artists"
                items={form.djArtists}
                onChange={items => setField('djArtists', items)}
                addLabel="ADD MORE DJs"
                placeholder="DJ/Artist"
                maxItems={8}
              />

              {/* Hosts */}
              <DynamicListField
                label="Hosts"
                items={form.hosts}
                onChange={items => setField('hosts', items)}
                addLabel="ADD HOST (S)"
                placeholder="Host"
                maxItems={5}
              />

              {/* Sponsors */}
              <SponsorsUpload
                count={3}
                pickedImages={sponsorImages}
                onUploadPress={handleSponsorUpload}
                onLibraryPress={handleSponsorLibrary}
                onRemove={handleSponsorRemove}
              />

              {/* Delivery Time */}
              <DeliveryTimeSelector
                options={DELIVERY_OPTIONS}
                selectedId={form.deliveryTime}
                onSelect={id => setField('deliveryTime', id)}
              />

              {/* Extras */}
              <ExtrasSelector
                extras={EXTRAS}
                selectedIds={form.selectedExtras}
                onToggle={handleToggleExtra}
              />

              {/* Note for Designer */}
              <FormField
                label="Note for the Designer"
                placeholder="Any specific design requests or branding guidelines..."
                value={form.designerNote}
                onChangeText={t => setField('designerNote', t)}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* ── Similar Flyers ── */}
            {similarFlyers.length > 0 && (
              <View style={styles.similarSection}>
                <View
                  style={[styles.sectionTitleRow, { paddingHorizontal: 16 }]}
                >
                  <Text style={styles.sectionTitle}>Similar Flyers</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 16,
                    gap: 12,
                    paddingTop: 12,
                  }}
                >
                  {similarFlyers.map(flyer => (
                    <FlyerCard
                      key={String(flyer._id || flyer.id)}
                      id={String(flyer._id || flyer.id)}
                      title={flyer.name || flyer.title || 'Flyer'}
                      price={`$${flyer.price ?? flyerStore.basePrice}`}
                      imageSource={
                        flyer.image_url
                          ? { uri: flyer.image_url }
                          : {
                              uri: 'https://via.placeholder.com/300x420?text=No+Image',
                            }
                      }
                      isPremium={flyer.isPremium}
                      isFavorited={flyer.isFavorited}
                      onPress={id =>
                        navigation.push('FlyerDetail', { flyerId: id })
                      }
                      onFavoritePress={async id => {
                        const userId = authStore.user?.id;
                        if (!userId) {
                          Alert.alert(
                            'Sign In Required',
                            'Please sign in to save flyers.',
                          );
                          return;
                        }
                        try {
                          await flyerStore.addToFavorites(userId, Number(id));
                        } catch (err) {
                          console.error('Favorite error:', err);
                        }
                      }}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.bottomPadding} />
          </ScrollView>

          {/* ── Sticky Footer Buttons ── */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                (cartStore.isAddingToCart || isInCart) && styles.buttonDisabled,
              ]}
              onPress={handleAddToCart}
              disabled={cartStore.isAddingToCart || isInCart}
              activeOpacity={0.8}
            >
              {cartStore.isAddingToCart ? (
                <ActivityIndicator size="small" color={Colors.textPrimary} />
              ) : (
                <Text style={styles.addToCartText}>
                  {isInCart ? 'IN CART' : 'ADD TO CART'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.checkoutButton,
                cartStore.isAddingToCart && styles.buttonDisabled,
              ]}
              onPress={handleCheckoutNow}
              disabled={cartStore.isAddingToCart}
              activeOpacity={0.85}
            >
              <View style={styles.checkoutContent}>
                <View>
                  <Text style={styles.checkoutText}>CHECKOUT</Text>
                  <Text style={styles.checkoutText}>NOW</Text>
                </View>
                <Text style={styles.priceText}>${totalPrice.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  formCard: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 18,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.black,
    color: Colors.textPrimary,
  },
  sectionTitleIconImage: {
    width: 20,
    height: 20,
  },
  calendarIconImage: {
    width: 20,
    height: 20,
  },
  similarSection: {
    marginTop: 28,
    marginBottom: 8,
  },
  bottomPadding: {
    height: 100, // Increased for footer
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#1E1E1E', // Dark grey
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  addToCartText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
  },
  checkoutButton: {
    flex: 1.5,
    backgroundColor: Colors.primary, // Red
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  checkoutContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.black,
    lineHeight: 16,
  },
  priceText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizes.base,
  },
});

export default FlyerDetailScreen;
