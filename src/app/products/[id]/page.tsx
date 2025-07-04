
'use client';

import { useProducts } from '@/hooks/use-products';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { AddToCartForm } from './_components/add-to-cart-form';
import { AiRecommendations } from '@/components/ai-recommendations';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function ProductDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { products, loading } = useProducts();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            <div>
                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
            </div>
            <div className="flex flex-col justify-center py-4 space-y-6">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-8 w-1/3" />
                <Separator />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="pt-4">
                  <Skeleton className="h-12 w-40" />
                </div>
            </div>
        </div>
      </div>
    );
  }

  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
        <div>
          <Carousel className="w-full">
            <CarouselContent>
              {product.images.map((img, index) => (
                <CarouselItem key={index}>
                  <Card className="overflow-hidden rounded-xl shadow-lg">
                    <CardContent className="p-0">
                      <div className="relative aspect-[3/4] w-full">
                        <Image
                          src={img}
                          alt={`${product.name} image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          data-ai-hint={product.dataAiHint}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
        <div className="flex flex-col justify-center py-4">
          <div className="space-y-4">
            <span className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">{product.category} / {product.subCategory}</span>
            <h1 className="text-4xl lg:text-5xl font-bold font-headline">{product.name}</h1>
            <div className="flex items-center gap-4">
              <p className="text-3xl font-medium text-accent">₱{product.price.toFixed(2)}</p>
              {product.quantity > 0 ? (
                  <Badge>{product.quantity} in stock</Badge>
              ) : (
                  <Badge variant="destructive">Out of stock</Badge>
              )}
            </div>
             <Separator className="my-6" />
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            
            {(product.width || product.length || product.waistSize) && (
              <div className="pt-4">
                <h3 className="text-base font-semibold mb-2">Specifications</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  {product.width && <p>Width: {product.width} in.</p>}
                  {product.length && <p>Length: {product.length} in.</p>}
                  {product.waistSize && <p>Waist Size: {product.waistSize} in.</p>}
                </div>
              </div>
            )}

            <div className="pt-4">
              <AddToCartForm product={product} />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-24">
         <Separator />
      </div>
      <div className="mt-16 lg:mt-24">
        <AiRecommendations product={product} />
      </div>
    </div>
  );
}
