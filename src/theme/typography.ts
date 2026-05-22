// theme/typography.ts

import { StyleSheet } from 'react-native';

// ─── Font Size Scale ──────────────────────────────────────────────────────────
const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
};

// ─── Font Weight Scale ────────────────────────────────────────────────────────
const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
  black: '900' as const,
};

const fontFamilies = {
  regular: 'Geist-Regular',
  medium: 'Geist-Medium',
  semiBold: 'Geist-SemiBold',
  bold: 'Geist-Bold',
  black: 'Geist-Black',
  sans: 'Geist-Regular',
  mono: 'GeistMono-Regular',
  monoMedium: 'GeistMono-Medium',
  monoSemiBold: 'GeistMono-SemiBold',
  monoBold: 'GeistMono-Bold',
} as const;

// ─── Named exports (used by old screens/navigators) ───────────────────────────
export const FontSize = fontSizes;
export const FontWeight = fontWeights;
export const FontFamily = fontFamilies;

// ─── Stylesheet presets ───────────────────────────────────────────────────────
export const typography = StyleSheet.create({
  displayLarge: { fontSize: fontSizes['4xl'], fontFamily: fontFamilies.black },
  headingLarge: { fontSize: fontSizes['2xl'], fontFamily: fontFamilies.bold },
  headingMedium: { fontSize: fontSizes.xl, fontFamily: fontFamilies.semiBold },
  bodyLarge: { fontSize: fontSizes.base, fontFamily: fontFamilies.regular },
  bodySmall: { fontSize: fontSizes.sm, fontFamily: fontFamilies.regular },
  label: { fontSize: fontSizes.sm, fontFamily: fontFamilies.semiBold },
  caption: { fontSize: fontSizes.xs, fontFamily: fontFamilies.regular },
  mono: { fontSize: fontSizes.sm, fontFamily: fontFamilies.mono },
});

// ─── Default export (used by new components like Header, FlyerCard, etc.) ─────
const Typography = {
  fontSizes,
  fontWeights,
  fontFamilies,
};

export default Typography;
