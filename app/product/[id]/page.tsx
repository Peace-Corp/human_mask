"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import Footer from "@/components/Footer";

interface SizeOption {
  label: string;
  size: string;
  stock: number;
}

const MOCK_PRODUCT = {
  name: "사람의 탈 티셔츠 (블랙)",
  price: 30000,
  sizes: [
    { label: "S (90)", size: "S", stock: 21 },
    { label: "M (95)", size: "M", stock: 21 },
    { label: "L (100)", size: "L", stock: 21 },
  ] as SizeOption[],
  image: "/placeholder-product.png",
  detailImage: "/placeholder-detail.png",
};

function formatPrice(amount: number) {
  return `₩ ${amount.toLocaleString()}원`;
}

export default function ProductDetailPage() {
  const params = useParams();
  const [quantities, setQuantities] = useState<Record<string, number>>({
    S: 0,
    M: 0,
    L: 0,
  });

  const product = MOCK_PRODUCT;

  const updateQuantity = (size: string, delta: number) => {
    setQuantities((prev) => {
      const next = Math.max(0, (prev[size] || 0) + delta);
      const sizeOption = product.sizes.find((s) => s.size === size);
      if (sizeOption && next > sizeOption.stock) return prev;
      return { ...prev, [size]: next };
    });
  };

  const selectedItems = useMemo(
    () =>
      product.sizes
        .filter((s) => quantities[s.size] > 0)
        .map((s) => ({
          ...s,
          quantity: quantities[s.size],
          subtotal: quantities[s.size] * product.price,
        })),
    [quantities, product.sizes, product.price]
  );

  const totalQuantity = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = selectedItems.reduce((sum, i) => sum + i.subtotal, 0);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 pt-16 md:px-6 md:pt-20">
        {/* Product top section */}
        <div className="flex flex-col gap-6 md:flex-row md:gap-10">
          {/* Product image */}
          <div className="w-full md:w-1/2">
            <div className="aspect-square w-full bg-neutral-100">
              <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                제품 사진
              </div>
            </div>
          </div>

          {/* Product info */}
          <div className="flex w-full flex-col md:w-1/2">
            <h1 className="font-bmk text-lg md:text-xl">{product.name}</h1>
            <p className="mt-1 font-bmk text-xl md:text-2xl">
              {formatPrice(product.price)}
            </p>

            {/* Divider */}
            <div className="my-4 h-px bg-neutral-300" />

            {/* Size options */}
            <div className="flex flex-col gap-2.5">
              {product.sizes.map((size) => {
                const qty = quantities[size.size] || 0;
                const isActive = qty > 0;

                return (
                  <div
                    key={size.size}
                    className={`flex items-center rounded-full px-4 py-2.5 md:px-5 md:py-3 ${
                      isActive
                        ? "border-2 border-[#8793ff] bg-[#eee]"
                        : "border border-[#c2c2c2] bg-[#eee]"
                    }`}
                  >
                    <span className="font-bmk text-sm md:text-base">
                      {size.label}
                    </span>

                    <span className="ml-auto mr-3 text-[11px] text-[#9e9e9e] md:mr-4 md:text-xs">
                      재고 [{size.stock}]
                    </span>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(size.size, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ababab] text-white transition-opacity hover:opacity-80"
                        aria-label={`${size.label} 수량 감소`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>

                      <span className="flex h-7 w-9 items-center justify-center rounded-md bg-white font-bmk text-sm md:text-base">
                        {qty}
                      </span>

                      <button
                        onClick={() => updateQuantity(size.size, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ababab] text-white transition-opacity hover:opacity-80"
                        aria-label={`${size.label} 수량 증가`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <div className="my-4 h-px bg-neutral-300" />

            {/* Order summary */}
            {selectedItems.length > 0 && (
              <div className="mb-2 flex flex-col gap-1">
                {selectedItems.map((item) => (
                  <div
                    key={item.size}
                    className="flex items-center justify-between font-bmk text-xs md:text-sm"
                  >
                    <span>
                      {item.label} x {item.quantity}
                    </span>
                    <span>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            <div className="flex items-center gap-2">
              <span className="font-bmk text-lg md:text-xl">총금액</span>
              {totalQuantity > 0 && (
                <span className="font-bmk text-sm md:text-base">
                  ({totalQuantity}개)
                </span>
              )}
              <span className="ml-auto font-bmk text-xl md:text-2xl">
                {formatPrice(totalPrice)}
              </span>
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex flex-col gap-2.5">
              <button className="w-full rounded-full bg-black py-3 font-bmk text-xs text-white transition-opacity hover:opacity-80 md:text-sm">
                바로 구매하기
              </button>
              <button className="w-full rounded-full bg-[#d9d9d9] py-3 font-bmk text-xs text-black transition-opacity hover:opacity-80 md:text-sm">
                장바구니에 담기
              </button>
            </div>
          </div>
        </div>

        {/* Product detail images */}
        <section className="mt-12 flex flex-col items-center md:mt-16">
          <div className="w-full max-w-3xl">
            <div className="flex aspect-[958/2954] w-full items-center justify-center bg-neutral-50 text-neutral-400">
              제품 상세 이미지
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="mx-auto w-full max-w-5xl">
        <Footer />
      </div>
    </div>
  );
}
