// src/stores/cartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@prisma/client';


export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price?: any;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  setCart: (items: CartItem[]) => void;
  addItem: (product: Product, quantity: number) => void; 
  updateItemQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;

}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      setCart: (items) => {
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => sum + ((item?.product?.price as any) ?? 0) * item.quantity, 0);
        set({ items, totalItems, totalPrice });
      },
      addItem: (product, quantity) => {
 
        set((state) => {
          const existingItem = state.items.find((item) => item.productId === product.id);
          let updatedItems;
          if (existingItem) {
            updatedItems = state.items.map((item) =>
              item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item
            );
          } else {
            updatedItems = [...state.items, { id: `mock-${Date.now()}`, productId: product.id, product, quantity }];
          }
          const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = updatedItems.reduce((sum, item) => sum + (((item?.product?.price as any) || 0) * item.quantity), 0);
          return { items: updatedItems, totalItems, totalPrice };
        });
      },
      updateItemQuantity: (itemId, quantity) => {
        set((state) => {
          const updatedItems = state.items
            .map((item) => (item.id === itemId ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0); 

          const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = updatedItems.reduce((sum, item) => sum + (((item?.product?.price as any) || 0) * item.quantity), 0);
          return { items: updatedItems, totalItems, totalPrice };
        });
      },
      removeItem: (itemId) => {
        set((state) => {
          const updatedItems = state.items.filter((item) => item.id !== itemId);
          const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = updatedItems.reduce((sum, item) => sum + (((item?.product?.price as any) || 0) * item.quantity), 0);
          return { items: updatedItems, totalItems, totalPrice };
        });
      },
      clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);