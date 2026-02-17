"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadTossPayments,
  TossPaymentsWidgets,
  ANONYMOUS,
} from "@tosspayments/tosspayments-sdk";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { getCart, getCartTotal } from "@/utils/cart";
import { formatPrice } from "@/utils/formatPrice";
import { createOrder } from "@/lib/orders";
import ShippingForm from "@/components/checkout/ShippingForm";
import type { CartItem, ShippingInfo } from "@/lib/types";

const KRW_TO_USD_RATE = 0.00075;
const DOMESTIC_SHIPPING = 3000;
const INTERNATIONAL_SHIPPING = 15000;
const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;

type PaymentMethod = "toss" | "paypal";

const defaultShippingInfo: ShippingInfo = {
  name: "",
  phone: "",
  email: "",
  shippingType: "domestic",
};

function isShippingComplete(info: ShippingInfo): boolean {
  if (!info.name.trim() || !info.phone.trim() || !info.email.trim())
    return false;

  if (info.shippingType === "domestic") {
    return !!info.roadAddress;
  }

  return !!(
    info.country &&
    info.city?.trim() &&
    info.state?.trim() &&
    info.postalCode?.trim() &&
    info.addressLine1?.trim()
  );
}

function TossPaymentSection({
  amount,
  orderName,
  shippingInfo,
  cartItems,
  isProcessing,
  setIsProcessing,
  setError,
  disabled,
}: {
  amount: number;
  orderName: string;
  shippingInfo: ShippingInfo;
  cartItems: CartItem[];
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
  setError: (v: string | null) => void;
  disabled: boolean;
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
          value: amount,
        });

        setWidgets(widgetsInstance);
      } catch (err) {
        console.error("Failed to initialize Toss Payments:", err);
        setError("결제 시스템을 초기화하는 중 오류가 발생했습니다.");
      }
    }

    initTossPayments();
  }, [amount, setError]);

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
    if (!widgets || !isReady || isProcessing || disabled) return;

    setIsProcessing(true);
    try {
      // Ensure widget amount matches current total before payment
      await widgets.setAmount({ currency: "KRW", value: amount });

      const orderId = `order_${Date.now()}`;

      // Create order in Supabase before redirecting to payment
      await createOrder({
        orderId,
        cartItems,
        shippingInfo,
        total: amount,
        paymentMethod: "toss",
        orderName,
      });

      await widgets.requestPayment({
        orderId,
        orderName,
        successUrl: `${window.location.origin}/payment/success?expectedAmount=${amount}`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: shippingInfo.email,
        customerName: shippingInfo.name,
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
        disabled={!isReady || isProcessing || disabled}
        className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing
          ? "처리 중..."
          : `${amount.toLocaleString()}원 결제하기`}
      </button>
      {disabled && (
        <p className="text-xs text-red-500 text-center mt-2">
          배송 정보를 모두 입력해주세요.
        </p>
      )}
    </>
  );
}

function PayPalPaymentSection({
  amountUSD,
  amountKRW,
  shippingInfo,
  cartItems,
  orderName,
  isProcessing,
  setIsProcessing,
  setError,
  disabled,
}: {
  amountUSD: string;
  amountKRW: number;
  shippingInfo: ShippingInfo;
  cartItems: CartItem[];
  orderName: string;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
  setError: (v: string | null) => void;
  disabled: boolean;
}) {
  const onApprove = async (data: { orderID: string }) => {
    setIsProcessing(true);
    try {
      console.log("PayPal order approved:", data.orderID);
      window.location.href = `/payment/success?orderId=${data.orderID}&amount=${amountUSD}&expectedAmount=${amountUSD}&paymentType=paypal`;
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
        해외 결제를 위한 PayPal 결제입니다. (${amountUSD} USD)
      </p>

      {disabled ? (
        <div className="text-center py-6">
          <p className="text-sm text-red-500">
            배송 정보를 모두 입력해주세요.
          </p>
        </div>
      ) : (
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
              const orderId = `order_${Date.now()}`;
              await createOrder({
                orderId,
                cartItems,
                shippingInfo,
                total: amountKRW,
                paymentMethod: "paypal",
                orderName,
              });

              return actions.order.create({
                intent: "CAPTURE",
                purchase_units: [
                  {
                    amount: {
                      currency_code: "USD",
                      value: amountUSD,
                    },
                    description: "사람의탈 상품",
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
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("toss");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingInfo, setShippingInfo] =
    useState<ShippingInfo>(defaultShippingInfo);

  useEffect(() => {
    const items = getCart();
    if (items.length === 0) {
      router.replace("/cart");
      return;
    }
    setCartItems(items);
    setSubtotal(getCartTotal());
  }, [router]);

  const shippingCost =
    shippingInfo.shippingType === "domestic"
      ? DOMESTIC_SHIPPING
      : INTERNATIONAL_SHIPPING;
  const totalKRW = subtotal + shippingCost;
  const totalUSD = (totalKRW * KRW_TO_USD_RATE).toFixed(2);
  const shippingComplete = isShippingComplete(shippingInfo);

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

  if (cartItems.length === 0) {
    return null; // Redirecting to /cart
  }

  const orderName =
    cartItems.length === 1
      ? `${cartItems[0].productName} (${cartItems[0].size})`
      : `${cartItems[0].productName} 외 ${cartItems.length - 1}건`;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Shipping Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <ShippingForm
            shippingInfo={shippingInfo}
            onChange={setShippingInfo}
          />
        </div>

        {/* Order Summary & Payment */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제하기</h1>
          <p className="text-gray-500 mb-6">주문 내역을 확인해주세요.</p>

          {/* Order summary */}
          <div className="border-t border-b py-4 mb-6">
            {cartItems.map((item) => (
              <div
                key={item.variantId}
                className="flex justify-between items-center py-1"
              >
                <span className="text-sm text-gray-700">
                  {item.productName} ({item.size}) x {item.quantity}
                </span>
                <span className="text-sm font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}

            <div className="flex justify-between items-center pt-2 border-t mt-2">
              <span className="text-sm text-gray-600">소계</span>
              <span className="text-sm text-gray-900">
                {formatPrice(subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm text-gray-600">
                배송비 (
                {shippingInfo.shippingType === "domestic"
                  ? "국내"
                  : "해외"}
                )
              </span>
              <span className="text-sm text-gray-900">
                {formatPrice(shippingCost)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t mt-2">
              <span className="font-semibold">합계</span>
              <div className="text-right">
                <span className="text-lg font-semibold text-gray-900">
                  {formatPrice(totalKRW)}
                </span>
                <span className="text-sm text-gray-500 block">
                  (${totalUSD} USD)
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
              key={totalKRW}
              amount={totalKRW}
              orderName={orderName}
              shippingInfo={shippingInfo}
              cartItems={cartItems}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              setError={setError}
              disabled={!shippingComplete}
            />
          ) : (
            <PayPalPaymentSection
              amountUSD={totalUSD}
              amountKRW={totalKRW}
              shippingInfo={shippingInfo}
              cartItems={cartItems}
              orderName={orderName}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              setError={setError}
              disabled={!shippingComplete}
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
