'use client';

import { useState, useMemo } from 'react';
import { products as allProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/product-card';
import { ProductFilters } from '@/components/product-filters';

export default function Home() {
  const [filters, setFilters] = useState({
    category: 'All',
    price: [0, 500],
    size: 'All',
  });

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const categoryMatch = filters.category === 'All' || product.category === filters.category;
      const priceMatch = product.price >= filters.price[0] && product.price <= filters.price[1];
      const sizeMatch = filters.size === 'All' || product.sizes.includes(filters.size as any);
      return categoryMatch && priceMatch && sizeMatch;
    });
  }, [filters]);

  return (
    <div className="container mx-auto px-4 py-12">
       <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">Explore the Collection</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Timeless pieces, sustainably crafted. Discover your new favorite staples from our curated collection of modern apparel.
          </p>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <ProductFilters filters={filters} setFilters={setFilters} />
        </aside>
        <main className="lg:col-span-3">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 flex flex-col items-center justify-center min-h-[40vh]">
              <p className="text-2xl font-semibold">No products found</p>
              <p className="text-lg text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
