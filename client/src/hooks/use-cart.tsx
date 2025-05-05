import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItemWithProduct, Product } from "@shared/schema";
import { useAuth } from "./use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "./use-toast";
import { queryClient } from "@/lib/queryClient";

interface CartContextType {
  cartItems: CartItemWithProduct[];
  cartTotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartItem: (id: number | string, quantity: number) => void;
  removeCartItem: (id: number | string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Calculate cart total
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // Load cart from server or localStorage
  useEffect(() => {
    if (user) {
      // Fetch cart from server when user is logged in
      fetchCart();
    } else {
      // Load cart from localStorage when not logged in
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart));
        } catch (error) {
          console.error("Failed to parse cart from localStorage", error);
          localStorage.removeItem("cart");
        }
      }
    }
  }, [user]);

  // Save cart to localStorage when it changes (for non-logged in users)
  useEffect(() => {
    if (!user && cartItems.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  // Fetch cart from server
  const fetchCart = async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      } else {
        console.error("Failed to fetch cart");
      }
    } catch (error) {
      console.error("Error fetching cart", error);
    }
  };

  // Add item to cart
  const addToCart = async (product: Product, quantity = 1) => {
    // For logged in users, send to server
    if (user) {
      try {
        // Convert the product.id to a number if it's not already
        const productId = Number(product.id);
            
        console.log('Adding to cart:', productId, quantity);
        await apiRequest("POST", "/api/cart", {
          productId: productId,
          quantity: quantity,
        });
        
        // Refetch cart to get updated items
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        fetchCart();
      } catch (error) {
        console.error('Add to cart error:', error);
        toast({
          title: "Error",
          description: `Failed to add item to cart: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
      }
    } else {
      // For non-logged in users, update local state
      const existingItem = cartItems.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        // Update quantity if item exists
        setCartItems(
          cartItems.map((item) =>
            item.product.id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                }
              : item
          )
        );
      } else {
        // Add new item
        setCartItems([
          ...cartItems,
          {
            id: Date.now(), // Temporary ID for local cart
            userId: 0, // Placeholder user ID
            productId: product.id,
            quantity: quantity,
            createdAt: new Date(),
            product,
          },
        ]);
      }
    }
  };

  // Update cart item quantity
  const updateCartItem = async (id: number | string, quantity: number) => {
    if (user) {
      try {
        console.log(`Updating cart item ${id} to quantity ${quantity}`);
        await apiRequest("PUT", `/api/cart/${id}`, { quantity });
        fetchCart();
      } catch (error) {
        console.error("Error updating cart item:", error);
        toast({
          title: "Error",
          description: "Failed to update item quantity",
          variant: "destructive",
        });
      }
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity,
              }
            : item
        )
      );
    }
  };

  // Remove item from cart
  const removeCartItem = async (id: number | string) => {
    if (user) {
      try {
        console.log(`Removing cart item with ID: ${id}`);
        await apiRequest("DELETE", `/api/cart/${id}`, undefined);
        fetchCart();
      } catch (error) {
        console.error("Error removing cart item:", error);
        toast({
          title: "Error",
          description: "Failed to remove item from cart",
          variant: "destructive",
        });
      }
    } else {
      setCartItems(cartItems.filter((item) => item.id !== id));
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (user) {
      try {
        await apiRequest("DELETE", "/api/cart", undefined);
        fetchCart();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to clear cart",
          variant: "destructive",
        });
      }
    } else {
      setCartItems([]);
      localStorage.removeItem("cart");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
