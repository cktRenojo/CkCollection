export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type ProductCategory = 'Women' | 'Men' | 'New Arrivals' | 'Unisex';
export type ProductSubCategory = 'Shirt' | 'Blouse' | 'Jacket' | 'Trousers' | 'Dress' | 'T-Shirt' | 'Sweater' | 'Jeans' | 'Coat' | 'Polo Shirt' | 'Scarf' | 'Skirt';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  sizes: ProductSize[];
  category: ProductCategory;
  subCategory: ProductSubCategory;
  dataAiHint?: string;
};

export type CartItem = {
  product: Product;
  size: ProductSize;
  quantity: number;
};
