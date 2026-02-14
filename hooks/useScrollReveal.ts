"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealOptions {
  y?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  start?: string;
  ease?: string;
}

export function useScrollReveal<T extends HTMLElement>(
  options: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    y = 30,
    duration = 0.6,
    delay = 0,
    stagger = 0,
    start = "top 85%",
    ease = "power2.out",
  } = options;

  useEffect(() => {
    if (!ref.current) return;

    const targets = stagger ? ref.current.children : ref.current;

    const anim = gsap.from(targets, {
      y,
      opacity: 0,
      duration,
      delay,
      stagger: stagger || undefined,
      ease,
      scrollTrigger: {
        trigger: ref.current,
        start,
        once: true,
      },
    });

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, [y, duration, delay, stagger, start, ease]);

  return ref;
}
