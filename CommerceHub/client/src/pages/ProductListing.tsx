import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Product, Category } from "@shared/schema";
import ProductCard from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, SlidersHorizontal, X } from "lucide-react";
import { Helmet } from "react-helmet";

type ProductsResponse = {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

const ProductListing = () => {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  
  // Extract query parameters
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";
  const initialFeatured = searchParams.get("featured") === "true";
  const initialIsNew = searchParams.get("isNew") === "true";
  const initialOnSale = searchParams.get("onSale") === "true";
  
  // State for filters
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [featured, setFeatured] = useState(initialFeatured);
  const [isNew, setIsNew] = useState(initialIsNew);
  const [onSale, setOnSale] = useState(initialOnSale);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  // Categories query
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Build query string for products endpoint
  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    params.append("page", page.toString());
    params.append("limit", "12");
    
    if (category) params.append("category", category);
    if (search) params.append("search", search);
    if (featured) params.append("featured", "true");
    if (isNew) params.append("new", "true");
    if (onSale) params.append("onSale", "true");
    if (minPrice !== undefined) params.append("minPrice", minPrice.toString());
    if (maxPrice !== undefined) params.append("maxPrice", maxPrice.toString());
    params.append("sortBy", sortBy);
    params.append("sortOrder", sortOrder);
    
    return params.toString();
  };
  
  // Products query
  const {
    data: productsData,
    isLoading,
    error,
    refetch
  } = useQuery<ProductsResponse>({
    queryKey: [`/api/products?${buildQueryString()}`],
  });
  
  // Update URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (category) params.append("category", category);
    if (search) params.append("search", search);
    if (featured) params.append("featured", "true");
    if (isNew) params.append("isNew", "true");
    if (onSale) params.append("onSale", "true");
    if (minPrice !== undefined) params.append("minPrice", minPrice.toString());
    if (maxPrice !== undefined) params.append("maxPrice", maxPrice.toString());
    
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`
    );
  }, [category, search, featured, isNew, onSale, minPrice, maxPrice]);
  
  // Apply price range
  const handlePriceRangeApply = () => {
    setMinPrice(priceRange[0]);
    setMaxPrice(priceRange[1]);
    setPage(1);
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setCategory("");
    setFeatured(false);
    setIsNew(false);
    setOnSale(false);
    setPriceRange([0, 1000]);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };
  
  // Toggle filter visibility on mobile
  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>Shop Products | ShopEase</title>
        <meta name="description" content="Browse our collection of products with great deals and fast shipping." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shop Products</h1>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              {productsData
                ? `Showing ${productsData.products.length} of ${productsData.pagination.total} products`
                : "Browse our collection"}
            </p>
            <Button
              onClick={toggleFilterVisibility}
              variant="outline"
              className="md:hidden flex items-center gap-2"
            >
              <SlidersHorizontal size={18} />
              Filters
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar */}
          <div
            className={`w-full md:w-64 flex-shrink-0 bg-white p-4 rounded-lg shadow-sm ${
              isFilterVisible ? "fixed inset-0 z-40 overflow-auto" : "hidden md:block"
            }`}
          >
            <div className="md:hidden flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button variant="ghost" size="icon" onClick={toggleFilterVisibility}>
                <X size={24} />
              </Button>
            </div>
            
            {/* Search filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-grow"
                />
                <Button variant="outline" onClick={() => refetch()}>
                  Go
                </Button>
              </div>
            </div>
            
            {/* Category filter */}
            <Accordion type="single" collapsible defaultValue="category">
              <AccordionItem value="category">
                <AccordionTrigger>Categories</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="all-categories"
                        name="category"
                        checked={category === ""}
                        onChange={() => {
                          setCategory("");
                          setPage(1);
                        }}
                        className="mr-2"
                      />
                      <label htmlFor="all-categories">All Categories</label>
                    </div>
                    {categories?.map((cat) => (
                      <div key={cat.id} className="flex items-center">
                        <input
                          type="radio"
                          id={`category-${cat.id}`}
                          name="category"
                          checked={category === cat.slug}
                          onChange={() => {
                            setCategory(cat.slug);
                            setPage(1);
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`category-${cat.id}`}>{cat.name}</label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Price filter */}
              <AccordionItem value="price">
                <AccordionTrigger>Price Range</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <Slider
                      defaultValue={[0, 1000]}
                      max={1000}
                      step={10}
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      className="my-4"
                    />
                    <div className="flex items-center justify-between">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                    <Button
                      onClick={handlePriceRangeApply}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Apply
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Status filters */}
              <AccordionItem value="status">
                <AccordionTrigger>Product Status</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured"
                        checked={featured}
                        onCheckedChange={(checked) => {
                          setFeatured(checked === true);
                          setPage(1);
                        }}
                      />
                      <label
                        htmlFor="featured"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Featured
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new"
                        checked={isNew}
                        onCheckedChange={(checked) => {
                          setIsNew(checked === true);
                          setPage(1);
                        }}
                      />
                      <label
                        htmlFor="new"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        New Arrivals
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sale"
                        checked={onSale}
                        onCheckedChange={(checked) => {
                          setOnSale(checked === true);
                          setPage(1);
                        }}
                      />
                      <label
                        htmlFor="sale"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        On Sale
                      </label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {/* Sort options */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [newSortBy, newSortOrder] = value.split("-");
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder as "asc" | "desc");
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort options" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Newest</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Reset filters button */}
            <Button
              onClick={handleResetFilters}
              variant="outline"
              className="w-full mt-6"
            >
              Reset Filters
            </Button>
            
            {/* Apply button for mobile view */}
            <Button
              onClick={toggleFilterVisibility}
              className="w-full mt-4 md:hidden"
            >
              Apply Filters
            </Button>
          </div>
          
          {/* Overlay for mobile filter */}
          {isFilterVisible && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
              onClick={toggleFilterVisibility}
            ></div>
          )}
          
          {/* Products grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-4 h-80 animate-pulse">
                    <div className="w-full h-40 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load products. Please try again later.
                </AlertDescription>
              </Alert>
            ) : productsData?.products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button onClick={handleResetFilters}>Clear Filters</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {productsData?.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                
                {/* Pagination */}
                {productsData && productsData.pagination.totalPages > 1 && (
                  <Pagination
                    totalPages={productsData.pagination.totalPages}
                    currentPage={page}
                    onPageChange={setPage}
                    className="mt-8"
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
