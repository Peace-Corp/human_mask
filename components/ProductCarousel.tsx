"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import gsap from "gsap";
import "swiper/css";

const PRODUCT_COUNT = 6;

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
            {Array.from({ length: PRODUCT_COUNT }).map((_, i) => (
              <SwiperSlide key={i}>
                <div
                  className="w-full cursor-pointer rounded bg-gray-100"
                  style={{ aspectRatio: "0.7 / 1" }}
                  onMouseEnter={(e) => {
                    gsap.to(e.currentTarget, {
                      scale: 1.03,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      duration: 0.25,
                      ease: "power2.out",
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.currentTarget, {
                      scale: 1,
                      boxShadow: "0 0 0 rgba(0,0,0,0)",
                      duration: 0.25,
                      ease: "power2.out",
                    });
                  }}
                >
                  <span className="text-[10px] text-neutral-400">
                    상품 {i + 1}
                  </span>
                </div>
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
