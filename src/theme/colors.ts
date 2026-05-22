// theme/colors.ts

const primary = '#B92025';

const getReadableTextColor = (hex: string) => {
  const normalized = hex.replace('#', '');
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map(char => char + char)
          .join('')
      : normalized;

  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);

  // Perceived luminance keeps contrast decisions stable for brand changes.
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;

  return luminance >= 160 ? '#18181b' : '#fafafa';
};

const primaryForeground = getReadableTextColor(primary);

const Colors = {
  background: '#09090b',
  surface: '#18181b',
  surfaceElevated: '#27272a',
  card: '#18181b',
  border: '#27272a',
  borderLight: '#3f3f46',

  primary,
  primaryForeground,
  primaryLight: '#ffffff',
  primaryDark: '#d4d4d8',

  secondary: '#27272a',
  accent: '#d4d4d8',
  muted: '#27272a',
  mutedForeground: '#a1a1aa',

  textPrimary: '#fafafa',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  textInverse: primaryForeground,

  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',

  badge: '#fafafa',
  heart: '#fafafa',
  crownBg: '#fafafa',

  searchBg: '#18181b',
  searchBorder: '#27272a',
  searchPlaceholder: '#71717a',
  searchIcon: '#a1a1aa',

  tabBarBackground: '#09090b',
  tabBarActive: '#fafafa',
  tabBarInactive: '#71717a',

  drawerBackground: '#09090b',
  drawerActive: '#fafafa',

  overlay: 'rgba(0,0,0,0.62)',
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorKeys = keyof typeof Colors;

// Named export for backward-compatibility with old navigators/screens
export { Colors };

// Default export for new components
export default Colors;
