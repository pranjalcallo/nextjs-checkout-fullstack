// src/components/Navbar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import Button from './ui/Button';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { totalItems: totalCartItems, clearCart } = useCartStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    clearCart();
    setIsMobileMenuOpen(false); // Close mobile menu on logout
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gray-800 text-white">
      {/* Main Navbar */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-xl font-bold hover:text-gray-300 transition-colors"
            onClick={closeMobileMenu}
          >
            E-Commerce
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Link 
              href="/" 
              className="hover:text-gray-300 transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              Products
            </Link>
            <Link 
              href="/cart" 
              className="relative hover:text-gray-300 transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              Cart
              {totalCartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 lg:space-x-6">
                <span className="text-gray-300 px-3 py-2 text-sm">
                  Hello, {user?.name || user?.email}
                </span>
                <Button 
                  onClick={handleLogout} 
                  variant="secondary" 
                  size="sm"
                  className="whitespace-nowrap"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 lg:space-x-6">
                <Link 
                  href="/auth/login" 
                  className="hover:text-gray-300 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link 
                  href="/auth/register" 
                  className="hover:text-gray-300 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Cart icon for mobile */}
            <Link 
              href="/cart" 
              className="relative p-2 hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m0 0L17 21" />
              </svg>
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </Link>
            
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md hover:text-gray-300 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Products Link */}
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium hover:text-gray-300 hover:bg-gray-700 transition-colors"
              onClick={closeMobileMenu}
            >
              Products
            </Link>

            {/* Cart Link */}
            <Link
              href="/cart"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:text-gray-300 hover:bg-gray-700 transition-colors"
              onClick={closeMobileMenu}
            >
              <span>Cart</span>
              {totalCartItems > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </Link>

            {/* Authentication Links */}
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-base font-medium text-gray-300 border-t border-gray-700 mt-2 pt-3">
                  Hello, {user?.name || user?.email}
                </div>
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center mt-2"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:text-gray-300 hover:bg-gray-700 transition-colors"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:text-gray-300 hover:bg-gray-700 transition-colors"
                  onClick={closeMobileMenu}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;