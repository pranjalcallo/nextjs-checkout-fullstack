// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  const products = [
    {
      name: 'Next.js T-Shirt',
      description: 'A stylish t-shirt for Next.js enthusiasts.',
      price: 29.99,
      imageUrl: 'https://picsum.photos/300/400',
      stock: 50,
    },
    {
      name: 'Prisma Mug',
      description: 'Keep your coffee warm with this Prisma branded mug.',
      price: 15.50,
      imageUrl: 'https://picsum.photos/300/400',
      stock: 75,
    },
    {
      name: 'Tailwind CSS Hoodie',
      description: 'Comfortable hoodie for Tailwind CSS developers.',
      price: 49.00,
      imageUrl: 'https://picsum.photos/300/400',
      stock: 30,
    },
    {
      name: 'Zustand Sticker Pack',
      description: 'Decorate your laptop with Zustand stickers.',
      price: 9.99,
      imageUrl: 'https://picsum.photos/300/400',
      stock: 100,
    },
    {
      name: 'PostgreSQL Database Guide',
      description: 'A comprehensive guide to PostgreSQL for beginners.',
      price: 35.00,
      imageUrl: 'https://picsum.photos/300/400',
      stock: 20,
    },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: p,
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });