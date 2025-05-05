import { useCart } from "@/context/CartContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const Cart = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateCartItemQuantity, 
    cartTotal,
    cartCount
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Helmet>
          <title>Shopping Cart | ShopEase</title>
        </Helmet>
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="mb-6 flex justify-center">
              <ShoppingCart className="h-16 w-16 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link href="/products">
              <Button className="bg-primary text-white px-6 py-2">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Shopping Cart ({cartCount}) | ShopEase</title>
      </Helmet>
      
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b">
              <div className="col-span-6">
                <span className="font-medium">Product</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="font-medium">Price</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="font-medium">Quantity</span>
              </div>
              <div className="col-span-2 text-right">
                <span className="font-medium">Total</span>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.id} className="p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center">
                  {/* Product */}
                  <div className="col-span-6 flex items-center mb-4 md:mb-0">
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden mr-4">
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <Link href={`/products/${item.product.slug}`}>
                        <h3 className="font-medium text-gray-800 hover:text-primary">{item.product.name}</h3>
                      </Link>
                      {item.product.brand && (
                        <p className="text-sm text-gray-500">Brand: {item.product.brand}</p>
                      )}
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-red-500 flex items-center mt-1 md:hidden"
                      >
                        <Trash2 size={14} className="mr-1" /> Remove
                      </button>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="col-span-2 text-center mb-4 md:mb-0">
                    <div className="md:hidden text-sm text-gray-500 mb-1">Price:</div>
                    <span>{formatCurrency(Number(item.product.price))}</span>
                  </div>
                  
                  {/* Quantity */}
                  <div className="col-span-2 flex justify-center mb-4 md:mb-0">
                    <div className="md:hidden text-sm text-gray-500 mb-1 mr-2">Quantity:</div>
                    <div className="flex border rounded">
                      <button 
                        className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        onClick={() => updateCartItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-3 py-1 border-x">{item.quantity}</span>
                      <button 
                        className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="col-span-2 flex justify-between md:justify-end items-center">
                    <div className="md:hidden text-sm text-gray-500">Total:</div>
                    <span className="font-medium">{formatCurrency(Number(item.product.price) * item.quantity)}</span>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 ml-4 hidden md:block"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6">
            <Link href="/products">
              <Button variant="outline" className="flex items-center">
                <ArrowLeft size={16} className="mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{formatCurrency(9.99)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (6%)</span>
                <span>{formatCurrency(cartTotal * 0.06)}</span>
              </div>
              <div className="border-t pt-3 mt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(cartTotal + 9.99 + (cartTotal * 0.06))}</span>
              </div>
            </div>
            
            <Link href="/checkout">
              <Button className="w-full bg-primary text-white py-3">
                Proceed to Checkout
              </Button>
            </Link>
            
            <div className="mt-4 text-sm text-gray-500">
              <p className="mb-1">We accept:</p>
              <div className="flex space-x-2 mt-2">
                <div className="w-10 h-6 bg-gray-200 rounded"></div>
                <div className="w-10 h-6 bg-gray-200 rounded"></div>
                <div className="w-10 h-6 bg-gray-200 rounded"></div>
                <div className="w-10 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
