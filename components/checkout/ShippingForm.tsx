"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { countries } from "@/utils/countries";
import type { ShippingInfo } from "@/lib/types";

const JUSO_API_KEY = process.env.NEXT_PUBLIC_JUSO_API_KEY!;

interface JusoResult {
  roadAddr: string;
  jibunAddr: string;
  zipNo: string;
  bdNm: string;
}

export default function ShippingForm({
  shippingInfo,
  onChange,
}: {
  shippingInfo: ShippingInfo;
  onChange: (info: ShippingInfo) => void;
}) {
  const [addressQuery, setAddressQuery] = useState("");
  const [addressResults, setAddressResults] = useState<JusoResult[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showAddressModal && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showAddressModal]);

  const update = (fields: Partial<ShippingInfo>) => {
    onChange({ ...shippingInfo, ...fields });
  };

  const handlePhoneChange = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, "");
    update({ phone: numbersOnly });
  };

  const searchAddress = async () => {
    if (!addressQuery.trim()) return;
    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        confmKey: JUSO_API_KEY,
        currentPage: "1",
        countPerPage: "10",
        keyword: addressQuery.trim(),
        resultType: "json",
      });
      const res = await fetch(
        `https://business.juso.go.kr/addrlink/addrLinkApi.do?${params}`
      );
      const data = await res.json();
      setAddressResults(data.results?.juso || []);
    } catch (err) {
      console.error("Address search failed:", err);
      setAddressResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectAddress = (juso: JusoResult) => {
    update({
      roadAddress: juso.roadAddr,
      zonecode: juso.zipNo,
    });
    setShowAddressModal(false);
    setAddressQuery("");
    setAddressResults([]);
  };

  const inputClass =
    "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";
  const labelClass = "block text-xs font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900">배송 정보</h2>

      {/* Name */}
      <div>
        <label className={labelClass}>이름 *</label>
        <input
          type="text"
          value={shippingInfo.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="수령인 이름"
          className={inputClass}
        />
      </div>

      {/* Phone */}
      <div>
        <label className={labelClass}>연락처 *</label>
        <input
          type="tel"
          inputMode="numeric"
          value={shippingInfo.phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="숫자만 입력"
          className={inputClass}
        />
      </div>

      {/* Email */}
      <div>
        <label className={labelClass}>이메일 *</label>
        <input
          type="email"
          value={shippingInfo.email}
          onChange={(e) => update({ email: e.target.value })}
          placeholder="example@email.com"
          className={inputClass}
        />
      </div>

      {/* Shipping Type Toggle */}
      <div>
        <label className={labelClass}>배송 유형 *</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => update({ shippingType: "domestic" })}
            className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
              shippingInfo.shippingType === "domestic"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
          >
            국내 배송
            <span className="block text-xs mt-0.5 opacity-75">3,000원</span>
          </button>
          <button
            type="button"
            onClick={() => update({ shippingType: "international" })}
            className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
              shippingInfo.shippingType === "international"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
          >
            해외 배송
            <span className="block text-xs mt-0.5 opacity-75">15,000원</span>
          </button>
        </div>
      </div>

      {/* Address Section */}
      {shippingInfo.shippingType === "domestic" ? (
        <DomesticAddress
          shippingInfo={shippingInfo}
          update={update}
          inputClass={inputClass}
          labelClass={labelClass}
          showAddressModal={showAddressModal}
          setShowAddressModal={setShowAddressModal}
          addressQuery={addressQuery}
          setAddressQuery={setAddressQuery}
          addressResults={addressResults}
          setAddressResults={setAddressResults}
          isSearching={isSearching}
          searchAddress={searchAddress}
          selectAddress={selectAddress}
          searchInputRef={searchInputRef}
        />
      ) : (
        <InternationalAddress
          shippingInfo={shippingInfo}
          update={update}
          inputClass={inputClass}
          labelClass={labelClass}
        />
      )}
    </div>
  );
}

