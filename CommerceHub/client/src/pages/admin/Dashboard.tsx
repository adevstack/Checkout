import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Helmet } from "react-helmet";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, Users, DollarSign, TrendingUp, Package, ArrowRight } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState("7days");

  // Mock data for charts and stats - in a real app, this would come from API calls
  const salesData = [
    { name: "Mon", sales: 4000 },
    { name: "Tue", sales: 3000 },
    { name: "Wed", sales: 2000 },
    { name: "Thu", sales: 2780 },
    { name: "Fri", sales: 1890 },
    { name: "Sat", sales: 2390 },
    { name: "Sun", sales: 3490 },
  ];

  const categoryData = [
    { name: "Electronics", value: 400 },
    { name: "Fashion", value: 300 },
    { name: "Home", value: 200 },
    { name: "Health", value: 180 },
    { name: "Sports", value: 150 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  // Fetch recent orders - using a placeholder here since we're using in-memory storage
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/admin/orders', { limit: 5 }],
    enabled: user?.role === "admin",
  });

  // In a real app, these would be actual API calls
  const stats = {
    totalSales: 25890.75,
    totalOrders: 432,
    totalCustomers: 258,
    averageOrderValue: 120.25,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Admin Dashboard | ShopEase</title>
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Sales</p>
                <h3 className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</h3>
                <p className="text-xs text-green-500 mt-1">+12.5% from last period</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
                <p className="text-xs text-green-500 mt-1">+8.2% from last period</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Customers</p>
                <h3 className="text-2xl font-bold">{stats.totalCustomers}</h3>
                <p className="text-xs text-green-500 mt-1">+5.3% from last period</p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Order Value</p>
                <h3 className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</h3>
                <p className="text-xs text-green-500 mt-1">+3.8% from last period</p>
              </div>
              <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>
              Daily sales for the {timeframe === "7days" ? "last 7 days" : 
                timeframe === "30days" ? "last 30 days" : 
                timeframe === "90days" ? "last 90 days" : 
                timeframe === "year" ? "this year" : "today"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, "Sales"]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>
              Distribution of sales across product categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => [`${value}`, "Orders"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Latest customer orders
                </CardDescription>
              </div>
              <Link href="/admin/orders">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  View All <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-3 font-medium text-gray-500">Order</th>
                    <th className="text-left pb-3 font-medium text-gray-500">Customer</th>
                    <th className="text-left pb-3 font-medium text-gray-500">Date</th>
                    <th className="text-left pb-3 font-medium text-gray-500">Amount</th>
                    <th className="text-left pb-3 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">Loading...</td>
                    </tr>
                  ) : !orders || orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">No recent orders</td>
                    </tr>
                  ) : (
                    orders.map((order: any) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">#{order.id}</td>
                        <td className="py-3">User {order.userId}</td>
                        <td className="py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-3">{formatCurrency(Number(order.total))}</td>
                        <td className="py-3">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            order.status === "delivered" ? "bg-green-100 text-green-800" :
                            order.status === "shipped" ? "bg-blue-100 text-blue-800" :
                            order.status === "processing" ? "bg-yellow-100 text-yellow-800" :
                            order.status === "cancelled" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>
              Management shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link href="/admin/products">
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Manage Products
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  Manage Orders
                </Button>
              </Link>
              <Link href="/admin/users"> {/* Added Link for Manage Users button */}
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </Link> {/* Added closing Link tag */}
              <Link href="/admin/reports"> {/* Added Link for View Sales Reports button */}
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="mr-2 h-4 w-4" />
                  View Sales Reports
                </Button>
              </Link> {/* Added closing Link tag */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;