"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "주문 후 배송까지 얼마나 걸리나요?",
    answer:
      "주문 확인 후 영업일 기준 2~5일 이내에 발송됩니다. 택배사 사정에 따라 1~2일 추가 소요될 수 있습니다.",
  },
  {
    question: "교환 및 반품은 어떻게 하나요?",
    answer:
      "상품 수령 후 7일 이내에 교환 및 반품 신청이 가능합니다. 단순 변심의 경우 왕복 배송비는 고객님 부담이며, 상품 불량의 경우 무료로 교환/반품 처리됩니다.",
  },
  {
    question: "결제 수단은 어떤 것이 있나요?",
    answer:
      "신용카드, 체크카드, 무통장입금, 카카오페이, 네이버페이 등 다양한 결제 수단을 지원합니다.",
  },
  {
    question: "주문 취소는 어떻게 하나요?",
    answer:
      "발송 전 주문은 마이페이지에서 직접 취소 가능합니다. 이미 발송된 주문은 고객센터(010-2087-0621)로 연락 부탁드립니다.",
  },
  {
    question: "해외 배송도 가능한가요?",
    answer:
      "현재 해외 배송은 지원하지 않으며, 국내 배송만 가능합니다. 해외 배송 관련 문의는 이메일로 연락해 주세요.",
  },
  {
    question: "상품이 품절되면 재입고 알림을 받을 수 있나요?",
    answer:
      "상품 상세 페이지에서 재입고 알림 신청이 가능합니다. 재입고 시 등록하신 연락처로 알림을 보내드립니다.",
  },
  {
    question: "사람의 탈 IP 관련 협업 문의는 어디로 하나요?",
    answer:
      "IP 협업, 라이선스 등 비즈니스 문의는 이메일(contact@modoogoods.com)로 연락 부탁드립니다.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 md:px-6">
        <main className="flex-1 py-10 md:py-16">
          <h2 className="mb-8 text-center text-xl font-bold md:mb-12 md:text-2xl">
            자주 묻는 질문
          </h2>

          <div className="divide-y divide-neutral-200 border-y border-neutral-200">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => toggle(i)}
                  className="flex w-full items-center justify-between py-4 text-left text-xs font-medium text-neutral-800 md:py-5 md:text-sm"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    openIndex === i ? "max-h-40 pb-4" : "max-h-0"
                  }`}
                >
                  <p className="text-[11px] leading-relaxed text-neutral-500 md:text-xs">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
