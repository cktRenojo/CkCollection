'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/use-products';
import type { ProductSize } from '@/lib/types';

interface ProductFiltersProps {
  filters: {
    category: string;
    subCategory: string;
    size: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

export function ProductFilters({ filters, setFilters }: ProductFiltersProps) {
  const { products } = useProducts();

  const categories = useMemo(() => {
    if (!products.length) return ['All'];
    const uniqueCategories = [...new Set(products.map((p) => p.category))];
    return ['All', ...uniqueCategories.sort()];
  }, [products]);

  const subCategories = useMemo(() => {
    if (!products.length) return ['All'];
    const filteredProducts =
      filters.category === 'All'
        ? products
        : products.filter((p) => p.category === filters.category);
    const uniqueSubCategories = [...new Set(filteredProducts.map((p) => p.subCategory))];
    return ['All', ...uniqueSubCategories.sort()];
  }, [products, filters.category]);

  const sizes = useMemo(() => {
    if (!products.length) return ['All'];
    const allSizes = products.flatMap((p) => p.sizes);
    const uniqueSizes = [...new Set(allSizes)];
    const sortOrder: ProductSize[] = ['XS', 'S', 'M', 'L', 'XL'];
    uniqueSizes.sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b));
    return ['All', ...uniqueSizes];
  }, [products]);


  const handleCategoryChange = (value: string) => {
    setFilters((prev: any) => ({ ...prev, category: value, subCategory: 'All' }));
  };

  const handleSubCategoryChange = (value: string) => {
    setFilters((prev: any) => ({ ...prev, subCategory: value }));
  };

  const handleSizeChange = (value: string) => {
    setFilters((prev: any) => ({ ...prev, size: value }));
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
              {categories.map((category) => (
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
        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Select value={filters.size} onValueChange={handleSizeChange}>
            <SelectTrigger id="size">
              <SelectValue placeholder="Select a size" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((size) => (
                <SelectItem key={size} value={size}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
