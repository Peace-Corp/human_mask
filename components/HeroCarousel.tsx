"use client";

import { useState, type ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

interface HeroCarouselProps {
  header?: ReactNode;
}

export default function HeroCarousel({ header }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);

  return (
    <section className="relative w-full">
      {/* Background — fills width, ~60% height, color transitions with slide */}
      <div
        className="absolute inset-x-0 top-0 h-[60%] transition-colors duration-500 ease-out"
        style={{ backgroundColor: SLIDES[current].bgColor }}
      />

      <div className="relative">
        {header}

        {/* Swiper carousel */}
        <div className="relative overflow-hidden">
          <Swiper
            modules={[Navigation, Pagination]}
            slidesPerView={1.8}
            centeredSlides
            spaceBetween={16}
            loop
            navigation={{
              prevEl: ".hero-prev",
              nextEl: ".hero-next",
            }}
            onSlideChange={(swiper) => setCurrent(swiper.realIndex)}
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

          {/* Arrow buttons — positioned at the edge between active and adjacent slides */}
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
