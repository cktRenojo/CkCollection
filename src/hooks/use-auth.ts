
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password:string) => Promise<{ user: User, isAdmin: boolean }>;
  signupUser: (fullName: string, email: string, password: string) => Promise<User>;
  signupAdmin: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const adminRef = doc(db, 'admins', user.uid);
        const adminSnap = await getDoc(adminRef);
        setIsAdmin(adminSnap.exists());
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const adminRef = doc(db, 'admins', user.uid);
    const adminSnap = await getDoc(adminRef);
    const isAdmin = adminSnap.exists();
    
    return { user, isAdmin };
  };
  
  const signupUser = async (fullName: string, email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName: fullName });
    
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName: fullName,
      email: user.email,
      role: 'user',
      createdAt: new Date(),
    });

    return user;
  };

  const signupAdmin = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, 'admins', user.uid), { role: 'admin', createdAt: new Date() });
    await signOut(auth);
    return userCredential;
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      // Step 1: Authentication
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Step 2: Firestore operation
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            role: 'user',
            createdAt: new Date(),
          });
          toast({
            title: 'Account Created',
            description: 'Welcome to C&K Collections!',
          });
        } else {
           toast({
            title: 'Login Successful',
            description: "Welcome back!",
          });
        }
      } catch (firestoreError: any) {
        // This will catch errors from getDoc or setDoc
        console.error("Firestore operation failed after Google sign-in:", firestoreError);
        toast({
          title: 'Login Succeeded, But Profile Sync Failed',
          description: `Your user profile could not be saved to the database. Error: ${firestoreError.message}`,
          variant: 'destructive',
        });
      }

    } catch (authError: any) {
      // This will catch errors from signInWithPopup, like the user closing the window
      if (authError.code !== 'auth/popup-closed-by-user') {
        console.error("Google sign-in failed:", authError);
        toast({
          title: 'Sign-in Failed',
          description: authError.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
  };

  const value = {
    user,
    isAdmin,
    loading,
    login,
    signupUser,
    signupAdmin,
    logout,
    signInWithGoogle,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
