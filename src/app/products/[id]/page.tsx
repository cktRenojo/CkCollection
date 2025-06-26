import { products } from '@/lib/data';
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

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <Carousel className="w-full">
            <CarouselContent>
              {product.images.map((img, index) => (
                <CarouselItem key={index}>
                  <Card>
                    <CardContent className="p-0">
                      <div className="relative aspect-[3/4] w-full">
                        <Image
                          src={img}
                          alt={`${product.name} image ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                          data-ai-hint={product.dataAiHint}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-sm font-semibold text-primary">{product.category}</span>
          <h1 className="text-4xl lg:text-5xl font-bold font-headline mt-2">{product.name}</h1>
          <p className="text-2xl mt-4 font-medium">₱{product.price.toFixed(2)}</p>
          <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>
          <div className="mt-8">
            <AddToCartForm product={product} />
          </div>
        </div>
      </div>
      <div className="mt-16 lg:mt-24">
        <AiRecommendations product={product} />
      </div>
    </div>
  );
}
