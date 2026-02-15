"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { User, ShoppingCart } from "lucide-react";
import gsap from "gsap";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!headerRef.current) return;
    gsap.from(headerRef.current, {
      opacity: 0,
      y: -10,
      duration: 0.4,
      ease: "power2.out",
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-2.5 transition-all duration-300 md:px-6 md:py-3 ${
        scrolled
          ? "bg-white/10 backdrop-blur-md shadow-sm"
          : "mix-blend-difference"
      }`}
    >
      <div className={`flex items-center gap-3 text-xs tracking-wide md:text-sm ${scrolled ? "text-black" : "text-white"}`}>
        <Link href="/contact" className="font-bmk hover:opacity-70">
          CONTACT
        </Link>
        <Link href="/faq" className="font-bmk hover:opacity-70">
          FAQ
        </Link>
      </div>

      <Link href="/" className={`absolute left-1/2 -translate-x-1/2 font-bmk text-base font-bold md:text-lg ${scrolled ? "text-black" : "text-white"}`}>
        사람의 탈
      </Link>

      <div className={`flex items-center gap-2 ${scrolled ? "text-black" : "text-white"}`}>
        <button aria-label="계정" className="hover:opacity-70">
          <User className="h-5 w-5" />
        </button>
        <button aria-label="장바구니" className="hover:opacity-70">
          <ShoppingCart className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
