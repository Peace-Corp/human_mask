import Link from "next/link";
import gsap from "gsap";
import { formatPrice } from "@/utils/formatPrice";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
}

export default function ProductCard({ id, name, price }: ProductCardProps) {
  return (
    <Link href={`/product/${id}`}>
      <div
        className="w-full cursor-pointer rounded bg-gray-100"
        style={{ aspectRatio: "0.7 / 1" }}
        onMouseEnter={(e) => {
          gsap.to(e.currentTarget, {
            scale: 1.03,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            duration: 0.25,
            ease: "power2.out",
          });
        }}
        onMouseLeave={(e) => {
          gsap.to(e.currentTarget, {
            scale: 1,
            boxShadow: "0 0 0 rgba(0,0,0,0)",
            duration: 0.25,
            ease: "power2.out",
          });
        }}
      />
      <div className="mt-1.5 px-0.5">
        <p className="truncate text-[11px] font-medium text-neutral-700 md:text-xs">
          {name}
        </p>
        <p className="text-[11px] font-bold text-neutral-900 md:text-xs">
          {formatPrice(price)}
        </p>
      </div>
    </Link>
  );
}
