// src/app/checkout/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useRouter } from 'next/navigation';
import CartSummary from '@/components/cart/CartSummary';
import PaymentForm from '@/components/checkout/PaymentForm';
import PaymentStatus from '@/components/checkout/PaymentStatus';
import { processCheckout, PaymentDetails, CheckoutResponse } from '@/services/checkoutService';
import { toast, Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';



export default function CheckoutPage() {
    const { items: cartItems, totalPrice, clearCart } = useCartStore();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const router = useRouter();

    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');
    const [paymentResponse, setPaymentResponse] = useState<CheckoutResponse | null>(null);
    const [loading, setLoading] = useState(true);


    const handlePaymentSubmit = useCallback(async (paymentDetails: PaymentDetails) => {
        setPaymentLoading(true);
        setPaymentStatus('idle');
        setPaymentResponse(null);


        const checkoutItems: any[] = cartItems.map(item => ({
            productId: item.productId,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
        }));

        try {
            const response = await processCheckout(checkoutItems, paymentDetails);
            setPaymentResponse(response);
            setPaymentStatus(response.status);
            if (response.status === 'success') {
                clearCart(); // Clear local cart state on successful checkout
                toast.success(response.message || 'Payment successful!');
            } else {
                toast.error(response.message || 'Payment failed. Please try again.');
            }
        } catch (error: any) {
            console.error('Checkout failed:', error);
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred during checkout.';
            setPaymentResponse({ message: errorMessage, status: 'failed' });
            setPaymentStatus('failed');
            toast.error(errorMessage);
        } finally {
            setPaymentLoading(false);
        }
    }, [cartItems, clearCart]);

    const handleRetryPayment = useCallback(() => {
        setPaymentStatus('idle');
        setPaymentResponse(null);
    }, []);



    useEffect(() => {
        if (isAuthenticated) {
            setLoading(false);
        }
    }, [isAuthenticated]);
    useEffect(() => {
        if (cartItems.length === 0 && paymentStatus === 'idle') {
            toast.error('Your cart is empty. Please add items to checkout.');
            router.push('/');
        }
    }, [cartItems, router, paymentStatus]);



    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }


    if (cartItems.length === 0 && paymentStatus === 'idle') {
        return null;
    }

    return (
        <div className="py-8">
            <Toaster />
            <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

            {paymentStatus !== 'idle' ? (
                <PaymentStatus status={paymentStatus} response={paymentResponse} onRetry={handleRetryPayment} />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <PaymentForm onSubmit={handlePaymentSubmit} loading={paymentLoading} />
                    </div>
                    <div className="lg:col-span-1">
                        <CartSummary showCheckoutButton={false} /> {/* Don't show button here */}
                    </div>
                </div>
            )}
        </div>
    );
}