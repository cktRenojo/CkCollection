
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/use-products';
import { differenceInDays } from 'date-fns';
import type { Product, ProductCategory } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface ProductFiltersProps {
  filters: {
    category: string;
    subCategory: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

// Helper functions duplicated from page.tsx to ensure consistent filtering logic.
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

const mainFilterCategories = ['All', 'Women', 'Men', 'New Arrivals', 'Unisex'];


export function ProductFilters({ filters, setFilters }: ProductFiltersProps) {
  const { products } = useProducts();
  const router = useRouter();
  
  const subCategories = useMemo(() => {
    if (!products.length) return ['All'];

    const relevantProducts =
      filters.category === 'All'
        ? products
        : products.filter((p) => getProductDisplayCategories(p).includes(filters.category));
    
    const productSubCategories = new Set(relevantProducts.map((p) => p.subCategory).filter(Boolean) as string[]);
    productSubCategories.add('All');

    return [...productSubCategories].sort((a, b) => {
      if (a === 'All') return -1;
      if (b === 'All') return 1;
      return a.localeCompare(b);
    });
  }, [products, filters.category]);


  const handleCategoryChange = (value: string) => {
    // Also update the URL to keep things consistent
    if (value === 'All') {
        router.push('/shop');
    } else {
        router.push(`/shop?category=${encodeURIComponent(value)}`);
    }
  };

  const handleSubCategoryChange = (value: string) => {
    setFilters((prev: any) => ({ ...prev, subCategory: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={filters.category} onValueChange={handleCategoryChange}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {mainFilterCategories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sub-category">Sub-Category</Label>
          <Select value={filters.subCategory} onValueChange={handleSubCategoryChange} disabled={subCategories.length <= 1}>
            <SelectTrigger id="sub-category">
              <SelectValue placeholder="Select a sub-category" />
            </SelectTrigger>
            <SelectContent>
              {subCategories.map((subCategory) => (
                <SelectItem key={subCategory} value={subCategory}>{subCategory}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
