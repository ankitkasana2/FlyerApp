// theme/colors.ts

const Colors = {
  background: '#0E0E0E',
  surface: '#1A1A1A',
  surfaceElevated: '#222222',
  card: '#1E1D2E',
  border: '#2A2A2A',
  borderLight: '#3D3C52',

  primary: '#E53935',       // red accent
  primaryLight: '#FF6F6F',
  primaryDark: '#B71C1C',

  secondary: '#FF6584',
  accent: '#FF8906',

  textPrimary: '#FFFFFF',
  textSecondary: '#9E9E9E',
  textMuted: '#5C5C5C',
  textInverse: '#0E0E0E',

  success: '#2CB67D',
  warning: '#FFC857',
  error: '#EF233C',

  badge: '#E53935',
  heart: '#FFFFFF',
  crownBg: '#E53935',

  searchBg: '#1C1C1C',
  searchBorder: '#2C2C2C',
  searchPlaceholder: '#5C5C5C',
  searchIcon: '#5C5C5C',

  tabBarBackground: '#0E0E0E',
  tabBarActive: '#E53935',
  tabBarInactive: '#5C5C5C',

  drawerBackground: '#0E0E0E',
  drawerActive: '#E53935',

  overlay: 'rgba(0,0,0,0.45)',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorKeys = keyof typeof Colors;

// Named export for backward-compatibility with old navigators/screens
export { Colors };

// Default export for new components
export default Colors;
