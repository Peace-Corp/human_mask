import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="flex min-h-screen justify-center bg-neutral-300">
      <div className="flex w-full max-w-3xl flex-col min-h-screen">
        <Header />

        {/* Main Content */}
        <main className="flex flex-1 flex-col bg-neutral-200">
          {/* Image Placeholder */}
          <div className="flex flex-1 items-center justify-center">
            <span className="text-sm text-neutral-600 md:text-base">
              상세 이미지
            </span>
          </div>

          {/* Purchase Button */}
          <div className="px-4 pb-6 pt-4 md:px-8 md:pb-8">
            <button className="w-full rounded-full bg-black py-3.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 md:py-4 md:text-base">
              구매하기
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
