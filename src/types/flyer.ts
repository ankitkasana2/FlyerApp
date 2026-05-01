// src/types/flyer.ts
// Flyer model — mirrors the shape returned by GET /flyers

export interface Flyer {
  _id?: string;
  id?: string | number;
  title: string;
  /** Mapped from `title` by flyerStore.fetchFlyer */
  name?: string;
  price: number | string;
  imageUrl?: string;
  image_url?: string;
  image?: string;
  isPremium?: boolean;
  isFavorited?: boolean;
  category?: string;
  categories?: string[];
  createdAt?: string;
  created_at?: string;
}
export interface Banner {
  id: string;
  tag?: string;
  title: string;
  ctaLabel?: string;
  button_text?: string;
  description?: string;
  image_url: string;
}
export interface FavoritesResponse {
  success: boolean;
  favorites: Flyer[];
  message?: string;
}
