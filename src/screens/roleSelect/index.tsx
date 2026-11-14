import { useNavigate } from "react-router-dom";
import { useChildStore } from "../../store/child";

export default function RoleSelectScreen() {
  const navigate = useNavigate();
  const profile = useChildStore((s) => s.profile);

  function goParent() {
    navigate(profile ? "/tasks" : "/onboarding");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between max-w-sm mx-auto px-6 py-16">
      {/* 로고 */}
      <div className="flex items-center gap-2">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="1" y="1" width="26" height="26" rx="5" stroke="#111" strokeWidth="1.5" />
          <line x1="8" y1="8" x2="20" y2="20" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="8" x2="8" y2="20" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="font-semibold text-gray-900 text-sm tracking-tight">GrowthLens</span>
      </div>

      {/* 선택 카드 */}
      <div className="w-full space-y-4">
        <h1 className="text-[22px] font-bold text-gray-900 text-center mb-6">
          어떤 분이세요?
        </h1>

        <button
          onClick={goParent}
          className="w-full border border-gray-200 rounded-3xl p-6 text-left flex items-center gap-5 active:bg-gray-50 transition-colors"
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <ParentIcon />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-base">부모님 · 보호자</p>
            <p className="text-sm text-gray-500 mt-0.5">아이의 발달을 함께 기록해요</p>
          </div>
          <ChevronIcon className="ml-auto text-gray-300 flex-shrink-0" />
        </button>

        <button
          onClick={() => navigate("/doctor/patients")}
          className="w-full border border-gray-200 rounded-3xl p-6 text-left flex items-center gap-5 active:bg-gray-50 transition-colors"
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <DoctorIcon />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-base">의사 · 전문가</p>
            <p className="text-sm text-gray-500 mt-0.5">환자의 발달 데이터를 확인해요</p>
          </div>
          <ChevronIcon className="ml-auto text-gray-300 flex-shrink-0" />
        </button>
      </div>

      <p className="text-xs text-gray-400">GrowthLens는 진단하지 않아요.</p>
    </div>
  );
}

function ParentIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="10" cy="8" r="3.5" />
      <path d="M4 22c0-4 2.5-6 6-6s6 2 6 6" />
      <circle cx="21" cy="11" r="2.5" />
      <path d="M17 22c0-3 1.8-4.5 4-4.5s4 1.5 4 4.5" />
    </svg>
  );
}

function DoctorIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4h10a2 2 0 012 2v13a5 5 0 01-10 0V6a2 2 0 012-2z" />
      <path d="M14 15v4M12 17h4" />
      <path d="M11 4V2M17 4V2" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7.5 5l5 5-5 5" />
    </svg>
  );
}
