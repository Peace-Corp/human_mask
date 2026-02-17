import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 md:px-6">
        <main className="flex-1 py-10 md:py-16">
          <h2 className="mb-8 text-center text-xl font-bold md:mb-12 md:text-2xl">
            문의하기
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Phone */}
            <div className="flex items-start gap-3 rounded-lg border border-neutral-200 p-4 md:p-5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
              <div>
                <h3 className="text-xs font-bold text-neutral-800 md:text-sm">전화 문의</h3>
                <p className="mt-1 text-[11px] text-neutral-500 md:text-xs">010-2087-0621</p>
                <p className="mt-0.5 text-[10px] text-neutral-400">평일 10:00 ~ 18:00 (점심 12:00 ~ 13:00)</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 rounded-lg border border-neutral-200 p-4 md:p-5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
              <div>
                <h3 className="text-xs font-bold text-neutral-800 md:text-sm">이메일 문의</h3>
                <p className="mt-1 text-[11px] text-neutral-500 md:text-xs">contact@modoogoods.com</p>
                <p className="mt-0.5 text-[10px] text-neutral-400">영업일 기준 1~2일 내 답변</p>
              </div>
            </div>

            {/* Address */}
            {/* <div className="flex items-start gap-3 rounded-lg border border-neutral-200 p-4 md:p-5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
              <div>
                <h3 className="text-xs font-bold text-neutral-800 md:text-sm">주소</h3>
                <p className="mt-1 text-[11px] text-neutral-500 md:text-xs">서울특별시 마포구 세터산 4길 2, b102호</p>
                <p className="mt-0.5 text-[10px] text-neutral-400">상호명: 피스코프</p>
              </div>
            </div> */}

            {/* Hours */}
            <div className="flex items-start gap-3 rounded-lg border border-neutral-200 p-4 md:p-5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
              <div>
                <h3 className="text-xs font-bold text-neutral-800 md:text-sm">운영시간</h3>
                <p className="mt-1 text-[11px] text-neutral-500 md:text-xs">평일 10:00 ~ 18:00</p>
                <p className="mt-0.5 text-[10px] text-neutral-400">점심시간 12:00 ~ 13:00 | 주말/공휴일 휴무</p>
              </div>
            </div>
          </div>

          {/* Bank info */}
          <div className="mt-8 rounded-lg border border-neutral-200 p-4 text-center md:mt-10 md:p-5">
            <h3 className="text-xs font-bold text-neutral-800 md:text-sm">입금 계좌 안내</h3>
            <p className="mt-2 text-[11px] text-neutral-500 md:text-xs">
              우리은행 1005904144208 (예금주: 피스코프)
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
