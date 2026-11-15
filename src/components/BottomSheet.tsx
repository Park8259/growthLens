import type { ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/** 아래에서 올라오는 선택 시트 (Figma: 성별·생년월일·몸무게·키·조산여부·거주지역·출생 순서) */
export default function BottomSheet({ open, onClose, title, subtitle, children }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-sm bg-white rounded-t-[24px] px-6 pt-2.5 pb-8 animate-sheet-up"
      >
        <div className="mx-auto h-[5px] w-10 rounded-full bg-[#D0D0D0]" />
        <h2 className="mt-6 text-[20px] leading-6 font-bold text-ink">{title}</h2>
        {subtitle && <p className="mt-2.5 text-sm text-ink-sub">{subtitle}</p>}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

/** 시트 하단 버튼: 취소 + 확인 */
export function SheetActions({
  onCancel,
  onConfirm,
  confirmLabel = "확인",
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
}) {
  return (
    <div className="flex gap-2.5">
      <button
        type="button"
        onClick={onCancel}
        className="w-[128px] h-[54px] rounded-[14px] bg-fill-cancel text-base font-bold text-ink"
      >
        취소
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="flex-1 h-[54px] rounded-[14px] bg-brand text-base font-bold text-white"
      >
        {confirmLabel}
      </button>
    </div>
  );
}

/** 시트 하단 단일 버튼: 선택 완료 */
export function SheetDone({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-[54px] rounded-[14px] text-[17px] font-bold ${
        disabled ? "bg-fill-disabled text-ink-hint" : "bg-brand text-white"
      }`}
    >
      선택 완료
    </button>
  );
}

/** 하늘색으로 선택 표시되는 카드 (조산여부·출생 순서·성별) */
export function OptionCard({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex flex-col items-center justify-center rounded-[14px] transition-colors ${
        selected
          ? "bg-brand-light border-[1.5px] border-brand text-brand"
          : "bg-white border border-line-soft text-ink-sub"
      } ${className}`}
    >
      {children}
    </button>
  );
}
