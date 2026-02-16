"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { User, ShoppingCart, Menu, X } from "lucide-react";
import gsap from "gsap";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-2.5 transition-all duration-300 md:px-6 md:py-3 ${
          scrolled
            ? "bg-white/10 backdrop-blur-md shadow-sm"
            : "mix-blend-difference"
        }`}
      >
        {/* Desktop: nav links | Mobile: brand name */}
        <div
          className={`hidden items-center gap-3 text-xs tracking-wide md:flex md:text-sm ${scrolled ? "text-black" : "text-white"}`}
        >
          <Link href="/contact" className="font-bmk hover:opacity-70">
            CONTACT
          </Link>
          <Link href="/faq" className="font-bmk hover:opacity-70">
            FAQ
          </Link>
        </div>

        <Link
          href="/"
          className={`font-bmk text-sm font-bold md:absolute md:left-1/2 md:-translate-x-1/2 md:text-lg ${scrolled ? "text-black" : "text-white"}`}
        >
          사람의 탈
        </Link>

        {/* Desktop: icons | Mobile: hamburger */}
        <div
          className={`hidden items-center gap-2 md:flex ${scrolled ? "text-black" : "text-white"}`}
        >
          <button aria-label="장바구니" className="hover:opacity-70">
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>

        <button
          aria-label="메뉴"
          className={`md:hidden ${scrolled ? "text-black" : "text-white"}`}
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 md:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile sidebar */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-64 flex-col bg-white shadow-lg transition-transform duration-300 md:hidden ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="font-bmk text-sm font-bold">사람의 탈</span>
          <button
            aria-label="닫기"
            onClick={() => setSidebarOpen(false)}
            className="hover:opacity-70"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-4 py-3 text-sm">
          <Link
            href="/contact"
            className="font-bmk rounded-md px-2 py-2 hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            CONTACT
          </Link>
          <Link
            href="/faq"
            className="font-bmk rounded-md px-2 py-2 hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            FAQ
          </Link>
        </nav>

        <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-4">
          <button aria-label="장바구니" className="hover:opacity-70">
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </aside>
    </>
  );
}
