import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Product } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import ProductCard from "@/components/product-card";
import { ProductCategories } from "@/components/product-categories";
import { ResetProducts } from "@/components/admin/reset-products";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FilterIcon, Star, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";

export default function Products() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const initialCategory = searchParams.get("category") || "";
  const { user } = useAuth();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Apply filters
  const filteredProducts = products
    ? products.filter((product) => {
        // Category filter
        if (
          selectedCategories.length > 0 &&
          !selectedCategories.includes(product.category)
        ) {
          return false;
        }

        // Price filter
        const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
        const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        if (product.price < minPrice || product.price > maxPrice) {
          return false;
        }

        // Rating filter
        if (ratingFilter && (product.rating || 0) < ratingFilter) {
          return false;
        }

        return true;
      })
    : [];

  // Categories from products
  const categories = products
    ? Array.from(new Set(products.map((product) => product.category)))
    : [];

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(
        selectedCategories.filter((c) => c !== category)
      );
    }
  };

  const handlePriceChange = (type: "min" | "max", value: string) => {
    setPriceRange({ ...priceRange, [type]: value });
  };

  const handleRatingChange = (rating: number, checked: boolean) => {
    setRatingFilter(checked ? rating : null);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: "", max: "" });
    setRatingFilter(null);
  };

  const MobileFilters = () => (
    <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden flex items-center gap-2">
          <FilterIcon className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        
        {/* Filter content */}
        <div className="py-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Categories</h3>
            <div className="mt-2 space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center">
                  <Checkbox
                    id={`category-${category}-mobile`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) =>
                      handleCategoryChange(category, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`category-${category}-mobile`}
                    className="ml-2 text-sm text-gray-600 dark:text-gray-300"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Price Range</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange("min", e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange("max", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Rating</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <Checkbox
                  id="rating-4-mobile"
                  checked={ratingFilter === 4}
                  onCheckedChange={(checked) =>
                    handleRatingChange(4, checked === true)
                  }
                />
                <Label
                  htmlFor="rating-4-mobile"
                  className="ml-2 text-sm text-gray-600 dark:text-gray-300 flex items-center"
                >
                  <div className="flex">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                    <Star className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                  </div>
                  <span className="ml-1">& up</span>
                </Label>
              </div>
              <div className="flex items-center">
                <Checkbox
                  id="rating-3-mobile"
                  checked={ratingFilter === 3}
                  onCheckedChange={(checked) =>
                    handleRatingChange(3, checked === true)
                  }
                />
                <Label
                  htmlFor="rating-3-mobile"
                  className="ml-2 text-sm text-gray-600 dark:text-gray-300 flex items-center"
                >
                  <div className="flex">
                    {[...Array(3)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                    {[...Array(2)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                    ))}
                  </div>
                  <span className="ml-1">& up</span>
                </Label>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={handleClearFilters}>
              Clear All
            </Button>
            <SheetClose asChild>
              <Button>Apply Filters</Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
      <div className="pb-5 border-b border-gray-200 dark:border-gray-700 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Products
        </h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <MobileFilters />
        </div>
      </div>
      
      {/* Product Categories */}
      <div className="mt-6">
        <ProductCategories />
      </div>

      <div className="pt-6 pb-24 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
        {/* Desktop Filters sidebar */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-20 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Categories</h3>
              <div className="mt-2 space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(category, checked === true)
                      }
                    />
                    <Label
                      htmlFor={`category-${category}`}
                      className="ml-2 text-sm text-gray-600 dark:text-gray-300"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Price Range</h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange("min", e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange("max", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Rating</h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <Checkbox
                    id="rating-4"
                    checked={ratingFilter === 4}
                    onCheckedChange={(checked) =>
                      handleRatingChange(4, checked === true)
                    }
                  />
                  <Label
                    htmlFor="rating-4"
                    className="ml-2 text-sm text-gray-600 dark:text-gray-300 flex items-center"
                  >
                    <div className="flex">
                      {[...Array(4)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      ))}
                      <Star className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                    </div>
                    <span className="ml-1">& up</span>
                  </Label>
                </div>
                <div className="flex items-center">
                  <Checkbox
                    id="rating-3"
                    checked={ratingFilter === 3}
                    onCheckedChange={(checked) =>
                      handleRatingChange(3, checked === true)
                    }
                  />
                  <Label
                    htmlFor="rating-3"
                    className="ml-2 text-sm text-gray-600 dark:text-gray-300 flex items-center"
                  >
                    <div className="flex">
                      {[...Array(3)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      ))}
                      {[...Array(2)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                      ))}
                    </div>
                    <span className="ml-1">& up</span>
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="mt-6 lg:mt-0 lg:col-span-2 xl:col-span-3">
          {/* Active filters */}
          {(selectedCategories.length > 0 ||
            priceRange.min ||
            priceRange.max ||
            ratingFilter) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedCategories.map((category) => (
                <Badge 
                  key={category}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {category}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleCategoryChange(category, false)}
                  />
                </Badge>
              ))}
              {(priceRange.min || priceRange.max) && (
                <Badge 
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  Price: {priceRange.min || "0"}$ - {priceRange.max || "∞"}$
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setPriceRange({ min: "", max: "" })}
                  />
                </Badge>
              )}
              {ratingFilter && (
                <Badge 
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {ratingFilter}+ Stars
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setRatingFilter(null)}
                  />
                </Badge>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 xl:gap-x-8">
              {Array(6).fill(0).map((_, index) => (
                <div key={index} className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-lg" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 xl:gap-x-8">
              {filteredProducts.map((product, index) => (
                <ProductCard key={`product-${product.id}-${index}`} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                No products found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try changing your filters or search criteria
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </div>
          )}
          
          {/* Admin Tools - Reset Products */}
          {user?.isAdmin && (
            <div className="mt-12 pt-8 border-t dark:border-gray-700">
              <ResetProducts />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
