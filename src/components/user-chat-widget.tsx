'use client';

import { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useChat } from '@/hooks/use-chat';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function UserChatWidget() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const conversationId = user ? user.uid : null;
  const { messages, loading: chatLoading, sendMessage } = useChat(conversationId);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            setTimeout(() => {
              viewport.scrollTop = viewport.scrollHeight;
            }, 100);
        }
    }
  }, [messages, isOpen]);

  if (authLoading || !user || isAdmin) {
    return null;
  }
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
    setNewMessage('');
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
            <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
            <MessageCircle className="h-7 w-7" />
            </Button>
        </SheetTrigger>
        <SheetContent className="w-full max-w-[400px] flex flex-col p-0">
            <SheetHeader className="p-4 border-b">
            <SheetTitle>Chat with Support</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                    {chatLoading ? (
                        <div className="flex justify-center items-center h-full pt-10">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-10">
                        <p>No messages yet.</p>
                        <p>Ask us anything!</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                            'flex items-end gap-2',
                            msg.senderId === user.uid ? 'justify-end' : 'justify-start'
                            )}
                        >
                            {msg.senderId !== user.uid && (
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>A</AvatarFallback>
                            </Avatar>
                            )}
                            <div
                            className={cn(
                                'max-w-[75%] rounded-lg px-3 py-2',
                                msg.senderId === user.uid
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                            >
                            <p className="text-sm">{msg.text}</p>
                            <p className={cn(
                                "text-xs mt-1 text-right",
                                msg.senderId === user.uid
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            )}>
                                {msg.timestamp ? formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true }) : 'sending...'}
                            </p>
                            </div>
                            {msg.senderId === user.uid && (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoURL ?? ''} />
                                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                            </Avatar>
                            )}
                        </div>
                        ))
                    )}
                    </div>
                </ScrollArea>
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-background">
                <div className="relative">
                    <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
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
        </SheetContent>
        </Sheet>
    </div>
  );
}
