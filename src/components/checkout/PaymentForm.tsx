// src/components/checkout/PaymentForm.tsx
import React, { useState, useCallback, useMemo } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { PaymentDetails } from '@/services/checkoutService';
import { toast } from 'react-hot-toast';

interface PaymentFormProps {
  onSubmit: (details: PaymentDetails) => void;
  loading: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, loading }) => {
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState(''); 
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((field: string, value: string): string | null => {
    switch (field) {
      case 'cardName':
        return value.trim() ? null : 'Cardholder name is required.';
      case 'cardNumber':
        const cleanCardNumber = value.replace(/\s/g, '');
        return /^\d{16}$/.test(cleanCardNumber) ? null : 'Card number must be 16 digits.';
      case 'expiry':
        const [month, year] = value.split('/');
        if (!/^(0[1-9]|1[0-2])$/.test(month) || !/^([0-9]{2})$/.test(year)) {
          return 'Invalid expiry date format (MM/YY).';
        }
        const currentYear = new Date().getFullYear() % 100; 
        const currentMonth = new Date().getMonth() + 1;
        const expiryYear = parseInt(year);
        const expiryMonth = parseInt(month);

        if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
          return 'Expiry date cannot be in the past.';
        }
        return null;
      case 'cvv':
        return /^\d{3,4}$/.test(value) ? null : 'CVV must be 3 or 4 digits.';
      default:
        return null;
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let formattedValue = value;

    if (id === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').slice(0, 16);
      formattedValue = formattedValue.replace(/(\d{4})(?=\d)/g, '$1 '); 
      setCardNumber(formattedValue);
    } else if (id === 'expiry') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4); 
      if (formattedValue.length > 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2);
      }
      setExpiry(formattedValue);
    } else if (id === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4); 
      setCvv(formattedValue);
    } else if (id === 'cardName') {
      setCardName(value);
    }

    setErrors((prev:any) => ({ ...prev, [id]: validateField(id, formattedValue) }));
  }, [validateField]);


  const isFormValid = useMemo(() => {
    const fields = { cardName, cardNumber, expiry, cvv };
    for (const key in fields) {
      const fieldName = key as keyof typeof fields;
      if (validateField(fieldName, fields[fieldName])) {
        return false;
      }
    }
    return true;
  }, [cardName, cardNumber, expiry, cvv, validateField]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentErrors: Record<string, string> = {};
    const fields = { cardName, cardNumber, expiry, cvv };
    let isValid = true;

    for (const key in fields) {
      const fieldName = key as keyof typeof fields;
      const error = validateField(fieldName, fields[fieldName]);
      if (error) {
        currentErrors[fieldName] = error;
        isValid = false;
      }
    }

    setErrors(currentErrors);

    if (isValid) {
      onSubmit({
        cardName: cardName.trim(),
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiry: expiry.trim(),
        cvv: cvv.trim(),
      });
    } else {
      toast.error('Please correct the errors in the payment form.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Payment Details</h2>
      <form onSubmit={handleSubmit}>
        <Input
          id="cardName"
          label="Cardholder Name"
          type="text"
          value={cardName}
          onChange={handleInputChange}
          error={errors.cardName}
          placeholder="John Doe"
          disabled={loading}
          autoComplete="cc-name"
        />
        <Input
          id="cardNumber"
          label="Card Number"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{4} [0-9]{4} [0-9]{4} [0-9]{4}"
          maxLength={19} 
          value={cardNumber}
          onChange={handleInputChange}
          error={errors.cardNumber}
          placeholder="XXXX XXXX XXXX XXXX"
          disabled={loading}
          autoComplete="cc-number"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="expiry"
            label="Expiry (MM/YY)"
            type="text"
            inputMode="numeric"
            pattern="(0[1-9]|1[0-2])\/([0-9]{2})"
            maxLength={5}
            value={expiry}
            onChange={handleInputChange}
            error={errors.expiry}
            placeholder="MM/YY"
            disabled={loading}
            autoComplete="cc-exp"
          />
          <Input
            id="cvv"
            label="CVV"
            type="password" 
            inputMode="numeric"
            pattern="[0-9]{3,4}"
            maxLength={4}
            value={cvv}
            onChange={handleInputChange}
            error={errors.cvv}
            placeholder="XXX"
            disabled={loading}
            autoComplete="cc-csc"
          />
        </div>
        <Button
          type="submit"
          className="w-full mt-6"
          loading={loading}
          disabled={loading || !isFormValid}
        >
          {loading ? 'Processing Payment...' : 'Pay Now'}
        </Button>
      </form>
    </div>
  );
};

export default PaymentForm;