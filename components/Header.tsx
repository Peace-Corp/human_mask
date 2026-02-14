import { User, ShoppingCart } from "lucide-react";

export default function Header() {
  return (
    <header className="relative z-10 flex items-center justify-between px-4 py-2.5 mix-blend-difference md:px-6 md:py-3">
      <div className="flex items-center gap-3 text-xs tracking-wide text-white md:text-sm">
        <a href="#" className="font-bmk hover:opacity-70">
          CONTACT
        </a>
        <a href="#" className="font-bmk hover:opacity-70">
          FAQ
        </a>
      </div>

      <h1 className="absolute left-1/2 -translate-x-1/2 font-bmk text-base font-bold text-white md:text-lg">
        사람의 탈
      </h1>

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
