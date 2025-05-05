import { useState } from "react";
import { XIcon, Plus, Minus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { useLocation } from "wouter";

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { cartItems, updateCartItem, removeCartItem, cartTotal } = useCart();
  const [_, setLocation] = useLocation();

  const handleCheckout = () => {
    onClose();
    setLocation("/checkout");
  };

  const handleContinueShopping = () => {
    onClose();
    setLocation("/products");
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-md sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-medium text-gray-900 dark:text-white">Shopping cart</SheetTitle>
            <SheetClose className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <XIcon className="h-5 w-5" />
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Your cart is empty</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700 -my-6">
              {cartItems.map((item) => (
                <li key={item.id} className="py-6 flex">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div className="ml-4 flex-1 flex flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                        <h3>{item.product.name}</h3>
                        <p className="ml-4">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex-1 flex items-end justify-between text-sm">
                      <div className="flex items-center">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-3 py-1">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCartItem(item.id)}
                          className="font-medium text-primary hover:text-primary-dark"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
              <p>Subtotal</p>
              <p>${cartTotal.toFixed(2)}</p>
            </div>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Shipping and taxes calculated at checkout.
            </p>
            <div className="mt-6">
              <Button
                onClick={handleCheckout}
                className="w-full"
              >
                Checkout
              </Button>
            </div>
            <div className="mt-6 flex justify-center text-sm text-center text-gray-500 dark:text-gray-400">
              <p>
                or{" "}
                <Button
                  variant="link"
                  onClick={handleContinueShopping}
                  className="font-medium text-primary hover:text-primary-dark p-0"
                >
                  Continue Shopping<span aria-hidden="true"> &rarr;</span>
                </Button>
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
