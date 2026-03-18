"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Minus, Plus } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { addToCart } from "@/utils/cart";
import type { Product, ProductVariant, CartItem } from "@/lib/types";

interface ProductDetailModalProps {
  product: Product;
  variants: ProductVariant[];
  open: boolean;
  onClose: () => void;
  onAddedToCart: () => void;
}

export default function ProductDetailModal({
  product,
  variants,
  open,
  onClose,
  onAddedToCart,
}: ProductDetailModalProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Create synthetic variant for products without variants
  const effectiveVariants = useMemo(() => {
    if (variants.length > 0) return variants;
    return [
      {
        id: product.id,
        product_id: product.id,
        size: "",
        stock: product.stock,
        sort_order: 0,
        created_at: "",
        updated_at: "",
      } as ProductVariant,
    ];
  }, [variants, product]);

  const initQuantities = useCallback(() => {
    setQuantities(
      Object.fromEntries(effectiveVariants.map((v) => [v.id, 0]))
    );
  }, [effectiveVariants]);

  // Reset quantities when modal opens or product changes
  useEffect(() => {
    initQuantities();
  }, [initQuantities]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const updateQuantity = (variantId: string, delta: number) => {
    setQuantities((prev) => {
      const next = Math.max(0, (prev[variantId] || 0) + delta);
      const variant = effectiveVariants.find((v) => v.id === variantId);
      if (variant && next > variant.stock) return prev;
      return { ...prev, [variantId]: next };
    });
  };

  const selectedItems = useMemo(() => {
    return effectiveVariants
      .map((v) => ({
        variant: v,
        quantity: quantities[v.id] || 0,
        subtotal: (quantities[v.id] || 0) * product.price,
      }))
      .filter((item) => item.quantity > 0);
  }, [quantities, product, effectiveVariants]);

  const totalQuantity = selectedItems.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = selectedItems.reduce((s, i) => s + i.subtotal, 0);

  const handleAddToCart = () => {
    if (selectedItems.length === 0) return;
    for (const item of selectedItems) {
      const cartItem: CartItem = {
        productId: product.id,
        variantId: item.variant.id,
        productName: product.name,
        size: item.variant.size,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || "",
      };
      addToCart(cartItem);
    }
    initQuantities();
    onAddedToCart();
  };

  const isSingleVariant = effectiveVariants.length === 1 && effectiveVariants[0].size === "";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col rounded-t-2xl bg-white shadow-xl transition-transform duration-300 md:inset-x-auto md:inset-y-4 md:left-1/2 md:max-h-none md:w-full md:max-w-lg md:-translate-x-1/2 md:rounded-2xl ${
          open ? "translate-y-0" : "translate-y-full md:translate-y-[calc(100%+2rem)]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 md:px-5 md:py-4">
          <h2 className="truncate text-sm font-medium md:text-base">{product.name}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-neutral-100"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body — images only */}
        <div className="flex-1 overflow-y-auto">
          {/* Thumbnail image */}
          {product.images[0] && (
            <div className="px-4 pt-4 md:px-5 md:pt-5">
              <div className="relative w-full overflow-hidden rounded-lg bg-neutral-50" style={{ aspectRatio: "1 / 1" }}>
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 480px"
                />
              </div>
            </div>
          )}

          {/* Description image section */}
          {product.description_image && (
            <div className="mt-4 border-t-4 border-neutral-100 px-4 pt-4 md:px-5 md:pt-5">
              <p className="mb-2 text-[11px] font-medium text-neutral-400 md:text-xs">
                상세 정보
              </p>
              <Image
                src={product.description_image}
                alt={`${product.name} 상세 이미지`}
                width={800}
                height={1200}
                className="h-auto w-full rounded-lg"
                sizes="(max-width: 768px) 100vw, 480px"
              />
            </div>
          )}
        </div>

        {/* Fixed bottom — options + price + button */}
        <div className="border-t border-neutral-200 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 md:px-5 md:pb-4 md:pt-4">
          {/* Price */}
          <p className="mb-3 text-base font-bold md:text-lg">
            {formatPrice(product.price)}
          </p>

          {/* Variant selection */}
          <div className="mb-3">
            {isSingleVariant ? (
              effectiveVariants[0].stock === 0 ? (
                <p className="text-xs text-red-400">품절</p>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">수량</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(effectiveVariants[0].id, -1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ababab] text-white transition-opacity hover:opacity-80"
                      aria-label="수량 감소"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="flex h-6 w-8 items-center justify-center rounded-md bg-white text-xs md:text-sm">
                      {quantities[effectiveVariants[0].id] || 0}
                    </span>
                    <button
                      onClick={() => updateQuantity(effectiveVariants[0].id, 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ababab] text-white transition-opacity hover:opacity-80"
                      aria-label="수량 증가"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-2">
                {effectiveVariants.map((variant) => {
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
                      <span className="text-xs md:text-sm">{variant.size}</span>

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
          </div>

          {/* Selected items summary (multi-variant only) */}
          {!isSingleVariant && selectedItems.length > 0 && (
            <div className="mb-2 flex flex-col gap-0.5">
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
          )}

          {/* Total + button */}
          <div className="flex items-center gap-2">
            <span className="text-sm md:text-base">총금액</span>
            {totalQuantity > 0 && (
              <span className="text-xs md:text-sm">({totalQuantity}개)</span>
            )}
            <span className="ml-auto text-base font-bold md:text-lg">
              {formatPrice(totalPrice)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={selectedItems.length === 0}
            className="mt-2 w-full rounded-full bg-black py-2.5 text-xs text-white transition-opacity hover:opacity-80 disabled:opacity-40 md:py-3 md:text-sm"
          >
            장바구니에 담기
          </button>
        </div>
      </div>
    </>
  );
}
