import { useMemo, useRef, useState } from "react";
import BottomSheet, { OptionCard, SheetActions, SheetDone } from "../../components/BottomSheet";
import WheelPicker, { WheelGroup } from "../../components/WheelPicker";
import { PROVINCES, REGIONS } from "../../data/regions";
import { SIBLING_LABEL } from "./labels";

// 각 시트는 열릴 때마다 새로 마운트돼요. 그래서 고르는 중인 값(draft)은 처음 값에서 시작하고,
// 확인/선택 완료를 눌러야 바깥에 반영돼요. 취소하거나 바깥을 누르면 그대로 닫혀요.

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

const pad = (n: number) => String(n).padStart(2, "0");

/** "잘 모르겠어요" 링크 */
function UnknownLink({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-sm font-bold text-ink-sub">
      잘 모르겠어요
    </button>
  );
}

// ─── 성별 ────────────────────────────────────────────────

export function GenderSheet({
  value,
  onClose,
  onSelect,
}: {
  value: "male" | "female" | null;
  onClose: () => void;
  onSelect: (v: "male" | "female") => void;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <BottomSheet open onClose={onClose} title="성별을 선택해주세요">
      <div className="flex gap-3.5">
        {(["male", "female"] as const).map((g) => (
          <OptionCard
            key={g}
            selected={draft === g}
            onClick={() => setDraft(g)}
            className="flex-1 h-[149px] gap-1"
          >
            <img
              src={g === "male" ? "/images/icon-baby-boy.png" : "/images/icon-baby-girl.png"}
              alt=""
              className="h-[64px] w-auto object-contain"
            />
            <span className="text-[17px] font-bold">{g === "male" ? "남아" : "여아"}</span>
          </OptionCard>
        ))}
      </div>
      <div className="mt-6">
        <SheetDone disabled={!draft} onClick={() => draft && onSelect(draft)} />
      </div>
    </BottomSheet>
  );
}

// ─── 생년월일 ────────────────────────────────────────────

function monthsSince(iso: string, now: Date): number {
  const [y, m, d] = iso.split("-").map(Number);
  let months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
  if (now.getDate() < d) months -= 1;
  return Math.max(0, months);
}

export function BirthDateSheet({
  value,
  onClose,
  onSelect,
}: {
  value: string; // YYYY-MM-DD 또는 ""
  onClose: () => void;
  onSelect: (iso: string) => void;
}) {
  const [now] = useState(() => new Date());
  const maxY = now.getFullYear();
  const maxM = now.getMonth() + 1;
  const maxD = now.getDate();

  // 처음 열 때 값이 없으면 12개월 전 날짜에서 시작
  const [init] = useState(() => {
    if (value) return value.split("-").map(Number);
    const d = new Date(now);
    d.setFullYear(d.getFullYear() - 1);
    return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
  });
  const [y, setY] = useState(init[0]);
  const [m, setM] = useState(init[1]);
  const [d, setD] = useState(init[2]);

  const years = useMemo(() => range(maxY - 6, maxY), [maxY]);
  const months = useMemo(() => range(1, y === maxY ? maxM : 12), [y, maxY, maxM]);
  const days = useMemo(() => {
    const last = new Date(y, m, 0).getDate();
    return range(1, y === maxY && m === maxM ? Math.min(last, maxD) : last);
  }, [y, m, maxY, maxM, maxD]);

  // 연·월이 바뀌어 고른 월/일이 범위를 넘으면 마지막 값으로 맞춤
  const month = Math.min(m, months[months.length - 1]);
  const day = Math.min(d, days[days.length - 1]);
  const iso = `${y}-${pad(month)}-${pad(day)}`;

  const calendarRef = useRef<HTMLInputElement>(null);
  const todayIso = `${maxY}-${pad(maxM)}-${pad(maxD)}`;

  return (
    <BottomSheet open onClose={onClose} title="생년월일">
      <WheelGroup highlight={false}>
        <WheelPicker ariaLabel="연도" items={years} value={y} onChange={setY} format={(v) => `${v}년`} />
        <WheelPicker ariaLabel="월" items={months} value={month} onChange={setM} format={(v) => `${v}월`} />
        <WheelPicker ariaLabel="일" items={days} value={day} onChange={setD} format={(v) => `${v}일`} />
      </WheelGroup>

      <div className="mt-5 mb-6 flex items-center justify-between text-sm text-ink-sub">
        <span>현재 {monthsSince(iso, now)}개월</span>
        <button
          type="button"
          className="relative flex items-center gap-1.5 font-bold"
          onClick={() => calendarRef.current?.showPicker?.()}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round">
            <rect x="3" y="3.5" width="12" height="11" rx="2" />
            <path d="M3 7.5h12M6.5 2v3M11.5 2v3" />
          </svg>
          달력으로 보기
          <input
            ref={calendarRef}
            type="date"
            max={todayIso}
            value={iso}
            tabIndex={-1}
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0"
            onChange={(e) => {
              if (!e.target.value) return;
              const [ny, nm, nd] = e.target.value.split("-").map(Number);
              setY(ny);
              setM(nm);
              setD(nd);
            }}
          />
        </button>
      </div>

      <SheetActions onCancel={onClose} onConfirm={() => onSelect(iso)} />
    </BottomSheet>
  );
}

