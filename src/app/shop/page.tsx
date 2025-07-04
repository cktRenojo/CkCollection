
'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Product, ProductCategory } from '@/lib/types';
import ProductCard from '@/components/product-card';
import { ProductFilters } from '@/components/product-filters';
import { useProducts } from '@/hooks/use-products';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInDays } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const getEffectiveCategory = (product: Product): ProductCategory => {
    if (product.category === 'New Arrivals' && product.createdAt && product.genderCategory) {
        const createdAtDate = product.createdAt.toDate ? product.createdAt.toDate() : new Date(product.createdAt);
        if (differenceInDays(new Date(), createdAtDate) > 30) {
            return product.genderCategory;
        }
    }
    return product.category;
};

const getProductDisplayCategories = (product: Product): string[] => {
    const categories: Set<string> = new Set();
    const effectiveCategory = getEffectiveCategory(product);
    categories.add(effectiveCategory);

    if (effectiveCategory === 'Unisex') {
        categories.add('Men');
        categories.add('Women');
    }
    
    if (product.category === 'New Arrivals' && effectiveCategory === 'New Arrivals' && product.genderCategory) {
        categories.add(product.genderCategory);
        if (product.genderCategory === 'Unisex') {
            categories.add('Men');
            categories.add('Women');
        }
    }

    return Array.from(categories);
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="space-y-4">
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/4" />
            </div>
        </div>
      ))}
    </div>
  );
}

function ShopContent() {
  const { products: allProducts, loading } = useProducts();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  const [filters, setFilters] = useState({
    category: categoryFromUrl || 'All',
    subCategory: 'All',
  });

  useEffect(() => {
    setFilters(prevFilters => ({
      ...prevFilters,
      category: categoryFromUrl || 'All',
      subCategory: 'All', // Reset sub-category when main category changes via URL
    }));
  }, [categoryFromUrl]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      let categoryMatch = false;
      if (filters.category === 'All') {
        categoryMatch = true;
      } else {
        const displayCategories = getProductDisplayCategories(product);
        categoryMatch = displayCategories.includes(filters.category);
      }
      
      const subCategoryMatch = filters.subCategory === 'All' || product.subCategory === filters.subCategory;
      return categoryMatch && subCategoryMatch;
    });
  }, [allProducts, filters]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
       <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">Explore the Collection</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Timeless pieces, sustainably crafted. Discover your new favorite staples from our curated collection of modern apparel.
          </p>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
          <ProductFilters filters={filters} setFilters={setFilters} />
        </aside>
        <main className="lg:col-span-3">
          {loading ? (
             <ProductGridSkeleton />
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 flex flex-col items-center justify-center min-h-[40vh] bg-background-soft rounded-lg">
              <p className="text-2xl font-semibold">No products found</p>
              <p className="text-lg text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


function ShopPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="text-center mb-12">
                <Skeleton className="h-12 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                            <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                        </CardContent>
                    </Card>
                </aside>
                <main className="lg:col-span-3">
                    <ProductGridSkeleton />
                </main>
            </div>
        </div>
    )
}


export default function ShopPage() {
  return (
    <Suspense fallback={<ShopPageSkeleton />}>
      <ShopContent />
    </Suspense>
  );
}
