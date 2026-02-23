"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight, Minus, Plus, Check, ArrowUp } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { addToCart } from "@/utils/cart";
import type { Product, ProductVariant, CartItem } from "@/lib/types";
import Footer from "@/components/Footer";
import "swiper/css";

interface HomeContentProps {
  products: Product[];
  variants: ProductVariant[];
  orderDetailImage: string | null;
}

export default function HomeContent({
  products,
  variants,
  orderDetailImage,
}: HomeContentProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const swiperRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageSwiperRef = useRef<any>(null);

  const activeProduct = products[activeIndex] || null;

  // Show scroll-to-top button after scrolling down
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Group variants by product
  const variantsByProduct = useMemo(() => {
    const map: Record<string, ProductVariant[]> = {};
    for (const v of variants) {
      if (!map[v.product_id]) map[v.product_id] = [];
      map[v.product_id].push(v);
    }
    for (const p of products) {
      if (!map[p.id] || map[p.id].length === 0) {
        map[p.id] = [
          {
            id: p.id,
            product_id: p.id,
            size: "",
            stock: p.stock,
            sort_order: 0,
            created_at: "",
            updated_at: "",
          },
        ];
      }
    }
    return map;
  }, [variants, products]);

  // Reset quantities and image index when active product changes
  useEffect(() => {
    const productVariants = activeProduct
      ? variantsByProduct[activeProduct.id] || []
      : [];
    setQuantities(
      Object.fromEntries(productVariants.map((v) => [v.id, 0]))
    );
    setActiveImageIndex(0);
  }, [activeIndex, activeProduct, variantsByProduct]);


  const currentVariants = activeProduct
    ? variantsByProduct[activeProduct.id] || []
    : [];
  const isSingleVariant = currentVariants.length <= 1;

  const updateQuantity = useCallback(
    (variantId: string, delta: number) => {
      setQuantities((prev) => {
        const next = Math.max(0, (prev[variantId] || 0) + delta);
        const variant = currentVariants.find((v) => v.id === variantId);
        if (variant && next > variant.stock) return prev;
        return { ...prev, [variantId]: next };
      });
    },
    [currentVariants]
  );

  const selectedItems = useMemo(() => {
    if (!activeProduct) return [];
    return currentVariants
      .map((v) => ({
        variant: v,
        quantity: quantities[v.id] || 0,
        subtotal: (quantities[v.id] || 0) * activeProduct.price,
      }))
      .filter((item) => item.quantity > 0);
  }, [quantities, activeProduct, currentVariants]);

  const totalQuantity = selectedItems.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = selectedItems.reduce((s, i) => s + i.subtotal, 0);

  const buildCartItems = useCallback((): CartItem[] => {
    if (!activeProduct) return [];
    return selectedItems.map((item) => ({
      productId: activeProduct.id,
      variantId: item.variant.id,
      productName: activeProduct.name,
      size: item.variant.size,
      price: activeProduct.price,
      quantity: item.quantity,
      image: activeProduct.images[0] || "",
    }));
  }, [activeProduct, selectedItems]);

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
    const productVariants = activeProduct
      ? variantsByProduct[activeProduct.id] || []
      : [];
    setQuantities(
      Object.fromEntries(productVariants.map((v) => [v.id, 0]))
    );
    setShowConfirmation(true);
  };

  const handleProductClick = (index: number) => {
    // Let Swiper drive — onSlideChange will update activeIndex
    if (swiperRef.current) swiperRef.current.slideTo(index);
  };

  const handleSlideChange = useCallback(
    (swiper: { activeIndex: number }) => {
      setActiveIndex(swiper.activeIndex);
    },
    []
  );

  if (products.length === 0) return null;

  return (
    <>
      {/* Product Carousel */}
      <section className="py-6 md:py-10">
        <h2 className="mb-4 text-center text-base font-bold md:mb-6 md:text-lg">
          제품 구성
        </h2>

        <div className="relative flex items-center px-2 md:px-4">
          <button
            className="home-prev shrink-0 text-neutral-400 hover:text-neutral-700"
            aria-label="이전 상품"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          <div className="min-w-0 flex-1 px-2 md:px-3">
            <Swiper
              modules={[Navigation]}
              slidesPerView={3}
              centeredSlides
              spaceBetween={12}
              initialSlide={1}
              grabCursor
              navigation={{
                prevEl: ".home-prev",
                nextEl: ".home-next",
              }}
              breakpoints={{
                640: { slidesPerView: 4, spaceBetween: 14 },
                768: { slidesPerView: 5, spaceBetween: 16 },
              }}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              onSlideChange={handleSlideChange}
            >
              {products.map((product, index) => (
                <SwiperSlide key={product.id}>
                  <div
                    onClick={() => handleProductClick(index)}
                    className="cursor-pointer"
                  >
                    <div
                      className={`relative w-full overflow-hidden rounded bg-gray-100 transition-all duration-200 ${
                        index === activeIndex
                          ? ""
                          : "opacity-50"
                      }`}
                      style={{ aspectRatio: "0.7 / 1" }}
                    >
                      {product.images[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
                        />
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <button
            className="home-next shrink-0 text-neutral-400 hover:text-neutral-700"
            aria-label="다음 상품"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>
      </section>

      {/* Triangle divider — pointing up */}
      <div className="flex justify-center">
        <div
          className="h-0 w-0"
          style={{
            borderLeft: "20px solid transparent",
            borderRight: "20px solid transparent",
            borderBottom: "15px solid #fafafa",
          }}
        />
      </div>

      {/* Product Detail Section */}
      {activeProduct && (
        <section className="bg-neutral-50 py-8 md:py-12">
          <div className="mx-auto max-w-4xl px-4 md:px-6">
            <div className="flex flex-col gap-6 md:flex-row md:gap-10">
              {/* Product images — swipeable carousel */}
              <div className="w-full shrink-0 md:w-1/2">
                {activeProduct.images.length > 0 ? (
                  <Swiper
                    modules={[Pagination]}
                    slidesPerView={1}
                    spaceBetween={0}
                    pagination={{ clickable: true }}
                    onSwiper={(s) => { imageSwiperRef.current = s; }}
                    onSlideChange={(s) => setActiveImageIndex(s.activeIndex)}
                    key={activeProduct.id}
                    className="w-full [&_.swiper-pagination-bullet-active]:bg-black"
                  >
                    {activeProduct.images.map((img, i) => (
                      <SwiperSlide key={i}>
                        <div
                          className="relative w-full overflow-hidden bg-white"
                          style={{ aspectRatio: "1 / 1" }}
                        >
                          <Image
                            src={img}
                            alt={`${activeProduct.name} ${i + 1}`}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority={i === 0}
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <div
                    className="flex w-full items-center justify-center bg-white text-sm text-neutral-400"
                    style={{ aspectRatio: "1 / 1" }}
                  >
                    No Image
                  </div>
                )}

                {/* Thumbnail gallery */}
                {activeProduct.images.length > 1 && (
                  <div className="mt-2 flex gap-2">
                    {activeProduct.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setActiveImageIndex(i);
                          if (imageSwiperRef.current) imageSwiperRef.current.slideTo(i);
                        }}
                        className={`relative h-14 w-14 shrink-0 overflow-hidden rounded bg-neutral-100 md:h-16 md:w-16 ${
                          i === activeImageIndex
                            ? "ring-2 ring-black"
                            : "ring-1 ring-neutral-200"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${activeProduct.name} ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product info + options */}
              <div className="flex flex-1 flex-col">
                <h2 className="text-base md:text-lg">{activeProduct.name}</h2>
                <p className="mt-1 text-lg font-bold md:text-xl">
                  {formatPrice(activeProduct.price)}
                </p>

                {/* Variant options */}
                {isSingleVariant ? (
                  <div className="mt-4">
                    {currentVariants[0]?.stock === 0 ? (
                      <p className="text-xs text-red-400">품절</p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500">수량</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              updateQuantity(currentVariants[0].id, -1)
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ababab] text-white transition-opacity hover:opacity-80"
                            aria-label="수량 감소"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="flex h-7 w-9 items-center justify-center rounded-md bg-[#eee] text-xs md:text-sm">
                            {quantities[currentVariants[0].id] || 0}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(currentVariants[0].id, 1)
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ababab] text-white transition-opacity hover:opacity-80"
                            aria-label="수량 증가"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : currentVariants.length > 1 ? (
                  <div className="mt-4 flex flex-col gap-2">
                    {currentVariants.map((variant) => {
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
                                  onClick={() =>
                                    updateQuantity(variant.id, -1)
                                  }
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ababab] text-white transition-opacity hover:opacity-80"
                                  aria-label={`${variant.size} 수량 감소`}
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="flex h-6 w-8 items-center justify-center rounded-md bg-white text-xs md:text-sm">
                                  {qty}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(variant.id, 1)
                                  }
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
                ) : null}

                {/* Selected items summary */}
                {!isSingleVariant && selectedItems.length > 0 && (
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
          </div>
        </section>
      )}

      {/* Description image */}
      {activeProduct?.description_image && (
        <section className="flex justify-center px-4 py-8 md:py-12">
          <div className="relative w-full max-w-3xl">
            <Image
              src={activeProduct.description_image}
              alt={`${activeProduct.name} 상세 이미지`}
              width={800}
              height={1200}
              className="h-auto w-full"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        </section>
      )}

      <Footer />

      {/* Added to cart confirmation modal */}
      {showConfirmation && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowConfirmation(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white px-5 py-6 shadow-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black">
                <Check className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm">장바구니에 담겼습니다</p>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 rounded-full border border-neutral-300 py-2.5 text-xs transition-colors hover:bg-neutral-50"
              >
                계속 쇼핑하기
              </button>
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  router.push("/cart");
                }}
                className="flex-1 rounded-full bg-black py-2.5 text-xs text-white transition-opacity hover:opacity-80"
              >
                장바구니로 이동
              </button>
            </div>
          </div>
        </>
      )}

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white shadow-lg transition-all duration-300 hover:bg-black md:bottom-8 md:right-6 ${
          showScrollTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
        aria-label="맨 위로"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </>
  );
}
