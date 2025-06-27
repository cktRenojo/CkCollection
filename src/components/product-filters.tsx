
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/use-products';

interface ProductFiltersProps {
  filters: {
    category: string;
    subCategory: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

export function ProductFilters({ filters, setFilters }: ProductFiltersProps) {
  const { products } = useProducts();

  const categories = useMemo(() => {
    if (!products.length) return ['All'];
    const productCategories = new Set(products.map((p) => p.category).filter(Boolean) as string[]);
    productCategories.add('All');
    return [...productCategories].sort((a, b) => {
      if (a === 'All') return -1;
      if (b === 'All') return 1;
      return a.localeCompare(b);
    });
  }, [products]);

  const subCategories = useMemo(() => {
    if (!products.length) return ['All'];
    const filteredProducts =
      filters.category === 'All'
        ? products
        : products.filter((p) => p.category === filters.category);
    
    const productSubCategories = new Set(filteredProducts.map((p) => p.subCategory).filter(Boolean) as string[]);
    productSubCategories.add('All');

    return [...productSubCategories].sort((a, b) => {
      if (a === 'All') return -1;
      if (b === 'All') return 1;
      return a.localeCompare(b);
    });
  }, [products, filters.category]);


  const handleCategoryChange = (value: string) => {
    setFilters((prev: any) => ({ ...prev, category: value, subCategory: 'All' }));
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
      </CardContent>
    </Card>
  );
}
