'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { products as initialProducts } from '@/lib/data';

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on initial client-side render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        try {
          const parsedProducts = JSON.parse(storedProducts);
          if (Array.isArray(parsedProducts)) {
            setProducts(parsedProducts);
          }
        } catch (error) {
          console.error("Failed to parse products from localStorage", error);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Persist to localStorage whenever products change, but only after initial load
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('products', JSON.stringify(products));
    }
  }, [products, isLoaded]);


  const addProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
  };

  const removeProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const value = {
    products,
    addProduct,
    removeProduct,
  };

  return React.createElement(ProductsContext.Provider, { value }, children);
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
