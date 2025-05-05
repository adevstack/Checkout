import { Link } from "wouter";
import { Product } from "@shared/schema";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart(product.id, 1);
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
      variant: "default",
    });
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toast({
      title: "Added to wishlist",
      description: `${product.name} has been added to your wishlist`,
      variant: "default",
    });
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform hover:shadow-md hover:-translate-y-1 cursor-pointer h-full">
        <div className="relative">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-48 object-cover" 
          />
          <button 
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:text-red-500"
            onClick={handleAddToWishlist}
            aria-label="Add to wishlist"
          >
            <Heart size={18} />
          </button>
          
          {/* Sale badge */}
          {product.isOnSale && (
            <div className="absolute top-2 left-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
              Sale
            </div>
          )}
          
          {/* New badge */}
          {product.isNew && !product.isOnSale && (
            <div className="absolute top-2 left-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded">
              New
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-800">{product.name}</h3>
              <p className="text-gray-500 text-sm">{product.brand}</p>
            </div>
            <div className="flex items-center text-sm text-amber-500">
              <Star className="fill-amber-500" size={16} />
              <span className="ml-1 text-gray-600">{product.rating}</span>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-lg font-bold">{formatCurrency(Number(product.price))}</span>
              {product.compareAtPrice && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  {formatCurrency(Number(product.compareAtPrice))}
                </span>
              )}
            </div>
            <Button
              onClick={handleAddToCart}
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-blue-600"
              size="icon"
              aria-label="Add to cart"
            >
              <ShoppingCart size={18} />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
