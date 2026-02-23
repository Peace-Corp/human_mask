import HeroCarousel from "@/components/HeroCarousel";
import HomeContent from "@/components/HomeContent";
import BannerPopupModal from "@/components/BannerPopupModal";
import {
  getProducts,
  getHeroBanners,
  getBrandOrderDetailImage,
  getAllProductVariants,
} from "@/lib/fetchers";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, banners, orderDetailImage] = await Promise.all([
    getProducts(),
    getHeroBanners(),
    getBrandOrderDetailImage(),
  ]);

  const variants = await getAllProductVariants(products.map((p) => p.id));

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <HeroCarousel banners={banners} />

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
        <HomeContent
          products={products}
          variants={variants}
          orderDetailImage={orderDetailImage}
        />
      </div>

      {orderDetailImage && <BannerPopupModal imageUrl={orderDetailImage} />}
    </div>
  );
}
