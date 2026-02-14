"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PRODUCT_COUNT = 6;

export default function ProductCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 160;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-6 md:py-10">
      <h2 className="mb-4 text-center font-bmk text-base font-bold md:mb-6 md:text-lg">
        제품 구성
      </h2>

      <div className="relative flex items-center px-2 md:px-4">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className="flex-shrink-0 text-neutral-400 hover:text-neutral-700"
          aria-label="이전 상품"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        {/* Scrollable product list */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto px-2 scrollbar-hide md:gap-4 md:px-3"
        >
          {Array.from({ length: PRODUCT_COUNT }).map((_, i) => (
            <button
              key={i}
              className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded bg-gray-100 transition-shadow hover:shadow-md sm:h-28 sm:w-28 md:h-32 md:w-32"
            >
              <span className="text-[10px] text-neutral-400">
                상품 {i + 1}
              </span>
            </button>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className="flex-shrink-0 text-neutral-400 hover:text-neutral-700"
          aria-label="다음 상품"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        </button>
      </div>
    </section>
  );
}
