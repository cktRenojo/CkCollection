
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Product, ProductCategory, ProductSubCategory, ProductSize } from '@/lib/types';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, UploadCloud, Loader2, LogOut, Pencil } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/use-products';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

const allCategories: ProductCategory[] = ['Women', 'Men', 'New Arrivals', 'Unisex'];
const allGenderCategories: ('Women' | 'Men' | 'Unisex')[] = ['Women', 'Men', 'Unisex'];
const allSubCategories: ProductSubCategory[] = ['Shirt', 'Blouse', 'Jacket', 'Trousers', 'Dress', 'T-Shirt', 'Sweater', 'Jeans', 'Coat', 'Polo Shirt', 'Scarf', 'Skirt', 'Shorts', 'Shoes'];
const allSizes: ProductSize[] = ['XS', 'S', 'M', 'L', 'XL'];

const upperWearSubCategories: ProductSubCategory[] = ['Shirt', 'Blouse', 'Jacket', 'T-Shirt', 'Sweater', 'Dress', 'Coat', 'Polo Shirt'];
const lowerWearSubCategories: ProductSubCategory[] = ['Trousers', 'Jeans', 'Skirt', 'Shorts'];


export default function AdminPage() {
  const { products, addProduct, updateProduct, removeProduct, loading: productsLoading } = useProducts();
  const { user, isAdmin, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [subCategoryFilter, setSubCategoryFilter] = useState('All');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  
  // State for new product form
  const [newProductName, setNewProductName] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductQuantity, setNewProductQuantity] = useState('');
  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newProductSizes, setNewProductSizes] = useState<ProductSize[]>([]);
  const [newProductCategory, setNewProductCategory] = useState<ProductCategory | ''>('');
  const [newProductGenderCategory, setNewProductGenderCategory] = useState<('Women' | 'Men' | 'Unisex') | ''>('');
  const [newProductSubCategory, setNewProductSubCategory] = useState<ProductSubCategory | ''>('');
  const [newProductWidth, setNewProductWidth] = useState('');
  const [newProductLength, setNewProductLength] = useState('');
  const [newProductWaistSize, setNewProductWaistSize] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for edit product form
  const [editProductName, setEditProductName] = useState('');
  const [editProductDescription, setEditProductDescription] = useState('');
  const [editProductPrice, setEditProductPrice] = useState('');
  const [editProductQuantity, setEditProductQuantity] = useState('');
  const [editProductImage, setEditProductImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editProductSizes, setEditProductSizes] = useState<ProductSize[]>([]);
  const [editProductCategory, setEditProductCategory] = useState<ProductCategory | ''>('');
  const [editProductGenderCategory, setEditProductGenderCategory] = useState<('Women' | 'Men' | 'Unisex') | ''>('');
  const [editProductSubCategory, setEditProductSubCategory] = useState<ProductSubCategory | ''>('');
  const [editProductWidth, setEditProductWidth] = useState('');
  const [editProductLength, setEditProductLength] = useState('');
  const [editProductWaistSize, setEditProductWaistSize] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { toast } = useToast();

  const availableCategories = useMemo(() => {
    if (!products.length) return [];
    const uniqueCategories = [...new Set(products.map((p) => p.category))];
    return uniqueCategories.sort();
  }, [products]);

  const availableSubCategories = useMemo(() => {
    if (!products.length) return [];
    const uniqueSubCategories = [...new Set(products.map((p) => p.subCategory))];
    return uniqueSubCategories.sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const categoryMatch = categoryFilter === 'All' || product.category === categoryFilter;
      const subCategoryMatch = subCategoryFilter === 'All' || product.subCategory === subCategoryFilter;
      return categoryMatch && subCategoryMatch;
    });
  }, [products, categoryFilter, subCategoryFilter]);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      router.replace('/admin-auth/clark-and-kath09/login');
    } else if (!isAdmin) {
      router.replace('/');
    }
  }, [authLoading, user, isAdmin, router]);
  
  const handleLogout = async () => {
    await logout();
    router.push('/admin-auth/clark-and-kath09/login');
  };

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const resetAddFormState = () => {
    setNewProductName('');
    setNewProductDescription('');
    setNewProductPrice('');
    setNewProductQuantity('');
    setNewProductImage(null);
    setImagePreview(null);
    setNewProductSizes([]);
    setNewProductCategory('');
    setNewProductGenderCategory('');
    setNewProductSubCategory('');
    setNewProductWidth('');
    setNewProductLength('');
    setNewProductWaistSize('');
    setIsSubmitting(false);
  }

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
  
  const handleEditFileChange = (file: File | null) => {
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({ title: 'File too large', description: 'Please upload an image smaller than 10MB.', variant: 'destructive' });
        return;
      }
      setEditProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, isEdit = false) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (isEdit) {
        handleEditFileChange(e.dataTransfer.files[0]);
      } else {
        handleFileChange(e.dataTransfer.files[0]);
      }
    }
  };
  
  const handleAddProduct = async () => {
    if (!newProductName.trim() || !newProductDescription.trim() || !newProductPrice || !newProductQuantity || !newProductCategory || !newProductSubCategory || newProductSizes.length === 0) {
        toast({ title: 'All fields required', description: 'Please fill out all product details.', variant: 'destructive' });
        return;
    }
    if (newProductCategory === 'New Arrivals' && !newProductGenderCategory) {
        toast({ title: 'Gender Category Required', description: 'Please select a gender category for New Arrivals.', variant: 'destructive' });
        return;
    }
    const priceValue = parseFloat(newProductPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
        toast({ title: 'Invalid Price', description: 'Please enter a valid positive number for the price.', variant: 'destructive' });
        return;
    }
    const quantityValue = parseInt(newProductQuantity, 10);
    if (isNaN(quantityValue) || quantityValue < 0) {
        toast({ title: 'Invalid Quantity', description: 'Please enter a valid non-negative number for the quantity.', variant: 'destructive' });
        return;
    }

    if (upperWearSubCategories.includes(newProductSubCategory as ProductSubCategory) && (!newProductWidth.trim() || !newProductLength.trim())) {
        toast({ title: 'Dimensions Required', description: 'Please provide both width and length for this sub-category.', variant: 'destructive' });
        return;
    }
    
    if (lowerWearSubCategories.includes(newProductSubCategory as ProductSubCategory) && !newProductWaistSize.trim()) {
        toast({ title: 'Dimensions Required', description: 'Please provide waist size for this sub-category.', variant: 'destructive' });
        return;
    }
    
    setIsSubmitting(true);
    
    const productData: Omit<Product, 'id' | 'images' | 'createdAt'> = {
      name: newProductName,
      price: priceValue,
      description: newProductDescription,
      category: newProductCategory as ProductCategory,
      subCategory: newProductSubCategory as ProductSubCategory,
      sizes: newProductSizes,
      quantity: quantityValue,
      dataAiHint: 'fashion apparel',
      ...(newProductWidth && { width: parseFloat(newProductWidth) }),
      ...(newProductLength && { length: parseFloat(newProductLength) }),
      ...(newProductWaistSize && { waistSize: parseFloat(newProductWaistSize) }),
      ...(newProductCategory === 'New Arrivals' && { genderCategory: newProductGenderCategory as 'Men' | 'Women' | 'Unisex' }),
    };

    try {
      await addProduct(productData, newProductImage);
      toast({ title: 'Product Added', description: `${productData.name} has been added.` });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add product:", error);
      toast({ title: 'Error', description: 'Could not add product. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditDialog = (product: Product) => {
    setEditingProduct(product);
    setEditProductName(product.name);
    setEditProductDescription(product.description);
    setEditProductPrice(product.price.toString());
    setEditProductQuantity(product.quantity?.toString() ?? '0');
    setEditImagePreview(product.images[0] || null);
    setEditProductSizes(product.sizes);
    setEditProductCategory(product.category);
    setEditProductGenderCategory(product.genderCategory || '');
    setEditProductSubCategory(product.subCategory);
    setEditProductWidth(product.width?.toString() ?? '');
    setEditProductLength(product.length?.toString() ?? '');
    setEditProductWaistSize(product.waistSize?.toString() ?? '');
    setEditProductImage(null);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    if (!editProductName.trim() || !editProductDescription.trim() || !editProductPrice || !editProductQuantity || !editProductCategory || !editProductSubCategory || editProductSizes.length === 0) {
        toast({ title: 'All fields required', description: 'Please fill out all product details.', variant: 'destructive' });
        return;
    }
    if (editProductCategory === 'New Arrivals' && !editProductGenderCategory) {
        toast({ title: 'Gender Category Required', description: 'Please select a gender category for New Arrivals.', variant: 'destructive' });
        return;
    }
    const priceValue = parseFloat(editProductPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
        toast({ title: 'Invalid Price', description: 'Please enter a valid positive number for the price.', variant: 'destructive' });
        return;
    }
    const quantityValue = parseInt(editProductQuantity, 10);
    if (isNaN(quantityValue) || quantityValue < 0) {
        toast({ title: 'Invalid Quantity', description: 'Please enter a valid non-negative number for the quantity.', variant: 'destructive' });
        return;
    }

    setIsUpdating(true);

    const productData: Partial<Omit<Product, 'id' | 'images' | 'createdAt'>> = {
      name: editProductName,
      price: priceValue,
      description: editProductDescription,
      category: editProductCategory as ProductCategory,
      subCategory: editProductSubCategory as ProductSubCategory,
      sizes: editProductSizes,
      quantity: quantityValue,
      genderCategory: editProductCategory === 'New Arrivals' ? (editProductGenderCategory as 'Men' | 'Women' | 'Unisex') : undefined,
    };

    if (upperWearSubCategories.includes(editProductSubCategory as ProductSubCategory)) {
      productData.width = editProductWidth ? parseFloat(editProductWidth) : undefined;
      productData.length = editProductLength ? parseFloat(editProductLength) : undefined;
      productData.waistSize = undefined;
    } else if (lowerWearSubCategories.includes(editProductSubCategory as ProductSubCategory)) {
      productData.waistSize = editProductWaistSize ? parseFloat(editProductWaistSize) : undefined;
      productData.width = undefined;
      productData.length = undefined;
    } else {
      productData.width = undefined;
      productData.length = undefined;
      productData.waistSize = undefined;
    }


    try {
      await updateProduct(editingProduct.id, productData, editProductImage);
      toast({ title: 'Product Updated', description: `${productData.name} has been updated.` });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update product:", error);
      toast({ title: 'Error', description: 'Could not update product. Please try again.', variant: 'destructive' });
    } finally {
      setIsUpdating(false);
      setEditingProduct(null);
    }
  };

  const handleRemoveProduct = async (id: string) => {
    try {
      await removeProduct(id);
      toast({ title: 'Product Deleted', description: 'The product has been successfully deleted.' });
    } catch (error) {
       console.error("Failed to remove product:", error);
       toast({ title: 'Error', description: 'Could not remove product. Please try again.', variant: 'destructive' });
    }
  };

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
                  resetAddFormState();
                }
              }}
            >
            <DialogTrigger asChild>
                <Button onClick={resetAddFormState}>Add Product</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>Fill in the details for the new product.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[65vh] -mx-6">
                  <div className="space-y-4 py-4 px-6">
                    <div className="space-y-2">
                        <Label>Product Image</Label>
                        <div 
                        className="mt-2 flex justify-center rounded-lg border border-dashed border-input px-6 py-10"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e)}
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
                        <Input id="name" name="name" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Describe the product" value={newProductDescription} onChange={(e) => setNewProductDescription(e.target.value)} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <Input id="price" name="price" type="number" step="0.01" value={newProductPrice} onChange={(e) => setNewProductPrice(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input id="quantity" name="quantity" type="number" value={newProductQuantity} onChange={(e) => setNewProductQuantity(e.target.value)} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select 
                              name="category" 
                              value={newProductCategory} 
                              onValueChange={(value) => {
                                setNewProductCategory(value as ProductCategory);
                                if (value !== 'New Arrivals') {
                                  setNewProductGenderCategory('');
                                }
                              }}
                            >
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {allCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subCategory">Sub-Category</Label>
                            <Select name="subCategory" value={newProductSubCategory} onValueChange={(value) => setNewProductSubCategory(value as ProductSubCategory)}>
                            <SelectTrigger id="subCategory">
                                <SelectValue placeholder="Select sub-category" />
                            </SelectTrigger>
                            <SelectContent>
                                {allSubCategories.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                            </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {newProductCategory === 'New Arrivals' && (
                       <div className="space-y-2">
                          <Label htmlFor="genderCategory">Gender Category</Label>
                          <Select name="genderCategory" value={newProductGenderCategory} onValueChange={(value) => setNewProductGenderCategory(value as 'Men' | 'Women' | 'Unisex')}>
                          <SelectTrigger id="genderCategory">
                              <SelectValue placeholder="Select gender category" />
                          </SelectTrigger>
                          <SelectContent>
                              {allGenderCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                          </SelectContent>
                          </Select>
                      </div>
                    )}

                    {upperWearSubCategories.includes(newProductSubCategory as ProductSubCategory) && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="width">Width (in)</Label>
                                <Input id="width" type="number" value={newProductWidth} onChange={(e) => setNewProductWidth(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="length">Length (in)</Label>
                                <Input id="length" type="number" value={newProductLength} onChange={(e) => setNewProductLength(e.target.value)} />
                            </div>
                        </div>
                    )}
                    
                    {lowerWearSubCategories.includes(newProductSubCategory as ProductSubCategory) && (
                        <div className="space-y-2">
                            <Label htmlFor="waistSize">Waist Size (in)</Label>
                            <Input id="waistSize" type="number" value={newProductWaistSize} onChange={(e) => setNewProductWaistSize(e.target.value)} />
                        </div>
                    )}
                    
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
                  </div>
                </ScrollArea>
                <DialogFooter>
                    <Button type="button" onClick={handleAddProduct} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : 'Add Product'}
                    </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>

            {/* Edit Product Dialog */}
            <Dialog 
              open={isEditDialogOpen} 
              onOpenChange={(open) => {
                setIsEditDialogOpen(open);
                if (!open) {
                  setEditingProduct(null);
                }
              }}
            >
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                  <DialogDescription>Update the details for this product.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[65vh] -mx-6">
                  <div className="space-y-4 py-4 px-6">
                    <div className="space-y-2">
                        <Label>Product Image</Label>
                        <div 
                          className="mt-2 flex justify-center rounded-lg border border-dashed border-input px-6 py-10"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, true)}
                        >
                          <div className="text-center">
                            {editImagePreview ? (
                              <Image src={editImagePreview} alt="Product preview" width={100} height={100} className="mx-auto h-24 w-24 object-contain rounded-md" />
                            ) : (
                              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                            )}
                            <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                              <Label
                                  htmlFor="edit-file-upload"
                                  className="relative cursor-pointer rounded-md bg-background font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-primary/80"
                              >
                                  <span>Upload a file</span>
                                  <input id="edit-file-upload" name="edit-file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/gif" onChange={(e) => handleEditFileChange(e.target.files ? e.target.files[0] : null)} />
                              </Label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs leading-5 text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Product Name</Label>
                        <Input id="edit-name" value={editProductName} onChange={(e) => setEditProductName(e.target.value)} />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea id="edit-description" placeholder="Describe the product" value={editProductDescription} onChange={(e) => setEditProductDescription(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-price">Price</Label>
                            <Input id="edit-price" type="number" step="0.01" value={editProductPrice} onChange={(e) => setEditProductPrice(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-quantity">Quantity</Label>
                            <Input id="edit-quantity" type="number" value={editProductQuantity} onChange={(e) => setEditProductQuantity(e.target.value)} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-category">Category</Label>
                            <Select 
                              value={editProductCategory} 
                              onValueChange={(value) => {
                                setEditProductCategory(value as ProductCategory)
                                if (value !== 'New Arrivals') {
                                  setEditProductGenderCategory('');
                                }
                              }}
                            >
                            <SelectTrigger id="edit-category">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {allCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="edit-subCategory">Sub-Category</Label>
                            <Select value={editProductSubCategory} onValueChange={(value) => setEditProductSubCategory(value as ProductSubCategory)}>
                            <SelectTrigger id="edit-subCategory">
                                <SelectValue placeholder="Select sub-category" />
                            </SelectTrigger>
                            <SelectContent>
                                {allSubCategories.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                            </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {editProductCategory === 'New Arrivals' && (
                       <div className="space-y-2">
                          <Label htmlFor="edit-genderCategory">Gender Category</Label>
                          <Select name="genderCategory" value={editProductGenderCategory} onValueChange={(value) => setEditProductGenderCategory(value as 'Men' | 'Women' | 'Unisex')}>
                          <SelectTrigger id="edit-genderCategory">
                              <SelectValue placeholder="Select gender category" />
                          </SelectTrigger>
                          <SelectContent>
                              {allGenderCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                          </SelectContent>
                          </Select>
                      </div>
                    )}
                    
                    {upperWearSubCategories.includes(editProductSubCategory as ProductSubCategory) && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-width">Width (in)</Label>
                                <Input id="edit-width" type="number" value={editProductWidth} onChange={(e) => setEditProductWidth(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-length">Length (in)</Label>
                                <Input id="edit-length" type="number" value={editProductLength} onChange={(e) => setEditProductLength(e.target.value)} />
                            </div>
                        </div>
                    )}
                    
                    {lowerWearSubCategories.includes(editProductSubCategory as ProductSubCategory) && (
                        <div className="space-y-2">
                            <Label htmlFor="edit-waistSize">Waist Size (in)</Label>
                            <Input id="edit-waistSize" type="number" value={editProductWaistSize} onChange={(e) => setEditProductWaistSize(e.target.value)} />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Available Sizes</Label>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                          {allSizes.map((size) => (
                            <div key={size} className="flex items-center space-x-2">
                              <Checkbox
                                id={`size-edit-${size}`}
                                checked={editProductSizes.includes(size)}
                                onCheckedChange={(checked) => {
                                  setEditProductSizes(prevSizes => 
                                    checked 
                                      ? [...prevSizes, size]
                                      : prevSizes.filter(s => s !== size)
                                  );
                                }}
                              />
                              <Label htmlFor={`size-edit-${size}`} className="font-normal cursor-pointer">
                                {size}
                              </Label>
                            </div>
                          ))}
                        </div>
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="destructive" className="mr-auto" onClick={() => setProductToDelete(editingProduct)}>Delete</Button>
                    <Button type="button" onClick={handleUpdateProduct} disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>

            <AlertDialog open={isLogoutConfirmOpen} onOpenChange={setIsLogoutConfirmOpen}>
              <AlertDialogContent className="rounded-xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be returned to the admin login page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={buttonVariants({ variant: "default" })}
                    onClick={handleLogout}
                  >
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{productToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={async () => {
                if (productToDelete) {
                  await handleRemoveProduct(productToDelete.id);
                  setProductToDelete(null);
                  setIsEditDialogOpen(false); // Close edit dialog if open
                }
              }}
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
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
                      {availableCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
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
                      {availableSubCategories.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
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
                <TableHead className="w-[180px]">Category</TableHead>
                <TableHead className="w-[180px]">Sub-Category</TableHead>
                <TableHead className="w-[120px] text-right">Price</TableHead>
                <TableHead className="w-[120px] text-right">Quantity</TableHead>
                <TableHead className="w-[120px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-1/4 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-1/4 ml-auto" /></TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                      </div>
                    </TableCell>
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
                    <TableCell className="text-right">₱{product.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{product.quantity ?? 0}</TableCell>
                    <TableCell>
                      <div className='flex items-center justify-center'>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => setProductToDelete(product)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
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
