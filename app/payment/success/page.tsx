"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { clearCart } from "@/utils/cart";
import { finalizeOrder, getOrderWithItems } from "@/lib/orders";
import type { OrderWithItems } from "@/lib/orders";
import { formatPrice } from "@/utils/formatPrice";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(true);
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [confirmResult, setConfirmResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const expectedAmount = searchParams.get("expectedAmount");
  const paymentType = searchParams.get("paymentType");
  const isPayPal = paymentType === "paypal";
  const isValid = isPayPal
    ? !!orderId
    : amount && expectedAmount
      ? Number(amount) === Number(expectedAmount)
      : false;

  useEffect(() => {
    if (isValid && orderId) {
      confirmPayment();
    } else {
      setIsConfirming(false);
    }
  }, []);

  const confirmPayment = async () => {
    setIsConfirming(true);
    try {
      await finalizeOrder(orderId!, paymentKey || null);
      clearCart();

      const orderData = await getOrderWithItems(orderId!);
      setOrder(orderData);

      // Fire-and-forget: send receipt email
      fetch("/api/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      }).catch(() => {});

      setConfirmResult({
        success: true,
        message: "결제가 성공적으로 완료되었습니다.",
      });
    } catch {
      setConfirmResult({
        success: false,
        message: "결제 확인 중 오류가 발생했습니다.",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isValid) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-7 h-7 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-gray-900 mb-2">
          결제 검증 실패
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          결제 금액이 일치하지 않습니다.
        </p>
        <Link
          href="/checkout"
          className="inline-block px-5 py-2.5 text-sm bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          다시 시도하기
        </Link>
      </div>
    );
  }

  if (isConfirming) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="w-14 h-14 mx-auto mb-4 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <h1 className="text-lg font-semibold text-gray-900 mb-2">
          결제 확인 중
        </h1>
        <p className="text-sm text-gray-600">잠시만 기다려주세요...</p>
      </div>
    );
  }

  if (confirmResult && !confirmResult.success) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-7 h-7 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-gray-900 mb-2">확인 실패</h1>
        <p className="text-sm text-gray-600 mb-6">{confirmResult.message}</p>
        <Link
          href="/checkout"
          className="inline-block px-5 py-2.5 text-sm bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          다시 시도하기
        </Link>
      </div>
    );
  }

  // Receipt UI
  const orderDate = order?.created_at
    ? new Date(order.created_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const subtotal =
    order?.items.reduce(
      (sum, item) => sum + item.price_at_time * item.quantity,
      0
    ) ?? 0;
  const shippingCost = order ? order.total - subtotal : 0;

  return (
    <div className="bg-white rounded-lg shadow-md max-w-md w-full overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 text-white px-6 py-5 text-center">
        <div className="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-lg font-semibold">결제 완료</h1>
        <p className="text-xs text-white/70 mt-1">
          주문이 정상적으로 접수되었습니다
        </p>
      </div>

      <div className="px-6 py-5">
        {/* Order Info */}
        <div className="flex justify-between items-start text-xs text-gray-500 mb-4 pb-4 border-b border-dashed border-gray-300">
          <div>
            <span className="block text-[11px] text-gray-400 mb-0.5">
              주문번호
            </span>
            <span className="text-gray-900 font-mono text-xs">
              {order?.id || orderId}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[11px] text-gray-400 mb-0.5">
              주문일시
            </span>
            <span className="text-gray-700">{orderDate}</span>
          </div>
        </div>

        {/* Items */}
        {order && order.items.length > 0 && (
          <div className="mb-4 pb-4 border-b border-dashed border-gray-300">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              주문 내역
            </h2>
            <div className="space-y-2.5">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm text-gray-900 truncate">
                      {item.product?.name || "상품"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.size && `${item.size} · `}수량 {item.quantity}개
                    </p>
                  </div>
                  <span className="text-sm text-gray-900 font-medium whitespace-nowrap">
                    {formatPrice(item.price_at_time * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price breakdown */}
        <div className="mb-4 pb-4 border-b border-dashed border-gray-300 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">소계</span>
            <span className="text-gray-700">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">
              배송비 (
              {order?.delivery_method === "domestic" ? "국내" : "해외"})
            </span>
            <span className="text-gray-700">
              {shippingCost > 0 ? formatPrice(shippingCost) : "무료"}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200">
            <span className="text-sm font-semibold text-gray-900">
              총 결제 금액
            </span>
            <span className="text-base font-bold text-gray-900">
              {formatPrice(order?.total ?? Number(amount) ?? 0)}
            </span>
          </div>
        </div>

        {/* Payment & Customer Info */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-5">
          <div>
            <span className="text-gray-400 block text-[11px]">결제 수단</span>
            <span className="text-gray-700">
              {order?.payment_method === "toss" ? "국내 결제" : "PayPal"}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">주문 상태</span>
            <span className="text-green-600 font-medium">결제 완료</span>
          </div>
          {order?.customer_name && (
            <div>
              <span className="text-gray-400 block text-[11px]">수령인</span>
              <span className="text-gray-700">{order.customer_name}</span>
            </div>
          )}
          {order?.customer_email && (
            <div>
              <span className="text-gray-400 block text-[11px]">이메일</span>
              <span className="text-gray-700 truncate block">
                {order.customer_email}
              </span>
            </div>
          )}
        </div>

        {/* Action */}
        <Link
          href="/"
          className="block w-full text-center py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
      <div className="w-14 h-14 mx-auto mb-4 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
      <h1 className="text-lg font-semibold text-gray-900 mb-2">로딩 중</h1>
      <p className="text-sm text-gray-600">잠시만 기다려주세요...</p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Suspense fallback={<LoadingFallback />}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
