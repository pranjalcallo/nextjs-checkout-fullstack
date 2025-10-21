// src/tests/api/checkout/checkout.test.ts
import { POST } from '@/app/api/checkout/route';
import prisma from '@/lib/db';
import { NextRequest } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

// Mock Prisma client
jest.mock('@/lib/db', () => ({
  user: {
    findUnique: jest.fn(),
  },
  product: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  cart: {
    findUnique: jest.fn(),
  },
  cartItem: {
    deleteMany: jest.fn(),
  },
  order: {
    create: jest.fn(),
  },
}));

// Mock authMiddleware to directly call the handler with a mock userId
jest.mock('@/lib/auth', () => ({
  ...jest.requireActual('@/lib/auth'),
  authMiddleware: jest.fn((request, handler) => {
    const userId = 'mock-user-id'; // Simulate authenticated user
    if (!userId) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }
    return handler(request, userId);
  }),
}));

// Mock Math.random to control payment success/failure
const mockMathRandom = jest.spyOn(Math, 'random');

describe('POST /api/checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMathRandom.mockRestore(); // Restore original behavior by default
  });

  const mockProduct1 = {
    id: 'prod1',
    name: 'Product 1',
    price: new Decimal(10.00),
    stock: 5,
    imageUrl: '', description: '', createdAt: new Date(), updatedAt: new Date(),
  };
  const mockProduct2 = {
    id: 'prod2',
    name: 'Product 2',
    price: new Decimal(20.00),
    stock: 10,
    imageUrl: '', description: '', createdAt: new Date(), updatedAt: new Date(),
  };

  const mockCartItems = [
    { productId: 'prod1', productName: 'Product 1', quantity: 2, price: 10.00 },
    { productId: 'prod2', productName: 'Product 2', quantity: 1, price: 20.00 },
  ];

  const mockPaymentDetails = {
    cardName: 'John Doe',
    cardNumber: '1234123412341234',
    expiry: '12/25',
    cvv: '123',
  };

  it('should process payment successfully and create an order', async () => {
    mockMathRandom.mockReturnValue(0.5); // Simulate payment success (80% success rate, so 0.5 is success)
    (prisma.product.findUnique as jest.Mock)
      .mockResolvedValueOnce(mockProduct1)
      .mockResolvedValueOnce(mockProduct2);
    (prisma.order.create as jest.Mock).mockResolvedValue({
      id: 'order-id-123',
      userId: 'mock-user-id',
      totalAmount: new Decimal(40.00),
      status: 'PAID',
    });

    const mockRequest = {
      json: () => Promise.resolve({
        cartItems: mockCartItems,
        paymentDetails: mockPaymentDetails,
      }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('success');
    expect(data.message).toBe('Payment successful and order placed!');
    expect(data.orderId).toBe('order-id-123');
    expect(data.totalAmount).toEqual(expect.any(Number)); // Total amount from mock order

    expect(prisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          userId: 'mock-user-id',
          totalAmount: new Decimal(40.00), // (2*10) + (1*20)
          status: 'PAID',
          paymentId: expect.any(String),
          items: {
            createMany: {
              data: [
                expect.objectContaining({ productId: 'prod1', quantity: 2, price: new Decimal(10.00) }),
                expect.objectContaining({ productId: 'prod2', quantity: 1, price: new Decimal(20.00) }),
              ],
            },
          },
        },
      })
    );
    expect(prisma.product.update).toHaveBeenCalledTimes(2);
    expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { cart: { userId: 'mock-user-id' } },
    });
  });

  it('should return 400 for missing payment details', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        cartItems: mockCartItems,
        paymentDetails: { cardName: 'John Doe' }, // Missing card number, expiry, cvv
      }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Missing payment details');
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it('should return 400 if cart is empty', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        cartItems: [],
        paymentDetails: mockPaymentDetails,
      }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Cart is empty');
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it('should return 400 if product is out of stock', async () => {
    (prisma.product.findUnique as jest.Mock)
      .mockResolvedValueOnce({ ...mockProduct1, stock: 1 }) // Not enough stock for quantity 2
      .mockResolvedValueOnce(mockProduct2);

    const mockRequest = {
      json: () => Promise.resolve({
        cartItems: mockCartItems,
        paymentDetails: mockPaymentDetails,
      }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toContain('Product Product 1 is out of stock or quantity exceeds available stock.');
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it('should handle payment failure', async () => {
    mockMathRandom.mockReturnValue(0.9); // Simulate payment failure (20% failure rate, 0.9 is in that range)
    (prisma.product.findUnique as jest.Mock)
      .mockResolvedValueOnce(mockProduct1)
      .mockResolvedValueOnce(mockProduct2);

    const mockRequest = {
      json: () => Promise.resolve({
        cartItems: mockCartItems,
        paymentDetails: mockPaymentDetails,
      }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400); // Mock failure returns 400
    expect(data.status).toBe('failed');
    expect(data.message).toBe('Payment failed. Please try again.');
    expect(prisma.order.create).not.toHaveBeenCalled(); // No order created on failure
    expect(prisma.product.update).not.toHaveBeenCalled(); // No stock deduction on failure
    expect(prisma.cartItem.deleteMany).not.toHaveBeenCalled(); // Cart not cleared on failure
  });
});