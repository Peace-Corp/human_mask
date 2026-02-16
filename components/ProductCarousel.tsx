"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import ProductCard from "@/components/ProductCard";
import "swiper/css";

const MOCK_PRODUCTS = [
  { id: 1, name: "사람의 탈 티셔츠 (블랙)", price: 30000 },
  { id: 2, name: "사람의 탈 티셔츠 (화이트)", price: 30000 },
  { id: 3, name: "사람의 탈 후드 (블랙)", price: 45000 },
  { id: 4, name: "사람의 탈 모자", price: 20000 },
  { id: 5, name: "사람의 탈 에코백", price: 15000 },
  { id: 6, name: "사람의 탈 스티커 세트", price: 5000 },
];

export default function ProductCarousel() {
  const sectionRef = useScrollReveal<HTMLElement>({ y: 40, duration: 0.7 });
  const titleRef = useScrollReveal<HTMLHeadingElement>({
    y: 20,
    duration: 0.5,
    delay: 0.15,
  });

  return (
    <section ref={sectionRef} className="py-6 md:py-10">
      <h2
        ref={titleRef}
        className="mb-4 text-center font-bmk text-base font-bold md:mb-6 md:text-lg"
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
            loop
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
            {MOCK_PRODUCTS.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
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
