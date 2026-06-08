import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerActions, useNavigation, useNavigationState } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import {
  BottomTabParamList,
  DrawerParamList,
  AppStackParamList,
} from './types';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { useStores } from '../stores/StoreContext';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AppImages from '../assets/App';
import Header from '../components/home/Header';

// ─── Screen Imports ────────────────────────────────────────────────────────────
import HomeScreen from '../screens/Home/HomeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import AboutScreen from '../screens/About/AboutScreen';
import CartScreen from '../screens/cart/CartScreen';
import DownloadsScreen from '../screens/Download/DownloadsScreen';
import FlyerDetailScreen from '../screens/FlyerDetail/FlyerDetailScreen';
import FavoritesScreen from '../screens/Favorites/FavoritesScreen';
import MediaLibraryScreen from '../screens/MediaLibrary/MediaLibraryScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/Profile/ChangePasswordScreen';
import MyOrdersScreen from '../screens/orders/MyOrdersScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import CategoryScreen from '../screens/Category/CategoryScreen';
import CategoryFlyersScreen from '../screens/CategoryFlyers/CategoryFlyersScreen';
import AppDrawer from './AppDrawer';
import ContactUsScreen from '../screens/DrawerScreen/ContactUs';
import FAQScreen from '../screens/DrawerScreen/FAQScreen';
import HelpCenterScreen from '../screens/DrawerScreen/HelpCenterScreen';
import HowItWorksScreen from '../screens/DrawerScreen/HowItWorksScreen';
import PrivacyPolicyScreen from '../screens/DrawerScreen/PrivacyPolicyScreen';
import RefundPolicyScreen from '../screens/DrawerScreen/RefundPolicyScreen';
import TermsOfServiceScreen from '../screens/DrawerScreen/TermsOfServiceScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Tab icon map ──────────────────────────────────────────────────────────────
const TAB_ICONS: Record<keyof BottomTabParamList, any> = {
  Home: AppImages.home,
  Categories: AppImages.categories,
  Download: AppImages.download,
  Cart: AppImages.cart,
};

const TAB_COUNT = 4;
const TAB_WIDTH = SCREEN_WIDTH / TAB_COUNT;
const INDICATOR_WIDTH = 80;
const indicatorLeft = (i: number) =>
  i * TAB_WIDTH + TAB_WIDTH / 2 - INDICATOR_WIDTH / 2;

// ─── Animated Tab Item ─────────────────────────────────────────────────────────
const TabItem: React.FC<{
  route: any;
  index: number;
  isFocused: boolean;
  label: string;
  onPress: () => void;
  badgeCount?: number;
}> = ({ route, isFocused, label, onPress, badgeCount = 0 }) => {
  const activeAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(activeAnim, {
      toValue: isFocused ? 1 : 0,
      tension: 180,
      friction: 14,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  const translateY = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });
  const pillOpacity = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const pillScale = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });
  const iconOpacity = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.38, 1],
  });

  const icon = TAB_ICONS[route.name as keyof BottomTabParamList];

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.iconWrapper, { transform: [{ translateY }] }]}>
        {/* Subtle pill background */}
        <Animated.View
          style={[
            styles.pill,
            { opacity: pillOpacity, transform: [{ scale: pillScale }] },
          ]}
        />
        <Animated.Image
          source={icon}
          style={[
            styles.tabIcon,
            {
              opacity: iconOpacity,
              tintColor: isFocused ? Colors.primary : '#FFFFFF',
            },
          ]}
          resizeMode="contain"
        />
        {badgeCount > 0 && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>
              {badgeCount > 9 ? '9+' : badgeCount}
            </Text>
          </View>
        )}
      </Animated.View>

      <Text
        style={[
          styles.tabLabel,
          {
            color: isFocused ? Colors.textPrimary : '#FFFFFF',
            fontFamily: isFocused ? FontFamily.semiBold : FontFamily.regular,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// ─── Custom Tab Bar ────────────────────────────────────────────────────────────
const CustomTabBar: React.FC<BottomTabBarProps> = observer(({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { cartStore } = useStores();

  // Sliding indicator translateX
  const indicatorX = useRef(
    new Animated.Value(indicatorLeft(state.index)),
  ).current;

  useEffect(() => {
    Animated.spring(indicatorX, {
      toValue: indicatorLeft(state.index),
      tension: 90,
      friction: 11,
      useNativeDriver: true,
    }).start();
  }, [state.index]);

  return (
    <View
      style={[
        styles.tabBar,
        { paddingBottom: Math.max(insets.bottom, 12) },
      ]}
    >
      {/* Sliding top indicator */}
      <Animated.View
        style={[
          styles.indicator,
          { transform: [{ translateX: indicatorX }] },
        ]}
      />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = String(options.title ?? route.name);
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabItem
            key={route.key}
            route={route}
            index={index}
            isFocused={isFocused}
            label={label}
            onPress={onPress}
            badgeCount={route.name === 'Cart' ? cartStore.itemCount : 0}
          />
        );
      })}
    </View>
  );
});

// ─── Global Header ─────────────────────────────────────────────────────────────
const GlobalHeader = observer(() => {
  const nav = useNavigation<any>();
  const { notificationStore } = useStores();

  return (
    <SafeAreaView edges={['top']}>
      <Header
        notificationCount={notificationStore.unreadCount}
        onMenuPress={() => nav.dispatch(DrawerActions.openDrawer())}
        onNotificationPress={() => nav.navigate('Notifications')}
      />
    </SafeAreaView>
  );
});

