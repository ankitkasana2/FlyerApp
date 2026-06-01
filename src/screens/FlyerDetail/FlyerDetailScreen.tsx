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
import Config from 'react-native-config';
import { useStripe } from '@stripe/stripe-react-native';
import ScreenHeader from '../../components/common/ScreenHeader';
import DatePickerField from '../../components/common/DatePickerField';
import FlyerHeroBanner from './FlyerHeroBanner';
import FormField from './FormField';
import DynamicListField from './DynamicListField';
import VenueLogoUpload from './VenueLogoUpload';
import SponsorsUpload from './SponsorsUpload';
import MediaLibraryModal from '../../components/media/MediaLibraryModal';
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
import PeopleListWithPhotos, {
  type PersonWithPhoto,
} from './PeopleListWithPhotos';
import {
  buildCheckoutPayload,
  createPaymentSheet,
  finalizePayment,
  STRIPE_RETURN_URL,
} from '../../services/stripeService';

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
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const stripePublishableKey =
    Config.STRIPE_PUBLISHABLE_KEY ||
    Config.PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    Config.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  // ── Image picker hook ───────────────────────────────────────────────────────
  const { pickFromCamera, pickFromLibrary, pickWithPrompt } = useImagePicker();

  // ── Picked image state ──────────────────────────────────────────────────────
  const [venueLogo, setVenueLogo] = useState<PickedImage | null>(null);
  const [sponsorImages, setSponsorImages] = useState<(PickedImage | null)[]>([
    null,
    null,
    null,
  ]);
  const [birthdayPersonPhoto, setBirthdayPersonPhoto] =
    useState<PickedImage | null>(null);
  const [venueText, setVenueText] = useState('');

  const [djPeople, setDjPeople] = useState<PersonWithPhoto[]>([
    { name: '', image: null, hasPhoto: true },
    { name: '', image: null, hasPhoto: true },
    { name: '', image: null, hasPhoto: true },
    { name: '', image: null, hasPhoto: true },
  ]);
  const [hostPeople, setHostPeople] = useState<PersonWithPhoto[]>([
    { name: '', image: null, hasPhoto: true },
    { name: '', image: null, hasPhoto: true },
  ]);

  // ── Media library modal state ────────────────────────────────────────────────
  type MediaTarget =
    | { type: 'venue' }
    | { type: 'sponsor'; index: number }
    | { type: 'birthday' }
    | { type: 'dj'; index: number }
    | { type: 'host'; index: number }
    | null;
  const [mediaLibraryTarget, setMediaLibraryTarget] =
    useState<MediaTarget>(null);

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

  const flyer = flyerStore.flyer;
  const flyerCategories = useMemo(() => {
    const raw = (flyer?.categories ?? []).map(v => String(v));
    const primary = flyer?.category ? [String(flyer.category)] : [];
    return [...new Set([...raw, ...primary])];
  }, [flyer?.categories, flyer?.category]);

  const parsedFlyerPrice = useMemo(() => {
    const raw = flyer?.price ?? flyerStore.basePrice ?? 0;
    if (typeof raw === 'number') return raw;
    const cleaned = String(raw).replace(/[^0-9.]/g, '');
    const numeric = Number(cleaned);
    return Number.isNaN(numeric) ? 0 : numeric;
  }, [flyer?.price, flyerStore.basePrice]);

  const isBirthdayForm = useMemo(() => {
    if (!flyer) return false;
    if (flyer.form_type === 'Birthday') return true;
    if (String(flyer.category ?? '').toLowerCase() === 'birthday') return true;
    return flyerCategories.some(cat => cat.toLowerCase() === 'birthday');
  }, [flyer, flyerCategories]);

  const isNoPhotoForm = useMemo(() => {
    if (!flyer) return false;
    const formType = String(flyer.form_type ?? '').toLowerCase();
    const categoryStr = String(flyer.category ?? '').toLowerCase();
    return (
      formType === 'no photo' ||
      categoryStr.includes('no-photo') ||
      categoryStr.includes('no photo') ||
      categoryStr.includes('nophoto') ||
      flyerCategories.some(cat => cat.toLowerCase().includes('no photo'))
    );
  }, [flyer, flyerCategories]);

  const isWithPhotoForm = useMemo(() => {
    if (!flyer) return false;
    const formType = String(flyer.form_type ?? '').toLowerCase();
    const categoryStr = String(flyer.category ?? '').toLowerCase();
    return (
      formType === 'with photo' ||
      flyer.hasPhotos === true ||
      categoryStr.includes('with photo') ||
      categoryStr.includes('photo')
    );
  }, [flyer, flyerCategories]);

  // Apply the same "slot rules" as the web:
  // - $10 with photo: DJ 1-2 have photos, DJ 3-4 text only. Host 1 has photo, Host 2 text only.
  // - $15 with photo: DJ 1-4 have photos, Host 1-2 have photos.
  useEffect(() => {
    if (!isWithPhotoForm) return;
    if (parsedFlyerPrice === 10) {
      setDjPeople(prev =>
        prev.slice(0, 4).map((p, i) => ({ ...p, hasPhoto: i < 2 })),
      );
      setHostPeople(prev =>
        prev.slice(0, 2).map((p, i) => ({ ...p, hasPhoto: i === 0 })),
      );
      return;
    }
    if (parsedFlyerPrice === 15) {
      setDjPeople(prev =>
        prev.slice(0, 4).map(p => ({ ...p, hasPhoto: true })),
      );
      setHostPeople(prev =>
        prev.slice(0, 2).map(p => ({ ...p, hasPhoto: true })),
      );
    }
  }, [isWithPhotoForm, parsedFlyerPrice]);

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
        return categories.includes(String(currentCategoryId));
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
  // "UPLOAD LOGO" = pick from camera OR device gallery (device-side)
  const handleVenueLogoCamera = useCallback(async () => {
    const img = await pickWithPrompt('Venue Logo');
    if (img) setVenueLogo(img);
  }, [pickWithPrompt]);

  // "CHOOSE FROM LIBRARY" = open server media library modal (handled by VenueLogoUpload)
  const handleVenueLogoLibrary = useCallback(async () => {
    setMediaLibraryTarget({ type: 'venue' });
  }, []);

  // ── Sponsor image pick handlers ─────────────────────────────────────────────
  // "UPLOAD SPONSOR" = pick from camera OR device gallery
  const handleSponsorUpload = useCallback(
    async (index: number) => {
      const img = await pickWithPrompt(`Sponsor ${index + 1}`);
      if (img) {
        setSponsorImages(prev => {
          const next = [...prev];
          next[index] = img;
          return next;
        });
      }
    },
    [pickWithPrompt],
  );

  // "LIBRARY" = open server media library modal
  const handleSponsorLibrary = useCallback((index: number) => {
    setMediaLibraryTarget({ type: 'sponsor', index });
  }, []);

  const handleSponsorRemove = useCallback((index: number) => {
    setSponsorImages(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }, []);

  // ─── Price calculation ──────────────────────────────────────────────────
  const totalPrice = useMemo(() => {
    const base = isBirthdayForm
      ? 10
      : isNoPhotoForm
      ? parsedFlyerPrice >= 40
        ? 40
        : parsedFlyerPrice === 15
        ? 15
        : 10
      : flyerStore.basePrice || parsedFlyerPrice || 0;

    let total = base;

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

  const validateBeforeCart = useCallback((): {
    ok: boolean;
    message?: string;
  } => {
    if (!form.eventTitle.trim()) {
      return { ok: false, message: 'Event Title is required.' };
    }
    if (!form.deliveryTime) {
      return { ok: false, message: 'Please select a delivery time.' };
    }
    if (isNoPhotoForm) {
      const hasVenue = !!venueLogo || !!venueText.trim();
      if (!hasVenue) {
        return { ok: false, message: 'Please add a venue logo or venue text.' };
      }
    }
    return { ok: true };
  }, [form.deliveryTime, form.eventTitle, isNoPhotoForm, venueLogo, venueText]);

  // ─── Add to Cart handler ─────────────────────────────────────────────────
  const doAddToCart = useCallback(async (): Promise<number | null> => {
    const userId = authStore.user?.id;
    const flyerIs = flyerStore.flyer?.id ?? flyerId;
    const categoryId =
      flyerStore.flyerFormDetail.categoryId ??
      flyerStore.flyer?.categories?.[0] ??
      flyerStore.flyer?.category ??
      undefined;

    if (!userId) {
      Alert.alert('Not Logged In', 'Please sign in to add items to your cart.');
      return null;
    }

    if (!flyerIs) {
      Alert.alert('Error', 'Could not identify this flyer. Please try again.');
      return null;
    }

    const validation = validateBeforeCart();
    if (!validation.ok) {
      Alert.alert(
        'Missing Details',
        validation.message || 'Please complete the form.',
      );
      return null;
    }

    const djsPayload = (
      isWithPhotoForm
        ? djPeople
        : form.djArtists.map(name => ({ name, image: null, hasPhoto: false }))
    )
      .map(entry => ({ name: entry.name }))
      .filter(entry => entry.name.trim().length > 0);

    const hostName =
      (isWithPhotoForm ? hostPeople.map(h => h.name) : form.hosts).find(
        h => h.trim().length > 0,
      ) || '';

    // Build sponsors array (text + file index)
    const sponsorsPayload = sponsorImages.map((img, i) => ({
      name: `Sponsor ${i + 1}`,
      _hasImage: !!img,
    }));

    const result = await cartStore.addToCart(
      {
        user_id: userId,
        flyer_is: flyerIs,
        category_id: categoryId ? String(categoryId) : undefined,
        presenting: form.presenter,
        event_title: form.eventTitle,
        event_date: form.date
          ? form.date.toISOString().split('T')[0]
          : undefined,
        address_phone: form.addressPhone,
        flyer_info: form.flyerInfo,
        delivery_time: form.deliveryTime,
        custom_notes: form.designerNote,
        image_url: flyerStore.flyer?.image_url ?? undefined,
        venue_text: isNoPhotoForm ? venueText.trim() : undefined,
        story_size_version: form.selectedExtras.includes('story'),
        custom_flyer: form.selectedExtras.includes('diff'),
        animated_flyer: form.selectedExtras.includes('anim'),
        instagram_post_size: form.selectedExtras.includes('insta'),
        total_price: totalPrice,
        subtotal: totalPrice,
        djs: djsPayload,
        host: { name: hostName },
        sponsors: sponsorsPayload.map(s => ({ name: s.name })),
      },
      // File attachments
      {
        venueLogo: venueLogo,
        sponsorImages: sponsorImages,
        hostImage: isWithPhotoForm ? hostPeople[0]?.image ?? null : null,
        djImages: isWithPhotoForm ? djPeople.map(p => p.image) : [],
      },
    );

    if (result.success) {
      return result.cartItemId ?? null;
    } else {
      Alert.alert(
        'Error',
        result.message || 'Failed to add to cart. Please try again.',
      );
      return null;
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
    venueText,
    isNoPhotoForm,
    isWithPhotoForm,
    djPeople,
    hostPeople,
    parsedFlyerPrice,
    isBirthdayForm,
    validateBeforeCart,
  ]);

  const handleAddToCart = useCallback(async () => {
    await doAddToCart();
  }, [doAddToCart]);

  // ─── Checkout handler ────────────────────────────────────────────────────
  const handleCheckoutNow = useCallback(async () => {
    const userId = authStore.user?.id;
    if (!userId) {
      Alert.alert('Not Logged In', 'Please sign in to checkout.');
      return;
    }

    if (!stripePublishableKey) {
      Alert.alert(
        'Stripe not configured',
        'Add `STRIPE_PUBLISHABLE_KEY` to your `.env` before testing checkout.',
      );
      return;
    }

    const cartItemId = await doAddToCart();
    if (!cartItemId) return;

    try {
      const paymentSheet = await createPaymentSheet(
        buildCheckoutPayload([{ id: cartItemId } as any], totalPrice, userId),
      );

      const { error } = await initPaymentSheet({
        merchantDisplayName: 'FlyerApp',
        paymentIntentClientSecret: paymentSheet.paymentIntent,
        customerId: paymentSheet.customer,
        customerEphemeralKeySecret: paymentSheet.ephemeralKey,
        allowsDelayedPaymentMethods: true,
        returnURL: STRIPE_RETURN_URL,
      });

      if (error) {
        Alert.alert('Checkout unavailable', error.message);
        return;
      }

      const paymentResult = await presentPaymentSheet();
      if (paymentResult.error) {
        Alert.alert('Payment not completed', paymentResult.error.message);
        return;
      }

      try {
        if (paymentSheet.paymentIntentId) {
          await finalizePayment(paymentSheet.paymentIntentId);
        }
      } catch {
        // Webhook may still finalize; keep UX optimistic.
      }

      Alert.alert('Payment successful', 'Your order is being processed.', [
        {
          text: 'View Orders',
          onPress: () => navigation.navigate('MyOrders'),
        },
        { text: 'OK' },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Checkout failed',
        error?.message || 'Unable to start Stripe checkout.',
      );
    }
  }, [
    authStore.user?.id,
    doAddToCart,
    initPaymentSheet,
    navigation,
    presentPaymentSheet,
    stripePublishableKey,
    totalPrice,
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Screen Header ── */}
      <ScreenHeader
        title={flyerStore.flyer?.name || 'Flyer Detail'}
        subtitle={undefined}
        onBackPress={() => navigation.goBack()}
        showSearch={false}
        showAvatar={false}
        rightSlot={
          parsedFlyerPrice > 0 ? (
            <View style={styles.pricePill}>
              <Text style={styles.pricePillText}>
                ${parsedFlyerPrice.toFixed(2)}
              </Text>
            </View>
          ) : null
        }
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
                  const alreadyFavorited = flyerStore.flyer?.isFavorited;
                  if (alreadyFavorited) {
                    await flyerStore.removeFromFavorites(userId, Number(id));
                  } else {
                    await flyerStore.addToFavorites(userId, Number(id));
                  }
                } catch (err) {
                  console.error('Favorite toggle error:', err);
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
              {!isBirthdayForm && (
                <>
                  <VenueLogoUpload
                    pickedImage={venueLogo}
                    onUploadPress={handleVenueLogoCamera}
                    onChooseFromLibrary={handleVenueLogoLibrary}
                    onRemove={() => setVenueLogo(null)}
                  />
                  {isNoPhotoForm && (
                    <FormField
                      label="Venue Text (if no logo)"
                      placeholder="Type venue name..."
                      value={venueText}
                      onChangeText={setVenueText}
                    />
                  )}
                </>
              )}

              {/* DJs & Artists */}
              {!isBirthdayForm &&
                (isWithPhotoForm ? (
                  <PeopleListWithPhotos
                    label="DJs"
                    items={djPeople}
                    onChange={setDjPeople}
                    onPickImage={async index => {
                      const img = await pickWithPrompt(`DJ ${index + 1}`);
                      if (!img) return;
                      setDjPeople(prev =>
                        prev.map((p, i) =>
                          i === index ? { ...p, image: img } : p,
                        ),
                      );
                    }}
                    onPickFromLibrary={index =>
                      setMediaLibraryTarget({ type: 'dj', index })
                    }
                    onRemoveImage={index =>
                      setDjPeople(prev =>
                        prev.map((p, i) =>
                          i === index ? { ...p, image: null } : p,
                        ),
                      )
                    }
                  />
                ) : (
                  <DynamicListField
                    label="DJs & Artists"
                    items={form.djArtists}
                    onChange={items => setField('djArtists', items)}
                    addLabel="ADD MORE DJs"
                    placeholder="DJ/Artist"
                    maxItems={4}
                  />
                ))}

              {/* Hosts */}
              {isBirthdayForm ? (
                <DynamicListField
                  label="Hosts"
                  items={form.hosts}
                  onChange={items => setField('hosts', items)}
                  addLabel="ADD HOST"
                  placeholder="Host"
                  maxItems={2}
                />
              ) : isWithPhotoForm ? (
                <PeopleListWithPhotos
                  label="Hosts"
                  items={hostPeople}
                  onChange={setHostPeople}
                  onPickImage={async index => {
                    const img = await pickWithPrompt(`Host ${index + 1}`);
                    if (!img) return;
                    setHostPeople(prev =>
                      prev.map((p, i) =>
                        i === index ? { ...p, image: img } : p,
                      ),
                    );
                  }}
                  onPickFromLibrary={index =>
                    setMediaLibraryTarget({ type: 'host', index })
                  }
                  onRemoveImage={index =>
                    setHostPeople(prev =>
                      prev.map((p, i) =>
                        i === index ? { ...p, image: null } : p,
                      ),
                    )
                  }
                />
              ) : (
                <DynamicListField
                  label="Hosts"
                  items={form.hosts}
                  onChange={items => setField('hosts', items)}
                  addLabel="ADD HOST (S)"
                  placeholder="Host"
                  maxItems={2}
                />
              )}

              {/* Sponsors */}
              {!isBirthdayForm && (
                <SponsorsUpload
                  count={3}
                  pickedImages={sponsorImages}
                  onUploadPress={handleSponsorUpload}
                  onLibraryPress={handleSponsorLibrary}
                  onRemove={handleSponsorRemove}
                />
              )}

              {isBirthdayForm && (
                <>
                  <Text style={styles.sectionTitle}>
                    Birthday Person Photo (Optional)
                  </Text>
                  <VenueLogoUpload
                    pickedImage={birthdayPersonPhoto}
                    onUploadPress={async () => {
                      const img = await pickWithPrompt('Birthday Person Photo');
                      if (img) setBirthdayPersonPhoto(img);
                    }}
                    onChooseFromLibrary={() =>
                      setMediaLibraryTarget({ type: 'birthday' })
                    }
                    onRemove={() => setBirthdayPersonPhoto(null)}
                  />
                </>
              )}

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

      {/* ── Media Library Modal ── */}
      <MediaLibraryModal
        visible={mediaLibraryTarget !== null}
        userId={authStore.user?.id ?? ''}
        onSelect={img => {
          if (mediaLibraryTarget?.type === 'venue') {
            setVenueLogo(img);
          } else if (mediaLibraryTarget?.type === 'sponsor') {
            const idx = mediaLibraryTarget.index;
            setSponsorImages(prev => {
              const next = [...prev];
              next[idx] = img;
              return next;
            });
          } else if (mediaLibraryTarget?.type === 'birthday') {
            setBirthdayPersonPhoto(img);
          } else if (mediaLibraryTarget?.type === 'dj') {
            const idx = mediaLibraryTarget.index;
            setDjPeople(prev =>
              prev.map((p, i) => (i === idx ? { ...p, image: img } : p)),
            );
          } else if (mediaLibraryTarget?.type === 'host') {
            const idx = mediaLibraryTarget.index;
            setHostPeople(prev =>
              prev.map((p, i) => (i === idx ? { ...p, image: img } : p)),
            );
          }
          setMediaLibraryTarget(null);
        }}
        onClose={() => setMediaLibraryTarget(null)}
      />
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
  pricePill: {
    borderWidth: 0.75,
    borderColor: Colors.primary,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  pricePillText: {
    color: Colors.primary,
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semiBold,
    letterSpacing: 0.2,
  },
});

export default FlyerDetailScreen;
