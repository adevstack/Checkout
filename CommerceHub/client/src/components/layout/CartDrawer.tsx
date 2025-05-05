import { useCart } from "@/context/CartContext";
import { X, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";

const CartDrawer = () => {
  const cart = useCart();
  
  const isCartOpen = cart.isCartOpen;
  const toggleCart = cart.toggleCart;
  const cartItems = cart.cartItems;
  const removeFromCart = cart.removeFromCart;
  const updateCartItemQuantity = cart.updateCartItemQuantity;
  const cartTotal = cart.cartTotal;
  const cartCount = cart.cartCount;

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="bg-white w-full md:w-96 h-full overflow-y-auto ml-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Your Cart ({cartCount})</h2>
            <button onClick={toggleCart} className="text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Link href="/products">
              <Button onClick={toggleCart} className="bg-primary text-white">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.id} className="p-4 flex">
                  <img 
                    src={item.product.imageUrl} 
                    alt={item.product.name} 
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-gray-500 text-sm">
                      {item.product.brand && `Brand: ${item.product.brand}`}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded">
                        <button 
                          className="px-2 py-1 text-gray-600"
                          onClick={() => updateCartItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-2 py-1">{item.quantity}</span>
                        <button 
                          className="px-2 py-1 text-gray-600"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(Number(item.product.price))}
                      </p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-sm text-red-500 mt-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span className="font-semibold">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span className="font-semibold">{formatCurrency(9.99)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Tax</span>
                <span className="font-semibold">{formatCurrency(cartTotal * 0.06)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold mb-6">
                <span>Total</span>
                <span>{formatCurrency(cartTotal + 9.99 + (cartTotal * 0.06))}</span>
              </div>
              <Link href="/checkout">
                <Button onClick={toggleCart} className="w-full bg-primary text-white py-3 mb-2">
                  Checkout
                </Button>
              </Link>
              <Button 
                onClick={toggleCart} 
                variant="outline" 
                className="w-full border-gray-300 text-gray-800 py-3"
              >
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
