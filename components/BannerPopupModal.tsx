"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface BannerPopupModalProps {
  imageUrl: string;
}

const STORAGE_KEY = "banner_dismissed_date";

function isDismissedToday(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === new Date().toDateString();
}

export default function BannerPopupModal({ imageUrl }: BannerPopupModalProps) {
  const [show, setShow] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isDismissedToday()) {
      setShow(false);
    } else {
      document.body.style.overflow = "hidden";
    }
    setMounted(true);
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const close = () => {
    setShow(false);
    document.body.style.overflow = "";
  };

  const closeForToday = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toDateString());
    close();
  };

  // Don't render during SSR or before hydration check
  if (!mounted || !show) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={close} />
      <div className="fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Close button */}
        <button
          onClick={close}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Order detail image */}
        <div className="flex-1 overflow-y-auto">
          <Image
            src={imageUrl}
            alt="공지"
            width={800}
            height={800}
            className="h-auto w-full"
            sizes="(max-width: 768px) 90vw, 512px"
            priority
          />
        </div>

        {/* Close for today button */}
        <button
          onClick={closeForToday}
          className="shrink-0 border-t border-neutral-200 py-3 text-xs text-neutral-500 hover:bg-neutral-50"
        >
          오늘 하루 보지 않기
        </button>
      </div>
    </>
  );
}
