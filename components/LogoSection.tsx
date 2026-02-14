"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LogoSection() {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: textRef.current,
        start: "top 85%",
        once: true,
      },
    });

    // Entrance: scale up and fade in
    tl.from(textRef.current, {
      scale: 0.8,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });

    // Continuous gentle float
    tl.to(textRef.current, {
      y: -4,
      duration: 3,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section className="flex flex-1 items-center justify-center px-8 py-16 md:py-24">
      <div className="flex h-48 w-64 items-center justify-center sm:h-56 sm:w-80 md:h-72 md:w-96">
        <span
          ref={textRef}
          className="font-bmk text-6xl text-neutral-800 sm:text-7xl md:text-8xl"
        >
          사람의 탈
        </span>
      </div>
    </section>
  );
}
