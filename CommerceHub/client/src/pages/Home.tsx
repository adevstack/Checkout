import HeroSection from "@/components/home/HeroSection";
import CategoryNav from "@/components/home/CategoryNav";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PromoSection from "@/components/home/PromoSection";
import NewArrivals from "@/components/home/NewArrivals";
import Testimonials from "@/components/home/Testimonials";
import NewsletterSignup from "@/components/home/NewsletterSignup";
import { Helmet } from "react-helmet";

const Home = () => {
  return (
    <div>
      <Helmet>
        <title>ShopEase - Online Shopping Made Easy</title>
        <meta name="description" content="Shop the latest products with great deals and discounts. Fast shipping and excellent customer service." />
      </Helmet>
      
      <HeroSection />
      <CategoryNav />
      <FeaturedProducts />
      <PromoSection />
      <NewArrivals />
      <Testimonials />
      <NewsletterSignup />
    </div>
  );
};

export default Home;
