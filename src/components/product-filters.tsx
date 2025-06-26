'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const categories = ['All', 'Women', 'Men', 'New Arrivals', 'Best Sellers'];
const subCategories = ['All', 'Shirt', 'Blouse', 'Jacket', 'Trousers', 'Dress', 'T-Shirt', 'Sweater', 'Jeans', 'Coat', 'Polo Shirt', 'Scarf', 'Skirt'];
const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL'];

interface ProductFiltersProps {
  filters: {
    category: string;
    subCategory: string;
    price: number[];
    size: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

export function ProductFilters({ filters, setFilters }: ProductFiltersProps) {
  const handleCategoryChange = (value: string) => {
    setFilters((prev: any) => ({ ...prev, category: value }));
  };

  const handleSubCategoryChange = (value: string) => {
    setFilters((prev: any) => ({ ...prev, subCategory: value }));
  };

  const handlePriceChange = (value: number[]) => {
    setFilters((prev: any) => ({ ...prev, price: value }));
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
          <Select value={filters.subCategory} onValueChange={handleSubCategoryChange}>
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
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Price Range</Label>
            <span className="text-sm font-medium">
              ₱{filters.price[0]} - ₱{filters.price[1]}
            </span>
          </div>
          <Slider
            defaultValue={[0, 500]}
            min={0}
            max={500}
            step={10}
            value={filters.price}
            onValueChange={handlePriceChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
