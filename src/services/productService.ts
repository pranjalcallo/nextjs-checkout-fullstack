// src/services/productService.ts
import axiosInstance from './axiosInstance';
import { Product } from '@prisma/client'; 

export const getProducts = async (): Promise<Product[]> => {
  const response = await axiosInstance.get('/products');
  return response.data;
};