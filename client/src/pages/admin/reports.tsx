import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bar, 
  BarChart, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { Button } from "@/components/ui/button";
import { DownloadIcon, BarChart2, LineChart as LineChartIcon, RefreshCw } from "lucide-react";
import AdminNav from "../../components/admin-nav";
import { useQuery } from "@tanstack/react-query";

export default function AdminReports() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("revenue");
  
  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      setLocation("/");
    } else if (!user) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  // Define types for our data
  interface RevenueData {
    month: string;
    revenue: number;
  }

  interface ProductData {
    category: string;
    sales: number;
  }
  
  // Fetch sales data
  const { 
    data: revenueData, 
    isLoading: revenueLoading, 
    isError: revenueError,
    refetch: refetchRevenue
  } = useQuery<RevenueData[]>({
    queryKey: ["/api/admin/reports/revenue"],
    enabled: !!user?.isAdmin,
  });

  // Fetch product data 
  const { 
    data: productData, 
    isLoading: productLoading, 
    isError: productError,
    refetch: refetchProducts
  } = useQuery<ProductData[]>({
    queryKey: ["/api/admin/reports/products"],
    enabled: !!user?.isAdmin,
  });

  // Sample data for charts (will be replaced with real data)
  const sampleRevenueData = [
    { month: "Jan", revenue: 4000 },
    { month: "Feb", revenue: 3000 },
    { month: "Mar", revenue: 5000 },
    { month: "Apr", revenue: 4500 },
    { month: "May", revenue: 6000 },
    { month: "Jun", revenue: 5500 },
    { month: "Jul", revenue: 7000 },
    { month: "Aug", revenue: 8000 },
    { month: "Sep", revenue: 7500 },
    { month: "Oct", revenue: 8500 },
    { month: "Nov", revenue: 9000 },
    { month: "Dec", revenue: 10000 },
  ];

  const sampleProductData = [
    { category: "Electronics", sales: 120 },
    { category: "Clothing", sales: 80 },
    { category: "Books", sales: 60 },
    { category: "Home", sales: 100 },
    { category: "Beauty", sales: 40 },
    { category: "Sports", sales: 30 },
    { category: "Toys", sales: 50 },
    { category: "Jewelry", sales: 20 },
  ];

  // For demonstration purposes, use sample data if actual data is not available
  const displayRevenueData = revenueData || sampleRevenueData;
  const displayProductData = productData || sampleProductData;

  const handleRefresh = () => {
    if (activeTab === "revenue") {
      refetchRevenue();
    } else {
      refetchProducts();
    }
  };

  // Mock export functionality
  const handleExport = () => {
    const data = activeTab === "revenue" ? displayRevenueData : displayProductData;
    const fileName = activeTab === "revenue" ? "revenue-report.json" : "product-sales-report.json";
    
    // Create a blob with the data
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sales Reports</h1>
      
      <AdminNav />
      
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <Tabs 
            defaultValue="revenue" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="revenue" className="flex items-center">
                  <LineChartIcon className="mr-2 h-4 w-4" />
                  Revenue
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Product Sales
                </TabsTrigger>
              </TabsList>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={revenueLoading || productLoading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <TabsContent value="revenue" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {revenueLoading ? (
                      <div className="flex items-center justify-center h-80">
                        <p>Loading revenue data...</p>
                      </div>
                    ) : revenueError ? (
                      <div className="flex items-center justify-center h-80">
                        <p className="text-destructive">Failed to load revenue data</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={displayRevenueData}>
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`$${value}`, "Revenue"]}
                            labelFormatter={(label) => `Month: ${label}`}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#3498db" 
                            strokeWidth={2} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</div>
                        <div className="text-2xl font-bold mt-1">
                          ${displayRevenueData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Average Monthly Revenue</div>
                        <div className="text-2xl font-bold mt-1">
                          ${Math.round(displayRevenueData.reduce((sum, item) => sum + item.revenue, 0) / displayRevenueData.length).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Highest Month</div>
                        <div className="text-2xl font-bold mt-1">
                          {displayRevenueData.reduce((max, item) => item.revenue > max.revenue ? item : max, { month: '', revenue: 0 }).month}
                          {" "}
                          (${displayRevenueData.reduce((max, item) => item.revenue > max.revenue ? item : max, { month: '', revenue: 0 }).revenue.toLocaleString()})
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="products" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {productLoading ? (
                      <div className="flex items-center justify-center h-80">
                        <p>Loading product data...</p>
                      </div>
                    ) : productError ? (
                      <div className="flex items-center justify-center h-80">
                        <p className="text-destructive">Failed to load product data</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={displayProductData}>
                          <XAxis dataKey="category" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [value, "Sales"]}
                            labelFormatter={(label) => `Category: ${label}`}
                          />
                          <Bar 
                            dataKey="sales" 
                            fill="#2ecc71" 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Product Sales Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Products Sold</div>
                        <div className="text-2xl font-bold mt-1">
                          {displayProductData.reduce((sum, item) => sum + item.sales, 0).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Top Selling Category</div>
                        <div className="text-2xl font-bold mt-1">
                          {displayProductData.reduce((max, item) => item.sales > max.sales ? item : max, { category: '', sales: 0 }).category}
                          {" "}
                          ({displayProductData.reduce((max, item) => item.sales > max.sales ? item : max, { category: '', sales: 0 }).sales} units)
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Average Sales per Category</div>
                        <div className="text-2xl font-bold mt-1">
                          {Math.round(displayProductData.reduce((sum, item) => sum + item.sales, 0) / displayProductData.length)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}