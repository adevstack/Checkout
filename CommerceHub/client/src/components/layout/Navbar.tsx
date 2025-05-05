import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, Heart, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileMenu from "./MobileMenu";
import CartDrawer from "./CartDrawer";

const Navbar = () => {
  const auth = useAuth();
  const cart = useCart();

  const isAuthenticated = auth.isAuthenticated;
  const user = auth.user;
  const logout = auth.logout;
  const cartCount = cart.cartCount;
  const toggleCart = cart.toggleCart;

  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Calculate wishlist count (can expand this with a proper wishlist context)
  const wishlistCount = 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Link href="/" className="text-2xl font-bold text-foreground dark:text-white flex items-center">
                <ShoppingCart className="mr-2" />
                ShopEase
              </Link>
            </div>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative w-full">
                  <Input
                    type="text"
                    placeholder="Search for products, brands..."
                    className="w-full pl-10 pr-4 py-2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    <Search size={18} />
                  </span>
                </div>
              </form>
            </div>

            {/* Navigation Links & Icons */}
            <nav className="flex items-center space-x-8">
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/products" className="text-gray-800 dark:text-gray-200 hover:text-primary font-medium">
                  Shop
                </Link>
                <Link href="/products?category=all" className="text-gray-800 dark:text-gray-200 hover:text-primary font-medium">
                  Categories
                </Link>
                <Link href="/products?onSale=true" className="text-gray-800 dark:text-gray-200 hover:text-primary font-medium">
                  Deals
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleCart}
                  className="text-gray-800 dark:text-white hover:text-primary relative"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="text-xl h-6 w-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>

                <button
                  className="text-gray-800 dark:text-white hover:text-primary relative"
                  aria-label="Wishlist"
                >
                  <Heart className="text-xl h-6 w-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                {isAuthenticated ? (
                  <div className="relative group">
                    <button className="text-gray-800 dark:text-white hover:text-primary" aria-label="User account">
                      <User className="text-xl h-6 w-6" />
                    </button>
                    <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Account
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Orders
                      </Link>
                      {user?.role === "admin" && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          toast({
                            title: "Logged out",
                            description: "You have been logged out successfully"
                          });
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link href="/login">
                    <button className="text-gray-800 dark:text-white hover:text-primary" aria-label="Sign in">
                      <User className="text-xl h-6 w-6" />
                    </button>
                  </Link>
                )}

                <button
                  onClick={toggleMobileMenu}
                  className="md:hidden text-gray-800 dark:text-gray-200"
                  aria-label="Menu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </nav>
          </div>

          {/* Search Bar (Mobile) */}
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch}>
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <Search size={18} />
                </span>
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={showMobileMenu} onClose={toggleMobileMenu} />

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
};

export default Navbar;