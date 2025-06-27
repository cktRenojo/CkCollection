'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Product } from '@/lib/types';
import { db, storage } from '@/lib/firebase';

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
  
  const uploadImage = async (imageFile: File, productId: string): Promise<string> => {
    const storageRef = ref(storage, `products/${productId}/${imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    return getDownloadURL(snapshot.ref);
  };

  const deleteImage = async (imageUrl: string) => {
    if (!imageUrl || imageUrl.includes('placehold.co')) return;
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        console.warn("Image not found in storage, skipping deletion:", imageUrl);
      } else {
        console.error("Error deleting image from storage:", error);
        throw error;
      }
    }
  };


  const addProduct = async (productData: Omit<Product, 'id' | 'images'>, imageFile: File | null) => {
    const tempProductRef = doc(collection(db, 'products'));
    const productId = tempProductRef.id;

    let imageUrl = 'https://placehold.co/600x800';
    if (imageFile) {
      imageUrl = await uploadImage(imageFile, productId);
    }
    
    const newProductWithImage = {
        ...productData,
        images: [imageUrl],
    };

    await setDoc(tempProductRef, newProductWithImage);
  };
  
  const updateProduct = async (productId: string, productData: Partial<Omit<Product, 'id' | 'images'>>, imageFile: File | null) => {
    const productRef = doc(db, 'products', productId);
    const productUpdateData: Partial<Product> = { ...productData };

    if (imageFile) {
      const currentProduct = products.find(p => p.id === productId);
      if (currentProduct && currentProduct.images[0]) {
        await deleteImage(currentProduct.images[0]);
      }
      
      const newImageUrl = await uploadImage(imageFile, productId);
      productUpdateData.images = [newImageUrl];
    }

    await updateDoc(productRef, productUpdateData);
  };

  const removeProduct = async (productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
    if (productToDelete && productToDelete.images.length > 0 && productToDelete.images[0]) {
      await deleteImage(productToDelete.images[0]);
    }
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
