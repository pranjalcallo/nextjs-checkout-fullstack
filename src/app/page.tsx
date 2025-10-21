// src/app/page.tsx
'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { Product } from '@prisma/client';
import { getProducts } from '@/services/productService';
import { addToCart, fetchCart } from '@/services/cartService';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';

import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast, Toaster } from 'react-hot-toast'; 
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCartProductId, setAddingToCartProductId] = useState<string | null>(null);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { setCart } = useCartStore();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts();

      const productsWithNumbers:any = data.map(p => ({
        ...p,
        price: parseFloat(p.price as any)
      }));
      setProducts(productsWithNumbers);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddToCart = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart.');
      return;
    }

    setAddingToCartProductId(productId);
    try {
      await addToCart(productId, 1);
      const updatedCart = await fetchCart(); 
      const clientCartItems:any = updatedCart.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          price: parseFloat(item?.product?.price as any ?? 0),
        }
      }));
      setCart(clientCartItems);
      toast.success('Item added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCartProductId(null);
    }
  }, [isAuthenticated, setCart]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="py-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6 text-center">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            isAddingToCart={addingToCartProductId === product.id}
          />
        ))}
      </div>
    </div>
  );
}