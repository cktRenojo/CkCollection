'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import type { ChatMessage, Conversation } from '@/lib/types';
import { useAuth } from './use-auth';

// Hook to manage messages for a single conversation
export function useChat(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ChatMessage[];
        setMessages(newMessages);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching messages:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !user || !conversationId) return;

    // 1. Add message to subcollection
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    await addDoc(messagesRef, {
      text,
      senderId: user.uid,
      timestamp: serverTimestamp(),
      senderName: isAdmin ? 'Admin' : user.displayName,
    });

    // 2. Update conversation metadata
    const convoRef = doc(db, 'conversations', conversationId);
    const convoSnap = await getDoc(convoRef);

    const convoData = {
      lastMessage: {
        text,
        timestamp: serverTimestamp(),
        senderId: user.uid,
      },
      updatedAt: serverTimestamp(),
    };

    if (!convoSnap.exists()) {
      // If it's the first message from a user, create the conversation doc
      if (!isAdmin) {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
              await setDoc(convoRef, {
                  ...convoData,
                  userId: user.uid,
                  userName: user.displayName,
                  userEmail: user.email,
                  participants: [user.uid, 'admin_group'], // Using a placeholder for admin group
              }, { merge: true });
          }
      }
    } else {
      await setDoc(convoRef, convoData, { merge: true });
    }
  };

  return { messages, loading, sendMessage };
}

// Hook for admins to get all conversations
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const convosRef = collection(db, 'conversations');
    const q = query(convosRef, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const convosData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userName: data.userName,
            userEmail: data.userEmail,
            lastMessage: data.lastMessage,
          };
        }) as Conversation[];
        setConversations(convosData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching conversations:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { conversations, loading };
}
