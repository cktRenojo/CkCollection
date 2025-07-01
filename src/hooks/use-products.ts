
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
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

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
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
    // Optimistic UI update: add product with placeholder image first
    const finalProductData: Omit<Product, 'id'> = {
        name: productData.name,
        price: productData.price,
        description: productData.description,
        category: productData.category,
        subCategory: productData.subCategory,
        sizes: productData.sizes,
        quantity: productData.quantity,
        dataAiHint: productData.dataAiHint || 'fashion apparel',
        images: ['https://placehold.co/600x800.png'], // Use PNG to avoid SVG errors
        ...(productData.width && { width: productData.width }),
        ...(productData.length && { length: productData.length }),
        ...(productData.waistSize && { waistSize: productData.waistSize }),
    };

    const newDocRef = await addDoc(collection(db, 'products'), finalProductData);

    if (imageFile) {
      // Upload image to storage in the background
      const dataUri = await fileToDataUri(imageFile);
      const storageRef = ref(storage, `products/${newDocRef.id}/${imageFile.name}`);
      
      uploadString(storageRef, dataUri, 'data_url').then(async (snapshot) => {
        const downloadURL = await getDownloadURL(snapshot.ref);
        // Update document with the real image URL
        await updateDoc(newDocRef, { images: [downloadURL] });
      }).catch(error => {
        console.error("Image upload failed:", error);
        toast({
          title: 'Image Upload Failed',
          description: 'The product was added, but the image failed to upload.',
          variant: 'destructive',
        });
      });
    }
  };
  
  const updateProduct = async (productId: string, productData: Partial<Omit<Product, 'id' | 'images'>>, imageFile: File | null) => {
    const productRef = doc(db, 'products', productId);
    const dataToUpdate: Partial<Omit<Product, 'id'>> = { ...productData };
    
    // Optimistic update for product data
    await updateDoc(productRef, dataToUpdate);

    if (imageFile) {
      // Upload new image in the background
      const dataUri = await fileToDataUri(imageFile);
      const storageRef = ref(storage, `products/${productId}/${imageFile.name}`);

      uploadString(storageRef, dataUri, 'data_url').then(async (snapshot) => {
        const downloadURL = await getDownloadURL(snapshot.ref);
        // Update document with the new image URL
        await updateDoc(productRef, { images: [downloadURL] });
      }).catch(error => {
        console.error("Image update failed:", error);
        toast({
          title: 'Image Update Failed',
          description: 'Product details were updated, but the new image failed to upload.',
          variant: 'destructive',
        });
      });
    }
  };

  const removeProduct = async (productId: string) => {
    const productRef = doc(db, 'products', productId);
    try {
        // First, get the product to find the image path
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
            const product = productSnap.data() as Product;
            const imageUrl = product.images[0];
            
            // Check if it's a firebase storage URL before trying to delete
            if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
                try {
                  const imageRef = ref(storage, imageUrl);
                  await deleteObject(imageRef);
                } catch(storageError: any) {
                    // Log error but don't block deletion of firestore doc, as image might not exist
                    if (storageError.code !== 'storage/object-not-found') {
                      console.error("Failed to delete image from storage:", storageError);
                    }
                }
            }
        }

        // Then delete the document from Firestore
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
