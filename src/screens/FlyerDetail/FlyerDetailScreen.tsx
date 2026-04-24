import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import ScreenHeader from '../../components/common/ScreenHeader';
import FlyerHeroBanner from './FlyerHeroBanner';
import FormField from './FormField';
import SelectDropdown, { SelectOption } from './SelectDropdown';
import DynamicListField from './DynamicListField';
import VenueLogoUpload from './VenueLogoUpload';
import SponsorsUpload from './SponsorsUpload';
import DeliveryTimeSelector, {
  DeliveryOption,
} from './DeliveryTimeSelector';
import ExtrasSelector, { ExtraItem } from './ExtrasSelector';
import SimilarFlyersSection, {
  SimilarFlyer,
} from './SimilarFlyersSection';
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

// ─── Static data ──────────────────────────────────────────────────────────────

const PRESENTER_OPTIONS: SelectOption[] = [
  { label: 'Maruf', value: 'maruf' },
  { label: 'Ahmed', value: 'ahmed' },
  { label: 'Sara', value: 'sara' },
];

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

const SIMILAR_FLYERS: SimilarFlyer[] = [
  {
    id: 'sf_1',
    title: 'Saturday Vibes',
    image: { uri: 'https://picsum.photos/seed/satvibes/300/420' },
    isPremium: true,
  },
  {
    id: 'sf_2',
    title: 'Luxe Night',
    image: { uri: 'https://picsum.photos/seed/luxenight/300/420' },
    isPremium: true,
  },
  {
    id: 'sf_3',
    title: 'Concert Series',
    image: { uri: 'https://picsum.photos/seed/concertseries/300/420' },
    isPremium: false,
  },
];

// ─── Form state type ──────────────────────────────────────────────────────────
interface FlyerDetailFormState {
  presenter: string;
  eventTitle: string;
  date: string;
  flyerInfo: string;
  addressPhone: string;
  djArtists: string[];
  hosts: string[];
  deliveryTime: string;
  selectedExtras: string[];
  designerNote: string;
}

