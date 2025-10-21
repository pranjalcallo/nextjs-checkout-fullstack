// src/components/providers/AuthProvider.tsx
'use client';

import { useEffect, ReactNode, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { fetchCart } from '@/services/cartService';
import { useRouter, usePathname } from 'next/navigation';
import LoadingSpinner from '../ui/LoadingSpinner';


interface AuthProviderProps {
  children: ReactNode;
}


const publicRoutes = ['/','/auth/login', '/auth/register'];

export default function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, token, user, logout } = useAuthStore();
  const setCart = useCartStore((state) => state.setCart);
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuthAndCart = async () => {
      setLoading(true); 

      const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
        const { isAuthenticated: hydratedIsAuthenticated, token: hydratedToken } = useAuthStore.getState();
        if (hydratedIsAuthenticated && hydratedToken) {
          fetchUserCart();
        } else {

          if (!publicRoutes.includes(pathname)) {
            router.push('/auth/login');
          }
          setLoading(false); 
        }
      });

      if (useAuthStore.persist.hasHydrated()) {
          const { isAuthenticated: initialIsAuthenticated, token: initialToken } = useAuthStore.getState();
          if (initialIsAuthenticated && initialToken) {
            fetchUserCart();
          } else {
            if (!publicRoutes.includes(pathname)) {
              router.push('/auth/login');
            }
            setLoading(false);
          }
      }

      return () => unsubscribe();
    };

    initializeAuthAndCart();
  }, [isAuthenticated, pathname, router, setCart]);


  const fetchUserCart = async () => {
    try {
      const cart = await fetchCart();

      const clientCartItems: any = cart.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          price: parseFloat(item.product.price as any), 
        }
      }));
      setCart(clientCartItems);
    } catch (error: any) {
      console.error('Failed to fetch cart:', error);
      if (error.response?.status === 401) {
        logout();
        router.push('/auth/login');
      }
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (!loading) { 
      if (!isAuthenticated && !publicRoutes.includes(pathname)) {
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, pathname, router, loading]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
}