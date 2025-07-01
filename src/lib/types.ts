export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type ProductCategory = 'Women' | 'Men' | 'New Arrivals' | 'Unisex';
export type ProductSubCategory = 'Shirt' | 'Blouse' | 'Jacket' | 'Trousers' | 'Dress' | 'T-Shirt' | 'Sweater' | 'Jeans' | 'Coat' | 'Polo Shirt' | 'Scarf' | 'Skirt' | 'Shorts' | 'Shoes';

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
  quantity: number;
  width?: number;
  length?: number;
  waistSize?: number;
};

export type CartItem = {
  product: Product;
  size: ProductSize;
  quantity: number;
};

export type ChatMessage = {
  id: string;
  text: string;
  senderId: string;
  timestamp: any; // Firestore Timestamp
  senderName?: string;
};

export type Conversation = {
  id: string; // This will be the userId
  userName: string;
  userEmail: string;
  lastMessage: ChatMessage | null;
};
