"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { User, ShoppingCart } from "lucide-react";
import gsap from "gsap";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!headerRef.current) return;
    gsap.from(headerRef.current, {
      opacity: 0,
      y: -10,
      duration: 0.4,
      ease: "power2.out",
    });
  }, []);

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-2.5 mix-blend-difference md:px-6 md:py-3"
    >
      <div className="flex items-center gap-3 text-xs tracking-wide text-white md:text-sm">
        <Link href="/contact" className="font-bmk hover:opacity-70">
          CONTACT
        </Link>
        <Link href="/faq" className="font-bmk hover:opacity-70">
          FAQ
        </Link>
      </div>

      <Link href="/" className="absolute left-1/2 -translate-x-1/2 font-bmk text-base font-bold text-white md:text-lg">
        사람의 탈
      </Link>

      <div className="flex items-center gap-2 text-white">
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
