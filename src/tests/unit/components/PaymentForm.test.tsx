// src/tests/unit/components/PaymentForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentForm from '@/components/checkout/PaymentForm';
import { toast } from 'react-hot-toast';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => null, // Mock Toaster component as it's typically rendered once at root
}));

describe('PaymentForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock current date for expiry validation
    jest.useFakeTimers().setSystemTime(new Date('2024-01-15T00:00:00.000Z')); // January 2024
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders all required fields', () => {
    render(<PaymentForm onSubmit={mockOnSubmit} loading={false} />);

    expect(screen.getByLabelText(/Cardholder Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Card Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expiry \(MM\/YY\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CVV/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pay Now/i })).toBeInTheDocument();
  });

  it('submit button is disabled initially', () => {
    render(<PaymentForm onSubmit={mockOnSubmit} loading={false} />);
    expect(screen.getByRole('button', { name: /Pay Now/i })).toBeDisabled();
  });

  it('enables submit button when all fields are valid', async () => {
    render(<PaymentForm onSubmit={mockOnSubmit} loading={false} />);

    fireEvent.change(screen.getByLabelText(/Cardholder Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Card Number/i), { target: { value: '1234123412341234' } });
    fireEvent.change(screen.getByLabelText(/Expiry \(MM\/YY\)/i), { target: { value: '12/26' } });
    fireEvent.change(screen.getByLabelText(/CVV/i), { target: { value: '123' } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Pay Now/i })).not.toBeDisabled();
    });
  });

  it('calls onSubmit with correct data on valid submission', async () => {
    render(<PaymentForm onSubmit={mockOnSubmit} loading={false} />);

    fireEvent.change(screen.getByLabelText(/Cardholder Name/i), { target: { value: 'Jane Smith' } });
    fireEvent.change(screen.getByLabelText(/Card Number/i), { target: { value: '4321 4321 4321 4321' } });
    fireEvent.change(screen.getByLabelText(/Expiry \(MM\/YY\)/i), { target: { value: '11/25' } });
    fireEvent.change(screen.getByLabelText(/CVV/i), { target: { value: '456' } });

    fireEvent.click(screen.getByRole('button', { name: /Pay Now/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        cardName: 'Jane Smith',
        cardNumber: '4321432143214321', // Cleaned number
        expiry: '11/25',
        cvv: '456',
      });
    });
  });

  it('shows error for invalid card number', async () => {
    render(<PaymentForm onSubmit={mockOnSubmit} loading={false} />);

    fireEvent.change(screen.getByLabelText(/Card Number/i), { target: { value: '123' } });
    fireEvent.blur(screen.getByLabelText(/Card Number/i)); // Trigger validation

    await waitFor(() => {
      expect(screen.getByText(/Card number must be 16 digits./i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Pay Now/i })).toBeDisabled();
  });

  it('shows error for invalid expiry date (past date)', async () => {
    render(<PaymentForm onSubmit={mockOnSubmit} loading={false} />);

    fireEvent.change(screen.getByLabelText(/Expiry \(MM\/YY\)/i), { target: { value: '12/23' } }); // Past date
    fireEvent.blur(screen.getByLabelText(/Expiry \(MM\/YY\)/i)); // Trigger validation

    await waitFor(() => {
      expect(screen.getByText(/Expiry date cannot be in the past./i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Pay Now/i })).toBeDisabled();
  });

  it('shows error for invalid CVV', async () => {
    render(<PaymentForm onSubmit={mockOnSubmit} loading={false} />);

    fireEvent.change(screen.getByLabelText(/CVV/i), { target: { value: '12' } });
    fireEvent.blur(screen.getByLabelText(/CVV/i)); // Trigger validation

    await waitFor(() => {
      expect(screen.getByText(/CVV must be 3 or 4 digits./i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Pay Now/i })).toBeDisabled();
  });

  it('shows loading state on button when loading prop is true', () => {
    render(<PaymentForm onSubmit={mockOnSubmit} loading={true} />);
    expect(screen.getByRole('button', { name: /Processing Payment.../i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Processing Payment.../i })).toHaveAttribute('disabled');
  });
});