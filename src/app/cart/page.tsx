// src/app/cart/page.tsx
'use client';

import React from 'react';
import { useCartStore } from '@/stores/cartStore';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Toaster } from 'react-hot-toast'; 


export default function CartPage() {
  const { items, totalItems } = useCartStore();


  return (
    <div className="py-8">
      <Toaster /> {/* Place Toaster at a high level */}
      <h1 className="text-3xl font-bold mb-8 text-center">Your Shopping Cart</h1>

      {totalItems === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-xl text-gray-600 mb-4">Your cart is empty.</p>
          <Link href="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <CartSummary showCheckoutButton={true} />
          </div>
        </div>
      )}
    </div>
  );
}