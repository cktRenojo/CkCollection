export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type ProductCategory = 'Women' | 'Men' | 'New Arrivals' | 'Best Sellers';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  sizes: ProductSize[];
  category: ProductCategory;
  dataAiHint?: string;
};

export type CartItem = {
  product: Product;
  size: ProductSize;
  quantity: number;
};
