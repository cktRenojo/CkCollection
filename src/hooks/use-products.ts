'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Product } from '@/lib/types';
import { db, storage } from '@/lib/firebase';
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
    const newDocRef = doc(collection(db, 'products'));
    const productId = newDocRef.id;

    const newProductWithPlaceholder = {
      ...productData,
      images: ['https://placehold.co/600x800'],
    };

    await setDoc(newDocRef, newProductWithPlaceholder);

    if (imageFile) {
      uploadImage(imageFile, productId)
        .then(async (imageUrl) => {
          await updateDoc(newDocRef, { images: [imageUrl] });
        })
        .catch((error) => {
          console.error("Background image upload failed:", error);
          toast({
            title: 'Image Upload Failed',
            description: `The image for ${productData.name} could not be uploaded. You can try updating it again from the edit menu.`,
            variant: 'destructive',
          });
        });
    }
  };
  
  const updateProduct = async (productId: string, productData: Partial<Omit<Product, 'id' | 'images'>>, imageFile: File | null) => {
    const productRef = doc(db, 'products', productId);
    const productUpdateData: Partial<Product> = { ...productData };

    await updateDoc(productRef, productUpdateData);

    if (imageFile) {
      const currentProduct = products.find(p => p.id === productId);
      
      uploadImage(imageFile, productId)
        .then(async (newImageUrl) => {
          await updateDoc(productRef, { images: [newImageUrl] });
          if (currentProduct?.images[0]) {
             await deleteImage(currentProduct.images[0]);
          }
        })
        .catch((error) => {
           console.error("Background image update failed:", error);
           toast({
            title: 'Image Update Failed',
            description: `The new image for ${productData.name} could not be uploaded. Please try again.`,
            variant: 'destructive',
          });
        });
    }
  };

  const removeProduct = async (productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
    
    await deleteDoc(doc(db, 'products', productId));

    if (productToDelete && productToDelete.images.length > 0 && productToDelete.images[0]) {
      deleteImage(productToDelete.images[0]).catch(error => {
        console.error("Background image deletion failed:", error);
      });
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
