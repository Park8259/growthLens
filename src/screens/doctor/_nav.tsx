import { useLocation, useNavigate } from "react-router-dom";
import { NavCalendarIcon, NavHomeIcon, NavMeIcon, NavPatientsIcon } from "../../components/icons";

// Figma 의사 버전 하단 탭: 오늘 · 환자 · 일정 · 내 정보
const TABS = [
  { label: "오늘", path: "/doctor", Icon: NavHomeIcon },
  { label: "환자", path: "/doctor/patients", Icon: NavPatientsIcon },
  { label: "일정", path: "/doctor/appointments", Icon: NavCalendarIcon },
  { label: "내 정보", path: "/doctor/me", Icon: NavMeIcon },
];

export default function DoctorNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <nav className="sticky bottom-0 z-20 flex h-[84px] border-t border-p-line bg-white pt-[11px]">
      {TABS.map(({ label, path, Icon }) => {
        const active = path === "/doctor" ? pathname === path : pathname.startsWith(path);
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

/** 이름 두 번째 글자를 넣은 동그란 아바타 */
export function Avatar({ name, size = 48, muted = false }: { name: string; size?: number; muted?: boolean }) {
  return (
    <span
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-bold ${
        muted ? "bg-p-card text-p-light" : "bg-brand-chip text-brand-icon"
      }`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.slice(1, 2)}
    </span>
  );
}
