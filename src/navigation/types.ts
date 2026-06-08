// ─── Auth Stack ──────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ConfirmEmail: undefined;
  ResetPassword: undefined;
  ResetPasswordOtp: { email: string };
  ResetPasswordNewPassword: { email: string; otp: string };
};

// ─── Bottom Tabs ─────────────────────────────────────────────────────────────
export type BottomTabParamList = {
  Home: undefined;
  Categories: undefined;
  Download: undefined;
  Cart: undefined;
};

// ─── Drawer ──────────────────────────────────────────────────────────────────
export type DrawerParamList = {
  MainTabs: undefined;
  Settings: undefined;
  About: undefined;
};

// ─── App Stack ─────────────────────────────────────────────────────────────────
export type AppStackParamList = {
  DrawerRoot: undefined;
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  MyOrders: undefined;
  OrderDetail: { orderId: string };
  HowItWorks: undefined;
  MediaLibrary: undefined;
  FlyerDetail: { flyerId: string; cartItemId?: number };
  CategoryFlyers: { categoryId: string; categoryName: string };
  Favorites: undefined;
  Notifications: undefined;
  ContactUs: undefined;
  FAQ: undefined;
  HelpCenter: undefined;
  PrivacyPolicy: undefined;
  RefundPolicy: undefined;
  TermsOfService: undefined;
};

// ─── Root ─────────────────────────────────────────────────────────────────────
export type RootParamList = {
  App: undefined;
  Auth: undefined;
};