// ─── 몸무게 / 키 ─────────────────────────────────────────

export function WeightSheet({
  value,
  onClose,
  onSelect,
}: {
  value: number | null | undefined; // null = 모름, undefined = 아직 안 고름
  onClose: () => void;
  onSelect: (kg: number | null) => void;
}) {
  const start = value ?? 9.0;
  const [whole, setWhole] = useState(Math.floor(start));
  const [tenth, setTenth] = useState(Math.round((start - Math.floor(start)) * 10));

  return (
    <BottomSheet open onClose={onClose} title="몸무게" subtitle="가장 최근에 잰 몸무게를 선택해주세요">
      <WheelGroup>
        <div className="w-14" />
        <WheelPicker ariaLabel="킬로그램" items={range(2, 25)} value={whole} onChange={setWhole} />
        <span className="relative text-[20px] font-bold text-ink">.</span>
        <WheelPicker ariaLabel="소수점 아래" items={range(0, 9)} value={tenth} onChange={setTenth} />
        <span className="relative w-14 text-[20px] font-bold text-ink">kg</span>
      </WheelGroup>
      <div className="mt-5 mb-6 flex items-center justify-between text-sm text-ink-sub">
        <span>0.1kg 단위로 선택할 수 있어요</span>
        <UnknownLink onClick={() => onSelect(null)} />
      </div>
      <SheetActions onCancel={onClose} onConfirm={() => onSelect(whole + tenth / 10)} />
    </BottomSheet>
  );
}

export function HeightSheet({
  value,
  onClose,
  onSelect,
}: {
  value: number | null | undefined;
  onClose: () => void;
  onSelect: (cm: number | null) => void;
}) {
  const [cm, setCm] = useState(value ?? 75);
  return (
    <BottomSheet open onClose={onClose} title="키" subtitle="가장 최근에 잰 키를 선택해주세요">
      <WheelGroup>
        <div className="w-24" />
        <WheelPicker ariaLabel="센티미터" items={range(45, 130)} value={cm} onChange={setCm} />
        <span className="relative w-24 text-[20px] font-bold text-ink">cm</span>
      </WheelGroup>
      <div className="mt-5 mb-6 flex justify-end">
        <UnknownLink onClick={() => onSelect(null)} />
      </div>
      <SheetActions onCancel={onClose} onConfirm={() => onSelect(cm)} />
    </BottomSheet>
  );
}

// ─── 조산 여부 / 출생 시 임신 주수 ──────────────────────

