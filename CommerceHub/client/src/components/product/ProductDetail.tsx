import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product, Review } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Heart, ShoppingCart, Star, Truck, ShieldCheck, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface ProductDetailProps {
  product: Product;
}

const ProductDetail = ({ product }: ProductDetailProps) => {
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Fetch reviews
  const { data: reviews } = useQuery<Review[]>({
    queryKey: [`/api/products/${product.id}/reviews`],
  });
  
  const images = [
    product.imageUrl,
    ...(product.additionalImages || []),
  ];
  
  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };
  
  const handleAddToWishlist = () => {
    toast({
      title: "Added to wishlist",
      description: `${product.name} has been added to your wishlist`,
    });
  };
  
  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = () => {
    setActiveImage((prev) => (prev - 1 + images.length) % images.length);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden h-80 md:h-96 bg-gray-100">
            <img
              src={images[activeImage]}
              alt={product.name}
              className="w-full h-full object-contain"
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm hover:bg-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm hover:bg-white"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`w-16 h-16 rounded overflow-hidden flex-shrink-0 border-2 ${
                    activeImage === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.isOnSale && (
            <span className="inline-block bg-accent text-white text-xs font-bold px-2 py-1 rounded mb-2">
              Sale
            </span>
          )}
          {product.isNew && (
            <span className="inline-block bg-secondary text-white text-xs font-bold px-2 py-1 rounded mb-2 ml-2">
              New
            </span>
          )}
          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {product.name}
          </h1>
          
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={18} 
                  className={i < Math.round(Number(product.rating)) ? "fill-amber-500" : ""} 
                />
              ))}
            </div>
            <span className="text-gray-600 text-sm">
              {product.reviewCount} reviews
            </span>
            {product.brand && (
              <>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600 text-sm">Brand: {product.brand}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center mb-6">
            <span className="text-2xl font-bold text-gray-800">
              {formatCurrency(Number(product.price))}
            </span>
            {product.compareAtPrice && (
              <span className="ml-2 text-gray-500 line-through">
                {formatCurrency(Number(product.compareAtPrice))}
              </span>
            )}
            {product.isOnSale && product.compareAtPrice && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                Save {formatCurrency(Number(product.compareAtPrice) - Number(product.price))}
              </span>
            )}
          </div>
          
          <p className="text-gray-600 mb-6">{product.description}</p>
          
          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <div className="flex w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100"
              >
                -
              </button>
              <div className="px-4 py-2 w-16 text-center border-y border-gray-300">
                {quantity}
              </div>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 py-3 px-8 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
            >
              <ShoppingCart size={20} />
              Add to Cart
            </Button>
            <Button
              onClick={handleAddToWishlist}
              variant="outline"
              className="flex items-center justify-center gap-2 py-3 px-8 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Heart size={20} />
              Add to Wishlist
            </Button>
          </div>
          
          {/* Product Features */}
          <div className="space-y-3 border-t border-gray-200 pt-4">
            <div className="flex items-center text-sm text-gray-600">
              <Truck size={18} className="text-green-600 mr-2" />
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <ShieldCheck size={18} className="text-green-600 mr-2" />
              <span>2-year warranty</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <RotateCcw size={18} className="text-green-600 mr-2" />
              <span>30-day money back guarantee</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews?.length || 0})</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4 p-4 bg-white rounded-lg border">
            <p className="text-gray-600">{product.description}</p>
          </TabsContent>
          <TabsContent value="specs" className="mt-4 p-4 bg-white rounded-lg border">
            <ul className="divide-y divide-gray-200">
              <li className="py-3 flex">
                <span className="font-medium w-1/3">Brand</span>
                <span className="text-gray-600">{product.brand}</span>
              </li>
              <li className="py-3 flex">
                <span className="font-medium w-1/3">In Stock</span>
                <span className="text-gray-600">{product.stock > 0 ? 'Yes' : 'No'}</span>
              </li>
              <li className="py-3 flex">
                <span className="font-medium w-1/3">Category</span>
                <span className="text-gray-600">Electronics</span>
              </li>
            </ul>
          </TabsContent>
          <TabsContent value="reviews" className="mt-4 p-4 bg-white rounded-lg border">
            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between">
                      <div className="flex items-center mb-1">
                        <div className="flex text-amber-500 mr-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={16} 
                              className={i < review.rating ? "fill-amber-500" : ""} 
                            />
                          ))}
                        </div>
                        <span className="font-medium">User {review.userId}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No reviews yet</p>
                {isAuthenticated ? (
                  <Button className="mt-4">Write a Review</Button>
                ) : (
                  <div className="mt-4">
                    <Link href="/login">
                      <Button variant="link">Log in to write a review</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetail;
