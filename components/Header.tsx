"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";
import gsap from "gsap";
import { getCartCount } from "@/utils/cart";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const showSolid = !isHome || scrolled;

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
    setCartCount(getCartCount());
    const onCartChange = () => setCartCount(getCartCount());
    window.addEventListener("cart-change", onCartChange);
    return () => window.removeEventListener("cart-change", onCartChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-2.5 text-black transition-all duration-300 md:px-6 md:py-3 ${
          showSolid ? "bg-white/10 backdrop-blur-md shadow-sm" : ""
        }`}
      >
        {/* Desktop: nav links | Mobile: brand name */}
        <div
          className="hidden items-center gap-3 text-xs tracking-wide md:flex md:text-sm"
        >
          <Link href="/contact" className="hover:opacity-70">
            CONTACT
          </Link>
          <Link href="/faq" className="hover:opacity-70">
            FAQ
          </Link>
        </div>

        <Link
          href="/"
          className="text-sm font-bold md:absolute md:left-1/2 md:-translate-x-1/2 md:text-lg"
        >
          사람의 탈
        </Link>

        {/* Desktop: icons | Mobile: hamburger */}
        <div
          className="hidden items-center gap-2 md:flex"
        >
          <Link href="/cart" aria-label="장바구니" className="relative hover:opacity-70">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <Link href="/cart" aria-label="장바구니" className="relative hover:opacity-70">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          <button
            aria-label="메뉴"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
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
          <span className="text-sm font-bold">사람의 탈</span>
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
            className="rounded-md px-2 py-2 hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            CONTACT
          </Link>
          <Link
            href="/faq"
            className="rounded-md px-2 py-2 hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            FAQ
          </Link>
        </nav>

      </aside>
    </>
  );
}
