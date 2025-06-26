'use client';

import { useEffect, useState } from 'react';
import { getProductRecommendations, type ProductRecommendationsInput, type ProductRecommendationsOutput } from '@/ai/flows/product-recommendations';
import type { Product } from '@/lib/types';
import ProductCard from './product-card';
import { Skeleton } from './ui/skeleton';

interface AiRecommendationsProps {
  product: Product;
}

// Create a mock product from AI recommendation to fit ProductCard props
const createMockProduct = (rec: ProductRecommendationsOutput['recommendedProducts'][0]): Product => ({
    id: rec.name.toLowerCase().replace(/\s/g, '-'), // Generate a slug-like ID
    name: rec.name,
    description: rec.description,
    price: rec.price,
    category: rec.category as Product['category'],
    images: ['https://placehold.co/600x800'],
    sizes: ['S', 'M', 'L'], // Default sizes
    dataAiHint: 'fashion model',
});


export function AiRecommendations({ product }: AiRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const input: ProductRecommendationsInput = {
          productName: product.name,
          productDescription: product.description,
          productCategory: product.category,
          productPrice: product.price,
        };
        const result = await getProductRecommendations(input);
        const mockProducts = result.recommendedProducts.map(createMockProduct);
        setRecommendations(mockProducts);
      } catch (error) {
        console.error("Failed to fetch AI recommendations:", error);
        setRecommendations([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [product]);

  return (
    <div>
      <h2 className="text-3xl font-bold font-headline mb-6">You Might Also Like</h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                    <Skeleton className="aspect-[3/4] w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-1/4" />
                </div>
            ))}
        </div>
      ) : recommendations && recommendations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {recommendations.slice(0, 4).map((recProduct) => (
            <ProductCard key={recProduct.id} product={recProduct} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No recommendations available at the moment.</p>
      )}
    </div>
  );
}
