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
      <div className="mt-6 grid grid-cols-1 gap-6 text-[11px] leading-relaxed text-neutral-500 sm:grid-cols-3 md:mt-8 md:text-xs">
        {/* 사업자 정보 */}
        <div>
          <h3 className="mb-2 text-xs font-bold text-neutral-800 md:text-sm">
            사업자 정보
          </h3>
          <p>상호명: 피스코프</p>
          <p>주소지: 서울특별시 마포구 세터산 4길 2, b102호</p>
          <p>전화번호: 010-2087-0621</p>
          <p>사업자등록번호: 118-08-15095</p>
          <p>대표자 이름: 김현준</p>
          <p>개인정보 책임자: 김현준</p>
          <p>통신판매업신고번호: 2021-서울마포-1399</p>
        </div>

        {/* BANK INFO */}
        <div>
          <h3 className="mb-2 text-xs font-bold text-neutral-800 md:text-sm">
            BANK INFO
          </h3>
          <p>우리은행</p>
          <p>1005904144208</p>
          <p>예금주: 피스코프</p>
        </div>

        {/* 고객 지원 */}
        <div>
          <h3 className="mb-2 text-xs font-bold text-neutral-800 md:text-sm">
            고객 지원
          </h3>
          <p>운영시간: 평일 10:00 ~ 18:00</p>
          <p>점심시간: 12:00 ~ 13:00</p>
          <p>주말/공휴일 휴무</p>
        </div>
      </div>
    </footer>
  );
}
