// src/app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';
import prisma from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';

const simulateNetworkDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function POST(req: Request) {
  return authMiddleware(req, async (request, userId) => {
    try {
      const { cartItems, paymentDetails } = await req.json();

      await simulateNetworkDelay(1000 + Math.random() * 2000);


      if (!paymentDetails || !paymentDetails.cardNumber || !paymentDetails.expiry || !paymentDetails.cvv || !paymentDetails.cardName) {
        return NextResponse.json({ message: 'Missing payment details' }, { status: 400 });
      }

      if (!/^\d{16}$/.test(paymentDetails.cardNumber.replace(/\s/g, ''))) {
         return NextResponse.json({ message: 'Invalid card number format' }, { status: 400 });
      }

      if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
        return NextResponse.json({ message: 'Invalid CVV format' }, { status: 400 });
      }

      if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(paymentDetails.expiry)) {
        return NextResponse.json({ message: 'Invalid expiry date format (MM/YY)' }, { status: 400 });
      }

      if (!cartItems || cartItems.length === 0) {
        return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
      }

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
            cart: {
              userId: userId
            }
          },
        });

        return NextResponse.json({
          message: 'Payment successful and order placed!',
          orderId: order.id,
          totalAmount: order.totalAmount,
          status: 'success'
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