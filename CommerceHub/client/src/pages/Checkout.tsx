import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, Check } from "lucide-react";

const Checkout = () => {
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    saveAddress: false,
    paymentMethod: "creditCard",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  
  const shipping = 9.99;
  const tax = cartTotal * 0.06;
  const totalAmount = cartTotal + shipping + tax;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };
  
  const validateShippingInfo = () => {
    const { firstName, lastName, email, address, city, state, zipCode, country } = formData;
    if (!firstName || !lastName || !email || !address || !city || !state || !zipCode || !country) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };
  
  const validatePaymentInfo = () => {
    const { cardNumber, cardName, expiryDate, cvv } = formData;
    if (formData.paymentMethod === "creditCard" && (!cardNumber || !cardName || !expiryDate || !cvv)) {
      toast({
        title: "Missing payment information",
        description: "Please fill in all required payment fields",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };
  
  const handleNextStep = () => {
    if (step === 1 && !validateShippingInfo()) return;
    if (step === 2 && !validatePaymentInfo()) return;
    
    setStep(step + 1);
    window.scrollTo(0, 0);
  };
  
  const handlePreviousStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };
  
  const handleSubmitOrder = async () => {
    if (!validatePaymentInfo()) return;
    
    setIsSubmitting(true);
    
    try {
      // Step 1: Process payment
      const paymentData = {
        amount: totalAmount,
        paymentMethod: formData.paymentMethod,
        cardDetails: formData.paymentMethod === "creditCard" ? {
          cardNumber: formData.cardNumber,
          cardName: formData.cardName,
          expiryDate: formData.expiryDate,
          cvv: formData.cvv
        } : undefined
      };
      
      // Process payment through our simulated payment endpoint
      const paymentResponse = await apiRequest("POST", "/api/payment/process", paymentData);
      const paymentResult = await paymentResponse.json();
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.message || "Payment processing failed");
      }
      
      // Step 2: Create order with payment information
      const orderData = {
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
        paymentId: paymentResult.paymentId,
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };
      
      // Send order to API
      const response = await apiRequest("POST", "/api/orders", orderData);
      const order = await response.json();
      
      // Handle successful order
      setOrderPlaced(true);
      setOrderId(order.id);
      
      // Clear cart
      clearCart();
      
      // Invalidate cache for user orders
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      // Display success message
      toast({
        title: "Order placed successfully!",
        description: `Your order #${order.id} has been placed`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error placing order",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Redirect to cart if cart is empty
  if (cartItems.length === 0 && !orderPlaced) {
    navigate("/cart");
    return null;
  }
  
  // Order success view
  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Helmet>
          <title>Order Confirmation | ShopEase</title>
        </Helmet>
        
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
              <p className="text-gray-600 mb-4">
                Thank you for your purchase. Your order has been placed successfully.
              </p>
              <p className="font-medium mb-6">
                Order Number: <span className="text-primary">#{orderId}</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                A confirmation email has been sent to {formData.email}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                  <Button variant="outline">Continue Shopping</Button>
                </Link>
                <Link href="/profile">
                  <Button>View My Orders</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Checkout | ShopEase</title>
      </Helmet>
      
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          {/* Checkout Steps */}
          <div className="flex mb-8">
            <div className={`flex-1 text-center pb-2 ${step >= 1 ? "border-b-2 border-primary font-medium text-primary" : "border-b text-gray-500"}`}>
              Shipping
            </div>
            <div className={`flex-1 text-center pb-2 ${step >= 2 ? "border-b-2 border-primary font-medium text-primary" : "border-b text-gray-500"}`}>
              Payment
            </div>
            <div className={`flex-1 text-center pb-2 ${step >= 3 ? "border-b-2 border-primary font-medium text-primary" : "border-b text-gray-500"}`}>
              Review
            </div>
          </div>
          
          {/* Step 1: Shipping Information */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province *</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="ZIP Code"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => handleSelectChange("country", value)}
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="saveAddress"
                      checked={formData.saveAddress}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange("saveAddress", checked === true)
                      }
                    />
                    <label
                      htmlFor="saveAddress"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Save this address for future orders
                    </label>
                  </div>
                </div>
              </div>
              
              <Button onClick={handleNextStep} className="mt-6 w-full sm:w-auto">
                Continue to Payment
              </Button>
            </div>
          )}
          
          {/* Step 2: Payment Information */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="creditCard"
                    name="paymentMethod"
                    value="creditCard"
                    checked={formData.paymentMethod === "creditCard"}
                    onChange={(e) => handleSelectChange("paymentMethod", e.target.value)}
                  />
                  <Label htmlFor="creditCard" className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5 text-primary" />
                    Credit/Debit Card
                  </Label>
                </div>
                
                {formData.paymentMethod === "creditCard" && (
                  <div className="pl-6 pt-2 border-l-2 border-gray-100">
                    <div className="mb-4">
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <Label htmlFor="cardName">Cardholder Name *</Label>
                      <Input
                        id="cardName"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        placeholder="Name on card"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date *</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV *</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="radio"
                    id="paypal"
                    name="paymentMethod"
                    value="paypal"
                    checked={formData.paymentMethod === "paypal"}
                    onChange={(e) => handleSelectChange("paymentMethod", e.target.value)}
                  />
                  <Label htmlFor="paypal">
                    PayPal
                  </Label>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handlePreviousStep}>
                  Back
                </Button>
                <Button onClick={handleNextStep}>
                  Review Order
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 3: Review Order */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Review Your Order</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Shipping Address</h3>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p>{formData.firstName} {formData.lastName}</p>
                    <p>{formData.address}</p>
                    <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                    <p>{formData.country}</p>
                    <p>{formData.email}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Payment Method</h3>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {formData.paymentMethod === "creditCard" ? (
                      <div className="flex items-center">
                        <CreditCard className="mr-2 h-5 w-5 text-primary" />
                        <span>
                          Credit Card ending in {formData.cardNumber.slice(-4)}
                        </span>
                      </div>
                    ) : (
                      <p>PayPal</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Order Items</h3>
                  <div className="divide-y divide-gray-200 border rounded">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between p-3">
                        <div className="flex">
                          <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden mr-3">
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(Number(item.product.price) * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handlePreviousStep}>
                  Back
                </Button>
                <Button 
                  onClick={handleSubmitOrder} 
                  disabled={isSubmitting}
                  className="bg-primary text-white"
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.product.name} x{item.quantity}
                  </span>
                  <span>{formatCurrency(Number(item.product.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-3 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (6%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
