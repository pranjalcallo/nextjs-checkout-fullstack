// src/tests/api/cart/cart.test.ts
import { GET, POST } from '@/app/api/cart/route';
import { PUT, DELETE } from '@/app/api/cart/[id]/route';
import prisma from '@/lib/db';
import { NextRequest } from 'next/server';
import { authMiddleware, getUserIdFromRequest } from '@/lib/auth';

// Mock Prisma client
jest.mock('@/lib/db', () => ({
  user: {
    findUnique: jest.fn(),
  },
  cart: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  cartItem: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  product: {
    findUnique: jest.fn(),
  },
}));

// Mock authMiddleware to directly call the handler with a mock userId
// This avoids needing to mock the entire JWT process for these tests
jest.mock('@/lib/auth', () => ({
  ...jest.requireActual('@/lib/auth'),
  getUserIdFromRequest: jest.fn(() => 'mock-user-id'), // Always return a valid user ID
  authMiddleware: jest.fn((request, handler) => {
    const userId = 'mock-user-id'; // Simulate authenticated user
    if (!userId) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }
    return handler(request, userId);
  }),
}));

const mockProduct = {
  id: 'prod1',
  name: 'Test Product',
  price: 10.00,
  stock: 10,
  imageUrl: 'url',
  description: 'desc',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCartItem = {
  id: 'cartItem1',
  cartId: 'cart1',
  productId: 'prod1',
  quantity: 2,
  product: mockProduct,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCart = {
  id: 'cart1',
  userId: 'mock-user-id',
  items: [mockCartItem],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('API /api/cart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/cart', () => {
    it('should return existing cart for authenticated user', async () => {
      (prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);

      const mockRequest = {} as NextRequest; // Request body not relevant for GET

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCart);
      expect(prisma.cart.findUnique).toHaveBeenCalledWith({
        where: { userId: 'mock-user-id' },
        include: { items: { include: { product: true } } },
      });
    });

    it('should create a new cart if none exists for authenticated user', async () => {
      (prisma.cart.findUnique as jest.Mock).mockResolvedValue(null); // No existing cart
      (prisma.cart.create as jest.Mock).mockResolvedValue({ ...mockCart, items: [] }); // Create an empty cart

      const mockRequest = {} as NextRequest;

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.userId).toBe('mock-user-id');
      expect(data.items).toEqual([]);
      expect(prisma.cart.create).toHaveBeenCalledWith({
        data: { userId: 'mock-user-id' },
        include: { items: { include: { product: true } } },
      });
    });
  });

  describe('POST /api/cart', () => {
    it('should add a new item to cart', async () => {
      (prisma.cart.findUnique as jest.Mock).mockResolvedValue({ ...mockCart, items: [] }); // Empty cart
      (prisma.cartItem.create as jest.Mock).mockResolvedValue(mockCartItem);

      const mockRequest = {
        json: () => Promise.resolve({ productId: 'prod1', quantity: 2 }),
      } as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockCartItem);
      expect(prisma.cartItem.create).toHaveBeenCalledWith({
        data: { cartId: 'cart1', productId: 'prod1', quantity: 2 },
        include: { product: true },
      });
    });

    it('should update quantity of existing item in cart', async () => {
      (prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart); // Cart with existing item
      (prisma.cartItem.update as jest.Mock).mockResolvedValue({ ...mockCartItem, quantity: 4 });

      const mockRequest = {
        json: () => Promise.resolve({ productId: 'prod1', quantity: 2 }),
      } as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.quantity).toBe(4); // original 2 + new 2
      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: 'cartItem1' },
        data: { quantity: 4 },
        include: { product: true },
      });
    });

    it('should return 400 for invalid input', async () => {
      const mockRequest = {
        json: () => Promise.resolve({ productId: 'prod1', quantity: 0 }), // Invalid quantity
      } as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('Invalid product ID or quantity');
    });
  });
});

// Since PUT and DELETE are dynamic routes /api/cart/[id],
// we need to create separate test files or mock the `params` for dynamic segments
// For simplicity, let's create a minimal test for PUT/DELETE here.
// In a real project, consider creating separate test files for each route.

describe('API /api/cart/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /api/cart/[id]', () => {
    it('should update cart item quantity', async () => {
      (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue({
        ...mockCartItem,
        cart: { userId: 'mock-user-id' }
      });
      (prisma.cartItem.update as jest.Mock).mockResolvedValue({ ...mockCartItem, quantity: 5 });

      const mockRequest = {
        json: () => Promise.resolve({ quantity: 5 }),
      } as NextRequest;

      const response = await PUT(mockRequest, { params: { id: 'cartItem1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.quantity).toBe(5);
      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: 'cartItem1' },
        data: { quantity: 5 },
        include: { product: true },
      });
    });

    it('should remove item if quantity is 0', async () => {
      (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue({
        ...mockCartItem,
        cart: { userId: 'mock-user-id' }
      });
      (prisma.cartItem.delete as jest.Mock).mockResolvedValue(mockCartItem);

      const mockRequest = {
        json: () => Promise.resolve({ quantity: 0 }),
      } as NextRequest;

      const response = await PUT(mockRequest, { params: { id: 'cartItem1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Item removed from cart');
      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: 'cartItem1' },
      });
    });
  });

  describe('DELETE /api/cart/[id]', () => {
    it('should remove a cart item', async () => {
      (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue({
        ...mockCartItem,
        cart: { userId: 'mock-user-id' }
      });
      (prisma.cartItem.delete as jest.Mock).mockResolvedValue(mockCartItem);

      const mockRequest = {} as NextRequest; // No body needed for DELETE

      const response = await DELETE(mockRequest, { params: { id: 'cartItem1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Item removed from cart');
      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: 'cartItem1' },
      });
    });

    it('should return 404 if cart item not found or unauthorized', async () => {
      (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue(null); // Item not found

      const mockRequest = {} as NextRequest;

      const response = await DELETE(mockRequest, { params: { id: 'nonexistent-id' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.message).toBe('Cart item not found or unauthorized');
    });
  });
});