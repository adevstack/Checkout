import { useState } from "react";
import { Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { useFavorites } from "@/hooks/use-favorites";
import { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const productId = Number(product.id);

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  // Toggle favorite
  const toggleFavorite = () => {
    if (isFavorite(productId)) {
      removeFromFavorites(productId);
    } else {
      addToFavorites(product);
    }
  };

  return (
    <Card 
      className="group border-gray-200 dark:border-gray-700 overflow-hidden" 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
        />
      </div>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
          {product.name}
        </h3>
        <div className="mt-1 flex justify-between items-center">
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            ${product.price.toFixed(2)}
          </p>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
              {product.rating}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex space-x-2 w-full">
          <Button 
            onClick={handleAddToCart} 
            className="flex-1"
          >
            Add to Cart
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleFavorite}
            className={`${
              isFavorite(productId) 
                ? 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/40' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Heart 
              className={`h-5 w-5 ${
                isFavorite(productId) 
                  ? 'text-red-500 fill-red-500' 
                  : 'text-gray-600 dark:text-gray-400'
              }`} 
            />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
