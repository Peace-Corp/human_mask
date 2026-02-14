"use client";

import { useState, useRef, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";
import "swiper/css";

const SLIDES = [
  { label: "배너 이미지 1", bgColor: "#E8D44D" },
  { label: "배너 이미지 2", bgColor: "#4DA8E8" },
  { label: "배너 이미지 3", bgColor: "#E85A4D" },
  { label: "배너 이미지 4", bgColor: "#6B4DE8" },
  { label: "배너 이미지 5", bgColor: "#6B4DE7" },
  { label: "배너 이미지 6", bgColor: "#6B4DE4" },
  { label: "배너 이미지 7", bgColor: "#6B4DE2" },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const bgRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const handleSlideChange = useCallback(
    (swiper: { realIndex: number }) => {
      const newIndex = swiper.realIndex;
      const oldIndex = current;
      setCurrent(newIndex);

      // Animate background color
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          backgroundColor: SLIDES[newIndex].bgColor,
          duration: 0.6,
          ease: "power2.inOut",
        });
      }

      // Animate dots: shrink old, bounce new
      if (dotRefs.current[oldIndex]) {
        gsap.to(dotRefs.current[oldIndex], { scale: 1, duration: 0.3 });
      }
      if (dotRefs.current[newIndex]) {
        gsap.fromTo(
          dotRefs.current[newIndex],
          { scale: 1 },
          { scale: 1.4, duration: 0.4, ease: "elastic.out(1, 0.5)" }
        );
        gsap.to(dotRefs.current[newIndex], {
          scale: 1,
          duration: 0.3,
          delay: 0.4,
        });
      }
    },
    [current]
  );

  return (
    <section className="relative w-full pt-14">
      {/* Background — fills width, ~60% height, color animated via GSAP */}
      <div
        ref={bgRef}
        className="absolute inset-x-0 top-0 h-[60%]"
        style={{ backgroundColor: SLIDES[0].bgColor }}
      />

      <div className="relative">
        {/* Swiper carousel */}
        <div className="relative overflow-hidden">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            slidesPerView={1.8}
            centeredSlides
            spaceBetween={32}
            loop
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            navigation={{
              prevEl: ".hero-prev",
              nextEl: ".hero-next",
            }}
            onSlideChange={handleSlideChange}
          >
            {SLIDES.map((slide, i) => (
              <SwiperSlide key={i}>
                <div
                  className="flex items-center justify-center bg-gray-200"
                  style={{ aspectRatio: "1.7 / 1" }}
                >
                  <span className="text-xs text-neutral-400">
                    {slide.label}
                  </span>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Arrow buttons */}
          <button
            className="hero-prev absolute left-[22%] top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            aria-label="이전 슬라이드"
          >
            <ChevronLeft className="h-7 w-7 md:h-9 md:w-9" />
          </button>
          <button
            className="hero-next absolute right-[22%] top-1/2 z-10 translate-x-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            aria-label="다음 슬라이드"
          >
            <ChevronRight className="h-7 w-7 md:h-9 md:w-9" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5 py-3 md:py-4">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              ref={(el) => { dotRefs.current[i] = el; }}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === current ? "bg-neutral-800" : "bg-neutral-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
