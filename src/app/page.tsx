
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ShoppingBag, Sparkles, Truck, MessageSquare, ShieldCheck } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';

const carouselImages = [
  { src: 'https://placehold.co/1200x600.png', alt: 'Fashion model wearing modern apparel', hint: 'fashion model' },
  { src: 'https://placehold.co/1200x600.png', alt: 'Collection of stylish clothes on display', hint: 'clothing collection' },
  { src: 'https://placehold.co/1200x600.png', alt: 'Man and woman posing in trendy outfits', hint: 'couple fashion' },
];

const features = [
  {
    icon: ShoppingBag,
    title: 'Affordable Fashion',
    description: 'Trendy and high-quality apparel for every lifestyle without breaking the bank.',
  },
  {
    icon: Sparkles,
    title: 'Curated Styles',
    description: 'Carefully selected pieces for men and women, from casual essentials to statement items.',
  },
  {
    icon: Truck,
    title: 'Fast Shipping',
    description: 'Reliable and prompt delivery to get your new favorite clothes to you quickly.',
  },
  {
    icon: MessageSquare,
    title: 'Customer Service',
    description: 'Our responsive support team is always here to help you with any questions.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Guaranteed',
    description: 'We stand by our products. If you\'re not satisfied, we offer a money-back guarantee.',
  },
];

export default function LandingPage() {
    const autoplayPlugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: false })
    );

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center text-white overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://placehold.co/1600x900.png"
                    alt="Stylish background image"
                    fill
                    className="object-cover"
                    priority
                    data-ai-hint="fashion background"
                />
                <div className="absolute inset-0 bg-black/50" />
            </div>
          <div className="relative z-10 p-4">
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4">Welcome to C&K Collections</h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/90">
                A curated online clothing store offering a wide variety of affordable, trendy, and high-quality apparel for both men and women. From casual essentials to statement pieces, we aim to bring style and comfort to every wardrobe.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </div>
        </section>

        {/* Carousel Section */}
        <section className="py-12 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-10">Featured Styles</h2>
            <Carousel
              plugins={[autoplayPlugin.current]}
              onMouseEnter={() => autoplayPlugin.current.stop()}
              onMouseLeave={() => autoplayPlugin.current.play()}
              className="w-full max-w-4xl mx-auto"
              opts={{
                loop: true,
              }}
            >
              <CarouselContent>
                {carouselImages.map((image, index) => (
                  <CarouselItem key={index}>
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="aspect-video relative">
                             <Image src={image.src} alt={image.alt} fill className="object-cover" data-ai-hint={image.hint}/>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </div>
        </section>
        
        {/* "Why Shop With Us" Section */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-10">Why Shop With Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {features.slice(0, 3).map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-2">
                        <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-8">
               {features.slice(3).map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-2">
                        <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
