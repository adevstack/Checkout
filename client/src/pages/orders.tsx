import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Order, OrderWithItems } from "@shared/schema";
import { ArrowUpRight, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Orders() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation("/login");
    }
  }, [user, navigate]);

  // Fetch order data
  const { data: orders, isLoading, isError } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
        Your Orders
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Check the status of recent orders, manage returns, and discover similar products.
      </p>

      <div className="mt-12 space-y-16">
        {isLoading ? (
          // Loading skeletons
          Array(2).fill(0).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="space-y-4">
                  {Array(2).fill(0).map((_, itemIndex) => (
                    <div key={itemIndex} className="flex items-center space-x-4">
                      <Skeleton className="h-16 w-16 rounded-md" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-48 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="mt-6 flex space-x-2">
                  <Skeleton className="h-10 w-40 rounded-md" />
                  <Skeleton className="h-10 w-40 rounded-md" />
                </div>
              </div>
            </div>
          ))
        ) : isError ? (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 text-center">
            <p className="text-red-500 dark:text-red-400">
              There was an error loading your orders. Please try again later.
            </p>
            <Button
              onClick={() => setLocation("/products")}
              className="mt-4"
            >
              Continue Shopping
            </Button>
          </div>
        ) : orders && orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Order #{order.id}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="sr-only">Order Summary</h4>
                
                {/* In a real app, we would fetch the order details with items */}
                {/* Here showing a placeholder since we don't have item details in the orders list */}
                <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    {order.status.toLowerCase() === "delivered" ? (
                      <Package className="h-8 w-8 text-green-500 mr-4" />
                    ) : (
                      <Truck className="h-8 w-8 text-blue-500 mr-4" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.status.toLowerCase() === "delivered" 
                          ? "Package delivered" 
                          : "Order being processed"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {order.shippingAddress.split(',')[0]} {/* Just show the first part of address */}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between text-sm font-medium">
                  <p className="text-gray-900 dark:text-white">Total</p>
                  <p className="text-gray-900 dark:text-white">${order.total.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-6 flex space-x-2">
                <Button variant="outline" onClick={() => setLocation(`/orders/${order.id}`)}>
                  View Order Details
                </Button>
                {order.status.toLowerCase() === "delivered" && (
                  <Button variant="outline">
                    Write a Review
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              You don't have any orders yet.
            </p>
            <Button
              onClick={() => setLocation("/products")}
              className="mt-4"
            >
              Start Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
