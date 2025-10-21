// src/lib/auth.ts
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET!; 

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in .env');
}

export const generateAuthToken = (user: { id: string; email: string; name?: string | null }) => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '1h' }); 
};

export const verifyAuthToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as { id: string; email: string; name?: string | null };
  } catch (error) {
    return null;
  }
};

export const getUserIdFromRequest = (req: Request): string | null => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return null;
  }

  const decoded = verifyAuthToken(token);
  return decoded ? decoded.id : null;
};



export const authMiddleware = async (request: Request, handler: (request: Request, userId: string) => Promise<NextResponse>) => {
  const userId = getUserIdFromRequest(request);

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  return handler(request, userId);
};


export interface AuthenticatedRequest extends Request {
  userId: string;
}