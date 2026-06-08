import { Image } from 'react-native';

// Ordered keyword → bundled image pairs.
// The first keyword that matches (case-insensitive substring) wins,
// so compound keywords (e.g. "all black") must come before single words
// (e.g. "party") to avoid false matches.
const CATEGORY_MATCHERS: [string, number][] = [
  ['recently',     require('./RecentlyAdded.webp')],
  ['4th of july',  require('./4thofJulyCategory.webp')],
  ['cinco',        require('./5DeMayoCategory.webp')],
  ['5 de mayo',    require('./5DeMayoCategory.webp')],
  ['all black',    require('./AllBlackPartyCategory.webp')],
  ['beach',        require('./BeachPartyCategory.webp')],
  ['pool',         require('./PoolPartyCategory.webp')],
  ['white party',  require('./WhitePartyCategory.webp')],
  ['ladies',       require('./Ladies Night Category.webp')],
  ['birthday',     require('./BirthdayFlyerCategory.webp')],
  ['hip hop',      require('./HipHopFlyer Category.webp')],
  ['hip-hop',      require('./HipHopFlyer Category.webp')],
  ['memorial',     require('./MemorialDayCategory.webp')],
  ['president',    require('./PresidentDayCategory.webp')],
  ['mexican',      require('./MexcianDayCategory.webp')],
  ['food',         require('./FoodFlyersCategory.webp')],
  ['drink',        require('./DrinkCategory.webp')],
  ['brunch',       require('./BrunchCategory.webp')],
  ['hookah',       require('./HookaCategory.webp')],
  ['hooka',        require('./HookaCategory.webp')],
  ['dj ',          require('./DJ Images And Artist Category.webp')],
  ['luxury',       require('./LuxuryFlyerCategory.webp')],
  ['premium',      require('./Premium Category.webp')],
  ['basic',        require('./BasicCategory.webp')],
  ['summer',       require('./SummerCategory.webp')],
  ['tropical',     require('./TropicalCategory.webp')],
  ['winter',       require('./WinterFlyerCategory.webp')],
  ['clean',        require('./CleanCategory.webp')],
  ['party',        require('./PartyFlyerCategory.webp')],
];

// Full image pool — used as a fallback for categories with no keyword match.
const FALLBACK_POOL: number[] = [
  require('./AllBlackPartyCategory.webp'),
  require('./BeachPartyCategory.webp'),
  require('./BirthdayFlyerCategory.webp'),
  require('./BrunchCategory.webp'),
  require('./CleanCategory.webp'),
  require('./DJ Images And Artist Category.webp'),
  require('./DrinkCategory.webp'),
  require('./FoodFlyersCategory.webp'),
  require('./HipHopFlyer Category.webp'),
  require('./HookaCategory.webp'),
  require('./Ladies Night Category.webp'),
  require('./LuxuryFlyerCategory.webp'),
  require('./MemorialDayCategory.webp'),
  require('./MexcianDayCategory.webp'),
  require('./PartyFlyerCategory.webp'),
  require('./PoolPartyCategory.webp'),
  require('./Premium Category.webp'),
  require('./PresidentDayCategory.webp'),
  require('./SummerCategory.webp'),
  require('./TropicalCategory.webp'),
  require('./WhitePartyCategory.webp'),
  require('./WinterFlyerCategory.webp'),
  require('./4thofJulyCategory.webp'),
  require('./5DeMayoCategory.webp'),
  require('./BasicCategory.webp'),
];

// Deterministic hash — unmatched categories always get the same image.
function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h * 31) + name.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Returns a bundled local image for a category name. Always returns a number.
 * Keyword matches get their dedicated image; everything else gets a
 * deterministically chosen image from the full pool (stable across re-renders).
 */
export function getCategoryStaticImage(categoryName: string): number {
  const lower = categoryName.toLowerCase();
  for (const [keyword, image] of CATEGORY_MATCHERS) {
    if (lower.includes(keyword)) return image;
  }
  return FALLBACK_POOL[hashName(lower) % FALLBACK_POOL.length];
}

/**
 * Pre-decodes every bundled category image into the native image cache.
 * Call this once at app startup (e.g. in TabLayout useEffect).
 * After this runs, ImageBackground renders each image in <16ms with no
 * visible overlay delay.
 */
export function prefetchAllCategoryImages(): void {
  // Deduplicate asset IDs across matchers and fallback pool
  const seen = new Set<number>();
  const allAssets: number[] = [];
  for (const [, img] of CATEGORY_MATCHERS) {
    if (!seen.has(img)) { seen.add(img); allAssets.push(img); }
  }
  for (const img of FALLBACK_POOL) {
    if (!seen.has(img)) { seen.add(img); allAssets.push(img); }
  }

  // Resolve each bundled asset to its native URI and prefetch (pre-decode).
  // Image.resolveAssetSource converts require() numbers → file:// / asset:// URIs
  // that Image.prefetch can warm in the native image cache.
  allAssets.forEach(asset => {
    try {
      const { uri } = Image.resolveAssetSource(asset);
      if (uri) Image.prefetch(uri).catch(() => {});
    } catch {
      // resolveAssetSource can throw if called too early; silently ignore
    }
  });
}
