"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import {
  getCart,
  updateCartItemQuantity,
  removeFromCart,
} from "@/utils/cart";
import { getProductVariants } from "@/lib/fetchers";
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
      const allVariants: ProductVariant[] = [];

      await Promise.all(
        productIds.map(async (pid) => {
          try {
            const variants = await getProductVariants(pid);
            allVariants.push(...variants);
          } catch {
            // Product may have been deleted
          }
        })
      );

      // Build stock lookup
      const stock: Record<string, number> = {};
      for (const v of allVariants) {
        stock[v.id] = v.stock;
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
      localStorage.setItem("human_mask_cart", JSON.stringify(adjusted));
      window.dispatchEvent(new Event("cart-change"));

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
          <p className="font-bmk text-sm text-neutral-500">
            장바구니가 비어 있습니다.
          </p>
          <Link
            href="/"
            className="mt-2 rounded-full bg-black px-6 py-2.5 font-bmk text-xs text-white hover:opacity-80"
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
        <h1 className="font-bmk text-lg md:text-xl">장바구니</h1>

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

        {/* Cart items */}
        <div className="mt-4">
          {cartItems.map((item) => (
            <div
              key={item.variantId}
              className="flex gap-3 border-b border-neutral-100 py-3"
            >
              {/* Thumbnail */}
              <Link
                href={`/product/${item.productId}`}
                className="shrink-0"
              >
                <div className="relative h-20 w-20 overflow-hidden bg-neutral-100 md:h-24 md:w-24">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-neutral-400">
                      No Image
                    </div>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/product/${item.productId}`}
                    className="font-bmk text-sm hover:underline md:text-base"
                  >
                    {item.productName}
                  </Link>
                  <p className="text-xs text-neutral-500">{item.size}</p>
                  <p className="mt-0.5 font-bmk text-sm">
                    {formatPrice(item.price)}
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="mt-1.5 flex items-center gap-1">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.variantId, item.quantity - 1)
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ababab] text-white transition-opacity hover:opacity-80"
                    aria-label="수량 감소"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="flex h-7 w-9 items-center justify-center rounded-md bg-neutral-100 font-bmk text-sm">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      handleQuantityChange(item.variantId, item.quantity + 1)
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ababab] text-white transition-opacity hover:opacity-80"
                    aria-label="수량 증가"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Line total + remove */}
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => handleRemove(item.variantId)}
                  className="text-neutral-400 transition-colors hover:text-neutral-600"
                  aria-label="삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <span className="font-bmk text-sm md:text-base">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 border-t border-neutral-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="font-bmk text-lg">
              총금액{" "}
              <span className="text-sm">({totalCount}개)</span>
            </span>
            <span className="font-bmk text-xl md:text-2xl">
              {formatPrice(totalPrice)}
            </span>
          </div>

          <Link
            href="/checkout"
            className="mt-3 block w-full rounded-full bg-black py-3 text-center font-bmk text-xs text-white transition-opacity hover:opacity-80 md:text-sm"
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
