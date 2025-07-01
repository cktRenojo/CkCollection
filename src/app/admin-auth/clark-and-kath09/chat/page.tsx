'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useConversations, useChat } from '@/hooks/use-chat';
import { useRouter } from 'next/navigation';
import { Loader2, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminChatPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { conversations, loading: convosLoading } = useConversations();
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) {
      router.replace('/admin-auth/clark-and-kath09/login');
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (!selectedConvo && conversations.length > 0) {
      setSelectedConvo(conversations[0]);
    } else if (selectedConvo) {
      // Refresh selectedConvo with the latest data from conversations list
      const updatedSelectedConvo = conversations.find(c => c.id === selectedConvo.id);
      if (updatedSelectedConvo) {
        setSelectedConvo(updatedSelectedConvo);
      }
    }
  }, [conversations, selectedConvo]);

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4.1rem)] flex border-t bg-background">
      <aside className="w-full md:w-1/3 xl:w-1/4 border-r h-full flex flex-col">
        <div className="p-4 border-b">
            <h2 className="text-2xl font-bold font-headline">Messages</h2>
        </div>
        <ScrollArea className="flex-1">
          {convosLoading ? (
            <div className="p-2 space-y-2">
              {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground mt-10">
                No conversations yet.
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {conversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => setSelectedConvo(convo)}
                  className={cn(
                    "w-full text-left p-3 rounded-md flex items-start gap-3 transition-colors",
                    selectedConvo?.id === convo.id ? "bg-muted" : "hover:bg-muted/50"
                  )}
                >
                  <Avatar>
                    <AvatarFallback>{convo.userName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 truncate">
                    <p className="font-semibold truncate">{convo.userName}</p>
                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessage?.text}</p>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {convo.lastMessage?.timestamp ? formatDistanceToNow(convo.lastMessage.timestamp.toDate()) : ''}
                  </p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </aside>

      <main className="hidden md:flex w-2/3 xl:w-3/4 h-full flex-col">
        {selectedConvo ? (
          <ChatWindow conversation={selectedConvo} key={selectedConvo.id} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Select a conversation to start chatting.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function ChatWindow({ conversation }: { conversation: Conversation }) {
  const { messages, loading: messagesLoading, sendMessage } = useChat(conversation.id);
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
             setTimeout(() => viewport.scrollTop = viewport.scrollHeight, 100);
        }
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
    setNewMessage('');
  };

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };


  return (
    <>
      <div className="p-4 border-b flex items-center gap-3 bg-background z-10 shadow-sm">
        <Avatar>
          <AvatarFallback>{getInitials(conversation.userName)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{conversation.userName}</p>
          <p className="text-sm text-muted-foreground">{conversation.userEmail}</p>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
            {messagesLoading ? (
                <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                messages.map((msg) => (
                <div
                    key={msg.id}
                    className={cn(
                    'flex items-end gap-2',
                    msg.senderId === user?.uid ? 'justify-end' : 'justify-start'
                    )}
                >
                    {msg.senderId !== user?.uid && (
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(msg.senderName)}</AvatarFallback>
                    </Avatar>
                    )}
                    <div
                    className={cn(
                        'max-w-[70%] rounded-lg px-3 py-2',
                        msg.senderId === user?.uid
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                    >
                    <p className="text-sm">{msg.text}</p>
                    <p className={cn(
                            "text-xs mt-1 text-right",
                            msg.senderId === user?.uid
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        )}>
                            {msg.timestamp ? formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true }) : 'sending...'}
                        </p>
                    </div>
                    {msg.senderId === user?.uid && (
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    )}
                </div>
                ))
            )}
            </div>
        </ScrollArea>
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-background z-10">
        <div className="relative">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${conversation.userName}...`}
            className="pr-12"
          />
          <Button
            type="submit"
            size="icon"
            className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8"
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </>
  );
}
