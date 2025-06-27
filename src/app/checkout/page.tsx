
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { Loader2, ShoppingCart, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      router.replace('/auth/login?redirect=/checkout');
    } else if (cartCount === 0) {
      // If user is logged in but cart is empty, redirect to home.
      router.replace('/');
    }
  }, [authLoading, user, router, cartCount]);

  const handlePlaceOrder = () => {
    // This is a demo. In a real app, you would process payment here.
    toast({
        title: 'Order Placed!',
        description: 'Thank you for your purchase. (This is a demo)',
    });
    clearCart();
    router.push('/');
  };

  if (authLoading || !user || cartCount === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-14rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold mb-2">Checkout</h1>
            <p className="text-lg text-muted-foreground">You're just a few steps away from your new favorite items.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  Order Summary
                </CardTitle>
                <CardDescription>
                  Review the items in your cart before proceeding.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={`${item.product.id}-${item.size}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                          <Image 
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            data-ai-hint={item.product.dataAiHint}
                           />
                        </div>
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Size: {item.size} - Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">₱{(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <Separator />
                   <div className="flex justify-between font-semibold text-lg">
                    <p>Total</p>
                    <p>₱{cartTotal.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Shipping & Payment</CardTitle>
                    <CardDescription>
                    This is a demo. No payment will be processed.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div>
                        <h3 className="font-medium mb-2">Shipping to:</h3>
                        <p className="text-muted-foreground">{user.displayName}</p>
                        <p className="text-muted-foreground">{user.email}</p>
                   </div>
                   <Button size="lg" className="w-full" onClick={handlePlaceOrder}>
                       <Lock className="mr-2 h-5 w-5" />
                       Place Order (Demo)
                   </Button>
                </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
