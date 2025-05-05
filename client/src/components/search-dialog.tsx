import { useState, useEffect } from "react";
import { X, Search as SearchIcon } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogClose 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useLocation } from "wouter";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [_, setLocation] = useLocation();

  // Reset search term when dialog opens
  useEffect(() => {
    if (open) {
      setSearchTerm("");
    }
  }, [open]);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: () => fetch("/api/products").then(res => res.json()),
    enabled: open,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleProductClick = (productId: number) => {
    onClose();
    // Assuming you would navigate to a product detail page
    setLocation(`/products?id=${productId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="text-lg font-medium text-gray-900 dark:text-white">
            Search Products
          </DialogTitle>
          <DialogClose className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </DialogClose>
        </DialogHeader>
        
        <div className="p-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <Input
              type="text"
              className="pl-10 pr-4 py-2"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="mt-4 max-h-72 overflow-y-auto">
            {isLoading ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">Loading...</p>
            ) : filteredProducts.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map(product => (
                  <li 
                    key={product.id} 
                    className="py-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 flex-shrink-0">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="h-full w-full object-cover object-center rounded-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {product.category}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : searchTerm ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No products found for "{searchTerm}"
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Type to search products
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
