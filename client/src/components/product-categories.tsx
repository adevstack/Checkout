import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@shared/schema';

export function ProductCategories() {
  const [location, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Extract category from URL if it exists
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const category = searchParams.get('category');
    setSelectedCategory(category);
  }, [location]);

  // Get all products to extract categories
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Get unique categories from products
  const categories = products 
    ? Array.from(new Set(products.map(product => product.category))).sort()
    : [];

  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      // If clicking the already selected category, clear the filter
      setSelectedCategory(null);
      setLocation('/products');
    } else {
      setSelectedCategory(category);
      setLocation(`/products?category=${category}`);
    }
  };

  if (isLoading) {
    return <div className="mb-6 h-12 flex items-center">Loading categories...</div>;
  }

  if (!categories.length) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Categories</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setLocation('/products')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            !selectedCategory 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All Products
        </button>
        
        {categories.map(category => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedCategory === category 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}