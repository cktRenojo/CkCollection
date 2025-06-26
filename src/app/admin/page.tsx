
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Product, ProductCategory, ProductSubCategory, ProductSize } from '@/lib/types';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, UploadCloud, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/use-products';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const allCategories: ProductCategory[] = ['Women', 'Men', 'New Arrivals', 'Best Sellers'];
const allSubCategories: ProductSubCategory[] = ['Shirt', 'Blouse', 'Jacket', 'Trousers', 'Dress', 'T-Shirt', 'Sweater', 'Jeans', 'Coat', 'Polo Shirt', 'Scarf', 'Skirt'];
const allSizes: ProductSize[] = ['XS', 'S', 'M', 'L', 'XL'];


export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const authStatus = typeof window !== 'undefined' ? localStorage.getItem('isAdminAuthenticated') : null;
    if (authStatus !== 'true') {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);
  
  const { products, addProduct, removeProduct, loading } = useProducts();
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [subCategoryFilter, setSubCategoryFilter] = useState('All');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // State for new product form
  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newProductSizes, setNewProductSizes] = useState<ProductSize[]>([]);
  const [newProductCategory, setNewProductCategory] = useState<ProductCategory | ''>('');
  const [newProductSubCategory, setNewProductSubCategory] = useState<ProductSubCategory | ''>('');
  
  const { toast } = useToast();
  
  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    router.push('/login');
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({ title: 'File too large', description: 'Please upload an image smaller than 10MB.', variant: 'destructive' });
        return;
      }
      setNewProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setNewProductImage(null);
      setImagePreview(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleAddProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    if (!newProductImage || !imagePreview) {
        toast({ title: 'Image Required', description: 'Please upload a product image.', variant: 'destructive' });
        return;
    }
    if (!newProductCategory) {
        toast({ title: 'Category Required', description: 'Please select a product category.', variant: 'destructive' });
        return;
    }
    if (!newProductSubCategory) {
        toast({ title: 'Sub-Category Required', description: 'Please select a product sub-category.', variant: 'destructive' });
        return;
    }
    if (newProductSizes.length === 0) {
      toast({ title: 'Sizes Required', description: 'Please select at least one size for the product.', variant: 'destructive' });
      return;
    }
    
    const newProduct: Omit<Product, 'id'> = {
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      description: formData.get('description') as string,
      category: newProductCategory as ProductCategory,
      subCategory: newProductSubCategory as ProductSubCategory,
      images: [imagePreview],
      sizes: newProductSizes,
      dataAiHint: 'fashion apparel',
    };
    
    try {
      await addProduct(newProduct);
      toast({ title: 'Product Added', description: `${newProduct.name} has been added.` });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add product:", error);
      toast({ title: 'Error', description: 'Could not add product. Please try again.', variant: 'destructive' });
    }
  };

  const handleRemoveProduct = async (id: string) => {
    try {
      await removeProduct(id);
      toast({ title: 'Product Removed', description: 'The product has been removed.', variant: 'destructive' });
    } catch (error) {
       console.error("Failed to remove product:", error);
       toast({ title: 'Error', description: 'Could not remove product. Please try again.', variant: 'destructive' });
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const categoryMatch = categoryFilter === 'All' || product.category === categoryFilter;
      const subCategoryMatch = subCategoryFilter === 'All' || product.subCategory === subCategoryFilter;
      return categoryMatch && subCategoryMatch;
    });
  }, [products, categoryFilter, subCategoryFilter]);


  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-headline">Manage Products</h2>
        <div className="flex items-center gap-4">
            <Dialog 
              open={isAddDialogOpen} 
              onOpenChange={(open) => {
                setIsAddDialogOpen(open);
                if (!open) {
                  // Reset form state when dialog is closed
                  setNewProductImage(null);
                  setImagePreview(null);
                  setNewProductSizes([]);
                  setNewProductCategory('');
                  setNewProductSubCategory('');
                }
              }}
            >
            <DialogTrigger asChild>
                <Button>Add Product</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Fill in the details for the new product.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="space-y-2">
                    <Label>Product Image</Label>
                    <div 
                    className="mt-2 flex justify-center rounded-lg border border-dashed border-input px-6 py-10"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    >
                    <div className="text-center">
                        {imagePreview ? (
                        <Image src={imagePreview} alt="Product preview" width={100} height={100} className="mx-auto h-24 w-24 object-contain rounded-md" />
                        ) : (
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        )}
                        <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                        <Label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-background font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-primary/80"
                        >
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/gif" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} />
                        </Label>
                        <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" name="name" required />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" required placeholder="Describe the product" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input id="price" name="price" type="number" step="0.01" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select name="category" required value={newProductCategory} onValueChange={(value) => setNewProductCategory(value as ProductCategory)}>
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {allCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="subCategory">Sub-Category</Label>
                    <Select name="subCategory" required value={newProductSubCategory} onValueChange={(value) => setNewProductSubCategory(value as ProductSubCategory)}>
                    <SelectTrigger id="subCategory">
                        <SelectValue placeholder="Select sub-category" />
                    </SelectTrigger>
                    <SelectContent>
                        {allSubCategories.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
                
                <div className="space-y-2">
                    <Label>Available Sizes</Label>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                      {allSizes.map((size) => (
                        <div key={size} className="flex items-center space-x-2">
                          <Checkbox
                            id={`size-add-${size}`}
                            checked={newProductSizes.includes(size)}
                            onCheckedChange={(checked) => {
                              setNewProductSizes(prevSizes => 
                                checked 
                                  ? [...prevSizes, size]
                                  : prevSizes.filter(s => s !== size)
                              );
                            }}
                          />
                          <Label htmlFor={`size-add-${size}`} className="font-normal cursor-pointer">
                            {size}
                          </Label>
                        </div>
                      ))}
                    </div>
                </div>
                
                <DialogFooter>
                    <Button type="submit">Add Product</Button>
                </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
            <Button variant="outline" size="icon" onClick={handleLogout} aria-label="Log out">
                <LogOut className="h-4 w-4" />
            </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="category-filter">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger id="category-filter" className="w-auto sm:w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      {allCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="subcategory-filter">Sub-Category</Label>
              <Select value={subCategoryFilter} onValueChange={setSubCategoryFilter}>
                  <SelectTrigger id="subcategory-filter" className="w-auto sm:w-[180px]">
                      <SelectValue placeholder="Filter by sub-category" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="All">All Sub-Categories</SelectItem>
                      {allSubCategories.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                  </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 hidden sm:table-cell">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Sub-Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-1/4" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image src={product.images[0]} alt={product.name} width={40} height={53} className="rounded-md object-cover" data-ai-hint={product.dataAiHint} />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.subCategory}</TableCell>
                    <TableCell>₱{product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(product.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
