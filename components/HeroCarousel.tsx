"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDE_COUNT = 4;
const SLIDE_WIDTH_PERCENT = 55;
const GAP_PERCENT = 1;

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(
    () => setCurrent((c) => (c === 0 ? SLIDE_COUNT - 1 : c - 1)),
    []
  );
  const next = useCallback(
    () => setCurrent((c) => (c === SLIDE_COUNT - 1 ? 0 : c + 1)),
    []
  );

  // Each slide occupies SLIDE_WIDTH_PERCENT + GAP_PERCENT of the track
  const step = SLIDE_WIDTH_PERCENT + GAP_PERCENT;
  const offset = -(current * step) + (50 - SLIDE_WIDTH_PERCENT / 2);

  return (
    <section className="relative w-full">
      {/* Slides track */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            gap: `${GAP_PERCENT}%`,
            transform: `translateX(${offset}%)`,
          }}
        >
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <div
              key={i}
              className="shrink-0"
              style={{ width: `${SLIDE_WIDTH_PERCENT}%` }}
            >
              <div className="flex h-48 items-center justify-center bg-gray-200 sm:h-64 md:h-80">
                <span className="text-xs text-neutral-400">
                  배너 이미지 {i + 1}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Arrow buttons */}
        <button
          onClick={prev}
          className="absolute left-[24%] top-1/2 -translate-y-1/2 flex items-center justify-center text-neutral-400 hover:text-neutral-600"
          aria-label="이전 슬라이드"
        >
          <ChevronLeft className="h-7 w-7 md:h-9 md:w-9" />
        </button>
        <button
          onClick={next}
          className="absolute right-[24%] top-1/2 -translate-y-1/2 flex items-center justify-center text-neutral-400 hover:text-neutral-600"
          aria-label="다음 슬라이드"
        >
          <ChevronRight className="h-7 w-7 md:h-9 md:w-9" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-1.5 py-3 md:py-4">
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === current ? "bg-neutral-800" : "bg-neutral-300"
            }`}
            aria-label={`슬라이드 ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
