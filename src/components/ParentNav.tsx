import { useLocation, useNavigate } from "react-router-dom";
import { NavChangeIcon, NavRecordIcon, NavSummaryIcon, NavTaskIcon } from "./icons";

// Figma 부모 버전 하단 탭: 과제 · 기록 · 변화 · 진료 요약
const TABS = [
  { label: "과제", path: "/tasks", Icon: NavTaskIcon },
  { label: "기록", path: "/timeline", Icon: NavRecordIcon },
  { label: "변화", path: "/charts", Icon: NavChangeIcon },
  { label: "진료 요약", path: "/clinic-summary", Icon: NavSummaryIcon },
];

export default function ParentNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    // Figma 11/20: 회색 둥근 바 위에 선택된 탭만 파란 알약
    <nav className="sticky bottom-0 z-20 bg-white px-5 pt-2 pb-[18px] print:hidden">
      <div className="flex h-[62px] items-center gap-0.5 rounded-[35.5px] bg-p-card px-[5px] shadow-[inset_-2px_-1px_2.8px_rgba(0,0,0,0.04)]">
        {TABS.map(({ label, path, Icon }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              aria-current={active ? "page" : undefined}
              className={`flex h-[54px] flex-1 flex-col items-center justify-center gap-[3px] rounded-[27px] ${
                active ? "bg-brand text-white shadow-[inset_0_0_6px_rgba(255,255,255,0.25)]" : "text-[#444444]"
              }`}
            >
              <Icon size={24} />
              <span className={`text-[11px] leading-[13px] ${active ? "font-bold" : "text-[#494949]"}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/** 칩 (과제 이름, 월령 등) */
export function Pill({
  children,
  tone = "blue",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "blue" | "gray" | "warn";
  className?: string;
}) {
  const tones = {
    blue: "bg-brand-chip text-brand-deep",
    gray: "bg-p-card text-p-body",
    warn: "bg-warn-bg text-warn-text",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 h-[26px] text-xs font-bold ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}
