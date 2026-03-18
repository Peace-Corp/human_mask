"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import type { Product, ProductVariant } from "@/lib/types";
import "swiper/css";

interface ProductCarouselProps {
  products: Product[];
  variants: ProductVariant[];
}

export default function ProductCarousel({ products, variants }: ProductCarouselProps) {
  const router = useRouter();
  const sectionRef = useScrollReveal<HTMLElement>({ y: 40, duration: 0.7 });
  const titleRef = useScrollReveal<HTMLHeadingElement>({
    y: 20,
    duration: 0.5,
    delay: 0.15,
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const selectedVariants = useMemo(() => {
    if (!selectedProduct) return [];
    return variants.filter((v) => v.product_id === selectedProduct.id);
  }, [selectedProduct, variants]);

  const handleAddedToCart = () => {
    setSelectedProduct(null);
    setShowConfirmation(true);
  };

  if (products.length === 0) return null;

  return (
    <>
      <section ref={sectionRef} className="py-6 md:py-10">
        <h2
          ref={titleRef}
          className="mb-4 text-center text-base font-bold md:mb-6 md:text-lg"
        >
          제품 구성
        </h2>

        <div className="relative flex items-center px-2 md:px-4">
          {/* Left arrow */}
          <button
            className="product-prev shrink-0 text-neutral-400 hover:text-neutral-700"
            aria-label="이전 상품"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          {/* Swiper product list */}
          <div className="min-w-0 flex-1 px-2 md:px-3">
            <Swiper
              modules={[Navigation]}
              slidesPerView={3}
              spaceBetween={12}
              loop={products.length > 3}
              grabCursor
              navigation={{
                prevEl: ".product-prev",
                nextEl: ".product-next",
              }}
              breakpoints={{
                640: { slidesPerView: 4, spaceBetween: 14 },
                768: { slidesPerView: 5, spaceBetween: 16 },
              }}
            >
              {products.map((product) => (
                <SwiperSlide key={product.id}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.images[0] ?? null}
                    onClick={() => setSelectedProduct(product)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Right arrow */}
          <button
            className="product-next shrink-0 text-neutral-400 hover:text-neutral-700"
            aria-label="다음 상품"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>
      </section>

      {/* Product detail modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          variants={selectedVariants}
          open={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddedToCart={handleAddedToCart}
        />
      )}

      {/* Added to cart confirmation */}
      {showConfirmation && (
        <>
          <div
            className="fixed inset-0 z-60 bg-black/50"
            onClick={() => setShowConfirmation(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-60 w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white px-5 py-6 shadow-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black">
                <Check className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm">장바구니에 담겼습니다</p>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 rounded-full border border-neutral-300 py-2.5 text-xs transition-colors hover:bg-neutral-50"
              >
                계속 쇼핑하기
              </button>
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  router.push("/cart");
                }}
                className="flex-1 rounded-full bg-black py-2.5 text-xs text-white transition-opacity hover:opacity-80"
              >
                장바구니로 이동
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
