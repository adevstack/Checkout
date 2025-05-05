import { Link } from "wouter";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully"
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="bg-white w-64 h-full overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button onClick={onClose} className="text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-4">
            <li>
              <Link href="/" onClick={onClose} className="block p-2 hover:bg-gray-100 rounded">
                Home
              </Link>
            </li>
            <li>
              <Link href="/products" onClick={onClose} className="block p-2 hover:bg-gray-100 rounded">
                Shop
              </Link>
            </li>
            <li>
              <Link href="/products" onClick={onClose} className="block p-2 hover:bg-gray-100 rounded">
                Categories
              </Link>
            </li>
            <li>
              <Link href="/products?onSale=true" onClick={onClose} className="block p-2 hover:bg-gray-100 rounded">
                Deals
              </Link>
            </li>

            {isAuthenticated && (
              <>
                <li>
                  <Link href="/profile" onClick={onClose} className="block p-2 hover:bg-gray-100 rounded">
                    My Account
                  </Link>
                </li>
                <li>
                  <Link href="/profile" onClick={onClose} className="block p-2 hover:bg-gray-100 rounded">
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link href="#" onClick={onClose} className="block p-2 hover:bg-gray-100 rounded">
                    Wishlist
                  </Link>
                </li>
                {user?.role === "admin" && (
                  <li>
                    <Link href="/admin" onClick={onClose} className="block p-2 hover:bg-gray-100 rounded">
                      Admin Dashboard
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          {isAuthenticated ? (
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              Log Out
            </Button>
          ) : (
            <>
              <Link href="/login" onClick={onClose}>
                <Button className="w-full bg-primary text-white">Sign In</Button>
              </Link>
              <p className="text-center mt-2 text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/register" onClick={onClose} className="text-primary">
                  Sign Up
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;