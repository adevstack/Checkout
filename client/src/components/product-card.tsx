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
      className="group border-gray-200 dark:border-opacity-40 dark:border-border overflow-hidden shadow-card card-product" 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full aspect-square bg-muted dark:bg-muted relative overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=700";
            e.currentTarget.alt = "Product image not available";
          }}
        />
      </div>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-foreground mt-2 line-clamp-2 h-10">
          {product.name}
        </h3>
        <div className="mt-1 flex justify-between items-center">
          <p className="text-lg font-semibold text-foreground dark:text-primary">
            ${product.price.toFixed(2)}
          </p>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-primary dark:text-primary fill-primary dark:fill-primary" />
            <span className="ml-1 text-sm text-muted-foreground">
              {product.rating}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex space-x-2 w-full">
          <Button 
            onClick={handleAddToCart} 
            className="flex-1 btn-primary"
          >
            Add to Cart
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleFavorite}
            className={`${
              isFavorite(productId) 
                ? 'bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 border-primary/30' 
                : 'bg-muted hover:bg-muted/80 dark:bg-accent dark:hover:bg-accent/80'
            }`}
          >
            <Heart 
              className={`h-5 w-5 ${
                isFavorite(productId) 
                  ? 'text-primary fill-primary/70' 
                  : 'text-muted-foreground dark:text-muted-foreground'
              }`} 
            />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
