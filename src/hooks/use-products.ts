
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
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

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


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

  const addProduct = async (productData: Omit<Product, 'id' | 'images'>, imageFile: File | null) => {
    let imageUrls = ['https://placehold.co/600x800'];
    if (imageFile) {
        try {
            const dataUri = await fileToDataUri(imageFile);
            imageUrls = [dataUri];
        } catch (error) {
            console.error("Failed to convert file to Data URI", error);
            toast({
                title: 'Image Processing Failed',
                description: 'Could not process the image. Using a placeholder.',
                variant: 'destructive',
            });
        }
    }

    // The user will experience a delay here as the data URI is generated and uploaded.
    await addDoc(collection(db, 'products'), {
      ...productData,
      images: imageUrls,
    });
  };
  
  const updateProduct = async (productId: string, productData: Partial<Omit<Product, 'id' | 'images'>>, imageFile: File | null) => {
    const productRef = doc(db, 'products', productId);
    const dataToUpdate: Partial<Omit<Product, 'id'>> = { ...productData };

    if (imageFile) {
        try {
            const dataUri = await fileToDataUri(imageFile);
            dataToUpdate.images = [dataUri];
        } catch (error) {
            console.error("Failed to convert file to Data URI", error);
            toast({
                title: 'Image Processing Failed',
                description: 'Could not process the new image. It has not been updated.',
                variant: 'destructive',
            });
        }
    }
    
    await updateDoc(productRef, dataToUpdate);
  };

  const removeProduct = async (productId: string) => {
    const productRef = doc(db, 'products', productId);
    try {
        await deleteDoc(productRef);
    } catch (error) {
        console.error("Failed to remove product:", error);
        toast({
            title: 'Error',
            description: 'Could not remove product. Please try again.',
            variant: 'destructive',
        });
        throw error;
    }
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
