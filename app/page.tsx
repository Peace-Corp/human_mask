import HeroCarousel from "@/components/HeroCarousel";
import ProductCarousel from "@/components/ProductCarousel";
import Footer from "@/components/Footer";
import ProductBannerSection from "@/components/ProductBannerSection";
import { getProducts, getHeroBanners, getBrandOrderDetailImage, getAllProductVariants } from "@/lib/fetchers";
import OrderModal from "@/components/OrderModal";

export default async function Home() {
  const [products, banners, orderDetailImage] = await Promise.all([
    getProducts(),
    getHeroBanners(),
    getBrandOrderDetailImage(),
  ]);

  const variants = await getAllProductVariants(products.map((p) => p.id));

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Hero area — full width, background color driven by active slide */}
      <HeroCarousel banners={banners} />

      {/* Content area — constrained width */}
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
        <main className="flex flex-1 flex-col">
          {/* Product Lineup */}
          <ProductCarousel products={products} variants={variants} />

          {/* Product Banner */}
          {orderDetailImage && <ProductBannerSection imageUrl={orderDetailImage} />}
        </main>

        <Footer />
      </div>

      {/* Floating order button + modal */}
      <OrderModal products={products} variants={variants} />
    </div>
  );
}
