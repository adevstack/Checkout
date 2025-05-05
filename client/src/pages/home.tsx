import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product-card";
import { Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const featuredProducts = products?.slice(0, 4) || [];

  return (
    <main>
      {/* Hero section */}
      <div className="relative bg-gray-900">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da" 
            alt="Hero background" 
            className="w-full h-full object-cover opacity-40" 
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Summer Collection
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl">
            Discover our latest arrivals with up to 50% off. Limited time offer on selected items.
          </p>
          <div className="mt-10">
            <Link to="/products">
              <Button size="lg" className="font-bold">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured categories */}
      <div className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-baseline sm:justify-between">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Shop by Category
            </h2>
            <Link to="/products" className="hidden text-sm font-semibold text-primary hover:text-primary-dark sm:block">
              Browse all categories<span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-x-6 lg:gap-8">
            <div className="group aspect-w-2 aspect-h-1 rounded-lg overflow-hidden sm:aspect-h-1 sm:aspect-w-1 sm:row-span-2">
              <img 
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e" 
                alt="Electronics category" 
                className="object-center object-cover group-hover:opacity-75" 
              />
              <div aria-hidden="true" className="bg-gradient-to-b from-transparent to-black opacity-50"></div>
              <div className="p-6 flex items-end">
                <div>
                  <h3 className="font-semibold text-white">
                    <Link to="/products?category=Electronics">
                      <span className="absolute inset-0"></span>
                      Electronics
                    </Link>
                  </h3>
                  <p aria-hidden="true" className="mt-1 text-sm text-white">Shop now</p>
                </div>
              </div>
            </div>
            <div className="group aspect-w-2 aspect-h-1 rounded-lg overflow-hidden sm:relative sm:aspect-none sm:h-full">
              <img 
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff" 
                alt="Fashion category" 
                className="object-center object-cover group-hover:opacity-75 sm:absolute sm:inset-0 sm:w-full sm:h-full" 
              />
              <div aria-hidden="true" className="bg-gradient-to-b from-transparent to-black opacity-50 sm:absolute sm:inset-0"></div>
              <div className="p-6 flex items-end sm:absolute sm:inset-0">
                <div>
                  <h3 className="font-semibold text-white">
                    <Link to="/products?category=Fashion">
                      <span className="absolute inset-0"></span>
                      Fashion
                    </Link>
                  </h3>
                  <p aria-hidden="true" className="mt-1 text-sm text-white">Shop now</p>
                </div>
              </div>
            </div>
            <div className="group aspect-w-2 aspect-h-1 rounded-lg overflow-hidden sm:relative sm:aspect-none sm:h-full">
              <img 
                src="https://images.unsplash.com/photo-1511556532299-8f662fc26c06" 
                alt="Home & Living category" 
                className="object-center object-cover group-hover:opacity-75 sm:absolute sm:inset-0 sm:w-full sm:h-full" 
              />
              <div aria-hidden="true" className="bg-gradient-to-b from-transparent to-black opacity-50 sm:absolute sm:inset-0"></div>
              <div className="p-6 flex items-end sm:absolute sm:inset-0">
                <div>
                  <h3 className="font-semibold text-white">
                    <Link to="/products?category=Home">
                      <span className="absolute inset-0"></span>
                      Home & Living
                    </Link>
                  </h3>
                  <p aria-hidden="true" className="mt-1 text-sm text-white">Shop now</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:hidden">
            <Link to="/products" className="block text-sm font-semibold text-primary hover:text-primary-dark">
              Browse all categories<span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured products */}
      <div className="bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-baseline sm:justify-between">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Featured Products
            </h2>
            <Link to="/products" className="hidden text-sm font-semibold text-primary hover:text-primary-dark sm:block">
              View all products<span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {isLoading ? (
              // Skeleton loaders for products
              Array(4).fill(0).map((_, index) => (
                <div key={index} className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-lg" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ))
            ) : (
              featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>

          <div className="mt-8 sm:hidden">
            <Link to="/products" className="block text-sm font-semibold text-primary hover:text-primary-dark">
              View all products<span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white text-center">
            What our customers say
          </h2>

          <div className="mt-12 space-y-10 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8">
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330" 
                    alt="Customer profile" 
                    className="h-full w-full object-cover" 
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Sarah Johnson</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "The quality of products exceeded my expectations. Fast shipping and excellent customer service. I'll definitely shop here again!"
              </p>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" 
                    alt="Customer profile" 
                    className="h-full w-full object-cover" 
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Michael Thompson</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(4)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" fillOpacity="0.5" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "Great selection of products at competitive prices. The website is easy to navigate and checkout process is smooth. Will recommend to friends."
              </p>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb" 
                    alt="Customer profile" 
                    className="h-full w-full object-cover" 
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Emily Rodriguez</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "Absolutely love the customer service! Had an issue with my order and they resolved it immediately. The products are high quality and arrived earlier than expected."
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
