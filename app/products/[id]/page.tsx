"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { addToCart } from "@/utils/cart";
import { getProductById, getProductVariants } from "@/lib/fetchers";
import type { Product, ProductVariant, CartItem } from "@/lib/types";
import Footer from "@/components/Footer";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [p, v] = await Promise.all([
        getProductById(id),
        getProductVariants(id),
      ]);
      setProduct(p);
      setVariants(v);
      setQuantities(Object.fromEntries(v.map((variant) => [variant.id, 0])));
      setLoading(false);
    }
    load();
  }, [id]);

  const updateQuantity = useCallback(
    (variantId: string, delta: number) => {
      setQuantities((prev) => {
        const next = Math.max(0, (prev[variantId] || 0) + delta);
        const variant = variants.find((v) => v.id === variantId);
        if (variant && next > variant.stock) return prev;
        return { ...prev, [variantId]: next };
      });
    },
    [variants]
  );

  const selectedItems = useMemo(() => {
    if (!product) return [];
    return variants
      .map((v) => ({
        variant: v,
        quantity: quantities[v.id] || 0,
        subtotal: (quantities[v.id] || 0) * product.price,
      }))
      .filter((item) => item.quantity > 0);
  }, [quantities, product, variants]);

  const totalQuantity = selectedItems.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = selectedItems.reduce((s, i) => s + i.subtotal, 0);

  const buildCartItems = useCallback((): CartItem[] => {
    if (!product) return [];
    return selectedItems.map((item) => ({
      productId: product.id,
      variantId: item.variant.id,
      productName: product.name,
      size: item.variant.size,
      price: product.price,
      quantity: item.quantity,
      image: product.images[0] || "",
    }));
  }, [product, selectedItems]);

  const handleBuyNow = () => {
    const items = buildCartItems();
    if (items.length === 0) return;
    for (const item of items) addToCart(item);
    router.push("/cart");
  };

  const handleAddToCart = () => {
    const items = buildCartItems();
    if (items.length === 0) return;
    for (const item of items) addToCart(item);
    setQuantities(Object.fromEntries(variants.map((v) => [v.id, 0])));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4">
        <p className="text-sm text-neutral-500">
          상품을 찾을 수 없습니다.
        </p>
        <Link
          href="/"
          className="rounded-full bg-black px-6 py-2.5 text-xs text-white hover:opacity-80"
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const hasVariants = variants.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 pt-14 pb-8 md:px-6 md:pt-20">
        {/* Product top section: image + options */}
        <div className="flex flex-col gap-6 md:flex-row md:gap-10">
          {/* Product image */}
          <div className="relative w-full shrink-0 overflow-hidden bg-neutral-50 md:w-1/2">
            <div className="relative w-full" style={{ aspectRatio: "1 / 1" }}>
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
                  No Image
                </div>
              )}
            </div>
          </div>

          {/* Product info + options */}
          <div className="flex flex-1 flex-col">
            <h1 className="text-base md:text-lg">{product.name}</h1>
            <p className="mt-1 text-lg font-bold md:text-xl">
              {formatPrice(product.price)}
            </p>

            {/* Size options */}
            {hasVariants && (
              <div className="mt-4 flex flex-col gap-2">
                {variants.map((variant) => {
                  const qty = quantities[variant.id] || 0;
                  const isActive = qty > 0;
                  const isSoldOut = variant.stock === 0;

                  return (
                    <div
                      key={variant.id}
                      className={`flex items-center rounded-full px-3 py-2 md:px-4 md:py-2.5 ${
                        isSoldOut
                          ? "border border-[#c2c2c2] bg-[#e5e5e5] opacity-60"
                          : isActive
                            ? "border-2 border-[#8793ff] bg-[#eee]"
                            : "border border-[#c2c2c2] bg-[#eee]"
                      }`}
                    >
                      <span className="text-xs md:text-sm">
                        {variant.size}
                      </span>

                      {isSoldOut ? (
                        <span className="ml-auto text-[10px] text-red-400 md:text-[11px]">
                          품절
                        </span>
                      ) : (
                        <>
                          <span className="ml-auto mr-2 text-[10px] text-[#9e9e9e] md:mr-3 md:text-[11px]">
                            재고 [{variant.stock}]
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(variant.id, -1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ababab] text-white transition-opacity hover:opacity-80"
                              aria-label={`${variant.size} 수량 감소`}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="flex h-6 w-8 items-center justify-center rounded-md bg-white text-xs md:text-sm">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateQuantity(variant.id, 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ababab] text-white transition-opacity hover:opacity-80"
                              aria-label={`${variant.size} 수량 증가`}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selected items summary */}
            {selectedItems.length > 0 && (
              <div className="mt-4 border-t border-neutral-200 pt-3">
                <div className="flex flex-col gap-0.5">
                  {selectedItems.map((item) => (
                    <div
                      key={item.variant.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span>
                        {item.variant.size} x {item.quantity}
                      </span>
                      <span>{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-base md:text-lg">
                총금액
                {totalQuantity > 0 && (
                  <span className="ml-1 text-xs md:text-sm">
                    ({totalQuantity}개)
                  </span>
                )}
              </span>
              <span className="text-lg font-bold md:text-xl">
                {formatPrice(totalPrice)}
              </span>
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={handleBuyNow}
                disabled={selectedItems.length === 0}
                className="w-full rounded-full bg-black py-3 text-xs text-white transition-opacity hover:opacity-80 disabled:opacity-40 md:text-sm"
              >
                바로 구매하기
              </button>
              <button
                onClick={handleAddToCart}
                disabled={selectedItems.length === 0}
                className="w-full rounded-full border border-neutral-300 bg-white py-3 text-xs text-black transition-colors hover:bg-neutral-50 disabled:opacity-40 md:text-sm"
              >
                장바구니에 담기
              </button>
            </div>
          </div>
        </div>

        {/* Description image */}
        {product.description_image && (
          <div className="mt-10 flex justify-center md:mt-16">
            <div className="relative w-full max-w-2xl">
              <Image
                src={product.description_image}
                alt={`${product.name} 상세 이미지`}
                width={800}
                height={1200}
                className="h-auto w-full"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-5xl">
        <Footer />
      </div>
    </div>
  );
}
