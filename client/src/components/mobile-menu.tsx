import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";

interface MobileMenuProps {
  onClose: () => void;
}

export default function MobileMenu({ onClose }: MobileMenuProps) {
  const [location] = useLocation();
  const { user, login, logout } = useAuth();
  
  const isActive = (path: string) => location === path;
  
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
      </div>
    </div>
  );
}
