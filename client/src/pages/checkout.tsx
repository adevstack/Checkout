import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";

// Form validation schema
const checkoutSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  apartment: z.string().optional(),
  city: z.string().min(2, { message: "City is required" }),
  postalCode: z.string().min(3, { message: "Postal code is required" }),
  phone: z.string().min(10, { message: "Phone number is required" }),
  paymentMethod: z.enum(["credit-card", "paypal"], {
    required_error: "Please select a payment method",
  }),
  cardNumber: z.string().optional(),
  expirationDate: z.string().optional(),
  cvc: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [_, setLocation] = useLocation();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate totals
  const shipping = cartTotal >= 100 ? 0 : 4.99;
  const tax = cartTotal * 0.07;
  const orderTotal = cartTotal + shipping + tax;

  // Initialize form with default values
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || "",
      firstName: "",
      lastName: "",
      address: "",
      apartment: "",
      city: "",
      postalCode: "",
      phone: "",
      paymentMethod: "credit-card",
      cardNumber: "",
      expirationDate: "",
      cvc: "",
    },
  });

  // Form submission handler
  const onSubmit = async (data: CheckoutFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to complete your purchase",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty. Add products before checkout.",
        variant: "destructive",
      });
      setLocation("/products");
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare shipping address string
      const shippingAddress = `${data.firstName} ${data.lastName}, ${data.address}${
        data.apartment ? `, ${data.apartment}` : ""
      }, ${data.city}, ${data.postalCode}`;

      // Send order to API
      await apiRequest("POST", "/api/orders", {
        shippingAddress,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      });

      // Clear cart after successful order
      clearCart();

      // Navigate to success page
      setLocation("/order-success");
    } catch (error) {
      console.error("Order submission error:", error);
      toast({
        title: "Checkout failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Watch payment method to conditionally show credit card form
  const watchPaymentMethod = form.watch("paymentMethod");

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Your cart is empty</h1>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Add some products to your cart before checking out.
          </p>
          <Button 
            onClick={() => setLocation("/products")}
            className="mt-8"
          >
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Checkout
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Please fill in your shipping and payment information to complete your order.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-8">
              {/* Contact Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Contact information</h2>
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="your@email.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Shipping Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Shipping information</h2>
                <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apartment"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Apartment, suite, etc. (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Payment method</h2>
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="credit-card" id="credit-card" />
                              <FormLabel htmlFor="credit-card" className="flex items-center">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Credit Card</span>
                                <div className="flex space-x-2 ml-4">
                                  <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                                    <path d="M6 10v4h12v-4H6z" fill="white" />
                                  </svg>
                                  <svg className="h-6 w-6 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 22a10 10 0 100-20 10 10 0 000 20z" />
                                    <path d="M12 10a2 2 0 100-4 2 2 0 000 4z" fill="white" />
                                    <path d="M12 18a2 2 0 100-4 2 2 0 000 4z" fill="white" />
                                    <path d="M10 12H14V14H10z" fill="white" />
                                  </svg>
                                  <svg className="h-6 w-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                                    <path d="M12 12.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" fill="white" />
                                  </svg>
                                </div>
                              </FormLabel>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="paypal" id="paypal" />
                              <FormLabel htmlFor="paypal" className="flex items-center">
                                <span className="font-medium text-gray-700 dark:text-gray-300">PayPal</span>
                                <svg className="h-6 w-6 ml-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M7 13l1.5-5h6.5c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5h-5l-.5 2h-2.5z" />
                                  <path d="M12 16l1-4h3.5c.8 0 1.5-.7 1.5-1.5S17.3 9 16.5 9H10L8.5 14h-3L4 6h5.5C11.4 6 13 7.6 13 9.5c0 .7-.2 1.4-.6 2 1.2.6 2 1.8 2 3.2 0 .7-.2 1.3-.5 1.8l-.4 1.5h-1.5z" />
                                </svg>
                              </FormLabel>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Credit Card Details */}
                {watchPaymentMethod === "credit-card" && (
                  <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Card number</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="**** **** **** ****"
                                maxLength={19}
                                onChange={(e) => {
                                  // Format card number with spaces
                                  const value = e.target.value
                                    .replace(/\s/g, "")
                                    .replace(/(\d{4})/g, "$1 ")
                                    .trim();
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="expirationDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiration date (MM/YY)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="MM/YY"
                                  maxLength={5}
                                  onChange={(e) => {
                                    // Format expiration date with slash
                                    let value = e.target.value.replace(/\D/g, "");
                                    if (value.length > 2) {
                                      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
                                    }
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cvc"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CVC</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="CVC"
                                  maxLength={4}
                                  onChange={(e) => {
                                    // Only allow numbers
                                    const value = e.target.value.replace(/\D/g, "");
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Submit Button - Visible on small screens */}
              <div className="mt-10 lg:hidden">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Order Summary */}
        <div className="mt-10 lg:mt-0">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Order summary</h2>

          <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <h3 className="sr-only">Items in your cart</h3>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {cartItems.map((item) => (
                <li key={item.id} className="flex py-6 px-4 sm:px-6">
                  <div className="flex-shrink-0">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-md object-center object-cover"
                    />
                  </div>

                  <div className="ml-6 flex-1 flex flex-col">
                    <div className="flex">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.product.name}
                        </h4>
                      </div>
                    </div>
                    <div className="flex-1 pt-2 flex items-end justify-between">
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                        ${item.product.price.toFixed(2)}
                      </p>
                      <div className="ml-4 flex">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="border-t border-gray-200 dark:border-gray-700 py-6 px-4 space-y-6 sm:px-6">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Subtotal</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                  ${cartTotal.toFixed(2)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Shipping</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                  ${shipping.toFixed(2)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Taxes</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                  ${tax.toFixed(2)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
                <dt className="text-base font-medium text-gray-900 dark:text-white">Total</dt>
                <dd className="text-base font-medium text-gray-900 dark:text-white">
                  ${orderTotal.toFixed(2)}
                </dd>
              </div>
            </dl>

            {/* Desktop Submit Button - Hidden on small screens */}
            <div className="border-t border-gray-200 dark:border-gray-700 py-6 px-4 sm:px-6 hidden lg:block">
              <Button
                onClick={form.handleSubmit(onSubmit)}
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </div>

          {/* Secure checkout badge */}
          <div className="mt-6 flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              Secure checkout - Your data is protected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
