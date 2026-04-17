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

// ─── Named exports (used by old screens/navigators) ───────────────────────────
export const FontSize = fontSizes;
export const FontWeight = fontWeights;

// ─── Stylesheet presets ───────────────────────────────────────────────────────
export const typography = StyleSheet.create({
  displayLarge: { fontSize: fontSizes['4xl'], fontWeight: fontWeights.black },
  headingLarge: { fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold },
  headingMedium: { fontSize: fontSizes.xl, fontWeight: fontWeights.semiBold },
  bodyLarge: { fontSize: fontSizes.base, fontWeight: fontWeights.regular },
  bodySmall: { fontSize: fontSizes.sm, fontWeight: fontWeights.regular },
  label: { fontSize: fontSizes.sm, fontWeight: fontWeights.semiBold },
  caption: { fontSize: fontSizes.xs, fontWeight: fontWeights.regular },
});

// ─── Default export (used by new components like Header, FlyerCard, etc.) ─────
const Typography = {
  fontSizes,
  fontWeights,
};

export default Typography;
