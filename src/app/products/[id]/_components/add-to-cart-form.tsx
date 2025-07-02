
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/hooks/use-cart';
import type { Product, ProductSize } from '@/lib/types';
import { ShoppingBag, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export function AddToCartForm({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const handleAddToCart = () => {
    if (!selectedSize) {
      setError('Please select a size.');
      return;
    }
    setError(null);
    addToCart(product, selectedSize);
  };

  const handleLoginRedirect = () => {
    router.push(`/auth/login?redirect=/products/${product.id}`);
  };

  const isOutOfStock = !product.quantity || product.quantity <= 0;

  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-12 w-full md:w-40" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6 pt-4">
        <p className="font-medium text-muted-foreground">Please log in to add items to your cart.</p>
        <Button size="lg" className="w-full md:w-auto" onClick={handleLoginRedirect}>
          <LogIn className="mr-2 h-5 w-5" />
          Login to Purchase
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Select Size:</Label>
        <RadioGroup
          value={selectedSize ?? ''}
          onValueChange={(value) => {
            setSelectedSize(value as ProductSize);
            if (error) setError(null);
          }}
          className="mt-4 flex items-center gap-3"
        >
          {product.sizes.map((size) => (
            <div key={size}>
              <RadioGroupItem value={size} id={`size-${size}`} className="peer sr-only" disabled={isOutOfStock} />
              <Label
                htmlFor={`size-${size}`}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium uppercase transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
                  "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground",
                  "peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-disabled:hover:bg-muted"
                )}
              >
                {size}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {error && <p className="mt-2 text-sm font-medium text-destructive">{error}</p>}
      </div>

      <Button size="lg" className="w-full md:w-auto" onClick={handleAddToCart} disabled={isOutOfStock}>
        <ShoppingBag className="mr-2 h-5 w-5" />
        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
      </Button>
    </div>
  );
}
