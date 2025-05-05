import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function OrderSuccess() {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();

  // Generate a random order number for display purposes
  const orderNumber = Math.floor(10000 + Math.random() * 90000);
  
  // Format today's date
  const orderDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // If user is not logged in, redirect to home
  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-300" />
        </div>
        
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-4xl">
          Order successful!
        </h1>
        
        <p className="mt-3 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Thank you for your order. We've received your order and will begin processing it soon.
        </p>
        
        <div className="mt-10">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Order details:</h2>
          
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-5">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Order number
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  #{orderNumber}
                </dd>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Date
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  {orderDate}
                </dd>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Status
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                  Processing
                </dd>
              </CardContent>
            </Card>
          </dl>
        </div>
        
        <div className="mt-10 space-x-4">
          <Button onClick={() => setLocation("/orders")} variant="outline">
            View Your Orders
          </Button>
          <Button onClick={() => setLocation("/")}>
            Continue Shopping
          </Button>
        </div>
        
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
            What happens next?
          </h3>
          <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li>You'll receive an order confirmation email shortly.</li>
            <li>Our team will prepare your items for shipping.</li>
            <li>You'll receive tracking information once your order ships.</li>
            <li>Your package will arrive in 2-5 business days.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
