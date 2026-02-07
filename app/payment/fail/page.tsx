"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentFailContent() {
  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const message = searchParams.get("message");

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
      <h1 className="text-xl font-semibold text-gray-900 mb-2">결제 실패</h1>
      <p className="text-gray-600 mb-6">
        {message || "결제 처리 중 오류가 발생했습니다."}
      </p>

      {code && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="flex justify-between py-2">
            <span className="text-gray-500">오류 코드</span>
            <span className="font-mono text-sm text-gray-900">{code}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Link
          href="/checkout"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          다시 시도하기
        </Link>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
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
      <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-600">로딩 중...</p>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<LoadingFallback />}>
        <PaymentFailContent />
      </Suspense>
    </div>
  );
}