const FlyerDetailScreen: React.FC = observer(() => {
  const { flyerStore } = useStores();
  const route = useRoute<RouteProp<AppStackParamList, 'FlyerDetail'>>();
  const navigation = useNavigation();
  const { flyerId } = route.params;

  const [form, setForm] = useState<FlyerDetailFormState>({
    presenter: '',
    eventTitle: '',
    date: '',
    flyerInfo: '',
    addressPhone: '',
    djArtists: ['', ''],
    hosts: [''],
    deliveryTime: '24h',
    selectedExtras: [],
    designerNote: '',
  });

  // ── Fetch flyer data on mount ─────────────────────────────────────────────
  useEffect(() => {
    flyerStore.fetchFlyer(flyerId);
  }, [flyerId, flyerStore]);

  // Update local form when flyer data is loaded (optional, depends on UX)
  useEffect(() => {
    if (flyerStore.flyer) {
      setForm((prev) => ({
        ...prev,
        eventTitle: flyerStore.flyer?.title || '',
        // You can add more fields here if the API provides them
      }));
    }
  }, [flyerStore.flyer]);

  // ── Generic field updater ──────────────────────────────────────────────────
  const setField = useCallback(
    <K extends keyof FlyerDetailFormState>(key: K, value: FlyerDetailFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleToggleExtra = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      selectedExtras: prev.selectedExtras.includes(id)
        ? prev.selectedExtras.filter((e) => e !== id)
        : [...prev.selectedExtras, id],
    }));
  }, []);

  // ─── Price calculation ──────────────────────────────────────────────────
  const totalPrice = useMemo(() => {
    let total = flyerStore.basePrice || 0;
    
    // Delivery cost
    const delivery = DELIVERY_OPTIONS.find(o => o.id === form.deliveryTime);
    if (delivery && delivery.sublabel) {
      const deliveryCost = parseInt(delivery.sublabel.replace(/[^0-9]/g, ''), 10);
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

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* ── Reusing ScreenHeader (back + title + search + avatar) ── */}
      <ScreenHeader
        title={flyerStore.flyer?.name || 'FLYER DETAIL'}
        onBackPress={() => navigation.goBack()}
        showSearch
        searchBadgeCount={1}
        onSearchPress={() => console.log('Search')}
        showAvatar
        avatarInitials="AK"
        onAvatarPress={() => console.log('Avatar')}
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
              brandTag="GKODIFY"
              isPremium={flyerStore.flyer?.isPremium}
              isFavorited={flyerStore.flyer?.isFavorited}
              onFavoritePress={() => {
                if (flyerStore.flyer?.id) {
                  flyerStore.toggleFavourite(String(flyerStore.flyer.id));
                }
              }}
            />

          {/* ── Form Card ── */}
          <View style={styles.formCard}>
            {/* Section title */}
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Event Details</Text>
              <Image source={AppImages.edit} style={styles.sectionTitleIconImage} />
            </View>

            {/* Presenting */}
            <SelectDropdown
              label="Presenting"
              placeholder="Select Presenter"
              options={PRESENTER_OPTIONS}
              selectedValue={form.presenter}
              onSelect={(v) => setField('presenter', v)}
            />

            {/* Event Title */}
            <FormField
              label="Event Title"
              placeholder="Society Fridays"
              value={form.eventTitle}
              onChangeText={(t) => setField('eventTitle', t)}
            />

            {/* Date */}
            <FormField
              label="Date"
              isRequired
              placeholder="June 01, 2025"
              value={form.date}
              onChangeText={(t) => setField('date', t)}
              rightIcon={
                <Image source={AppImages.calender} style={styles.calendarIconImage} />
              }
            />

            {/* Flyer Info */}
            <FormField
              label="Flyer info"
              placeholder="Add details, dress code, age limit..."
              value={form.flyerInfo}
              onChangeText={(t) => setField('flyerInfo', t)}
              multiline
              numberOfLines={4}
            />

            {/* Address & Phone */}
            <FormField
              label="Address & Phone"
              placeholder="123 Nightlife St, +1 234 567 890"
              value={form.addressPhone}
              onChangeText={(t) => setField('addressPhone', t)}
              keyboardType="default"
            />

            {/* Venue Logo */}
            <VenueLogoUpload
              onUploadPress={() => console.log('Upload logo')}
              onChooseFromLibrary={() => console.log('Choose from library')}
            />

            {/* DJs & Artists */}
            <DynamicListField
              label="DJs & Artists"
              items={form.djArtists}
              onChange={(items) => setField('djArtists', items)}
              addLabel="ADD MORE DJs"
              placeholder="DJ/Artist"
              maxItems={8}
            />

            {/* Hosts */}
            <DynamicListField
              label="Hosts"
              items={form.hosts}
              onChange={(items) => setField('hosts', items)}
              addLabel="ADD HOST (S)"
              placeholder="Host"
              maxItems={5}
            />

            {/* Sponsors */}
            <SponsorsUpload
              count={3}
              onUploadPress={(i) => console.log('Upload sponsor', i)}
              onLibraryPress={(i) => console.log('Library sponsor', i)}
            />

            {/* Delivery Time */}
            <DeliveryTimeSelector
              options={DELIVERY_OPTIONS}
              selectedId={form.deliveryTime}
              onSelect={(id) => setField('deliveryTime', id)}
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
              onChangeText={(t) => setField('designerNote', t)}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* ── Similar Flyers ── */}
          <View style={styles.similarSection}>
            <SimilarFlyersSection
              items={SIMILAR_FLYERS}
              onSeeAll={() => console.log('See all similar')}
              onItemPress={(id) => console.log('Similar flyer pressed:', id)}
            />
          </View>

          <View style={styles.bottomPadding} />
          </ScrollView>

          {/* ── Sticky Footer Buttons ── */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.addToCartButton}
              onPress={() => console.log('Add to cart')}
            >
              <Text style={styles.addToCartText}>ADD TO CART</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={() => console.log('Checkout now')}
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