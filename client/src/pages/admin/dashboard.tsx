import { useEffect } from "react";
import { useNavigate, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Order, Product, User } from "@shared/schema";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingBag,
  DollarSign,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowRight,
  Package,
  Clock,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();

  // Redirect if not admin
  useEffect(() => {
    if (!user || !user.isAdmin) {
      setLocation("/");
    }
  }, [user, navigate]);

  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user && user.isAdmin,
  });

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: !!user && user.isAdmin,
  });

  if (!user || !user.isAdmin) {
    return null; // Will redirect in useEffect
  }

  // Calculate dashboard metrics
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
  const totalProducts = products?.length || 0;
  
  // Get recent orders for display
  const recentOrders = orders?.slice(0, 3) || [];

  // Create data for charts
  const orderStatusData = [
    { name: "Pending", value: orders?.filter(o => o.status.toLowerCase() === "pending").length || 0 },
    { name: "Processing", value: orders?.filter(o => o.status.toLowerCase() === "processing").length || 0 },
    { name: "Shipped", value: orders?.filter(o => o.status.toLowerCase() === "shipped").length || 0 },
    { name: "Delivered", value: orders?.filter(o => o.status.toLowerCase() === "delivered").length || 0 }
  ];

  // Format date for display
  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>

        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Orders Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary rounded-md p-3">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Orders
                    </dt>
                    <dd>
                      {ordersLoading ? (
                        <Skeleton className="h-7 w-16 mt-1" />
                      ) : (
                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                          {totalOrders}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <Link href="/admin/orders" className="font-medium text-primary hover:text-primary-dark flex items-center">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </Card>

          {/* Revenue Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Revenue
                    </dt>
                    <dd>
                      {ordersLoading ? (
                        <Skeleton className="h-7 w-24 mt-1" />
                      ) : (
                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                          ${totalRevenue.toFixed(2)}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <Link href="/admin/reports" className="font-medium text-primary hover:text-primary-dark flex items-center">
                  View report
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </Card>

          {/* Products Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Products
                    </dt>
                    <dd>
                      {productsLoading ? (
                        <Skeleton className="h-7 w-16 mt-1" />
                      ) : (
                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                          {totalProducts}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <Link href="/admin/products" className="font-medium text-primary hover:text-primary-dark flex items-center">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Content Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="orders">Recent Orders</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            {/* Recent Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <CardTitle className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Recent Orders
                  </CardTitle>
                  <Link href="/admin/orders" className="text-sm font-medium text-primary hover:text-primary-dark">
                    View all orders
                  </Link>
                </CardHeader>
                <CardContent className="p-0">
                  {ordersLoading ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-16" />
                          </div>
                          <div className="mt-2 flex justify-between">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentOrders.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {recentOrders.map((order) => (
                        <li key={order.id}>
                          <div className="px-6 py-4">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-primary truncate">
                                Order #{order.id}
                              </p>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  order.status.toLowerCase() === "delivered"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : order.status.toLowerCase() === "processing"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    : order.status.toLowerCase() === "shipped"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                }`}>
                                  {order.status}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                  {order.shippingAddress.split(',')[0]} {/* Just show the first part */}
                                </p>
                                <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:ml-6">
                                  <DollarSign className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                  ${order.total.toFixed(2)}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                                <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <p>
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                      No orders found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Order Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {ordersLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={orderStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} orders`, "Count"]} />
                        <Bar dataKey="value" fill="#4F46E5" barSize={60} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Product Management Section */}
        <div className="mt-8">
          <Card>
            <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <CardTitle className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Product Management
              </CardTitle>
              <Link href="/admin/products" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none">
                Add New Product
              </Link>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Stock
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {productsLoading ? (
                    [1, 2, 3].map((i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <Skeleton className="h-10 w-10 rounded-full" />
                            </div>
                            <div className="ml-4">
                              <Skeleton className="h-4 w-36" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-16" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-12" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Skeleton className="h-8 w-32 inline-block" />
                        </td>
                      </tr>
                    ))
                  ) : products && products.length > 0 ? (
                    products.slice(0, 5).map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={product.imageUrl} 
                                alt={product.name} 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {product.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {product.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            ${product.price.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.stock > 10
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : product.stock > 0
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-primary hover:text-primary-dark mr-3">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {products && products.length > 5 && (
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-center">
                  <Link href="/admin/products" className="text-sm font-medium text-primary hover:text-primary-dark">
                    View all products
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
