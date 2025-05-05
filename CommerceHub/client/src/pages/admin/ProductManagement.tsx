import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, Category, insertProductSchema } from "@shared/schema";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  FilterIcon, 
  MoreVertical,
  ExternalLink,
  Eye,
  Check,
  X
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define the product form schema
const productFormSchema = insertProductSchema.extend({
  imageUrl: z.string().min(1, "Product image URL is required"),
  additionalImages: z.array(z.string()).optional(),
  price: z.string().or(z.number()).transform(val => 
    typeof val === 'string' ? parseFloat(val) : val
  ),
  compareAtPrice: z.string().or(z.number()).transform(val => 
    typeof val === 'string' ? parseFloat(val) : val
  ).optional().nullable(),
  stock: z.string().or(z.number()).transform(val => 
    typeof val === 'string' ? parseInt(val) : val
  ),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const ProductManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  if (!isAuthenticated || user?.role !== 'admin') {
    window.location.href = '/login';
    return null;
  }
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  // Create a form instance with the product schema
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: "",
      compareAtPrice: "",
      imageUrl: "",
      additionalImages: [],
      stock: 0,
      isNew: false,
      isFeatured: false,
      isOnSale: false,
    },
  });

  // Query for products with filters
  const { 
    data: productsData, 
    isLoading: productsLoading, 
    refetch: refetchProducts 
  } = useQuery<{ products: Product[], pagination: any }>({
    queryKey: [`/api/admin/products?page=${page}&limit=10&search=${search}&category=${categoryFilter}&${statusFilter !== "all" ? getStatusQueryParam(statusFilter) : ""}`],
    enabled: isAuthenticated && user?.role === 'admin'
  });

  // Query for categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Create product mutation
  const createProduct = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product created",
        description: "The product has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setShowAddModal(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create product",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateProduct = useMutation({
    mutationFn: async (data: ProductFormValues & { id: number }) => {
      const { id, ...productData } = data;
      const response = await apiRequest("PUT", `/api/products/${id}`, productData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product updated",
        description: "The product has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setShowEditModal(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update product",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProduct = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setShowDeleteModal(false);
      setCurrentProduct(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete product",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    if (currentProduct) {
      updateProduct.mutate({ ...data, id: currentProduct.id });
    } else {
      createProduct.mutate(data);
    }
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    form.reset({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice || undefined,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      additionalImages: product.additionalImages || [],
      brand: product.brand || "",
      stock: product.stock,
      isNew: product.isNew,
      isFeatured: product.isFeatured,
      isOnSale: product.isOnSale,
    });
    setShowEditModal(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setCurrentProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (currentProduct) {
      deleteProduct.mutate(currentProduct.id);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetchProducts();
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setStatusFilter("all");
    setPage(1);
  };

  // Helper to generate status query parameter
  function getStatusQueryParam(status: string): string {
    switch (status) {
      case "in-stock":
        return "minStock=1";
      case "out-of-stock":
        return "maxStock=0";
      case "featured":
        return "isFeatured=true";
      case "on-sale":
        return "isOnSale=true";
      case "new":
        return "isNew=true";
      default:
        return "";
    }
  }

  // Helper to generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Product Management | ShopEase Admin</title>
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Product Management</h1>
        <Button onClick={() => {
          setCurrentProduct(null);
          form.reset({
            name: "",
            slug: "",
            description: "",
            price: "",
            compareAtPrice: "",
            imageUrl: "",
            additionalImages: [],
            stock: 0,
            isNew: false,
            isFeatured: false,
            isOnSale: false,
          });
          setShowAddModal(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <form onSubmit={handleSearch}>
                <Label htmlFor="search" className="mb-2 block">Search Products</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder="Search by name, description, or brand..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit">
                    <Search className="h-4 w-4 mr-2" /> Search
                  </Button>
                </div>
              </form>
            </div>

            <div className="w-full md:w-48">
              <Label htmlFor="category" className="mb-2 block">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <Label htmlFor="status" className="mb-2 block">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="on-sale">On Sale</SelectItem>
                  <SelectItem value="new">New Arrivals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>

            <Button variant="secondary" onClick={() => refetchProducts()}>
              <FilterIcon className="h-4 w-4 mr-2" /> Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage your product catalog
          </CardDescription>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : !productsData || productsData.products.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <Button onClick={resetFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsData.products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="h-12 w-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          {product.name}
                          {product.brand && (
                            <span className="block text-sm text-gray-500">
                              {product.brand}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {formatCurrency(Number(product.price))}
                          {product.compareAtPrice && (
                            <span className="block text-sm text-gray-500 line-through">
                              {formatCurrency(Number(product.compareAtPrice))}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {product.isNew && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                              New
                            </span>
                          )}
                          {product.isFeatured && (
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                          {product.isOnSale && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
                              Sale
                            </span>
                          )}
                          {product.stock === 0 && (
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                              Out of Stock
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => window.open(`/products/${product.slug}`, '_blank')}>
                              <Eye className="h-4 w-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteProduct(product)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            {productsData && (
              <p className="text-sm text-gray-500">
                Showing {productsData.products.length} of {productsData.pagination.total} products
              </p>
            )}
          </div>

          {productsData && productsData.pagination.totalPages > 1 && (
            <Pagination
              totalPages={productsData.pagination.totalPages}
              currentPage={page}
              onPageChange={setPage}
            />
          )}
        </CardFooter>
      </Card>

      {/* Add/Edit Product Modal */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          setShowEditModal(false);
        }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{currentProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="options">Options</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter product name"
                            onChange={(e) => {
                              field.onChange(e);
                              // Auto-generate slug if not manually modified
                              if (!form.getValues("slug") || form.getValues("slug") === generateSlug(field.value)) {
                                form.setValue("slug", generateSlug(e.target.value));
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="product-url-slug" />
                        </FormControl>
                        <FormDescription>
                          URL-friendly version of the product name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Enter product description"
                            className="min-h-32"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01" 
                              min="0"
                              placeholder="0.00"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="compareAtPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Compare at Price</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01" 
                              min="0"
                              placeholder="0.00"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Original price before discount
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Brand name"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            value={field.value?.toString()}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Select a category</SelectItem>
                              {categories?.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="0"
                            placeholder="0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="images" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Image URL *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/image.jpg" />
                        </FormControl>
                        <FormDescription>
                          Enter the URL for the main product image
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Additional Images</FormLabel>
                    <FormDescription className="mb-2">
                      Enter URLs for additional product images
                    </FormDescription>

                    {form.watch("additionalImages")?.map((_, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <Input
                          value={form.watch(`additionalImages.${index}`)}
                          onChange={(e) => {
                            const newImages = [...form.watch("additionalImages") || []];
                            newImages[index] = e.target.value;
                            form.setValue("additionalImages", newImages);
                          }}
                          placeholder={`Additional image URL ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newImages = [...form.watch("additionalImages") || []];
                            newImages.splice(index, 1);
                            form.setValue("additionalImages", newImages);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        const currentImages = form.watch("additionalImages") || [];
                        form.setValue("additionalImages", [...currentImages, ""]);
                      }}
                    >
                      Add Image URL
                    </Button>
                  </div>

                  {form.watch("imageUrl") && (
                    <div className="mt-4">
                      <FormLabel>Preview</FormLabel>
                      <div className="mt-2 border rounded-md p-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-2">Main Image</p>
                          <img
                            src={form.watch("imageUrl")}
                            alt="Main product"
                            className="max-h-40 mx-auto object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://placehold.co/300x300/e2e8f0/64748b?text=Error+Loading+Image";
                            }}
                          />
                        </div>

                        {form.watch("additionalImages")?.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-2">Additional Images</p>
                            <div className="flex gap-2 overflow-x-auto py-2">
                              {form.watch("additionalImages").map((url, index) => (
                                url && (
                                  <img
                                    key={index}
                                    src={url}
                                    alt={`Additional ${index + 1}`}
                                    className="h-20 w-20 object-cover rounded border"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://placehold.co/300x300/e2e8f0/64748b?text=Error";
                                    }}
                                  />
                                )
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="options" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isNew"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Mark as New</FormLabel>
                          <FormDescription>
                            Flag this product as a new arrival
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Feature Product</FormLabel>
                          <FormDescription>
                            Show this product in featured sections
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isOnSale"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              // If marking as on sale and no compare price is set, suggest setting one
                              if (checked && !form.getValues("compareAtPrice")) {
                                toast({
                                  title: "Tip",
                                  description: "Consider setting a 'Compare at Price' for products on sale",
                                });
                              }
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>On Sale</FormLabel>
                          <FormDescription>
                            Mark this product as being on sale
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                >
                  {createProduct.isPending || updateProduct.isPending ? (
                    <>Saving...</>
                  ) : currentProduct ? (
                    <>Save Changes</>
                  ) : (
                    <>Create Product</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={(open) => {
        if (!open) setShowDeleteModal(false);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <Alert variant="destructive">
              <AlertTitle className="flex items-center">
                <Trash2 className="h-4 w-4 mr-2" /> Confirm Deletion
              </AlertTitle>
              <AlertDescription>
                Are you sure you want to delete <strong>{currentProduct?.name}</strong>? This action cannot be undone.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? "Deleting..." : "Delete Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;