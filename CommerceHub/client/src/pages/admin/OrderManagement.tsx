import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  FilterIcon, 
  MoreVertical,
  Eye,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon,
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

// Type for order details with items
interface OrderWithItems extends Order {
  items: Array<{
    id: number;
    productId: number;
    product: {
      name: string;
      imageUrl: string;
      price: number;
    };
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
}

const OrderManagement = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderWithItems | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Query for orders with filters
  const { 
    data: ordersData, 
    isLoading: ordersLoading, 
    refetch: refetchOrders 
  } = useQuery<{ orders: Order[], pagination: any }>({
    queryKey: [`/api/admin/orders?page=${page}&limit=10&status=${status !== "all" ? status : ""}`],
  });

  // Query for order details
  const getOrderDetails = async (orderId: number) => {
    try {
      const res = await apiRequest("GET", `/api/orders/${orderId}`);
      const orderData = await res.json();
      setCurrentOrder(orderData);
      setShowOrderDetail(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
    }
  };

  // Update order status mutation
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order updated",
        description: "The order status has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      setIsUpdatingStatus(false);
      
      // Refresh the current order details if order detail modal is open
      if (currentOrder) {
        getOrderDetails(currentOrder.id);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update order",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      setIsUpdatingStatus(false);
    },
  });

  const handleUpdateStatus = (status: string) => {
    if (!currentOrder) return;
    
    setIsUpdatingStatus(true);
    updateOrderStatus.mutate({
      orderId: currentOrder.id,
      status,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetchOrders();
  };

  const resetFilters = () => {
    setStatus("all");
    setSearch("");
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
      case "shipped":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Shipped</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Package className="h-5 w-5 text-yellow-500" />;
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Order Management | ShopEase Admin</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Order Management</h1>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <form onSubmit={handleSearch}>
                <Label htmlFor="search" className="mb-2 block">Search Orders</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder="Search by order ID or customer email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit">
                    <Search className="h-4 w-4 mr-2" /> Search
                  </Button>
                </div>
              </form>
            </div>
            
            <div className="w-full md:w-48">
              <Label htmlFor="status" className="mb-2 block">Order Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-48">
              <Label className="mb-2 block">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="w-full md:w-48">
              <Label className="mb-2 block">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) =>
                      startDate ? date < startDate : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
            
            <Button variant="secondary" onClick={() => refetchOrders()}>
              <FilterIcon className="h-4 w-4 mr-2" /> Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Manage customer orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : !ordersData || ordersData.orders.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">No orders found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters</p>
              <Button onClick={resetFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersData.orders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-gray-50" onClick={() => getOrderDetails(order.id)}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>
                        {typeof order.createdAt === 'string'
                          ? new Date(order.createdAt).toLocaleDateString()
                          : order.createdAt instanceof Date
                            ? order.createdAt.toLocaleDateString()
                            : 'Date unavailable'}
                      </TableCell>
                      <TableCell>Customer {order.userId}</TableCell>
                      <TableCell>{formatCurrency(Number(order.total))}</TableCell>
                      <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <Badge variant={order.paymentStatus === "paid" ? "outline" : "secondary"} className={
                          order.paymentStatus === "paid" 
                            ? "bg-green-100 text-green-800 hover:bg-green-100" 
                            : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                        }>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              getOrderDetails(order.id);
                            }}>
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              setCurrentOrder(order as OrderWithItems);
                              handleUpdateStatus("processing");
                            }} disabled={order.status !== "pending"}>
                              <Package className="h-4 w-4 mr-2 text-blue-500" /> Process
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              setCurrentOrder(order as OrderWithItems);
                              handleUpdateStatus("shipped");
                            }} disabled={order.status !== "processing"}>
                              <Truck className="h-4 w-4 mr-2 text-purple-500" /> Ship
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              setCurrentOrder(order as OrderWithItems);
                              handleUpdateStatus("delivered");
                            }} disabled={order.status !== "shipped"}>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Mark Delivered
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              setCurrentOrder(order as OrderWithItems);
                              handleUpdateStatus("cancelled");
                            }} disabled={order.status === "delivered" || order.status === "cancelled"} className="text-red-600">
                              <XCircle className="h-4 w-4 mr-2" /> Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            {ordersData && (
              <p className="text-sm text-gray-500">
                Showing {ordersData.orders.length} of {ordersData.pagination?.total || ordersData.orders.length} orders
              </p>
            )}
          </div>
          
          {ordersData && ordersData.pagination && ordersData.pagination.totalPages > 1 && (
            <Pagination
              totalPages={ordersData.pagination.totalPages}
              currentPage={page}
              onPageChange={setPage}
            />
          )}
        </CardFooter>
      </Card>
      
      {/* Order Detail Modal */}
      <Dialog open={showOrderDetail} onOpenChange={(open) => {
        if (!open) setShowOrderDetail(false);
      }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order #{currentOrder?.id}</DialogTitle>
          </DialogHeader>
          
          {currentOrder ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getOrderStatusIcon(currentOrder.status)}
                  <span className="font-medium">
                    Status: {getOrderStatusBadge(currentOrder.status)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-gray-500" />
                  <span>
                    {typeof currentOrder.createdAt === 'string' 
                      ? `${new Date(currentOrder.createdAt).toLocaleDateString()} at ${new Date(currentOrder.createdAt).toLocaleTimeString()}`
                      : currentOrder.createdAt instanceof Date 
                        ? `${currentOrder.createdAt.toLocaleDateString()} at ${currentOrder.createdAt.toLocaleTimeString()}`
                        : 'Date unavailable'}
                  </span>
                </div>
              </div>
              
              <Tabs defaultValue="items">
                <TabsList className="mb-4">
                  <TabsTrigger value="items">Order Items</TabsTrigger>
                  <TabsTrigger value="customer">Customer Info</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                </TabsList>
                
                <TabsContent value="items">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentOrder.items?.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  className="h-12 w-12 object-cover rounded"
                                />
                                <span>{item.product.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{formatCurrency(Number(item.price))}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(Number(item.price) * item.quantity)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="mt-4 space-y-2 text-right">
                    <div className="flex justify-end">
                      <div className="w-60">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(Number(currentOrder.total) * 0.9)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax (10%):</span>
                          <span>{formatCurrency(Number(currentOrder.total) * 0.1)}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t mt-2">
                          <span>Total:</span>
                          <span>{formatCurrency(Number(currentOrder.total))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="customer">
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-2">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p>
                          {currentOrder.shippingAddress.firstName}{" "}
                          {currentOrder.shippingAddress.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p>{currentOrder.shippingAddress.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">User ID</p>
                        <p>{currentOrder.userId}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="shipping">
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-2">Shipping Address</h3>
                    <p>
                      {currentOrder.shippingAddress.firstName}{" "}
                      {currentOrder.shippingAddress.lastName}
                    </p>
                    <p>{currentOrder.shippingAddress.address}</p>
                    <p>
                      {currentOrder.shippingAddress.city},{" "}
                      {currentOrder.shippingAddress.state}{" "}
                      {currentOrder.shippingAddress.zipCode}
                    </p>
                    <p>{currentOrder.shippingAddress.country}</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="payment">
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-2">Payment Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="capitalize">{currentOrder.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Status</p>
                        <Badge variant={currentOrder.paymentStatus === "paid" ? "outline" : "secondary"} className={
                          currentOrder.paymentStatus === "paid" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-amber-100 text-amber-800"
                        }>
                          {currentOrder.paymentStatus.charAt(0).toUpperCase() + currentOrder.paymentStatus.slice(1)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Paid</p>
                        <p>{formatCurrency(Number(currentOrder.total))}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-4">Update Order Status</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                    disabled={
                      currentOrder.status === "pending" ||
                      isUpdatingStatus
                    }
                    onClick={() => handleUpdateStatus("pending")}
                  >
                    <Package className="h-4 w-4 mr-2" /> Pending
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                    disabled={
                      currentOrder.status === "processing" ||
                      (currentOrder.status !== "pending" && currentOrder.status !== "shipped") ||
                      isUpdatingStatus
                    }
                    onClick={() => handleUpdateStatus("processing")}
                  >
                    <Package className="h-4 w-4 mr-2" /> Processing
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-purple-50 text-purple-700 hover:bg-purple-100"
                    disabled={
                      currentOrder.status === "shipped" ||
                      currentOrder.status !== "processing" ||
                      isUpdatingStatus
                    }
                    onClick={() => handleUpdateStatus("shipped")}
                  >
                    <Truck className="h-4 w-4 mr-2" /> Shipped
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-green-50 text-green-700 hover:bg-green-100"
                    disabled={
                      currentOrder.status === "delivered" ||
                      currentOrder.status !== "shipped" ||
                      isUpdatingStatus
                    }
                    onClick={() => handleUpdateStatus("delivered")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Delivered
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-red-50 text-red-700 hover:bg-red-100"
                    disabled={
                      currentOrder.status === "cancelled" ||
                      currentOrder.status === "delivered" ||
                      isUpdatingStatus
                    }
                    onClick={() => handleUpdateStatus("cancelled")}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Cancelled
                  </Button>
                </div>
                
                {currentOrder.status === "delivered" && (
                  <Alert className="mt-4 bg-green-50 text-green-800 border-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      This order has been delivered and completed.
                    </AlertDescription>
                  </Alert>
                )}
                
                {currentOrder.status === "cancelled" && (
                  <Alert className="mt-4 bg-red-50 text-red-800 border-red-200">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      This order has been cancelled.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4">Loading order details...</p>
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setShowOrderDetail(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;
