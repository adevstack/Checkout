import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Category } from "@shared/schema";
import {
  Smartphone,
  ShoppingBag,
  Home,
  Heart,
  Dumbbell,
  Baby,
  Utensils,
} from "lucide-react";

const CategoryNav = () => {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'electronics':
        return <Smartphone className="text-2xl text-primary" />;
      case 'fashion':
        return <ShoppingBag className="text-2xl text-primary" />;
      case 'home':
        return <Home className="text-2xl text-primary" />;
      case 'health':
        return <Heart className="text-2xl text-primary" />;
      case 'sports':
        return <Dumbbell className="text-2xl text-primary" />;
      case 'kids':
        return <Baby className="text-2xl text-primary" />;
      case 'kitchen':
        return <Utensils className="text-2xl text-primary" />;
      default:
        return <ShoppingBag className="text-2xl text-primary" />;
    }
  };

  // Fallback data in case API call fails
  const fallbackCategories = [
    { id: 1, name: "Electronics", slug: "electronics", icon: "mobile-alt" },
    { id: 2, name: "Fashion", slug: "fashion", icon: "tshirt" },
    { id: 3, name: "Home", slug: "home", icon: "home" },
    { id: 4, name: "Health", slug: "health", icon: "heartbeat" },
    { id: 5, name: "Sports", slug: "sports", icon: "dumbbell" },
    { id: 6, name: "Kids", slug: "kids", icon: "baby" },
    { id: 7, name: "Kitchen", slug: "kitchen", icon: "utensils" },
  ];

  const displayCategories = categories || fallbackCategories;

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 space-x-6 scrollbar-hide">
          {displayCategories.map((category) => (
            <Link key={category.id} href={`/products?category=${category.slug}`}>
              <div className="text-center flex-shrink-0 cursor-pointer">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  {getCategoryIcon(category.slug)}
                </div>
                <p className="text-sm font-medium">{category.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryNav;
