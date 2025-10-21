// src/services/checkoutService.ts
import axiosInstance from './axiosInstance';

export interface PaymentDetails {
  cardNumber: string;
  expiry: string; 
  cvv: string;
  cardName: string;
}

export interface CheckoutRequestItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface CheckoutResponse {
  message: string;
  orderId?: string;
  totalAmount?: number;
  status: 'success' | 'failed';
}

export const processCheckout = async (cartItems: CheckoutRequestItem[], paymentDetails: PaymentDetails): Promise<CheckoutResponse> => {
  const response = await axiosInstance.post('/checkout', { cartItems, paymentDetails });
  return response.data;
};