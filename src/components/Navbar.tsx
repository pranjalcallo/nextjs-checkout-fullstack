// src/components/Navbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import Button from './ui/Button';

const Navbar: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const { totalItems: totalCartItems, clearCart } = useCartStore();
    
  const handleLogout = () => {
      logout();
      clearCart();
  };

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          E-Commerce
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/" className="hover:text-gray-300">
            Products
          </Link>
          <Link href="/cart" className="relative hover:text-gray-300">
            Cart
            {totalCartItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalCartItems}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <>
              <span className="text-gray-300">Hello, {user?.name || user?.email}</span>
              <Button onClick={handleLogout} variant="secondary" size="sm">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hover:text-gray-300">
                Login
              </Link>
              <Link href="/auth/register" className="hover:text-gray-300">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;