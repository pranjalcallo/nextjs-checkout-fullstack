// src/components/cart/CartSummary.tsx
import React, { memo } from 'react';
import { useCartStore } from '@/stores/cartStore';
import Link from 'next/link';
import Button from '../ui/Button';

interface CartSummaryProps {
  showCheckoutButton?: boolean;
}

const CartSummary: React.FC<CartSummaryProps> = ({ showCheckoutButton = true }) => {
  const { items, totalItems, totalPrice } = useCartStore();

  const shippingCost = totalPrice > 0 && totalPrice < 50 ? 5.00 : 0.00; 
  const taxRate = 0.08; // 8% tax
  const taxAmount = totalPrice * taxRate;
  const grandTotal = totalPrice + shippingCost + taxAmount;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h2 className="text-2xl font-bold mb-4">Cart Summary</h2>
      <div className="space-y-2 mb-4 text-gray-700">
        <div className="flex justify-between">
          <span>Items ({totalItems})</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({taxRate * 100}%)</span>
          <span>${taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-xl pt-2 border-t border-gray-200">
          <span>Order Total</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </div>
      {showCheckoutButton && items.length > 0 && (
        <Link href="/checkout">
          <Button className="w-full mt-4" size="lg">
            Proceed to Checkout
          </Button>
        </Link>
      )}
      {items.length === 0 && (
        <p className="text-center text-gray-500 mt-4">Your cart is empty.</p>
      )}
    </div>
  );
};

export default memo(CartSummary);