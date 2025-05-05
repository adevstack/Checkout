import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { Product } from "@shared/schema";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

interface FavoritesContextType {
  favorites: Product[];
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Load favorites from localStorage on mount
  useEffect(() => {
    if (!user) {
      const savedFavorites = localStorage.getItem("favorites");
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (error) {
          console.error("Error parsing favorites from localStorage:", error);
          localStorage.removeItem("favorites");
        }
      }
    }
    // If we have a user, in a real app we would fetch favorites from the API
    // For this demo, we'll just use localStorage for everyone
  }, [user]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    } else {
      localStorage.removeItem("favorites");
    }
  }, [favorites]);

  // Add product to favorites
  const addToFavorites = (product: Product) => {
    if (!isFavorite(Number(product.id))) {
      setFavorites([...favorites, product]);
      toast({
        title: "Added to favorites",
        description: `${product.name} has been added to your favorites.`,
      });
    }
  };

  // Remove product from favorites
  const removeFromFavorites = (productId: number) => {
    const product = favorites.find(item => Number(item.id) === productId);
    if (product) {
      setFavorites(favorites.filter(item => Number(item.id) !== productId));
      toast({
        title: "Removed from favorites",
        description: `${product.name} has been removed from your favorites.`,
      });
    }
  };

  // Check if product is in favorites
  const isFavorite = (productId: number) => {
    return favorites.some(item => Number(item.id) === productId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}