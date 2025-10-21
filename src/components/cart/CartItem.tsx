// src/components/cart/CartItem.tsx
import React, { memo, useCallback, useState } from 'react';
import Image from 'next/image';
import { CartItem as CartItemType } from '@/stores/cartStore';
import Button from '../ui/Button';
import { updateCartItemQuantity, removeCartItem, fetchCart } from '@/services/cartService';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'react-hot-toast';

interface CartItemProps {
  item: any;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { setCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  const syncCart = useCallback(async () => {
    try {
      const updatedCart = await fetchCart();
      const clientCartItems:any = updatedCart.items.map(cartItem => ({
        ...cartItem,
        product: {
          ...cartItem.product,
          price: parseFloat(cartItem.product.price as any),
        }
      }));
      setCart(clientCartItems);
    } catch (error) {
      console.error('Failed to sync cart:', error);
      toast.error('Failed to update cart. Please refresh.');
    }
  }, [setCart]);

  const handleQuantityChange = useCallback(async (newQuantity: number) => {
    setLoading(true);
    try {
      if (newQuantity <= 0) {
        await removeCartItem(item.id);
        toast.success(`Removed ${item.product.name} from cart.`);
      } else {
        await updateCartItemQuantity(item.id, newQuantity);
        toast.success('Cart item quantity updated.');
      }
      await syncCart();
    } catch (error) {
      console.error('Error updating cart item:', error);
      toast.error('Failed to update item quantity.');
    } finally {
      setLoading(false);
    }
  }, [item.id, item.product.name, syncCart]);

  const handleRemoveItem = useCallback(async () => {
    setLoading(true);
    try {
      await removeCartItem(item.id);
      await syncCart();
      toast.success(`Removed ${item.product.name} from cart.`);
    } catch (error) {
      console.error('Error removing cart item:', error);
      toast.error('Failed to remove item from cart.');
    } finally {
      setLoading(false);
    }
  }, [item.id, item.product.name, syncCart]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 border-b border-gray-200 last:border-b-0">
      {/* Product Image */}
      <div className="relative w-full xs:w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
        <Image
          src={item.product.imageUrl || 'https://via.placeholder.com/100x100?text=No+Image'}
          alt={item.product.name}
          layout="fill"
          objectFit="cover"
          className="transition-transform hover:scale-105"
        />
      </div>

      {/* Product Info */}
      <div className="flex-grow w-full sm:w-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-grow">
            <h3 className="font-semibold text-base sm:text-lg line-clamp-2">{item.product.name}</h3>
            <p className="text-gray-600 text-sm mt-1">${item.product.price.toFixed(2)} each</p>
          </div>

          {/* Mobile: Price and Remove */}
          <div className="sm:hidden flex justify-between items-center mt-2">
            <span className="font-bold text-lg">${(item.product.price * item.quantity).toFixed(2)}</span>
            <Button
              onClick={handleRemoveItem}
              disabled={loading}
              variant="danger"
              size="sm"
              aria-label={`Remove ${item.product.name} from cart`}
            >
              {loading ? '...' : 'Remove'}
            </Button>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between sm:justify-start gap-4 mt-3 sm:mt-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={loading || item.quantity <= 1}
              variant="secondary"
              size="sm"
              className="w-8 h-8 flex items-center justify-center p-0"
              aria-label={`Decrease quantity of ${item.product.name}`}
            >
              -
            </Button>
            <span className="w-8 text-center border rounded-md py-1 text-sm font-medium">
              {item.quantity}
            </span>
            <Button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={loading}
              variant="secondary"
              size="sm"
              className="w-8 h-8 flex items-center justify-center p-0"
              aria-label={`Increase quantity of ${item.product.name}`}
            >
              +
            </Button>
          </div>

          {/* Desktop: Price and Remove */}
          <div className="hidden sm:flex items-center gap-4 ml-auto">
            <span className="font-bold text-lg min-w-[80px] text-right">
              ${(item.product.price * item.quantity).toFixed(2)}
            </span>
            <Button
              onClick={handleRemoveItem}
              disabled={loading}
              variant="danger"
              size="sm"
              aria-label={`Remove ${item.product.name} from cart`}
            >
              {loading ? '...' : 'Remove'}
            </Button>
          </div>
        </div>
      </div>

      {/* Alternative Mobile Layout for very small screens */}
      <div className="xs:hidden w-full">
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            Total: <span className="font-bold text-base">${(item.product.price * item.quantity).toFixed(2)}</span>
          </div>
          <Button
            onClick={handleRemoveItem}
            disabled={loading}
            variant="danger"
            size="sm"
          >
            {loading ? '...' : 'Remove'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default memo(CartItem);