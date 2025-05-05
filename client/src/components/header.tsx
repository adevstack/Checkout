import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Search } from "lucide-react";
import { ThemeToggle } from "./ui/theme-toggle";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useMobile } from "@/hooks/use-mobile";
import CartSidebar from "./cart";
import SearchDialog from "./search-dialog";
import UserDropdown from "./user-dropdown";
import MobileMenu from "./mobile-menu";

export default function Header() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { cartItems } = useCart();
  const isMobile = useMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and main nav */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="font-bold text-xl">
                  <span className="text-primary">Shop</span>
                  <span className="text-secondary">Ease</span>
                </Link>
              </div>
              
              {/* Desktop Nav */}
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8" aria-label="Main Navigation">
                <Link
                  to="/"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/")
                      ? "border-primary text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive("/products")
                      ? "border-primary text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
                  }`}
                >
                  Products
                </Link>
                {user && !user.isAdmin && (
                  <Link
                    to="/orders"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive("/orders")
                        ? "border-primary text-gray-900 dark:text-white"
                        : "border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
                    }`}
                  >
                    My Orders
                  </Link>
                )}
                {user && user.isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive("/admin/dashboard")
                        ? "border-primary text-gray-900 dark:text-white"
                        : "border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
                    }`}
                  >
                    Dashboard
                  </Link>
                )}
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center">
              {/* Search */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSearchOpen(true)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>

              {/* Dark mode toggle */}
              <ThemeToggle />

              {/* Cart */}
              <div className="ml-4 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCartOpen(true)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartItemsCount}
                    </Badge>
                  )}
                  <span className="sr-only">View cart</span>
                </Button>
              </div>

              {/* User dropdown */}
              <div className="ml-3 relative">
                <UserDropdown />
              </div>

              {/* Mobile menu button */}
              {isMobile && (
                <div className="-mr-2 flex items-center sm:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <span className="sr-only">Open main menu</span>
                    {mobileMenuOpen ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && <MobileMenu onClose={() => setMobileMenuOpen(false)} />}
      </header>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Cart Sidebar */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
