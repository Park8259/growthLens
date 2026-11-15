import { useEffect, useRef, useState } from "react";

const ROW = 44;      // 한 줄 높이 (Figma 휠 간격)
const VISIBLE = 5;   // 보이는 줄 수

interface Props<T extends string | number> {
  items: readonly T[];
  value: T;
  onChange: (value: T) => void;
  format?: (item: T) => string;
  ariaLabel: string;
}

/**
 * 스크롤해서 고르는 휠 선택기 한 열.
 * 가운데 줄이 선택값이에요. 가운데는 굵고 진하게, 멀어질수록 작고 흐리게 보여요.
 */
export default function WheelPicker<T extends string | number>({
  items,
  value,
  onChange,
  format = (v) => String(v),
  ariaLabel,
}: Props<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const selected = Math.max(0, items.indexOf(value));
  const [active, setActive] = useState(selected);

  // 바깥에서 값이 바뀌면(예: 월이 바뀌어 일 수가 줄어듦) 그 위치로 옮김
  useEffect(() => {
    const el = ref.current;
    if (el && Math.round(el.scrollTop / ROW) !== selected) {
      el.scrollTop = selected * ROW;
    }
  }, [selected, items.length]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function handleScroll() {
    const el = ref.current;
    if (!el) return;
    const idx = Math.min(items.length - 1, Math.max(0, Math.round(el.scrollTop / ROW)));
    setActive(idx);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (items[idx] !== value) onChange(items[idx]);
    }, 120);
  }

  function scrollTo(idx: number) {
    ref.current?.scrollTo({ top: idx * ROW, behavior: "smooth" });
  }

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label={ariaLabel}
      onScroll={handleScroll}
      className="no-scrollbar relative flex-1 overflow-y-scroll snap-y snap-mandatory"
      style={{ height: ROW * VISIBLE, paddingBlock: ROW * Math.floor(VISIBLE / 2) }}
    >
      {items.map((item, i) => {
        const d = Math.abs(i - active);
        const style =
          d === 0
            ? "text-[20px] font-bold text-ink"
            : d === 1
              ? "text-[17px] text-ink-hint"
              : "text-[15px] text-ink-faint";
        return (
          <div
            key={String(item)}
            role="option"
            aria-selected={i === active}
            onClick={() => scrollTo(i)}
            className={`snap-center flex items-center justify-center cursor-pointer select-none transition-all ${style}`}
            style={{ height: ROW }}
          >
            {format(item)}
          </div>
        );
      })}
    </div>
  );
}

/** 휠 여러 열을 나란히 놓는 틀. highlight가 켜지면 가운데 줄에 회색 띠를 깔아요. */
export function WheelGroup({
  children,
  highlight = true,
}: {
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="relative flex items-center" style={{ height: ROW * VISIBLE }}>
      {highlight && (
        <div
          className="pointer-events-none absolute inset-x-0 rounded-[10px] bg-fill-wheel"
          style={{ top: ROW * 2, height: ROW }}
        />
      )}
      <div className="relative flex flex-1 items-center">{children}</div>
    </div>
  );
}
