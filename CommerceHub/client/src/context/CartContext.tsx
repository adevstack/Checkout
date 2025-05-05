import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, Product } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "./AuthContext";

// Define the type for a cart item with product details
type CartItemWithProduct = CartItem & { product: Product };

interface CartContextType {
  cartItems: CartItemWithProduct[];
  isCartOpen: boolean;
  cartCount: number;
  cartTotal: number;
  toggleCart: () => void;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItemQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => void;
}

// Default value for CartContext
const defaultCartContext: CartContextType = {
  cartItems: [],
  isCartOpen: false,
  cartCount: 0,
  cartTotal: 0,
  toggleCart: () => { /* No-op */ },
  addToCart: async () => { throw new Error("CartProvider not initialized"); },
  updateCartItemQuantity: async () => { throw new Error("CartProvider not initialized"); },
  removeFromCart: async () => { throw new Error("CartProvider not initialized"); },
  clearCart: () => { /* No-op */ }
};

const CartContext = createContext<CartContextType>(defaultCartContext);

export const useCart = () => {
  return useContext(CartContext);
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  
  // Calculate cart count and total
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (Number(item.product.price) * item.quantity), 0);

  // Load cart data from server (if authenticated) or localStorage (if not)
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartFromServer();
    } else {
      loadCartFromLocalStorage();
    }
  }, [isAuthenticated, user?.id]);

  const fetchCartFromServer = async () => {
    try {
      const res = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setCartItems(data.items || []);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const loadCartFromLocalStorage = () => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
  };

  const saveCartToLocalStorage = (items: CartItemWithProduct[]) => {
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const addToCart = async (productId: number, quantity: number) => {
    try {
      if (isAuthenticated) {
        // If user is authenticated, add to server cart
        const res = await apiRequest("POST", "/api/cart/items", { productId, quantity });
        const data = await res.json();
        setCartItems(data.items);
      } else {
        // If not authenticated, add to local cart
        // First fetch the product details
        const productRes = await fetch(`/api/products?productId=${productId}`);
        if (!productRes.ok) throw new Error("Failed to fetch product");
        
        const productsData = await productRes.json();
        const product = productsData.products.find((p: Product) => p.id === productId);
        
        if (!product) throw new Error("Product not found");
        
        // Check if product is already in cart
        const existingItemIndex = cartItems.findIndex(
          item => item.product.id === productId
        );
        
        let newCartItems;
        
        if (existingItemIndex >= 0) {
          // Update quantity if product already in cart
          newCartItems = [...cartItems];
          newCartItems[existingItemIndex].quantity += quantity;
        } else {
          // Add new item if product not in cart
          const newItem: CartItemWithProduct = {
            id: Date.now(), // Generate temporary ID
            cartId: -1, // Placeholder for local cart
            productId,
            quantity,
            product
          };
          newCartItems = [...cartItems, newItem];
        }
        
        setCartItems(newCartItems);
        saveCartToLocalStorage(newCartItems);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  const updateCartItemQuantity = async (cartItemId: number, quantity: number) => {
    try {
      if (isAuthenticated) {
        // Update on server
        const res = await apiRequest("PUT", `/api/cart/items/${cartItemId}`, { quantity });
        const data = await res.json();
        setCartItems(data.items);
      } else {
        // Update in local storage
        const updatedItems = cartItems.map(item => 
          item.id === cartItemId ? { ...item, quantity } : item
        );
        setCartItems(updatedItems);
        saveCartToLocalStorage(updatedItems);
      }
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    try {
      if (isAuthenticated) {
        // Remove from server
        const res = await apiRequest("DELETE", `/api/cart/items/${cartItemId}`);
        const data = await res.json();
        setCartItems(data.items);
      } else {
        // Remove from local storage
        const updatedItems = cartItems.filter(item => item.id !== cartItemId);
        setCartItems(updatedItems);
        saveCartToLocalStorage(updatedItems);
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  };

  const clearCart = () => {
    setCartItems([]);
    if (!isAuthenticated) {
      localStorage.removeItem("cart");
    }
    // If authenticated, we would need an API endpoint to clear the cart
  };

  const value = {
    cartItems,
    isCartOpen,
    cartCount,
    cartTotal,
    toggleCart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
