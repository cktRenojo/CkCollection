'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { CartItem, Product, ProductSize } from '@/lib/types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, size: ProductSize) => void;
  removeFromCart: (productId: string, size: ProductSize) => void;
  updateQuantity: (productId: string, size: ProductSize, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  useEffect(() => {
    // This check is to prevent "localStorage is not defined" error during server-side rendering
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = (product: Product, size: ProductSize) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.product.id === product.id && item.size === size
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { product, size, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string, size: ProductSize) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.product.id === productId && item.size === size)
      )
    );
  };

  const updateQuantity = (productId: string, size: ProductSize, quantity: number) => {
    setCartItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter(
          (item) => !(item.product.id === productId && item.size === size)
        );
      }
      return prevItems.map((item) =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity }
          : item
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const providerValue = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
  };

  return React.createElement(CartContext.Provider, { value: providerValue }, children);
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
