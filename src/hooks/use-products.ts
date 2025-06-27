
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { db } from '@/lib/firebase';
import { useToast } from './use-toast';

interface ProductsContextType {
  products: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'images'>, imageFile: File | null) => Promise<void>;
  updateProduct: (productId: string, productData: Partial<Omit<Product, 'id' | 'images'>>, imageFile: File | null) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  loading: boolean;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const productsCollectionRef = collection(db, 'products');

    const unsubscribe = onSnapshot(productsCollectionRef, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching products from Firestore:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('FileReader did not return a string.'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'images'>, imageFile: File | null) => {
    let imageUrl = 'https://placehold.co/600x800';
    if (imageFile) {
        try {
            imageUrl = await fileToDataUri(imageFile);
        } catch (error) {
            console.error("Could not convert file to data URI", error);
            toast({
                title: 'Image Processing Failed',
                description: 'The selected image could not be processed. Please try another image.',
                variant: 'destructive',
            });
            return; // Stop if image fails
        }
    }

    const newProductDocument = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      subCategory: productData.subCategory,
      sizes: productData.sizes,
      quantity: productData.quantity,
      dataAiHint: productData.dataAiHint || 'fashion apparel',
      images: [imageUrl],
    };

    await addDoc(collection(db, 'products'), newProductDocument);
  };
  
  const updateProduct = async (productId: string, productData: Partial<Omit<Product, 'id' | 'images'>>, imageFile: File | null) => {
    const productRef = doc(db, 'products', productId);
    const productUpdateData: { [key: string]: any } = {};

    Object.keys(productData).forEach(key => {
        const typedKey = key as keyof typeof productData;
        if (productData[typedKey] !== undefined) {
            productUpdateData[key] = productData[typedKey];
        }
    });

    if (imageFile) {
        try {
            productUpdateData.images = [await fileToDataUri(imageFile)];
        } catch (error) {
            console.error("Could not convert file to data URI", error);
            toast({
                title: 'Image Processing Failed',
                description: 'The new image could not be processed. Please try another image.',
                variant: 'destructive',
            });
            return;
        }
    }

    await updateDoc(productRef, productUpdateData);
  };

  const removeProduct = async (productId: string) => {
    await deleteDoc(doc(db, 'products', productId));
  };


  const value = {
    products,
    addProduct,
    updateProduct,
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
