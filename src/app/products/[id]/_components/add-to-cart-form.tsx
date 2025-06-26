'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/hooks/use-cart';
import type { Product, ProductSize } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AddToCartForm({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!selectedSize) {
      setError('Please select a size.');
      return;
    }
    setError(null);
    addToCart(product, selectedSize);
    toast({
      title: 'Added to cart',
      description: `${product.name} (${selectedSize}) has been added to your cart.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Select Size:</Label>
        <RadioGroup
          value={selectedSize ?? ''}
          onValueChange={(value) => setSelectedSize(value as ProductSize)}
          className="mt-4 flex items-center gap-3"
        >
          {product.sizes.map((size) => (
            <div key={size}>
              <RadioGroupItem value={size} id={`size-${size}`} className="peer sr-only" />
              <Label
                htmlFor={`size-${size}`}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium uppercase transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
                  "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                )}
              >
                {size}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {error && <p className="mt-2 text-sm font-medium text-destructive">{error}</p>}
      </div>

      <Button size="lg" className="w-full md:w-auto" onClick={handleAddToCart}>
        <ShoppingBag className="mr-2 h-5 w-5" />
        Add to Cart
      </Button>
    </div>
  );
}
