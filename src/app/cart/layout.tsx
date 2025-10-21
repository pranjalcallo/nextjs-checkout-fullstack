// src/app/cart/layout.tsx

'use client';

import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/stores/authStore';
import React, { useEffect, useState } from 'react';
export default function CartLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    const [loading, setLoading] = useState(true);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {

        if (isAuthenticated) {
            setLoading(false);
        }

    }, [isAuthenticated]);



    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return <>{children}</>;
}