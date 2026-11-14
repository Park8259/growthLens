import { useRef } from "react";

interface Props {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  max?: string;
}

function toKoreanFormat(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y}. ${m}. ${d}`;
}

export default function DatePicker({ value, onChange, placeholder = "날짜 선택", max }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="relative w-full px-4 py-3.5 rounded-2xl border border-gray-200 cursor-pointer bg-white"
      onClick={() => inputRef.current?.showPicker?.()}
    >
      <span className={value ? "text-gray-900" : "text-gray-400"}>
        {value ? toKoreanFormat(value) : placeholder}
      </span>
      <input
        ref={inputRef}
        type="date"
        value={value}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
}
