import Config from 'react-native-config';
import { Platform } from 'react-native';
import type { CartItemRaw } from '../types/api';
import { API_BASE_URL } from './api';
import { createApiClient } from './apiClient';

export const STRIPE_RETURN_URL = 'flyerapp://stripe-redirect';

export interface PaymentSheetResponse {
  paymentIntent: string;
  paymentIntentId?: string;
  ephemeralKey?: string;
  customer?: string;
  publishableKey?: string;
}

interface CreatePaymentSheetPayload {
  amount: number;
  cartItemIds: number[];
  customerId?: string;
  userId?: string;
  currency?: string;
}

const normalizeBaseUrl = (baseUrl: string) => {
  const cleaned = baseUrl.replace(/\/$/, '');
  if (cleaned.includes('localhost') && Platform.OS === 'android') {
    return cleaned.replace('localhost', '10.0.2.2');
  }
  return cleaned;
};

const STRIPE_API_BASE_URL = normalizeBaseUrl(
  Config.STRIPE_API_BASE_URL || API_BASE_URL,
);
const STRIPE_PAYMENT_SHEET_PATH =
  Config.STRIPE_PAYMENT_SHEET_PATH || '/stripe/create-payment-sheet';
const STRIPE_CLIENT = createApiClient(STRIPE_API_BASE_URL);

export const buildCheckoutPayload = (
  cartItems: CartItemRaw[],
  amount: number,
  userId?: string,
) => ({
  amount: Number(amount.toFixed(2)),
  cartItemIds: cartItems.map(item => item.id),
  userId,
  web_user_id: userId,
});

export const createPaymentSheet = async (
  payload: CreatePaymentSheetPayload,
): Promise<PaymentSheetResponse> => {
  const { data } = await STRIPE_CLIENT.post<PaymentSheetResponse>(
    STRIPE_PAYMENT_SHEET_PATH,
    { currency: 'usd', ...payload },
  );
  return data;
};

export const finalizePayment = async (paymentIntentId: string) => {
  const { data } = await STRIPE_CLIENT.post('/stripe/checkout/finalize', {
    paymentIntentId,
  });
  return data as { success?: boolean; orders?: string[]; error?: string };
};
