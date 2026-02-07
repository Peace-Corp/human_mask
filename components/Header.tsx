import { Menu } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center justify-between bg-neutral-300 px-4 py-3 md:px-6 md:py-4">
      <h1 className="text-lg font-bmk font-bold text-black md:text-xl">
        사람의 탈 공식 굿즈
      </h1>
      <button
        className="flex h-9 w-9 items-center justify-center rounded bg-neutral-400/50 md:h-10 md:w-10"
        aria-label="메뉴"
      >
        <Menu className="h-5 w-5 text-neutral-700 md:h-6 md:w-6" />
      </button>
    </header>
  );
}
