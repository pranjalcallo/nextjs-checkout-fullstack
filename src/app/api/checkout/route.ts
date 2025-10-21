import { NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import prisma from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';
import { z } from 'zod';

const simulateNetworkDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

const paymentDetailsSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits'),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Expiry must be in MM/YY format'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
  cardName: z.string().min(1, 'Card name is required'),
});

const cartItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

const checkoutSchema = z.object({
  cartItems: z.array(cartItemSchema).nonempty('Cart cannot be empty'),
  paymentDetails: paymentDetailsSchema,
});

export async function POST(req: Request) {
  return authMiddleware(req, async (request, userId) => {
    try {
      const body = await req.json();
      const parsed = checkoutSchema.safeParse(body);

      if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        return NextResponse.json({ message: 'Validation failed', errors }, { status: 400 });
      }

      const { cartItems, paymentDetails } = parsed.data;

      await simulateNetworkDelay(1000 + Math.random() * 2000);

      let totalAmount = new Decimal(0);
      const orderItemsData = [];

      for (const item of cartItems) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.stock < item.quantity) {
          return NextResponse.json({ message: `Product ${item.productName} is out of stock or quantity exceeds available stock.` }, { status: 400 });
        }

        const itemPrice = new Decimal(product.price);
        totalAmount = totalAmount.plus(itemPrice.mul(item.quantity));
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: itemPrice,
        });
      }

      const paymentSuccess = Math.random() > 0.2;

      if (paymentSuccess) {
        const order = await prisma.order.create({
          data: {
            userId,
            totalAmount,
            status: 'PAID',
            paymentId: `mock_payment_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            items: {
              createMany: {
                data: orderItemsData,
              },
            },
          },
        });

        for (const item of cartItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        await prisma.cartItem.deleteMany({
          where: {
            cart: { userId },
          },
        });

        return NextResponse.json({
          message: 'Payment successful and order placed!',
          orderId: order.id,
          totalAmount: order.totalAmount,
          status: 'success',
        }, { status: 200 });

      } else {
        return NextResponse.json({ message: 'Payment failed. Please try again.', status: 'failed' }, { status: 400 });
      }

    } catch (error) {
      console.error('Checkout error:', error);
      return NextResponse.json({ message: 'Internal server error during checkout' }, { status: 500 });
    }
  });
}
