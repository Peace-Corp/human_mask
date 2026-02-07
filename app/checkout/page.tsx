"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadTossPayments,
  TossPaymentsWidgets,
  ANONYMOUS,
} from "@tosspayments/tosspayments-sdk";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const TEST_AMOUNT_KRW = 10000; // 10,000 KRW
const TEST_AMOUNT_USD = "8.00"; // ~$8 USD equivalent
const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;

type PaymentMethod = "toss" | "paypal";

function TossPaymentSection({
  isProcessing,
  setIsProcessing,
  setError,
}: {
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
  setError: (v: string | null) => void;
}) {
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
  const [isReady, setIsReady] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function initTossPayments() {
      try {
        const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
        const widgetsInstance = tossPayments.widgets({
          customerKey: ANONYMOUS,
        });

        await widgetsInstance.setAmount({
          currency: "KRW",
          value: TEST_AMOUNT_KRW,
        });

        setWidgets(widgetsInstance);
      } catch (err) {
        console.error("Failed to initialize Toss Payments:", err);
        setError("결제 시스템을 초기화하는 중 오류가 발생했습니다.");
      }
    }

    initTossPayments();
  }, [setError]);

  useEffect(() => {
    if (!widgets) return;

    async function renderWidgets(w: TossPaymentsWidgets) {
      try {
        await Promise.all([
          w.renderPaymentMethods({ selector: "#payment-methods" }),
          w.renderAgreement({ selector: "#agreement" }),
        ]);
        setIsReady(true);
      } catch (err) {
        console.error("Failed to render widgets:", err);
        setError("결제 UI를 불러오는 중 오류가 발생했습니다.");
      }
    }

    renderWidgets(widgets);
  }, [widgets, setError]);

  const handlePayment = async () => {
    if (!widgets || !isReady || isProcessing) return;

    setIsProcessing(true);
    try {
      await widgets.requestPayment({
        orderId: `order_${Date.now()}`,
        orderName: "테스트 상품",
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: "test@example.com",
        customerName: "테스트 고객",
      });
    } catch (err: unknown) {
      console.error("Payment failed:", err);
      if (err instanceof Error && err.message.includes("USER_CANCEL")) {
        // User cancelled, just reset state
      } else {
        setError("결제 처리 중 오류가 발생했습니다.");
      }
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          결제 수단 선택
        </h2>
        <div
          id="payment-methods"
          className={!isReady ? "animate-pulse bg-gray-100 h-48 rounded" : ""}
        />
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">약관 동의</h2>
        <div
          id="agreement"
          className={!isReady ? "animate-pulse bg-gray-100 h-24 rounded" : ""}
        />
      </div>

      <button
        onClick={handlePayment}
        disabled={!isReady || isProcessing}
        className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing
          ? "처리 중..."
          : `${TEST_AMOUNT_KRW.toLocaleString()}원 결제하기`}
      </button>
    </>
  );
}

function PayPalPaymentSection({
  isProcessing,
  setIsProcessing,
  setError,
}: {
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
  setError: (v: string | null) => void;
}) {
  const onApprove = async (data: { orderID: string }) => {
    setIsProcessing(true);
    try {
      // In production, capture the order on your backend
      // const response = await fetch('/api/paypal/capture-order', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ orderID: data.orderID }),
      // });
      // const result = await response.json();

      console.log("PayPal order approved:", data.orderID);
      window.location.href = `/payment/success?orderId=${data.orderID}&amount=${TEST_AMOUNT_USD}&paymentType=paypal`;
    } catch (err) {
      console.error("PayPal capture failed:", err);
      setError("PayPal 결제 처리 중 오류가 발생했습니다.");
      setIsProcessing(false);
    }
  };

  const onError = (err: Record<string, unknown>) => {
    console.error("PayPal error:", err);
    setError("PayPal 결제 중 오류가 발생했습니다.");
  };

  const onCancel = () => {
    console.log("PayPal payment cancelled");
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        PayPal로 결제
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        해외 결제를 위한 PayPal 결제입니다. (${TEST_AMOUNT_USD} USD)
      </p>

      <PayPalScriptProvider
        options={{
          clientId: PAYPAL_CLIENT_ID,
          currency: "USD",
          intent: "capture",
        }}
      >
        <PayPalButtons
          style={{
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "pay",
          }}
          disabled={isProcessing}
          createOrder={async (_data, actions) => {
            return actions.order.create({
              intent: "CAPTURE",
              purchase_units: [
                {
                  amount: {
                    currency_code: "USD",
                    value: TEST_AMOUNT_USD,
                  },
                  description: "테스트 상품",
                },
              ],
            });
          }}
          onApprove={async (data, actions) => {
            if (actions.order) {
              const details = await actions.order.capture();
              console.log("Payment completed:", details);
              onApprove({ orderID: data.orderID });
            }
          }}
          onError={onError}
          onCancel={onCancel}
        />
      </PayPalScriptProvider>
    </div>
  );
}

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("toss");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!TOSS_CLIENT_KEY || !PAYPAL_CLIENT_ID) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-xl font-semibold text-red-600 mb-4">설정 오류</h1>
          <p className="text-gray-600">결제 API 키가 설정되지 않았습니다.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-xl font-semibold text-red-600 mb-4">오류 발생</h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제하기</h1>
          <p className="text-gray-500 mb-6">테스트 결제</p>

          <div className="border-t border-b py-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">테스트 상품</span>
              <div className="text-right">
                <span className="text-lg font-semibold text-gray-900">
                  {TEST_AMOUNT_KRW.toLocaleString()}원
                </span>
                <span className="text-sm text-gray-500 block">
                  (${TEST_AMOUNT_USD} USD)
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div className="flex mb-6 border-b">
            <button
              onClick={() => setPaymentMethod("toss")}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                paymentMethod === "toss"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              국내 결제
              <span className="block text-xs mt-1">카드, 계좌이체 등</span>
            </button>
            <button
              onClick={() => setPaymentMethod("paypal")}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                paymentMethod === "paypal"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              해외 결제
              <span className="block text-xs mt-1">PayPal</span>
            </button>
          </div>

          {/* Payment Method Content */}
          {paymentMethod === "toss" ? (
            <TossPaymentSection
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              setError={setError}
            />
          ) : (
            <PayPalPaymentSection
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              setError={setError}
            />
          )}
        </div>

        <p className="text-center text-sm text-gray-500">
          테스트 모드로 실행 중입니다. 실제 결제가 이루어지지 않습니다.
        </p>
      </div>
    </div>
  );
}
