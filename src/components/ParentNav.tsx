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
    <nav className="sticky bottom-0 z-20 flex h-[84px] border-t border-p-line bg-white pt-[11px] print:hidden">
      {TABS.map(({ label, path, Icon }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            type="button"
            onClick={() => navigate(path)}
            className={`flex flex-1 flex-col items-center gap-1.5 ${active ? "text-brand" : "text-p-light"}`}
          >
            <Icon size={24} />
            <span className={`text-[11px] leading-[13px] ${active ? "font-bold" : ""}`}>{label}</span>
          </button>
        );
      })}
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
