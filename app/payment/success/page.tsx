"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const EXPECTED_AMOUNT = 10000;

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(true);
  const [confirmResult, setConfirmResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const isValid = amount ? Number(amount) === EXPECTED_AMOUNT : false;

  useEffect(() => {
    if (paymentKey && orderId && amount && isValid) {
      confirmPayment();
    } else {
      setIsConfirming(false);
    }
  }, [paymentKey, orderId, amount, isValid]);

  const confirmPayment = async () => {
    setIsConfirming(true);
    try {
      // In production, send to your backend for confirmation
      // const response = await fetch('/api/payment/confirm', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     paymentKey,
      //     orderId,
      //     amount: Number(amount),
      //   }),
      // });

      // Simulating backend confirmation for test mode
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
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
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          결제 검증 실패
        </h1>
        <p className="text-gray-600 mb-6">
          결제 금액이 일치하지 않습니다. 위변조가 감지되었을 수 있습니다.
        </p>
        <Link
          href="/checkout"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          다시 시도하기
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
      {isConfirming ? (
        <>
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            결제 확인 중
          </h1>
          <p className="text-gray-600">잠시만 기다려주세요...</p>
        </>
      ) : confirmResult?.success ? (
        <>
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
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
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            결제 완료
          </h1>
          <p className="text-gray-600 mb-6">{confirmResult.message}</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">주문 번호</span>
              <span className="font-medium text-gray-900">{orderId}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">결제 금액</span>
              <span className="font-medium text-gray-900">
                {Number(amount).toLocaleString()}원
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </>
      ) : (
        <>
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
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
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            확인 실패
          </h1>
          <p className="text-gray-600 mb-6">{confirmResult?.message}</p>
          <Link
            href="/checkout"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도하기
          </Link>
        </>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
      <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <h1 className="text-xl font-semibold text-gray-900 mb-2">로딩 중</h1>
      <p className="text-gray-600">잠시만 기다려주세요...</p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<LoadingFallback />}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
