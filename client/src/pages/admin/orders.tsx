import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Order } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Eye,
  Package,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpDown,
} from "lucide-react";

export default function AdminOrders() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<keyof Order>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // State for order details modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!user || !user.isAdmin) {
      setLocation("/");
    }
  }, [user, navigate]);

  // Fetch orders
  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user && user.isAdmin,
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PUT", `/api/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
      console.error("Update order status error:", error);
    },
  });

  // Filter and sort orders
  const filteredOrders = orders
    ? orders
        .filter(
          (order) =>
            (searchTerm === "" ||
              order.id.toString().includes(searchTerm) ||
              order.shippingAddress.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (statusFilter === "" || order.status.toLowerCase() === statusFilter.toLowerCase())
        )
        .sort((a, b) => {
          const aValue = a[sortField];
          const bValue = b[sortField];

          if (typeof aValue === "string" && typeof bValue === "string") {
            return sortDirection === "asc"
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          }

          // For numbers and dates
          if (
            (typeof aValue === "number" && typeof bValue === "number") ||
            (aValue instanceof Date && bValue instanceof Date)
          ) {
            return sortDirection === "asc"
              ? Number(aValue) - Number(bValue)
              : Number(bValue) - Number(aValue);
          }

          return 0;
        })
    : [];

  // Handle sort toggle
  const toggleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Handle status change
  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateOrderStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  // View order details
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "pending":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-blue-500" />;
      case "processing":
        return <Package className="h-5 w-5 text-yellow-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-orange-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user || !user.isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Order Management
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            View and manage customer orders
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Input
            placeholder="Search by order ID or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <div className="flex-1 sm:flex-none sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:border-gray-600 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <div className="grid grid-cols-6 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="px-6 py-3">
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-6 px-6 py-4">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="px-1">
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <Skeleton className="h-8 w-20 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400">
          Error loading orders. Please try again.
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No orders found. {searchTerm || statusFilter ? "Try adjusting your filters." : ""}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("id")}
                    className="flex items-center px-0 font-semibold"
                  >
                    Order ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("createdAt")}
                    className="flex items-center px-0 font-semibold"
                  >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("total")}
                    className="flex items-center px-0 font-semibold"
                  >
                    Total
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => toggleSort("status")}
                    className="flex items-center px-0 font-semibold"
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <div className="truncate max-w-xs">
                      {order.shippingAddress.split(",")[0]}
                    </div>
                  </TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span
                        className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center space-x-4 justify-end">
                      <Select
                        onValueChange={(value) =>
                          handleStatusChange(order.id, value)
                        }
                        defaultValue={order.status.toLowerCase()}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewOrderDetails(order)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Details Modal */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id} Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Order Information
                  </h3>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <p>Date: {formatDate(selectedOrder.createdAt)}</p>
                    <p>Status: {selectedOrder.status}</p>
                    <p>Total: ${selectedOrder.total.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Shipping Address
                  </h3>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <p>{selectedOrder.shippingAddress}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Items
                </h3>
                {/* This would ideally display order items, but we would need to fetch order details */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 text-center text-gray-500 dark:text-gray-400">
                  <p>
                    To view order items, you would need to fetch the order details from the API.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsOrderDetailsOpen(false)}
                >
                  Close
                </Button>
                <Select
                  onValueChange={(value) =>
                    handleStatusChange(selectedOrder.id, value)
                  }
                  defaultValue={selectedOrder.status.toLowerCase()}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
