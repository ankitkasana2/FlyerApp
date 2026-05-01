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
  Profile: undefined;
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
  Cart: undefined;
  FlyerDetail: { flyerId: string };
  Favorites: undefined;
  ContactUs: undefined;
  FAQ: undefined;
  HelpCenter: undefined;
  PrivacyPolicy: undefined;
};

// ─── Root ─────────────────────────────────────────────────────────────────────
export type RootParamList = {
  App: undefined;
  Auth: undefined;
};
