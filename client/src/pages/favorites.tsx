import { useState } from "react";
import { useFavorites } from "@/hooks/use-favorites";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Favorites() {
  const { favorites, removeFromFavorites } = useFavorites();
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);

  // Clear all favorites
  const handleClearFavorites = () => {
    setIsClearing(true);
    try {
      // Remove each favorite one by one
      favorites.forEach((product) => {
        removeFromFavorites(Number(product.id));
      });
      
      toast({
        title: "Favorites cleared",
        description: "All items have been removed from your favorites.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear favorites.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <main className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Favorites</h1>
        {favorites.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFavorites}
            disabled={isClearing}
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium mb-4">No favorites yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Items you mark as favorites will appear here.
          </p>
          <Button
            onClick={() => window.location.href = '/products'}
            className="mt-4"
          >
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}