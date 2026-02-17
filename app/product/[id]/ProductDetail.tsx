"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { addToCart } from "@/utils/cart";
import type { Product, ProductVariant, CartItem } from "@/lib/types";

interface ProductDetailProps {
  product: Product;
  variants: ProductVariant[];
}

export default function ProductDetail({ product, variants }: ProductDetailProps) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(variants.map((v) => [v.id, 0]))
  );
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  const updateQuantity = (variantId: string, delta: number) => {
    setQuantities((prev) => {
      const next = Math.max(0, (prev[variantId] || 0) + delta);
      const variant = variants.find((v) => v.id === variantId);
      if (variant && next > variant.stock) return prev;
      return { ...prev, [variantId]: next };
    });
  };

  const selectedItems = useMemo(
    () =>
      variants
        .filter((v) => (quantities[v.id] || 0) > 0)
        .map((v) => ({
          ...v,
          quantity: quantities[v.id],
          subtotal: quantities[v.id] * product.price,
        })),
    [quantities, variants, product.price]
  );

  const totalQuantity = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = selectedItems.reduce((sum, i) => sum + i.subtotal, 0);

  const handleAddToCart = () => {
    if (selectedItems.length === 0) return;

    for (const item of selectedItems) {
      const cartItem: CartItem = {
        productId: product.id,
        variantId: item.id,
        productName: product.name,
        size: item.size,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || "",
      };
      addToCart(cartItem);
    }

    setQuantities(Object.fromEntries(variants.map((v) => [v.id, 0])));
    setCartMessage("장바구니에 담았습니다.");
    setTimeout(() => setCartMessage(null), 2000);
  };

  const handleBuyNow = () => {
    if (selectedItems.length === 0) return;
    handleAddToCart();
    router.push("/cart");
  };

  const hasVariants = variants.length > 0;

  return (
    <>
      {/* Product top section */}
      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        {/* Product image */}
        <div className="w-full md:w-1/2">
          <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                제품 사진
              </div>
            )}
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
          {hasVariants ? (
            <div className="flex flex-col gap-2.5">
              {variants.map((variant) => {
                const qty = quantities[variant.id] || 0;
                const isActive = qty > 0;

                return (
                  <div
                    key={variant.id}
                    className={`flex items-center rounded-full px-4 py-2.5 md:px-5 md:py-3 ${
                      isActive
                        ? "border-2 border-[#8793ff] bg-[#eee]"
                        : "border border-[#c2c2c2] bg-[#eee]"
                    }`}
                  >
                    <span className="font-bmk text-sm md:text-base">
                      {variant.size}
                    </span>

                    <span className="ml-auto mr-3 text-[11px] text-[#9e9e9e] md:mr-4 md:text-xs">
                      재고 [{variant.stock}]
                    </span>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(variant.id, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ababab] text-white transition-opacity hover:opacity-80"
                        aria-label={`${variant.size} 수량 감소`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>

                      <span className="flex h-7 w-9 items-center justify-center rounded-md bg-white font-bmk text-sm md:text-base">
                        {qty}
                      </span>

                      <button
                        onClick={() => updateQuantity(variant.id, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ababab] text-white transition-opacity hover:opacity-80"
                        aria-label={`${variant.size} 수량 증가`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">사이즈 옵션 없음</p>
          )}

          {/* Divider */}
          <div className="my-4 h-px bg-neutral-300" />

          {/* Order summary – desktop only */}
          <div className="hidden md:block">
            {selectedItems.length > 0 && (
              <div className="mb-2 flex flex-col gap-1">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between font-bmk text-sm"
                  >
                    <span>
                      {item.size} x {item.quantity}
                    </span>
                    <span>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            <div className="flex items-center gap-2">
              <span className="font-bmk text-xl">총금액</span>
              {totalQuantity > 0 && (
                <span className="font-bmk text-base">
                  ({totalQuantity}개)
                </span>
              )}
              <span className="ml-auto font-bmk text-2xl">
                {formatPrice(totalPrice)}
              </span>
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex flex-col gap-2.5">
              <button
                onClick={handleBuyNow}
                disabled={selectedItems.length === 0}
                className="w-full rounded-full bg-black py-3 font-bmk text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                바로 구매하기
              </button>
              <button
                onClick={handleAddToCart}
                disabled={selectedItems.length === 0}
                className="w-full rounded-full bg-[#d9d9d9] py-3 font-bmk text-sm text-black transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                장바구니에 담기
              </button>
              {cartMessage && (
                <p className="text-center text-xs text-green-600">
                  {cartMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product detail image */}
      {product.description_image && (
        <section className="mt-12 flex flex-col items-center md:mt-16">
          <div className="relative w-full max-w-3xl">
            <Image
              src={product.description_image}
              alt={`${product.name} 상세 이미지`}
              width={958}
              height={2954}
              className="h-auto w-full"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        </section>
      )}

      {/* Mobile fixed bottom bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.08)] transition-transform duration-300 md:hidden ${
          totalQuantity > 0 ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          {selectedItems.length > 0 && (
            <div className="mb-2 flex flex-col gap-0.5">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between font-bmk text-xs"
                >
                  <span>
                    {item.size} x {item.quantity}
                  </span>
                  <span>{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="font-bmk text-base">총금액</span>
            <span className="font-bmk text-sm">({totalQuantity}개)</span>
            <span className="ml-auto font-bmk text-lg">
              {formatPrice(totalPrice)}
            </span>
          </div>

          <div className="mt-2 flex gap-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 rounded-full bg-[#d9d9d9] py-2.5 font-bmk text-xs text-black transition-opacity hover:opacity-80"
            >
              장바구니에 담기
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 rounded-full bg-black py-2.5 font-bmk text-xs text-white transition-opacity hover:opacity-80"
            >
              바로 구매하기
            </button>
          </div>
          {cartMessage && (
            <p className="mt-1 text-center text-xs text-green-600">
              {cartMessage}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
