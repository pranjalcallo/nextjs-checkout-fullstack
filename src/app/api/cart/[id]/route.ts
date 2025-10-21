// src/app/api/cart/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authMiddleware } from '@/lib/auth';


export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return authMiddleware(req, async (request, userId) => {
    try {
      const cartItemId = params.id;
      const { quantity } = await req.json();

      if (typeof quantity !== 'number' || quantity < 0) {
        return NextResponse.json({ message: 'Invalid quantity' }, { status: 400 });
      }

      const cartItem = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
        include: { cart: true },
      });

      if (!cartItem || cartItem.cart.userId !== userId) {
        return NextResponse.json({ message: 'Cart item not found or unauthorized' }, { status: 404 });
      }

      if (quantity === 0) {

        await prisma.cartItem.delete({
          where: { id: cartItemId },
        });
        return NextResponse.json({ message: 'Item removed from cart' }, { status: 200 });
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
        include: { product: true },
      });

      return NextResponse.json(updatedItem, { status: 200 });

    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      return NextResponse.json({ message: 'Failed to update cart item' }, { status: 500 });
    }
  });
}


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return authMiddleware(req, async (request, userId) => {
    try {
      const cartItemId = params.id;

      const cartItem = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
        include: { cart: true },
      });

      if (!cartItem || cartItem.cart.userId !== userId) {
        return NextResponse.json({ message: 'Cart item not found or unauthorized' }, { status: 404 });
      }

      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });

      return NextResponse.json({ message: 'Item removed from cart' }, { status: 200 });

    } catch (error) {
      console.error('Error removing cart item:', error);
      return NextResponse.json({ message: 'Failed to remove cart item' }, { status: 500 });
    }
  });
}