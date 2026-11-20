import type { ReactNode } from "react";

/** 입력 항목 라벨 + 칸 (Figma: 우리 아이 정보, 출생정보) */
export function Field({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div>
      {label && <p className="mb-2.5 text-sm font-bold text-ink-sub">{label}</p>}
      {children}
    </div>
  );
}

const boxBase =
  "w-full h-[51px] px-4 rounded-[10px] border bg-white text-base text-left flex items-center justify-between";

/** 누르면 선택 시트가 열리는 칸 */
export function SelectBox({
  value,
  placeholder,
  onClick,
  active = false,
  icon = "chevron",
}: {
  value?: string;
  placeholder: string;
  onClick: () => void;
  active?: boolean;
  icon?: "chevron" | "calendar";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${boxBase} ${active ? "border-ink-sub" : "border-line"}`}
    >
      <span className={value ? "text-ink" : "text-ink-hint"}>{value || placeholder}</span>
      {icon === "chevron" ? <ChevronDown /> : <CalendarIcon />}
    </button>
  );
}

/** 글자를 직접 입력하는 칸 */
export function TextBox(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`${boxBase} border-line text-ink placeholder:text-ink-hint focus:outline-none focus:border-ink-sub`}
    />
  );
}

/** 화면 상단: 뒤로 가기 + 가운데 제목 + 구분선 */
export function PageHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="relative flex h-[90px] items-end justify-center border-b border-line-divider pb-4">
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로 가기"
        className="absolute left-4 bottom-3.5 p-2"
      >
        <svg width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 1L1.5 8 8 15" />
        </svg>
      </button>
      <h1 className="text-lg font-bold text-ink">{title}</h1>
    </div>
  );
}

/** 회원가입 진행 막대 (Figma "진행단계_N/4": 계정 → 우리 아이 정보 → 출생 정보 → 이용약관) */
export function StepBar({ step, total = 4 }: { step: number; total?: number }) {
  return (
    <div className="flex gap-1.5 px-6 pt-3" aria-label={`${total}단계 중 ${step}단계`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-1 flex-1 rounded-full ${i < step ? "bg-brand" : "bg-[#E5E7EB]"}`} />
      ))}
    </div>
  );
}

/** 화면 하단 큰 버튼 (다음 / 완료) */
export function BottomButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="px-6 pb-[50px] pt-4 bg-white">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`w-full h-[56px] rounded-[14px] text-[17px] font-bold ${
          disabled ? "bg-fill-disabled text-ink-hint" : "bg-brand text-white"
        }`}
      >
        {label}
      </button>
    </div>
  );
}

function ChevronDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#555" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7.5l5 5 5-5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#555" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="14" height="13" rx="2" />
      <path d="M3 8.5h14M7 2.5v3M13 2.5v3" />
    </svg>
  );
}
