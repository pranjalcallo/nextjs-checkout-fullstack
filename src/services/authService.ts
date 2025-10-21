// src/services/authService.ts
import axiosInstance from './axiosInstance';
import { AuthUser } from '@/stores/authStore';

interface LoginResponse {
  user: AuthUser;
  token: string;
}

interface RegisterResponse {
  user: AuthUser;
  token: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await axiosInstance.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (name: string, email: string, password: string): Promise<RegisterResponse> => {
  const response = await axiosInstance.post('/auth/register', { name, email, password });
  return response.data;
};