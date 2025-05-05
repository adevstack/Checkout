import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export function ResetProducts() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { user } = useAuth();

  if (!user?.isAdmin) {
    return null;
  }

  const handleResetProducts = async () => {
    if (!confirm("Are you sure you want to reset all products? This will delete existing products and add new demo products.")) {
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await apiRequest("/api/admin/reset-products", "POST");
      
      console.log("Reset products response:", response);
      
      // Invalidate product cache to force refetch
      await queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      setResult("Products have been reset successfully! The page will reload with the updated products.");
      
      // Reload after a short delay to show the success message
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error resetting products:", error);
      setResult("Error resetting products. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 mb-6 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Product Data Management</h2>
      <p className="mb-4 text-gray-700 dark:text-gray-300">
        Reset and reseed the product database with demo products across multiple categories.
      </p>
      <button
        onClick={handleResetProducts}
        disabled={loading}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Reset Products"}
      </button>
      
      {result && (
        <p className={`mt-4 p-3 rounded ${result.includes('Error') ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'}`}>
          {result}
        </p>
      )}
    </div>
  );
}