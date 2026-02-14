export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 px-4 py-6 md:px-6 md:py-8">
      {/* Links row */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <span className="text-sm font-semibold text-neutral-800">
          ModooGoods
        </span>
        <nav className="flex flex-wrap gap-3 text-[11px] text-neutral-500 md:gap-4 md:text-xs">
          <a href="#" className="hover:text-neutral-800">FAQ</a>
          <a href="#" className="hover:text-neutral-800">CONTACT</a>
          <a href="#" className="hover:text-neutral-800">이용약관</a>
          <a href="#" className="hover:text-neutral-800">개인정보처리</a>
        </nav>
      </div>

      {/* Business Info */}
      <p className="mt-4 text-center text-[10px] leading-relaxed text-neutral-400 md:mt-6 md:text-[11px]">
        <span className="font-bold text-neutral-800">상호명: 피스코프</span> | 대표자: 김현준 | 개인정보 책임자: 김현준<br />
        주소지: 서울특별시 마포구 세터산 4길 2, b102호 | <span className="font-bold text-neutral-800">전화번호: 010-2087-0621</span><br />
        <span className="font-bold text-neutral-800">사업자등록번호: 118-08-15095</span> | 통신판매업신고번호: 2021-서울마포-1399<br />
        <span className="font-bold text-neutral-800">우리은행 1005904144208</span> (예금주: 피스코프)<br />
        <span className="font-bold text-neutral-800">운영시간: 평일 10:00 ~ 18:00</span> (점심 12:00 ~ 13:00) | 주말/공휴일 휴무
      </p>
    </footer>
  );
}
