// src/tests/api/auth/login.test.ts
import { POST } from '@/app/api/auth/login/route';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { generateAuthToken } from '@/lib/auth';
import { NextRequest } from 'next/server';


jest.mock('@/lib/db', () => ({
  user: {
    findUnique: jest.fn(),
  },
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

// Mock jsonwebtoken for generateAuthToken
jest.mock('@/lib/auth', () => ({
  ...jest.requireActual('@/lib/auth'),
  generateAuthToken: jest.fn((user) => `mock_token_for_${user.id}`),
}));


describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
  });

  const mockUser = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed_password123',
  };

  it('should log in a user successfully', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Passwords match

    const mockRequest = {
      json: () => Promise.resolve({
        email: 'test@example.com',
        password: 'password123',
      }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user.email).toBe('test@example.com');
    expect(data.user.id).toBe('test-user-id');
    expect(data.user.password).toBeUndefined(); // Ensure password is not returned
    expect(data.token).toBe('mock_token_for_test-user-id');
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
    expect(generateAuthToken).toHaveBeenCalledWith({ id: 'test-user-id', email: 'test@example.com', name: 'Test User' });
  });

  it('should return 400 if email or password are missing', async () => {
    const mockRequest = {
      json: () => Promise.resolve({ email: 'test@example.com' }), // Missing password
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Email and password are required');
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid email', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // User not found

    const mockRequest = {
      json: () => Promise.resolve({
        email: 'nonexistent@example.com',
        password: 'password123',
      }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe('Invalid credentials');
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid password', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Passwords do not match

    const mockRequest = {
      json: () => Promise.resolve({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    } as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe('Invalid credentials');
    expect(generateAuthToken).not.toHaveBeenCalled();
  });

  it('should handle internal server errors', async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

    const mockRequest = {
      json: () => Promise.resolve({
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