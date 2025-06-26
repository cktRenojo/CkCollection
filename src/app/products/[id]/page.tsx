'use client';

import { useProducts } from '@/hooks/use-products';
import { notFound } from 'next/navigation';
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

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { products } = useProducts();
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div>
          <Carousel className="w-full">
            <CarouselContent>
              {product.images.map((img, index) => (
                <CarouselItem key={index}>
                  <Card className="overflow-hidden rounded-xl">
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
            <span className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">{product.category}</span>
            <h1 className="text-4xl lg:text-5xl font-bold font-headline">{product.name}</h1>
            <p className="text-3xl font-medium text-primary">₱{product.price.toFixed(2)}</p>
             <Separator className="my-6" />
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
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
