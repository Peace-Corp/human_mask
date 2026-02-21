"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";
import "swiper/css";

interface ProductCarouselProps {
  products: Product[];
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
  const sectionRef = useScrollReveal<HTMLElement>({ y: 40, duration: 0.7 });
  const titleRef = useScrollReveal<HTMLHeadingElement>({
    y: 20,
    duration: 0.5,
    delay: 0.15,
  });

  if (products.length === 0) return null;

  return (
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
  );
}
