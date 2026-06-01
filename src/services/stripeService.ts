import type { CartItemRaw } from '../types/api';
import apiClient from './apiClient';

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

export const buildCheckoutPayload = (
  cartItems: CartItemRaw[],
  amount: number,
  userId?: string,
) => ({
  amount: Number(amount.toFixed(2)),
  cartItemIds: cartItems.map(item => item.id),
  userId,
});

export const createPaymentSheet = async (
  payload: CreatePaymentSheetPayload,
): Promise<PaymentSheetResponse> => {
  const { data } = await apiClient.post<PaymentSheetResponse>(
    '/stripe/create-payment-sheet',
    { currency: 'usd', ...payload },
  );
  return data;
};

export const finalizePayment = async (paymentIntentId: string) => {
  const { data } = await apiClient.post('/stripe/checkout/finalize', {
    paymentIntentId,
  });
  return data as { success?: boolean; orders?: string[]; error?: string };
};
