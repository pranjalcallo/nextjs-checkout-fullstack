// src/tests/unit/stores/cartStore.test.ts
import { useCartStore, CartItem } from '@/stores/cartStore';
import { Product } from '@prisma/client';
import { act } from 'react'; // Import act for state updates outside React components

// Mock a Product from Prisma type, ensuring price is a number for frontend store
const mockProduct1: Product = {
  id: 'prod1',
  name: 'Test Product 1',
  description: 'Desc 1',
  price: 10.00 as any, // Cast to any because Prisma Decimal is not a simple number
  imageUrl: 'url1',
  stock: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProduct2: Product = {
  id: 'prod2',
  name: 'Test Product 2',
  description: 'Desc 2',
  price: 25.00 as any,
  imageUrl: 'url2',
  stock: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('cartStore', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useCartStore.getState().clearCart();
    });
  });

  it('should initialize with empty cart', () => {
    const { items, totalItems, totalPrice } = useCartStore.getState();
    expect(items).toEqual([]);
    expect(totalItems).toBe(0);
    expect(totalPrice).toBe(0);
  });

  it('should add item to cart', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct1, 1);
    });

    const { items, totalItems, totalPrice } = useCartStore.getState();
    expect(items.length).toBe(1);
    expect(items[0].productId).toBe('prod1');
    expect(items[0].quantity).toBe(1);
    expect(totalItems).toBe(1);
    expect(totalPrice).toBe(10.00);
  });

  it('should increase quantity if item already exists', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct1, 1);
      useCartStore.getState().addItem(mockProduct1, 2);
    });

    const { items, totalItems, totalPrice } = useCartStore.getState();
    expect(items.length).toBe(1);
    expect(items[0].productId).toBe('prod1');
    expect(items[0].quantity).toBe(3);
    expect(totalItems).toBe(3);
    expect(totalPrice).toBe(30.00); // 3 * 10.00
  });

  it('should update item quantity directly', () => {
    // Add item first to get a real (mocked) item ID
    let currentItems: CartItem[] = [];
    act(() => {
      useCartStore.getState().addItem(mockProduct1, 1);
      currentItems = useCartStore.getState().items;
    });

    const itemId = currentItems[0].id;
    act(() => {
      useCartStore.getState().updateItemQuantity(itemId, 5);
    });

    const { items, totalItems, totalPrice } = useCartStore.getState();
    expect(items.length).toBe(1);
    expect(items[0].productId).toBe('prod1');
    expect(items[0].quantity).toBe(5);
    expect(totalItems).toBe(5);
    expect(totalPrice).toBe(50.00); // 5 * 10.00
  });

  it('should remove item if quantity is set to 0', () => {
    let currentItems: CartItem[] = [];
    act(() => {
      useCartStore.getState().addItem(mockProduct1, 1);
      currentItems = useCartStore.getState().items;
    });

    const itemId = currentItems[0].id;
    act(() => {
      useCartStore.getState().updateItemQuantity(itemId, 0);
    });

    const { items, totalItems, totalPrice } = useCartStore.getState();
    expect(items.length).toBe(0);
    expect(totalItems).toBe(0);
    expect(totalPrice).toBe(0);
  });

  it('should remove item from cart', () => {
    let currentItems: CartItem[] = [];
    act(() => {
      useCartStore.getState().addItem(mockProduct1, 1);
      useCartStore.getState().addItem(mockProduct2, 2);
      currentItems = useCartStore.getState().items;
    });

    const itemIdToRemove = currentItems.find(item => item.productId === 'prod1')!.id;
    act(() => {
      useCartStore.getState().removeItem(itemIdToRemove);
    });

    const { items, totalItems, totalPrice } = useCartStore.getState();
    expect(items.length).toBe(1);
    expect(items[0].productId).toBe('prod2');
    expect(items[0].quantity).toBe(2);
    expect(totalItems).toBe(2);
    expect(totalPrice).toBe(50.00); // 2 * 25.00
  });

  it('should clear the entire cart', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct1, 1);
      useCartStore.getState().addItem(mockProduct2, 2);
    });

    act(() => {
      useCartStore.getState().clearCart();
    });

    const { items, totalItems, totalPrice } = useCartStore.getState();
    expect(items).toEqual([]);
    expect(totalItems).toBe(0);
    expect(totalPrice).toBe(0);
  });

  it('should correctly calculate totalItems and totalPrice when setCart is used', () => {
    const initialCartItems:any = [
      {
        id: 'citem1',
        productId: mockProduct1.id,
        product: { ...mockProduct1, price: 10.00 }, // Ensure price is number
        quantity: 2,
      },
      {
        id: 'citem2',
        productId: mockProduct2.id,
        product: { ...mockProduct2, price: 25.00 }, // Ensure price is number
        quantity: 3,
      },
    ];

    act(() => {
      useCartStore.getState().setCart(initialCartItems);
    });

    const { items, totalItems, totalPrice } = useCartStore.getState();
    expect(items).toEqual(initialCartItems);
    expect(totalItems).toBe(5); // 2 + 3
    expect(totalPrice).toBe(95.00); // (2 * 10) + (3 * 25) = 20 + 75 = 95
  });
});