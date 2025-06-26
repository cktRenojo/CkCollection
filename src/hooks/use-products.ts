'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { db } from '@/lib/firebase';

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  loading: boolean;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This check ensures Firebase is initialized on the client.
    if (typeof window === 'undefined') return;

    const productsCollectionRef = collection(db, 'products');

    // --- Listen for real-time updates ---
    const unsubscribe = onSnapshot(productsCollectionRef, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching products from Firestore:", error);
        // In a real app, you'd want to handle this error more gracefully
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    // Firestore will auto-generate an ID
    await addDoc(collection(db, 'products'), productData);
  };

  const removeProduct = async (productId: string) => {
    await deleteDoc(doc(db, 'products', productId));
  };

  const value = {
    products,
    addProduct,
    removeProduct,
    loading,
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
