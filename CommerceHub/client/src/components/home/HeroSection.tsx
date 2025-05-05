import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Summer Sale is Live</h1>
            <p className="text-xl mb-6">
              Up to 50% off on all summer essentials. Limited time offer!
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products?onSale=true">
                <Button className="bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition">
                  Shop Now
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" className="bg-transparent border border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-primary transition">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
              alt="Summer Sale"
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
