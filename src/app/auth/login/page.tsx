// src/app/auth/login/page.tsx
import LoginForm from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - E-commerce',
  description: 'Login to your E-commerce account',
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
      <LoginForm />
    </div>
  );
}