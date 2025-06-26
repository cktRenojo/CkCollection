'use client';

import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Trash2 } from 'lucide-react';

export function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  return (
    <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
      <SheetHeader className="px-6">
        <SheetTitle>Shopping Cart ({cartCount})</SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full">
          <div className="px-6">
            {cartItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center space-y-1">
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm text-muted-foreground">Add items to see them here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6 py-4">
                {cartItems.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="flex items-start space-x-4">
                    <div className="relative h-24 w-24 overflow-hidden rounded-md">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        data-ai-hint={item.product.dataAiHint}
                      />
                    </div>
                    <div className="flex flex-1 flex-col text-sm">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-muted-foreground">Size: {item.size}</p>
                      <p className="text-muted-foreground">
                        Price: ${item.product.price.toFixed(2)}
                      </p>
                      <div className="mt-2 flex items-center">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product.id, item.size, parseInt(e.target.value, 10))}
                          className="w-16 h-8 mr-4"
                          aria-label={`Quantity for ${item.product.name}`}
                        />
                         <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.product.id, item.size)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            aria-label={`Remove ${item.product.name} from cart`}
                         >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      {cartItems.length > 0 && (
        <SheetFooter className="px-6 py-4 border-t bg-background">
          <div className="w-full space-y-4">
            <div className="flex justify-between text-base font-medium">
              <p>Subtotal</p>
              <p>${cartTotal.toFixed(2)}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Shipping and taxes calculated at checkout.
            </p>
            <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              Proceed to Checkout (Mock)
            </Button>
          </div>
        </SheetFooter>
      )}
    </SheetContent>
  );
}
