import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChildStore } from "../../store/child";

type Role = "parent" | "doctor";

// Figma(와이어프레임 페이지): "의사, 부모 사용 방식" — 누른 카드가 하늘색으로 바뀐 뒤 다음 화면으로 넘어가요
export default function RoleSelectScreen() {
  const navigate = useNavigate();
  const profile = useChildStore((s) => s.profile);
  const [picked, setPicked] = useState<Role | null>(null);

  function choose(role: Role) {
    if (picked) return;
    setPicked(role);
    const to = role === "parent" ? (profile ? "/tasks" : "/onboarding") : "/doctor/patients";
    window.setTimeout(() => navigate(to), 180);
  }

  return (
    <div className="min-h-screen bg-white max-w-sm mx-auto px-6 pt-[87px] font-noto">
      {/* 로고 */}
      <div className="flex items-center gap-0.5">
        <img src="/images/logo-mark.png" alt="" className="h-[31px] w-auto" />
        <img src="/images/logo-wordmark.png" alt="베베뷰" className="h-[36px] w-auto" />
      </div>

      <h1 className="mt-1 text-[26px] leading-[31px] font-bold text-ink-strong">
        어떻게 사용하실 건가요?
      </h1>
      <p className="mt-3 flex items-center gap-1.5 text-[15px] text-ink-muted">
        <InfoIcon />
        선택에 맞는 화면으로 시작할게요
      </p>

      <div className="mt-[118px] space-y-[18px]">
        <RoleCard
          selected={picked === "parent"}
          onClick={() => choose("parent")}
          title="부모님 · 보호자"
          desc="집에서 아이 발달을 기록해요"
          icon={<ParentIcon color={picked === "parent" ? "#FFFFFF" : "#000000"} />}
        />
        <RoleCard
          selected={picked === "doctor"}
          onClick={() => choose("doctor")}
          title="의사 · 전문가"
          desc="보호자가 공유한 기록을 봐요"
          icon={<img src="/images/icon-doctor.png" alt="" className="h-[59px] w-auto" />}
        />
      </div>
    </div>
  );
}

function RoleCard({
  selected,
  onClick,
  title,
  desc,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full h-[111px] rounded-[24px] pl-5 pr-5 flex items-center text-left transition-colors ${
        selected ? "bg-brand" : "bg-fill-card"
      }`}
    >
      <div className="w-[67px] flex justify-center flex-shrink-0">{icon}</div>
      <div className="ml-5 flex-1">
        <p className={`text-lg font-bold ${selected ? "text-white" : "text-ink-strong"}`}>{title}</p>
        <p className={`mt-2 text-sm ${selected ? "text-white" : "text-ink-muted"}`}>{desc}</p>
      </div>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={selected ? "#FFFFFF" : "#9AA3B0"} strokeWidth="1.83" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.25 5.5L13.75 11l-5.5 5.5" />
      </svg>
    </button>
  );
}

/** 보호자 아이콘: 머리(원) + 어깨(곡선) */
function ParentIcon({ color }: { color: string }) {
  return (
    <svg width="30" height="38" viewBox="0 0 30 38" fill="none" stroke={color} strokeLinecap="round">
      <circle cx="15" cy="12" r="10.5" strokeWidth="3.3" />
      <path d="M2 36c0-6 5.8-9.5 13-9.5S28 30 28 36" strokeWidth="3" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#5B6573" strokeWidth="1.2" strokeLinecap="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5.5v5" />
    </svg>
  );
}