function DomesticAddress({
  shippingInfo,
  update,
  inputClass,
  labelClass,
  showAddressModal,
  setShowAddressModal,
  addressQuery,
  setAddressQuery,
  addressResults,
  setAddressResults,
  isSearching,
  searchAddress,
  selectAddress,
  searchInputRef,
}: {
  shippingInfo: ShippingInfo;
  update: (fields: Partial<ShippingInfo>) => void;
  inputClass: string;
  labelClass: string;
  showAddressModal: boolean;
  setShowAddressModal: (v: boolean) => void;
  addressQuery: string;
  setAddressQuery: (v: string) => void;
  addressResults: JusoResult[];
  setAddressResults: (v: JusoResult[]) => void;
  isSearching: boolean;
  searchAddress: () => void;
  selectAddress: (juso: JusoResult) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>주소 *</label>
        {shippingInfo.roadAddress ? (
          <div className="flex items-start gap-2">
            <div className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-xs text-gray-500 block">
                [{shippingInfo.zonecode}]
              </span>
              {shippingInfo.roadAddress}
            </div>
            <button
              type="button"
              onClick={() => {
                update({ roadAddress: "", zonecode: "", detailAddress: "" });
                setShowAddressModal(true);
              }}
              className="px-3 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 shrink-0"
            >
              변경
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddressModal(true)}
            className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 border-dashed rounded-lg hover:border-gray-400 hover:bg-gray-50 flex items-center justify-center gap-1.5"
          >
            <Search size={14} />
            주소 검색
          </button>
        )}
      </div>

      {shippingInfo.roadAddress && (
        <div>
          <label className={labelClass}>상세주소</label>
          <input
            type="text"
            value={shippingInfo.detailAddress || ""}
            onChange={(e) => update({ detailAddress: e.target.value })}
            placeholder="동/호수 등 상세주소"
            className={inputClass}
          />
        </div>
      )}

      {/* Address Search Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-sm font-semibold">주소 검색</h3>
              <button
                onClick={() => {
                  setShowAddressModal(false);
                  setAddressQuery("");
                  setAddressResults([]);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4">
              <div className="flex gap-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={addressQuery}
                  onChange={(e) => setAddressQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchAddress()}
                  placeholder="도로명, 건물명, 지번으로 검색"
                  className={`${inputClass} flex-1`}
                />
                <button
                  onClick={searchAddress}
                  disabled={isSearching}
                  className="px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 disabled:bg-gray-400 shrink-0"
                >
                  {isSearching ? "..." : "검색"}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {addressResults.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {addressResults.map((juso, i) => (
                    <li key={i}>
                      <button
                        onClick={() => selectAddress(juso)}
                        className="w-full text-left py-2.5 hover:bg-gray-50 rounded px-2 -mx-2"
                      >
                        <span className="text-xs text-blue-600 font-medium">
                          [{juso.zipNo}]
                        </span>
                        <span className="text-sm text-gray-900 block mt-0.5">
                          {juso.roadAddr}
                        </span>
                        {juso.jibunAddr && (
                          <span className="text-xs text-gray-400 block mt-0.5">
                            {juso.jibunAddr}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : addressQuery && !isSearching ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  검색 결과가 없습니다.
                </p>
              ) : !addressQuery ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  검색어를 입력해주세요.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InternationalAddress({
  shippingInfo,
  update,
  inputClass,
  labelClass,
}: {
  shippingInfo: ShippingInfo;
  update: (fields: Partial<ShippingInfo>) => void;
  inputClass: string;
  labelClass: string;
}) {
  return (
    <div className="space-y-3">
      {/* Country */}
      <div>
        <label className={labelClass}>Country *</label>
        <div className="relative">
          <select
            value={shippingInfo.country || ""}
            onChange={(e) => update({ country: e.target.value })}
            className={`${inputClass} appearance-none pr-8`}
          >
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* City & State */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>City *</label>
          <input
            type="text"
            value={shippingInfo.city || ""}
            onChange={(e) => update({ city: e.target.value })}
            placeholder="City"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>State / Province *</label>
          <input
            type="text"
            value={shippingInfo.state || ""}
            onChange={(e) => update({ state: e.target.value })}
            placeholder="State"
            className={inputClass}
          />
        </div>
      </div>

      {/* Postal Code */}
      <div>
        <label className={labelClass}>Postal Code *</label>
        <input
          type="text"
          value={shippingInfo.postalCode || ""}
          onChange={(e) => update({ postalCode: e.target.value })}
          placeholder="Postal / ZIP code"
          className={inputClass}
        />
      </div>

      {/* Address Lines */}
      <div>
        <label className={labelClass}>Address Line 1 *</label>
        <input
          type="text"
          value={shippingInfo.addressLine1 || ""}
          onChange={(e) => update({ addressLine1: e.target.value })}
          placeholder="Street address"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Address Line 2</label>
        <input
          type="text"
          value={shippingInfo.addressLine2 || ""}
          onChange={(e) => update({ addressLine2: e.target.value })}
          placeholder="Apt, suite, unit, etc. (optional)"
          className={inputClass}
        />
      </div>
    </div>
  );
}
