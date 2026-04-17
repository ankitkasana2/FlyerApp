import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabParamList, DrawerParamList, AppStackParamList } from './types';
import { Colors } from '../theme/colors';
import { FontSize, FontWeight } from '../theme/typography';
import { Spacing } from '../theme/spacing';
import { useStores } from '../stores/StoreContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppImages from '../assets/App';

// ─── Screen Imports ────────────────────────────────────────────────────────
import HomeScreen from '../screens/Home/HomeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import ExploreScreen from '../screens/Explore/ExploreScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import AboutScreen from '../screens/About/AboutScreen';
import CartScreen from '../screens/cart/CartScreen';
import DownloadsScreen from '../screens/Download/DownloadsScreen';

// ─── Tab Icon component ────────────────────────────────────────────────────
const TabIcon = ({
  icon,
  focused,
}: {
  icon: ImageSourcePropType;
  focused: boolean;
}) => (
  <Image 
    source={icon} 
    style={[styles.tabIconImage, { tintColor: focused ? Colors.tabBarActive : Colors.tabBarInactive }]} 
    resizeMode="contain"
  />
);

// ─── Bottom Tab Navigator ─────────────────────────────────────────────────
const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabs = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          { height: 60 + insets.bottom, paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }
        ],
        tabBarItemStyle: { paddingHorizontal: 0 },
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
      }}>
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon icon={AppImages.home} focused={focused} />,
        tabBarItemStyle: { flex: 0.8 },
      }}
    />
    <Tab.Screen
      name="Categories"
      component={ExploreScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon icon={AppImages.categories} focused={focused} />,
        tabBarItemStyle: { flex: 1.4 },
      }}
    />
    <Tab.Screen
      name="Download"
      component={DownloadsScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon icon={AppImages.download} focused={focused} />,
        tabBarItemStyle: { flex: 1.0 },
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon icon={AppImages.profile} focused={focused} />,
        tabBarItemStyle: { flex: 0.8 },
      }}
    />
    </Tab.Navigator>
  );
};

// ─── Custom Drawer Content ─────────────────────────────────────────────────
const CustomDrawerContent = (props: any) => {
  const { authStore } = useStores();
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContainer}>
      {/* Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.drawerAvatar}>
          <Text style={styles.drawerAvatarText}>✈️</Text>
        </View>
        <Text style={styles.drawerAppName}>FlyerApp</Text>
        <Text style={styles.drawerTagline}>Your flight companion</Text>
      </View>

      {/* Nav Items */}
      <View style={styles.drawerItems}>
        <DrawerItemList {...props} />
      </View>

      {/* Footer */}
      <View style={styles.drawerFooter}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => authStore.logout()}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

// ─── Drawer Navigator ─────────────────────────────────────────────────────
const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator = () => (
  <Drawer.Navigator
    drawerContent={props => <CustomDrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerStyle: styles.drawer,
      drawerActiveTintColor: Colors.primary,
      drawerInactiveTintColor: Colors.textSecondary,
      drawerActiveBackgroundColor: `${Colors.primary}22`,
      drawerLabelStyle: styles.drawerLabel,
    }}>
    <Drawer.Screen
      name="MainTabs"
      component={BottomTabs}
      options={{ drawerLabel: '🏠  Home', title: 'Home' }}
    />
    <Drawer.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ drawerLabel: '⚙️  Settings', title: 'Settings' }}
    />
    <Drawer.Screen
      name="About"
      component={AboutScreen}
      options={{ drawerLabel: 'ℹ️  About', title: 'About' }}
    />
  </Drawer.Navigator>
);

const AppStack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
    <AppStack.Screen name="DrawerRoot" component={DrawerNavigator} />
    <AppStack.Screen name="Cart" component={CartScreen} />
  </AppStack.Navigator>
);

export default AppNavigator;

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Tab bar
  tabBar: {
    backgroundColor: Colors.tabBarBackground,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    paddingHorizontal: 0,
    width: '100%',
  },
  tabIconImage: {
    width: 18,
    height: 18,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },

  // Drawer
  drawer: {
    backgroundColor: Colors.drawerBackground,
    width: 280,
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: Colors.drawerBackground,
  },
  drawerHeader: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
  },
  drawerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  drawerAvatarText: {
    fontSize: 28,
  },
  drawerAppName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  drawerTagline: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  drawerItems: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  drawerLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
  drawerFooter: {
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  logoutIcon: {
    fontSize: 18,
  },
  logoutText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.error,
  },
});
