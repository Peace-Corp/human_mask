"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { addToCart } from "@/utils/cart";
import type { Product, ProductVariant, CartItem } from "@/lib/types";

interface OrderModalProps {
  products: Product[];
  variants: ProductVariant[];
}

export default function OrderModal({ products, variants }: OrderModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Initialize quantities when modal opens
  const initQuantities = useCallback(() => {
    setQuantities(Object.fromEntries(variants.map((v) => [v.id, 0])));
  }, [variants]);

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

  const variantsByProduct = useMemo(() => {
    const map: Record<string, ProductVariant[]> = {};
    for (const v of variants) {
      if (!map[v.product_id]) map[v.product_id] = [];
      map[v.product_id].push(v);
    }
    return map;
  }, [variants]);

  const updateQuantity = (variantId: string, delta: number) => {
    setQuantities((prev) => {
      const next = Math.max(0, (prev[variantId] || 0) + delta);
      const variant = variants.find((v) => v.id === variantId);
      if (variant && next > variant.stock) return prev;
      return { ...prev, [variantId]: next };
    });
  };

  const selectedItems = useMemo(() => {
    const items: {
      product: Product;
      variant: ProductVariant;
      quantity: number;
      subtotal: number;
    }[] = [];

    for (const product of products) {
      const productVariants = variantsByProduct[product.id] || [];
      for (const v of productVariants) {
        const qty = quantities[v.id] || 0;
        if (qty > 0) {
          items.push({
            product,
            variant: v,
            quantity: qty,
            subtotal: qty * product.price,
          });
        }
      }
    }
    return items;
  }, [quantities, products, variants, variantsByProduct]);

  const totalQuantity = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = selectedItems.reduce((sum, i) => sum + i.subtotal, 0);

  const handleBuyNow = () => {
    if (selectedItems.length === 0) return;

    for (const item of selectedItems) {
      const cartItem: CartItem = {
        productId: item.product.id,
        variantId: item.variant.id,
        productName: item.product.name,
        size: item.variant.size,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0] || "",
      };
      addToCart(cartItem);
    }

    initQuantities();
    setOpen(false);
    router.push("/cart");
  };

  return (
    <>
      {/* Floating order button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black px-5 py-3 text-sm text-white shadow-lg transition-opacity hover:opacity-80 md:bottom-8 md:px-6 md:py-3.5 md:text-base"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
        주문하기
      </button>

      {/* Modal backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Modal panel */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-xl transition-transform duration-300 md:inset-x-auto md:inset-y-4 md:left-1/2 md:max-h-none md:w-full md:max-w-lg md:-translate-x-1/2 md:rounded-2xl ${
          open ? "translate-y-0" : "translate-y-full md:translate-y-[calc(100%+2rem)]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 md:px-5 md:py-4">
          <h2 className="text-base md:text-lg">제품 주문</h2>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable product list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-5 md:py-5">
          <div className="flex flex-col gap-6">
            {products.map((product) => {
              const productVariants = variantsByProduct[product.id] || [];
              if (productVariants.length === 0) return null;

              return (
                <div key={product.id}>
                  {/* Product header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100 md:h-16 md:w-16">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                          사진
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm md:text-base">{product.name}</p>
                      <p className="text-sm text-neutral-600 md:text-base">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>

                  {/* Variant options */}
                  <div className="flex flex-col gap-2">
                    {productVariants.map((variant) => {
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

                  {/* Divider between products */}
                  <div className="mt-4 h-px bg-neutral-200" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Fixed bottom bar */}
        <div className="border-t border-neutral-200 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 md:px-5 md:pb-4 md:pt-4">
          {/* Selected items summary */}
          {selectedItems.length > 0 && (
            <div className="mb-2 flex flex-col gap-0.5">
              {selectedItems.map((item) => (
                <div
                  key={item.variant.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span>
                    {item.product.name} - {item.variant.size} x {item.quantity}
                  </span>
                  <span>{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm md:text-base">총금액</span>
            {totalQuantity > 0 && (
              <span className="text-xs md:text-sm">
                ({totalQuantity}개)
              </span>
            )}
            <span className="ml-auto text-base md:text-lg">
              {formatPrice(totalPrice)}
            </span>
          </div>

          <button
            onClick={handleBuyNow}
            disabled={selectedItems.length === 0}
            className="mt-2 w-full rounded-full bg-black py-2.5 text-xs text-white transition-opacity hover:opacity-80 disabled:opacity-40 md:py-3 md:text-sm"
          >
            구매하기
          </button>
        </div>
      </div>
    </>
  );
}
