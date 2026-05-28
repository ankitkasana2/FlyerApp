// All API request / response shapes — mirrors every endpoint in the backend.

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  is_read: 0 | 1;
  created_at: string;
  updated_at: string;
  order_id?: number | null;
  flyer_id?: number | null;
}

export interface NotificationsResponse {
  success: boolean;
  unread_count: number;
  notifications: Notification[];
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  message?: string;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
}

// ─── Auth / User ──────────────────────────────────────────────────────────────

export interface RegisterUserPayload {
  fullname: string;
  email: string;
  user_id: string;
}

export interface UserProfile {
  id: number;
  user_id: string;
  fullname: string;
  email: string;
  phone: string;
  mobile: string;
}

export interface UpdateProfilePayload {
  fullname: string;
  email: string;
  phone?: string;
  mobile?: string;
}

export interface ProfileResponse {
  success: boolean;
  token: string;
  user: UserProfile;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// ─── Banners ──────────────────────────────────────────────────────────────────

export interface BannerItem {
  id: number;
  title: string;
  description: string | null;
  button_text: string | null;
  button_enabled: boolean;
  link_type: 'category' | 'flyer' | 'external' | 'none';
  link_value: string | null;
  display_order: number;
  image: string;
  image_url: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface BannersResponse {
  success: boolean;
  data: BannerItem[];
}

// ─── Categories ───────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  rank: number;
}

export interface CategoriesResponse {
  success: boolean;
  categories: Category[];
}

// ─── Carousels ────────────────────────────────────────────────────────────────

export interface CarouselItem {
  id: number;
  name: string;
  position: number;
  is_pinned?: boolean | number;
}

export interface CarouselsResponse {
  success: boolean;
  carousels: CarouselItem[];
}

// ─── Flyers ───────────────────────────────────────────────────────────────────

export interface FlyerItem {
  id: number;
  title: string;
  price: number | string;
  image: string;
  image_url: string;
  categories: string[];
  form_type: string;
  recently_added: boolean;
  created_at: string;
  template_type?: string;
  description?: string;
}

export interface FlyersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface FlyersResponse {
  success: boolean;
  flyers: FlyerItem[];
  pagination: FlyersPagination;
}

export interface GetFlyersParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  category?: string;
  template_type?: string;
  q?: string;
  recentlyAdded?: boolean;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface DjEntry {
  name: string;
  image?: string;
}

export interface HostEntry {
  name: string;
  image?: string;
}

export interface SponsorEntry {
  name: string | null;
  image?: string | null;
}

export interface CartItemRaw {
  id: number;
  user_id: string;
  flyer_is: number;
  added_time: string;
  presenting: string;
  event_title: string;
  image_url: string | null;
  event_date: string;
  address_and_phone: string;
  flyer_info: string;
  delivery_time: string;
  total_price: string | number;
  custom_notes: string;
  email: string | null;
  story_size_version: boolean | number;
  custom_flyer: boolean | number;
  animated_flyer: boolean | number;
  instagram_post_size: boolean | number;
  venue_logo: string | null;
  djs: DjEntry[] | string;
  host: HostEntry | string;
  sponsors: SponsorEntry[] | string;
  flyer_title?: string;
  flyer_image_url?: string;
  status?: 'active' | 'pending' | 'inactive';
  flyer?: {
    id: number;
    title: string;
    price: number;
    image: string;
    type: string;
    categories: string[];
  };
}

export interface CartResponse {
  success: boolean;
  count: number;
  cart: CartItemRaw[];
}

export interface AddToCartPayload {
  user_id: string;
  flyer_is: string | number;
  category_id?: string | number;
  presenting?: string;
  event_title?: string;
  event_date?: string;
  address_phone?: string;
  flyer_info?: string;
  delivery_time?: string;
  custom_notes?: string;
  email?: string;
  web_user_id?: string;
  image_url?: string;
  venue_text?: string;
  story_size_version?: boolean;
  custom_flyer?: boolean;
  animated_flyer?: boolean;
  instagram_post_size?: boolean;
  total_price?: number;
  subtotal?: number;
  djs?: DjEntry[];
  host?: HostEntry;
  sponsors?: SponsorEntry[];
}

export interface CartFileAttachments {
  venueLogo?: { uri: string; name: string; type: string } | null;
  sponsorImages?: ({ uri: string; name: string; type: string } | null)[];
  hostImage?: { uri: string; name: string; type: string } | null;
  djImages?: ({ uri: string; name: string; type: string } | null)[];
}

export interface AddToCartResponse {
  success: boolean;
  message: string;
  cartItemId?: number;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: number;
  flyer_title: string;
  image_url: string;
  total_price: number;
  delivery_time: string;
  event_title: string;
  event_date: string;
  status?: OrderStatus;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  items?: OrderItem[];
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
}

export interface OrderDetailResponse {
  success: boolean;
  order: Order;
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export interface FavoriteFlyer {
  id: number;
  title: string;
  price: string;
  form_type: string;
  recently_added: number;
  categories: string[];
  image_url: string;
  created_at: string;
}

export interface FavoritesResponse {
  success: boolean;
  count: number;
  favorites: FavoriteFlyer[];
}

export interface FavoritePayload {
  user_id: string;
  flyer_id: number;
}

export interface FavoriteActionResponse {
  success: boolean;
  message: string;
}

// ─── Media Library ────────────────────────────────────────────────────────────

export interface MediaItem {
  id: number;
  original_name: string;
  file_url: string;
  is_logo: boolean;
  created_at: string;
}

export interface MediaListResponse {
  success: boolean;
  media: MediaItem[];
}

export interface UploadMediaResponse {
  success: boolean;
  file_url: string;
  url?: string;
  media?: { file_url: string };
}

export interface RenameMediaPayload {
  web_user_id: string;
  new_name: string;
}

export interface SetMediaTypePayload {
  web_user_id: string;
  is_logo?: boolean;
  is_image?: boolean;
}

export interface MediaActionResponse {
  success: boolean;
}