export function PrematureSheet({
  value,
  onClose,
  onSelect,
}: {
  value: boolean | null;
  onClose: () => void;
  onSelect: (premature: boolean) => void;
}) {
  const [draft, setDraft] = useState(value);
  const options = [
    { v: true, label: "조산", sub: "임신 37주 미만" },
    { v: false, label: "정상 출산", sub: "임신 37주 이상" },
  ];
  return (
    <BottomSheet open onClose={onClose} title="조산 여부를 선택해주세요">
      <div className="flex gap-3.5">
        {options.map((o) => (
          <OptionCard
            key={o.label}
            selected={draft === o.v}
            onClick={() => setDraft(o.v)}
            className="flex-1 h-[112px] gap-2"
          >
            <span className={`text-[17px] ${draft === o.v ? "font-bold" : ""}`}>{o.label}</span>
            <span className={`text-[11px] ${draft === o.v ? "" : "text-[#888888]"}`}>{o.sub}</span>
          </OptionCard>
        ))}
      </div>
      <div className="mt-6">
        <SheetDone disabled={draft === null} onClick={() => draft !== null && onSelect(draft)} />
      </div>
    </BottomSheet>
  );
}

export function WeeksSheet({
  value,
  onClose,
  onSelect,
}: {
  value: number | null | undefined;
  onClose: () => void;
  onSelect: (weeks: number | null) => void;
}) {
  const [weeks, setWeeks] = useState(value ?? 34);
  return (
    <BottomSheet open onClose={onClose} title="출생 시 임신 주수">
      <WheelGroup>
        <div className="w-24" />
        <WheelPicker ariaLabel="주" items={range(23, 36)} value={weeks} onChange={setWeeks} />
        <span className="relative w-24 text-[15px] font-bold text-ink">주</span>
      </WheelGroup>
      <div className="mt-5 mb-6 flex items-center justify-between">
        <span className="text-xs text-[#777777]">임신 37주 미만이면 조산이에요</span>
        <UnknownLink onClick={() => onSelect(null)} />
      </div>
      <SheetActions onCancel={onClose} onConfirm={() => onSelect(weeks)} />
    </BottomSheet>
  );
}

// ─── 거주지역 ────────────────────────────────────────────

export function RegionSheet({
  value,
  onClose,
  onSelect,
}: {
  value: { province: string; district: string } | null;
  onClose: () => void;
  onSelect: (v: { province: string; district: string }) => void;
}) {
  const [province, setProvince] = useState(value?.province ?? PROVINCES[0]);
  const districts = REGIONS[province];
  const [picked, setPicked] = useState(value?.district ?? districts[0]);
  // 시·도를 바꾸면 그 시·도의 첫 시·군·구로
  const district = districts.includes(picked) ? picked : districts[0];

  return (
    <BottomSheet
      open
      onClose={onClose}
      title="거주지역"
      subtitle="현재 살고 있는 지역을 선택해주세요"
    >
      <WheelGroup>
        <WheelPicker ariaLabel="시·도" items={PROVINCES} value={province} onChange={setProvince} />
        <WheelPicker
          key={province}
          ariaLabel="시·군·구"
          items={districts}
          value={district}
          onChange={setPicked}
        />
      </WheelGroup>
      <div className="mt-6">
        <SheetActions onCancel={onClose} onConfirm={() => onSelect({ province, district })} />
      </div>
    </BottomSheet>
  );
}

// ─── 출생 순서 ───────────────────────────────────────────

export function SiblingSheet({
  value,
  onClose,
  onSelect,
}: {
  value: number | null;
  onClose: () => void;
  onSelect: (order: number) => void;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <BottomSheet open onClose={onClose} title="출생 순서를 선택해주세요">
      <div className="flex gap-3">
        {[1, 2, 3].map((n) => (
          <OptionCard
            key={n}
            selected={draft === n}
            onClick={() => setDraft(n)}
            className="flex-1 h-[97px]"
          >
            <span className={`text-[17px] ${draft === n ? "font-bold" : ""}`}>{SIBLING_LABEL[n]}</span>
          </OptionCard>
        ))}
      </div>
      <div className="mt-6">
        <SheetDone disabled={draft === null} onClick={() => draft !== null && onSelect(draft)} />
      </div>
    </BottomSheet>
  );
}
