// src/components/checkout/PaymentStatus.tsx
import React from 'react';
import Button from '../ui/Button';
import Link from 'next/link';
import { CheckoutResponse } from '@/services/checkoutService';

interface PaymentStatusProps {
  status: 'success' | 'failed' | 'idle';
  response: CheckoutResponse | null;
  onRetry?: () => void;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ status, response, onRetry }) => {
  if (status === 'idle') {
    return null; 
  }

  const isSuccess = status === 'success';
  const title = isSuccess ? 'Payment Successful!' : 'Payment Failed';
  const message = isSuccess
    ? response?.message || 'Your order has been placed successfully.'
    : response?.message || 'There was an issue processing your payment. Please try again.';
  const icon = isSuccess ? (
    <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  ) : (
    <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md mx-auto mt-10">
      {icon}
      <h3 className="text-3xl font-bold mt-4 mb-2">{title}</h3>
      <p className={`text-lg mb-4 ${isSuccess ? 'text-gray-700' : 'text-red-700'}`}>
        {message}
      </p>
      {isSuccess && response?.orderId && (
        <p className="text-md text-gray-600 mb-4">
          Order ID: <span className="font-semibold">{response.orderId}</span>
        </p>
      )}
      <div className="space-y-4 mt-6">
        {isSuccess ? (
          <Link href="/">
            <Button className="w-full">Continue Shopping</Button>
          </Link>
        ) : (
          onRetry && (
            <Button onClick={onRetry} className="w-full" variant="secondary">
              Try Payment Again
            </Button>
          )
        )}
        <Link href="/cart">
          <Button variant="secondary" className="w-full">
            View Cart
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PaymentStatus;