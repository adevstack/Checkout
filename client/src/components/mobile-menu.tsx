import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme-provider";
import { Moon, Sun } from "lucide-react";
import { Link, useLocation } from "wouter";

interface MobileMenuProps {
  onClose: () => void;
}

export default function MobileMenu({ onClose }: MobileMenuProps) {
  const [location] = useLocation();
  const { user, login, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const isActive = (path: string) => location === path;
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  const handleLoginAsUser = () => {
    login({ email: "user@example.com", password: "user123" });
    onClose();
  };

  const handleLoginAsAdmin = () => {
    login({ email: "admin@example.com", password: "admin123" });
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="sm:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="pt-2 pb-3 space-y-1">
        <Link
          to="/"
          onClick={onClose}
          className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
            isActive("/")
              ? "bg-primary-50 dark:bg-gray-700 border-primary text-primary dark:text-white"
              : "border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          Home
        </Link>
        <Link
          to="/products"
          onClick={onClose}
          className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
            isActive("/products")
              ? "bg-primary-50 dark:bg-gray-700 border-primary text-primary dark:text-white"
              : "border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          Products
        </Link>
        {user && !user.isAdmin && (
          <Link
            to="/orders"
            onClick={onClose}
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive("/orders")
                ? "bg-primary-50 dark:bg-gray-700 border-primary text-primary dark:text-white"
                : "border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            My Orders
          </Link>
        )}
        {user && user.isAdmin && (
          <Link
            to="/admin/dashboard"
            onClick={onClose}
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive("/admin/dashboard")
                ? "bg-primary-50 dark:bg-gray-700 border-primary text-primary dark:text-white"
                : "border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Dashboard
          </Link>
        )}
      </div>
      <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
        {!user ? (
          <div className="space-y-1">
            <button
              onClick={handleLoginAsUser}
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left"
            >
              Login as User
            </button>
            <button
              onClick={handleLoginAsAdmin}
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left"
            >
              Login as Admin
            </button>
            <Link
              to="/login"
              onClick={onClose}
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Custom Login
            </Link>
            <Link
              to="/register"
              onClick={onClose}
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Register
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="block pl-3 pr-4 py-2 text-base font-medium text-gray-900 dark:text-white">
              {user.username}
            </div>
            <Link
              to="/profile"
              onClick={onClose}
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Profile
            </Link>
            <Link
              to="/settings"
              onClick={onClose}
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left"
            >
              Logout
            </button>
          </div>
        )}
        
        {/* Theme Toggle Button */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleTheme}
            className="flex items-center pl-3 pr-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full"
          >
            <div className="flex items-center">
              {theme === "dark" ? (
                <>
                  <Sun className="h-5 w-5 mr-3 text-yellow-500" />
                  <span>Switch to Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5 mr-3 text-indigo-500" />
                  <span>Switch to Dark Mode</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
