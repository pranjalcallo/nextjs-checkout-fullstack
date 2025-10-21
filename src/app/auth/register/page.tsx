// src/app/auth/register/page.tsx
import RegisterForm from '@/components/auth/RegisterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - E-commerce',
  description: 'Register for a new E-commerce account',
};

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
      <RegisterForm />
    </div>
  );
}