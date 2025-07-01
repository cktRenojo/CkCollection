
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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

  const uploadImage = async (productId: string, file: File): Promise<string> => {
    const imageRef = ref(storage, `products/${productId}/${file.name}`);
    await uploadBytes(imageRef, file);
    return getDownloadURL(imageRef);
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'images'>, imageFile: File | null) => {
    const newProductRef = doc(collection(db, 'products'));
    const productId = newProductRef.id;

    let imageUrl = 'https://placehold.co/600x800';
    if (imageFile) {
        try {
            imageUrl = await uploadImage(productId, imageFile);
        } catch (error) {
            console.error("Image upload failed:", error);
            toast({
                title: 'Image Upload Failed',
                description: 'Could not upload image. Please try again.',
                variant: 'destructive',
            });
            return;
        }
    }

    const newProductDocument = {
      id: productId,
      ...productData,
      images: [imageUrl],
    };

    await setDoc(newProductRef, newProductDocument);
  };
  
  const updateProduct = async (productId: string, productData: Partial<Omit<Product, 'id' | 'images'>>, imageFile: File | null) => {
    const productRef = doc(db, 'products', productId);
    const productUpdateData: { [key: string]: any } = { ...productData };

    if (imageFile) {
        try {
            const oldProductSnap = await getDoc(productRef);
            if (oldProductSnap.exists()) {
                const oldProduct = oldProductSnap.data() as Product;
                if (oldProduct.images && oldProduct.images[0] && oldProduct.images[0].includes('firebasestorage.googleapis.com')) {
                    const oldImageRef = ref(storage, oldProduct.images[0]);
                    await deleteObject(oldImageRef).catch(err => {
                        if (err.code !== 'storage/object-not-found') console.error("Could not delete old image", err);
                    });
                }
            }

            const newImageUrl = await uploadImage(productId, imageFile);
            productUpdateData.images = [newImageUrl];
        } catch (error) {
            console.error("Image upload failed:", error);
            toast({
                title: 'Image Upload Failed',
                description: 'Could not update image. Please try again.',
                variant: 'destructive',
            });
            return;
        }
    }

    await updateDoc(productRef, productUpdateData);
  };

  const removeProduct = async (productId: string) => {
    const productRef = doc(db, 'products', productId);
    try {
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
            const product = productSnap.data() as Product;
            if (product.images && product.images[0] && product.images[0].includes('firebasestorage.googleapis.com')) {
                try {
                    const imageRef = ref(storage, product.images[0]);
                    await deleteObject(imageRef);
                } catch (err: any) {
                    if (err.code !== 'storage/object-not-found') {
                        console.error("Failed to delete product image:", err);
                    }
                }
            }
        }
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
