// src/app/api/cart/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authMiddleware } from '@/lib/auth';


export async function GET(req: Request) {
  return authMiddleware(req, async (request, userId) => {
    try {
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true, 
            },
          },
        },
      });

      if (!cart) {

        const newCart = await prisma.cart.create({
          data: { userId },
          include: { items: { include: { product: true } } },
        });
        return NextResponse.json(newCart, { status: 200 });
      }

      return NextResponse.json(cart, { status: 200 });
    } catch (error) {
      console.error('Error fetching cart:', error);
      return NextResponse.json({ message: 'Failed to fetch cart' }, { status: 500 });
    }
  });
}


export async function POST(req: Request) {
  return authMiddleware(req, async (request, userId) => {
    try {
      const { productId, quantity } = await req.json();

      if (!productId || typeof quantity !== 'number' || quantity <= 0) {
        return NextResponse.json({ message: 'Invalid product ID or quantity' }, { status: 400 });
      }

      let cart: any = await prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
        });
      }

      const existingCartItem = cart.items.find((item: any) => item.productId === productId);

      if (existingCartItem) {
        // Update quantity if item already in cart
        const updatedItem = await prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + quantity },
          include: { product: true },
        });
        return NextResponse.json(updatedItem, { status: 200 });
      } else {
        // Add new item to cart
        const newItem = await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
          },
          include: { product: true },
        });
        return NextResponse.json(newItem, { status: 201 });
      }

    } catch (error) {
      console.error('Error adding/updating cart item:', error);
      return NextResponse.json({ message: 'Failed to add item to cart' }, { status: 500 });
    }
  });
}