"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import {
  getCart,
  saveCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} from "@/utils/cart";
import { getAllProductVariants, getProductById } from "@/lib/fetchers";
import type { CartItem, ProductVariant } from "@/lib/types";
import Footer from "@/components/Footer";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const items = getCart();
      if (items.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      // Fetch fresh variant stock for all products in cart
      const productIds = [...new Set(items.map((i) => i.productId))];
      let allVariants: ProductVariant[] = [];

      try {
        allVariants = await getAllProductVariants(productIds);
      } catch {
        // If fetch fails, show cart without stock validation
        setCartItems(items);
        setLoading(false);
        return;
      }

      // Build stock lookup
      const stock: Record<string, number> = {};
      for (const v of allVariants) {
        stock[v.id] = v.stock;
      }

      // For no-variant products (variantId === productId), fetch product stock
      const noVariantItems = items.filter(
        (i) => i.variantId === i.productId && stock[i.variantId] === undefined
      );
      if (noVariantItems.length > 0) {
        const productIds2 = [...new Set(noVariantItems.map((i) => i.productId))];
        await Promise.all(
          productIds2.map(async (pid) => {
            try {
              const p = await getProductById(pid);
              if (p) stock[p.id] = p.stock;
            } catch {
              // ignore
            }
          })
        );
      }

      // Check inventory and adjust
      const newWarnings: string[] = [];
      const adjusted = items
        .map((item) => {
          const currentStock = stock[item.variantId];

          if (currentStock === undefined) {
            newWarnings.push(
              `"${item.productName} (${item.size})" 옵션은 더 이상 판매하지 않습니다.`
            );
            return { ...item, quantity: 0 };
          }
          if (currentStock === 0) {
            newWarnings.push(
              `"${item.productName} (${item.size})" 이(가) 품절되었습니다.`
            );
            return { ...item, quantity: 0 };
          }
          if (item.quantity > currentStock) {
            newWarnings.push(
              `"${item.productName} (${item.size})" 재고가 부족하여 ${currentStock}개로 조정되었습니다.`
            );
            return { ...item, quantity: currentStock };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);

      // Persist adjusted cart
      saveCart(adjusted);

      setCartItems(adjusted);
      setStockMap(stock);
      setWarnings(newWarnings);
      setLoading(false);
    }

    init();
  }, []);

  const refreshCart = useCallback(() => {
    setCartItems(getCart());
  }, []);

  const handleQuantityChange = (variantId: string, newQty: number) => {
    const maxStock = stockMap[variantId] ?? 0;
    const clamped = Math.min(Math.max(0, newQty), maxStock);

    if (clamped === 0) {
      handleRemove(variantId);
      return;
    }

    updateCartItemQuantity(variantId, clamped);
    refreshCart();
  };

  const handleRemove = (variantId: string) => {
    removeFromCart(variantId);
    refreshCart();
  };

  const handleClearAll = () => {
    clearCart();
    refreshCart();
  };

  const groupedItems = useMemo(() => {
    const groups: Record<string, CartItem[]> = {};
    for (const item of cartItems) {
      if (!groups[item.productId]) groups[item.productId] = [];
      groups[item.productId].push(item);
    }
    return Object.values(groups);
  }, [cartItems]);

  const totalPrice = cartItems.reduce(
    (s, i) => s + i.price * i.quantity,
    0
  );
  const totalCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
          <ShoppingCart className="h-12 w-12 text-neutral-300" />
          <p className="text-sm text-neutral-500">
            장바구니가 비어 있습니다.
          </p>
          <Link
            href="/"
            className="mt-2 rounded-full bg-black px-6 py-2.5 text-xs text-white hover:opacity-80"
          >
            쇼핑하러 가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 pt-16 pb-8 md:px-6 md:pt-20">
        <div className="flex items-center justify-between">
          <h1 className="text-lg md:text-xl">장바구니</h1>
          <button
            onClick={handleClearAll}
            className="text-xs text-neutral-400 hover:text-neutral-600"
          >
            전체 삭제
          </button>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mt-3 rounded-lg bg-yellow-50 px-3 py-2.5">
            {warnings.map((w, i) => (
              <p key={i} className="text-xs text-yellow-700">
                {w}
              </p>
            ))}
          </div>
        )}

        {/* Cart items grouped by product */}
        <div className="mt-4 flex flex-col gap-4">
          {groupedItems.map((group) => {
            const first = group[0];
            const isSingle = group.length === 1;

            return (
              <div
                key={first.productId}
                className="border-b border-neutral-200 pb-4"
              >
                {/* Product header */}
                <div className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100 md:h-20 md:w-20">
                    {first.image ? (
                      <Image
                        src={first.image}
                        alt={first.productName}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-neutral-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-sm md:text-base">
                          {first.productName}
                        </span>
                        <p className="text-xs text-neutral-500">
                          {formatPrice(first.price)}
                        </p>
                      </div>
                      {isSingle && (
                        <button
                          onClick={() => handleRemove(first.variantId)}
                          className="text-neutral-400 transition-colors hover:text-neutral-600"
                          aria-label="삭제"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Inline controls for single-option products */}
                    {isSingle && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                first.variantId,
                                first.quantity - 1
                              )
                            }
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ababab] text-white transition-opacity hover:opacity-80"
                            aria-label="수량 감소"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="flex h-6 w-8 items-center justify-center rounded-md bg-neutral-100 text-xs">
                            {first.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                first.variantId,
                                first.quantity + 1
                              )
                            }
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ababab] text-white transition-opacity hover:opacity-80"
                            aria-label="수량 증가"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="ml-auto text-sm md:text-base">
                          {formatPrice(first.price * first.quantity)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Variant rows for multi-option products */}
                {!isSingle && (
                  <div className="mt-2 flex flex-col gap-1.5 pl-2">
                    {group.map((item) => (
                      <div
                        key={item.variantId}
                        className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2"
                      >
                        <span className="text-xs text-neutral-600">
                          {item.size}
                        </span>

                        <div className="ml-auto flex items-center gap-1">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.variantId,
                                item.quantity - 1
                              )
                            }
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ababab] text-white transition-opacity hover:opacity-80"
                            aria-label="수량 감소"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="flex h-6 w-8 items-center justify-center rounded-md bg-white text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.variantId,
                                item.quantity + 1
                              )
                            }
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ababab] text-white transition-opacity hover:opacity-80"
                            aria-label="수량 증가"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <span className="w-16 text-right text-xs md:text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </span>

                        <button
                          onClick={() => handleRemove(item.variantId)}
                          className="text-neutral-400 transition-colors hover:text-neutral-600"
                          aria-label="삭제"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 border-t border-neutral-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg">
              총금액{" "}
              <span className="text-sm">({totalCount}개)</span>
            </span>
            <span className="text-xl md:text-2xl">
              {formatPrice(totalPrice)}
            </span>
          </div>

          <Link
            href="/checkout"
            className="mt-3 block w-full rounded-full bg-black py-3 text-center text-xs text-white transition-opacity hover:opacity-80 md:text-sm"
          >
            주문하기
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <Footer />
      </div>
    </div>
  );
}
