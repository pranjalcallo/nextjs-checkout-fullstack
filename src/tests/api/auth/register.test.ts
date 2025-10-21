// src/tests/api/auth/register.test.ts
import { POST } from '@/app/api/auth/register/route';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { generateAuthToken } from '@/lib/auth';
import { NextRequest } from 'next/server';

// Mock Prisma client
jest.mock('@/lib/db', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
}));

// Mock jsonwebtoken for generateAuthToken
jest.mock('@/lib/auth', () => ({
  ...jest.requireActual('@/lib/auth'), // Keep actual implementations for other parts if needed
  generateAuthToken: jest.fn((user) => `mock_token_for_${user.id}`),
}));


describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure JWT_SECRET is set for the mock generateAuthToken
    process.env.JWT_SECRET = 'test_secret';
  });

  it('should register a new user successfully', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // No existing user
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed_password123', // Prisma returns hashed password
    });

    const mockRequest = {
      json: () => Promise.resolve({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123', // not used by API but often in client
      }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.user.email).toBe('test@example.com');
    expect(data.token).toBe('mock_token_for_test-user-id');
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password123',
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(generateAuthToken).toHaveBeenCalledWith({ id: 'test-user-id', email: 'test@example.com', name: 'Test User' });
  });

  it('should return 400 if required fields are missing', async () => {
    const mockRequest = {
      json: () => Promise.resolve({ email: 'test@example.com' }), // Missing name, password
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Name, email, and password are required');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('should return 400 if password is too short', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
      }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Password must be at least 6 characters long');
  });

  it('should return 409 if user with email already exists', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-id', email: 'test@example.com' });

    const mockRequest = {
      json: () => Promise.resolve({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.message).toBe('User with this email already exists');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('should handle internal server errors', async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

    const mockRequest = {
      json: () => Promise.resolve({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe('Internal server error');
  });
});