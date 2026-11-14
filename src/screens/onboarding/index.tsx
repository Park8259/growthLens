import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useChildStore } from "../../store/child";
import { correctedAgeMonths } from "../../utils/ageCalc";
import DatePicker from "../../components/DatePicker";

const REGIONS = [
  "서울", "경기", "인천", "부산", "대구", "광주",
  "대전", "울산", "세종", "강원", "충북", "충남",
  "전북", "전남", "경북", "경남", "제주",
];

const today = new Date().toISOString().split("T")[0];

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const setProfile = useChildStore((s) => s.setProfile);

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [isPremature, setIsPremature] = useState(false);
  const [gestationalWeeks, setGestationalWeeks] = useState("");
  const [region, setRegion] = useState("");
  const [siblingOrder, setSiblingOrder] = useState<number | null>(null);

  const ageMonths = useMemo(() => {
    if (!birthDate) return null;
    const weeks =
      isPremature && gestationalWeeks ? parseInt(gestationalWeeks) : undefined;
    return correctedAgeMonths(birthDate, weeks);
  }, [birthDate, isPremature, gestationalWeeks]);

  const prematureValid = !isPremature || (gestationalWeeks !== "" && parseInt(gestationalWeeks) >= 23 && parseInt(gestationalWeeks) <= 36);
  const isValid =
    name.trim() !== "" &&
    birthDate !== "" &&
    gender !== null &&
    region !== "" &&
    siblingOrder !== null &&
    prematureValid;

  function handleSubmit() {
    if (!isValid || !gender) return;
    setProfile({
      id: crypto.randomUUID(),
      name: name.trim(),
      birthDate,
      gender,
      gestationalWeeks:
        isPremature && gestationalWeeks ? parseInt(gestationalWeeks) : undefined,
      region: region || undefined,
      siblingOrder: siblingOrder ?? undefined,
      createdAt: Date.now(),
    });
    navigate("/tasks");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-sm mx-auto">
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* 로고 */}
        <div className="pt-12 pb-8">
          <div className="flex items-center gap-2 mb-8">
            <LogoIcon />
            <span className="font-semibold text-gray-900 text-sm tracking-tight">
              GrowthLens
            </span>
          </div>
          <h1 className="text-[26px] font-bold text-gray-900 leading-tight mb-1.5">
            아이 정보를 알려주세요
          </h1>
          <p className="text-sm text-gray-500">
            월령에 맞는 관찰 과제를 준비해 드릴게요
          </p>
        </div>

        <div className="space-y-5">
          {/* 아이 이름 */}
          <div>
            <label className="block text-sm text-gray-700 mb-1.5">아이 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="하온"
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 bg-white"
            />
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-sm text-gray-700 mb-1.5">생년월일</label>
            <DatePicker value={birthDate} onChange={setBirthDate} max={today} placeholder="날짜 선택" />
            {ageMonths !== null && (
              <p className="mt-2 text-sm font-medium text-gray-700">
                현재 {ageMonths}개월 · {ageMonths}~{ageMonths + 1}개월 과제가 준비돼요
              </p>
            )}
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-sm text-gray-700 mb-1.5">성별</label>
            <div className="flex gap-2">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 py-3.5 rounded-2xl border text-sm font-medium transition-colors ${
                    gender === g
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  {g === "male" ? "남아" : "여아"}
                </button>
              ))}
            </div>
          </div>

          {/* 조산 여부 */}
          <div>
            <div className="flex items-center justify-between py-0.5">
              <div>
                <p className="text-sm text-gray-700">조산이에요</p>
                <p className="text-xs text-gray-400">37주 미만 출생</p>
              </div>
              <Toggle value={isPremature} onChange={setIsPremature} />
            </div>
            {isPremature && (
              <div className="mt-3">
                <label className="block text-sm text-gray-700 mb-1.5">
                  임신 몇 주에 태어났나요?
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={gestationalWeeks}
                    onChange={(e) => setGestationalWeeks(e.target.value)}
                    placeholder="예: 32"
                    min={23}
                    max={36}
                    className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 bg-white pr-10"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">주</span>
                </div>
                <p className="mt-1.5 text-xs text-gray-400">
                  출생 기록지(퇴원 요약지)에서 확인할 수 있어요 · 23~36주 사이
                </p>
              </div>
            )}
          </div>

          {/* 거주 지역 */}
          <div>
            <label className="block text-sm text-gray-700 mb-1.5">거주 지역</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 text-gray-900 focus:outline-none focus:border-gray-400 bg-white appearance-none"
            >
              <option value="">선택 안 함</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* 출생 순서 */}
          <div>
            <label className="block text-sm text-gray-700 mb-1.5">출생 순서</label>
            <div className="flex gap-2">
              {[
                { label: "첫째", value: 1 },
                { label: "둘째", value: 2 },
                { label: "셋째 이상", value: 3 },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setSiblingOrder(siblingOrder === value ? null : value)
                  }
                  className={`flex-1 py-3 rounded-2xl border text-sm font-medium transition-colors ${
                    siblingOrder === value
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 고정 영역 */}
      <div className="px-6 pb-8 pt-4 bg-white border-t border-gray-50">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
          className={`w-full py-4 rounded-2xl text-white font-semibold text-base transition-colors ${
            isValid ? "bg-gray-900" : "bg-gray-300"
          }`}
        >
          시작하기
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">
          GrowthLens는 진단하지 않아요. 집에서의 관찰 기록을 돕습니다.
        </p>
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
        value ? "bg-gray-900" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          value ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function LogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="26" height="26" rx="5" stroke="#111" strokeWidth="1.5" />
      <line x1="8" y1="8" x2="20" y2="20" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="8" x2="8" y2="20" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
