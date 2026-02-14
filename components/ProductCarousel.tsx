"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";

const PRODUCT_COUNT = 6;

export default function ProductCarousel() {
  return (
    <section className="py-6 md:py-10">
      <h2 className="mb-4 text-center font-bmk text-base font-bold md:mb-6 md:text-lg">
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
            navigation={{
              prevEl: ".product-prev",
              nextEl: ".product-next",
            }}
            breakpoints={{
              640: { slidesPerView: 4, spaceBetween: 14 },
              768: { slidesPerView: 5, spaceBetween: 16 },
            }}
          >
            {Array.from({ length: PRODUCT_COUNT }).map((_, i) => (
              <SwiperSlide key={i}>
                <button
                  className="w-full rounded bg-gray-100 transition-shadow hover:shadow-md"
                  style={{ aspectRatio: "0.7 / 1" }}
                >
                  <span className="text-[10px] text-neutral-400">
                    상품 {i + 1}
                  </span>
                </button>
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
