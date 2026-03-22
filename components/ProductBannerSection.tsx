"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface ProductBannerSectionProps {
  images: (string | string[])[];
}

export default function ProductBannerSection({
  images,
}: ProductBannerSectionProps) {
  if (images.length === 0) return null;

  return (
    <section className="flex flex-1 flex-col items-center gap-4 px-2 py-12 md:gap-6 md:px-4 md:py-20">
      {images.map((entry, i) =>
        typeof entry === "string" ? (
          <div key={i} className="relative w-full max-w-3xl">
            <Image
              src={entry}
              alt={`Detail image ${i + 1}`}
              width={960}
              height={540}
              className="h-auto w-full rounded-lg object-contain"
            />
          </div>
        ) : (
          <div key={i} className="w-full max-w-3xl">
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              loop={entry.length > 1}
              spaceBetween={0}
              slidesPerView={1}
              className="detail-swiper rounded-lg"
            >
              {entry.map((url, j) => (
                <SwiperSlide key={j}>
                  <Image
                    src={url}
                    alt={`Detail image ${i + 1}-${j + 1}`}
                    width={960}
                    height={540}
                    className="h-auto w-full object-contain"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )
      )}
    </section>
  );
}
