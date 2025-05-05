import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const PromoSection = () => {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1511556532299-8f662fc26c06"
              alt="Electronics Sale"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-800/70 to-transparent flex items-center">
              <div className="p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Electronics Sale</h3>
                <p className="mb-4">Up to 40% off on selected items</p>
                <Link href="/products?category=electronics&onSale=true">
                  <Button className="inline-block bg-white text-blue-600 px-4 py-2 rounded-lg font-medium">
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77"
              alt="Fashion Collection"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-800/70 to-transparent flex items-center">
              <div className="p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Summer Collection</h3>
                <p className="mb-4">New arrivals for the season</p>
                <Link href="/products?category=fashion&isNew=true">
                  <Button className="inline-block bg-white text-emerald-600 px-4 py-2 rounded-lg font-medium">
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
