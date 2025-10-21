// src/components/ProductCard.tsx
import React, { memo } from 'react';
import { Product } from '@prisma/client';
import Image from 'next/image';
import Button from './ui/Button';

interface ProductCardProps {
  product: any;
  onAddToCart: (productId: string) => void;
  isAddingToCart: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, isAddingToCart }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative w-full h-48">
        <Image
          src={`${product?.imageUrl }?random=1`|| 'https://picsum.photos/300/300?random=1'}
          alt={product?.name}
          layout="fill"
          objectFit="cover"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h2>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-indigo-600">${product.price.toFixed(2)}</span>

        </div>
        <Button
          onClick={() => onAddToCart(product.id)}
          disabled={isAddingToCart || product.stock <= 0}
          loading={isAddingToCart}
          className="w-full"
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </div>
  );
};

export default memo(ProductCard); 