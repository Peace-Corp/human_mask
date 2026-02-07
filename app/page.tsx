"use client";

import { useState } from "react";
import Header from "@/components/Header";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen justify-center bg-white">
      <div className="flex w-full max-w-4xl flex-col min-h-screen">
        <Header onMenuClick={() => setIsModalOpen(true)} />

        {/* Main Content */}
        <main className="flex flex-1 flex-col bg-white">
          {/* Image Placeholder */}
          <div className="flex flex-1 items-center justify-center bg-gray-200 h-screen">
            <span className="text-sm text-neutral-600 md:text-base">
              상세 이미지
            </span>
          </div>

          {/* Purchase Button */}
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 pb-6 md:pb-8">
            <button className="w-xs sm:w-md rounded-full bg-black py-3.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 md:py-4 md:text-base">
              구매하기
            </button>
          </div>
        </main>
      </div>

      {/* Side Modal Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isModalOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsModalOpen(false)}
      />

      {/* Side Modal */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-64 bg-white shadow-lg transition-transform duration-300 ease-out sm:w-72 ${
          isModalOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4">
            <span className="font-bmk text-sm font-medium md:text-base">사람의 탈 공식 굿즈</span>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="text-neutral-500 hover:text-neutral-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Modal Content */}
          <nav className="flex-1 py-3 md:py-4">
            <ul className="space-y-1">
              <li>
                <button className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100 md:text-base">
                  주문조회하기
                </button>
              </li>
              <li>
                <button className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100 md:text-base">
                  문의하기
                </button>
              </li>
            </ul>
            
          </nav>
        </div>
      </div>
    </div>
  );
}