// ─── Bottom Tab Navigator ──────────────────────────────────────────────────────
const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabs = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Categories" component={CategoryScreen} />
    <Tab.Screen name="Download" component={DownloadsScreen} />
    <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
  </Tab.Navigator>
);

const getActiveRouteName = (state: any): string | undefined => {
  if (!state) return undefined;
  const route = state.routes?.[state.index ?? 0];
  if (!route) return undefined;
  if (route.state) return getActiveRouteName(route.state);
  return route.name;
};

// ─── Tab Layout with Global Header ─────────────────────────────────────────────
const TabLayout = observer(() => {
  const { notificationStore, authStore } = useStores();
  const {
    refreshNotifications,
  } = notificationStore;
  const navState = useNavigationState(state => state as any);
  const activeRouteName = getActiveRouteName(navState);
  const hideGlobalHeader =
    activeRouteName === 'Cart' ||
    activeRouteName === 'Download' ||
    activeRouteName === 'Categories';

  useEffect(() => {
    if (!authStore.isAuthenticated || authStore.isLoading) return;
    void refreshNotifications();
  }, [authStore.isAuthenticated, authStore.isLoading, refreshNotifications]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      {!hideGlobalHeader ? <GlobalHeader /> : null}
      <BottomTabs />
    </View>
  );
});

// ─── Drawer Navigator ──────────────────────────────────────────────────────────
const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator = () => (
  <Drawer.Navigator
    drawerContent={props => (
      <AppDrawer onClose={() => props.navigation.closeDrawer()} />
    )}
    screenOptions={{
      headerShown: false,
      drawerStyle: styles.drawer,
      drawerActiveTintColor: Colors.primary,
      drawerInactiveTintColor: Colors.textSecondary,
      drawerActiveBackgroundColor: `${Colors.primary}12`,
      drawerLabelStyle: styles.drawerLabel,
    }}
  >
    <Drawer.Screen
      name="MainTabs"
      component={TabLayout}
      options={{ drawerLabel: 'Home', title: 'Home' }}
    />
    <Drawer.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ drawerLabel: 'Settings', title: 'Settings' }}
    />
    <Drawer.Screen
      name="About"
      component={AboutScreen}
      options={{ drawerLabel: 'About', title: 'About' }}
    />
  </Drawer.Navigator>
);

// ─── App Stack ─────────────────────────────────────────────────────────────────
const AppStack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => (
  <AppStack.Navigator
    screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}
  >
    <AppStack.Screen name="DrawerRoot" component={DrawerNavigator} />
    <AppStack.Screen name="Profile" component={ProfileScreen} />
    <AppStack.Screen name="EditProfile" component={EditProfileScreen} />
    <AppStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <AppStack.Screen name="MyOrders" component={MyOrdersScreen} />
    <AppStack.Screen name="OrderDetail" component={OrderDetailScreen} />
    <AppStack.Screen name="HowItWorks" component={HowItWorksScreen} />
    <AppStack.Screen name="MediaLibrary" component={MediaLibraryScreen} />
    <AppStack.Screen name="FlyerDetail" component={FlyerDetailScreen} />
    <AppStack.Screen name="CategoryFlyers" component={CategoryFlyersScreen} />
    <AppStack.Screen name="Favorites" component={FavoritesScreen} />
    <AppStack.Screen name="Notifications" component={NotificationsScreen} />
    <AppStack.Screen name="ContactUs" component={ContactUsScreen} />
    <AppStack.Screen name="FAQ" component={FAQScreen} />
    <AppStack.Screen name="HelpCenter" component={HelpCenterScreen} />
    <AppStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    <AppStack.Screen name="RefundPolicy" component={RefundPolicyScreen} />
    <AppStack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
  </AppStack.Navigator>
);

export default AppNavigator;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Tab bar container ─────────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.tabBarBackground,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },

  // ── Sliding indicator at top edge ─────────────────────────────────────────
  indicator: {
    position: 'absolute',
    top: 0,
    width: INDICATOR_WIDTH,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },

  // ── Each tab slot ─────────────────────────────────────────────────────────
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    gap: 4,
    minHeight: 60,
  },

  // ── Icon container (pill lives inside here) ───────────────────────────────
  iconWrapper: {
    width: 52,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Pill behind active icon ───────────────────────────────────────────────
  pill: {
    position: 'absolute',
    width: 52,
    height: 34,
    borderRadius: 17,
    backgroundColor: `${Colors.primary}22`,
  },

  // ── Icon ──────────────────────────────────────────────────────────────────
  tabIcon: {
    width: 22,
    height: 22,
  },

  // ── Label ─────────────────────────────────────────────────────────────────
  tabLabel: {
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.2,
  },

  // ── Cart badge on tab icon ────────────────────────────────────────────────
  tabBadge: {
    position: 'absolute',
    top: -2,
    right: 2,
    backgroundColor: Colors.primary,
    borderRadius: 11,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    lineHeight: 15,
  },

  // ── Drawer ────────────────────────────────────────────────────────────────
  drawer: {
    backgroundColor: Colors.drawerBackground,
    width: 280,
  },
  drawerLabel: {
    fontSize: FontSize.base,
    fontFamily: FontFamily.medium,
  },
});
