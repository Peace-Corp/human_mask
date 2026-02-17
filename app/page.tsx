import HeroCarousel from "@/components/HeroCarousel";
import ProductCarousel from "@/components/ProductCarousel";
import Footer from "@/components/Footer";
import LogoSection from "@/components/LogoSection";
import { getProducts, getHeroBanners } from "@/lib/fetchers";

export default async function Home() {
  const [products, banners] = await Promise.all([
    getProducts(),
    getHeroBanners(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Hero area — full width, background color driven by active slide */}
      <HeroCarousel banners={banners} />

      {/* Content area — constrained width */}
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
        <main className="flex flex-1 flex-col">
          {/* Product Lineup */}
          <ProductCarousel products={products} />

          {/* Logo Section */}
          <LogoSection />
        </main>

        <Footer />
      </div>
    </div>
  );
}
