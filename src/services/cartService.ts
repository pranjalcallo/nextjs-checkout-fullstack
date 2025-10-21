// src/services/cartService.ts
import axiosInstance from './axiosInstance';
import { CartItem } from '@/stores/cartStore'; 

export interface BackendCart {
  id: string;
  userId: string;
  items: CartItem[]; 
}

export const fetchCart = async (): Promise<BackendCart> => {
  const response = await axiosInstance.get('/cart');
  return response.data;
};

export const addToCart = async (productId: string, quantity: number): Promise<CartItem> => {
  const response = await axiosInstance.post('/cart', { productId, quantity });
  return response.data;
};

export const updateCartItemQuantity = async (cartItemId: string, quantity: number): Promise<CartItem> => {
  const response = await axiosInstance.put(`/cart/${cartItemId}`, { quantity });
  return response.data;
};

export const removeCartItem = async (cartItemId: string): Promise<{ message: string }> => {
  const response = await axiosInstance.delete(`/cart/${cartItemId}`);
  return response.data;
};